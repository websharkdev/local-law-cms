'use strict';

const { Readable } = require('node:stream');

const RESOURCE_PATHS = {
  documents: '/api/admin/ops/documents',
  'translation-requests': '/api/admin/ops/translation-requests',
  'notary-bookings': '/api/admin/ops/notary-bookings',
  'custom-notary-requests': '/api/admin/ops/custom-notary-requests',
};

const ALLOWED_STATUSES = {
  documents: ['completed', 'reviewed', 'archived', 'error'],
  'translation-requests': ['pending', 'in_progress', 'completed', 'cancelled'],
  'notary-bookings': ['confirmed', 'cancelled', 'refunded'],
  'custom-notary-requests': ['pending', 'in_progress', 'completed', 'cancelled'],
};

const TYPE_ALIASES = {
  documents: 'documents',
  document: 'documents',
  translations: 'translation-requests',
  translation: 'translation-requests',
  'translation-requests': 'translation-requests',
  'notary-bookings': 'notary-bookings',
  notaryBooking: 'notary-bookings',
  'notary-booking': 'notary-bookings',
  'custom-notary-requests': 'custom-notary-requests',
  customNotary: 'custom-notary-requests',
  'custom-notary': 'custom-notary-requests',
};

const DEFAULT_TIMEOUT_MS = 15000;

class LocalLawConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LocalLawConfigError';
    this.status = 503;
  }
}

class LocalLawApiError extends Error {
  constructor(message, status = 502, details) {
    super(message);
    this.name = 'LocalLawApiError';
    this.status = status;
    this.details = details;
  }
}

function normalizeBaseUrl(raw) {
  let baseUrl = String(raw || '').trim().replace(/\/$/, '');

  // Node fetch often resolves "localhost" to ::1 while Next listens on IPv4 only.
  if (/^https?:\/\/localhost(?=[:/]|$)/i.test(baseUrl)) {
    baseUrl = baseUrl.replace(/^(https?:\/\/)localhost/i, '$1127.0.0.1');
  }

  return baseUrl;
}

function describeFetchFailure(error) {
  const cause = error?.cause || error;
  const code = cause?.code || error?.code;
  const detail = cause?.message || error?.message || 'unknown network error';
  return code ? `${code}: ${detail}` : detail;
}

module.exports = ({ strapi }) => ({
  resourcePaths: RESOURCE_PATHS,
  allowedStatuses: ALLOWED_STATUSES,

  normalizeType(type) {
    const normalized = TYPE_ALIASES[type];
    if (!normalized) {
      throw new LocalLawApiError(`Unknown operations type "${type}"`, 400);
    }
    return normalized;
  },

  getConfig() {
    const pluginConfig = strapi.config.get('plugin::operations') || {};
    const baseUrl = normalizeBaseUrl(
      pluginConfig.localLawUrl || process.env.LOCAL_LAW_URL,
    );
    const token =
      pluginConfig.adminApiToken || process.env.LOCAL_LAW_ADMIN_API_TOKEN;

    if (!baseUrl || !token) {
      throw new LocalLawConfigError(
        'LOCAL_LAW_URL and LOCAL_LAW_ADMIN_API_TOKEN must be configured for Operations',
      );
    }

    return { baseUrl, token };
  },

  assertAllowedStatus(type, status) {
    const resourceType = this.normalizeType(type);
    const allowed = ALLOWED_STATUSES[resourceType] || [];

    if (!allowed.includes(status)) {
      throw new LocalLawApiError(
        `Status "${status}" is not allowed for ${resourceType}. Allowed: ${allowed.join(', ')}`,
        400,
      );
    }
  },

  rewriteDownloadUrls(resourceType, items) {
    return items.map((item) => ({
      ...item,
      files: Array.isArray(item.files)
        ? item.files.map((file) => ({
            id: file.id,
            fileName: file.fileName,
            mimeType: file.mimeType,
            // Never expose storage keys; always go through Strapi proxy.
            downloadUrl: `/operations/${resourceType}/${item.id}/files/${file.id}/download`,
          }))
        : [],
    }));
  },

  async request(path, { method = 'GET', body, expectJson = true } = {}) {
    const { baseUrl, token } = this.getConfig();
    const url = `${baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(url, {
        method,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: expectJson ? 'application/json' : '*/*',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      const reason = describeFetchFailure(error);
      strapi.log.error(
        `operations: local-law request failed ${method} ${url} (${reason})`,
        error,
      );

      const aborted = error?.name === 'AbortError';
      throw new LocalLawApiError(
        aborted
          ? `Timed out reaching local-law at ${url}. Is the Next.js app running and reachable from Strapi?`
          : `Failed to reach local-law at ${url} (${reason}). Check LOCAL_LAW_URL from the Strapi server host (not the browser), and that Next exposes /api/admin/ops/*.`,
        502,
        { url, reason },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let details;
      try {
        details = await response.json();
      } catch {
        details = await response.text().catch(() => undefined);
      }

      strapi.log.warn(
        `operations: local-law responded ${response.status} for ${method} ${url}`,
      );

      const hint =
        response.status === 401 || response.status === 403
          ? ' Check LOCAL_LAW_ADMIN_API_TOKEN matches the token expected by Next.'
          : response.status === 404
            ? ' Next route missing — implement the local-law admin ops API (see docs/OPERATIONS.md).'
            : '';

      throw new LocalLawApiError(
        `local-law returned ${response.status} for ${method} ${url}.${hint}`,
        response.status >= 400 && response.status < 500 ? response.status : 502,
        details,
      );
    }

    if (!expectJson) {
      return response;
    }

    const payload = await response.json();
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }
    return payload?.data ?? payload;
  },

  async list(type) {
    const resourceType = this.normalizeType(type);
    const path = RESOURCE_PATHS[resourceType];
    const items = await this.request(path);
    const list = Array.isArray(items) ? items : [];
    return this.rewriteDownloadUrls(resourceType, list);
  },

  async updateStatus(type, id, status) {
    const resourceType = this.normalizeType(type);
    this.assertAllowedStatus(resourceType, status);

    strapi.log.info(
      `operations: status change type=${resourceType} id=${id} status=${status}`,
    );

    const result = await this.request(`/api/admin/ops/${resourceType}/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });

    if (result && typeof result === 'object' && !Array.isArray(result)) {
      return this.rewriteDownloadUrls(resourceType, [result])[0];
    }

    return result;
  },

  async downloadFile(type, id, fileId) {
    const resourceType = this.normalizeType(type);
    const path = `/api/admin/ops/${resourceType}/${id}/files/${fileId}/download`;
    const response = await this.request(path, { expectJson: false });

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition =
      response.headers.get('content-disposition') ||
      `attachment; filename="${fileId}"`;

    let body;
    if (response.body && typeof Readable.fromWeb === 'function') {
      body = Readable.fromWeb(response.body);
    } else {
      body = Buffer.from(await response.arrayBuffer());
    }

    return {
      body,
      contentType,
      contentDisposition,
    };
  },

  async health() {
    let config;
    try {
      config = this.getConfig();
    } catch (error) {
      return {
        ok: false,
        configured: false,
        message: error.message,
      };
    }

    try {
      // Prefer documents as the smoke endpoint; any 401/404 still proves connectivity.
      const response = await fetch(`${config.baseUrl}/api/admin/ops/documents`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });

      return {
        ok: response.ok,
        configured: true,
        baseUrl: config.baseUrl,
        status: response.status,
        message: response.ok
          ? 'local-law admin ops API reachable'
          : `local-law responded ${response.status} for /api/admin/ops/documents`,
      };
    } catch (error) {
      return {
        ok: false,
        configured: true,
        baseUrl: config.baseUrl,
        message: describeFetchFailure(error),
      };
    }
  },
});
