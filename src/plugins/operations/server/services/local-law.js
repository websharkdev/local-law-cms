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
    const baseUrl = (process.env.LOCAL_LAW_URL || '').replace(/\/$/, '');
    const token = process.env.LOCAL_LAW_ADMIN_API_TOKEN;

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

    let response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: expectJson ? 'application/json' : '*/*',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      strapi.log.error(`operations: local-law request failed ${method} ${path}`, error);
      throw new LocalLawApiError(`Failed to reach local-law at ${path}`, 502);
    }

    if (!response.ok) {
      let details;
      try {
        details = await response.json();
      } catch {
        details = await response.text().catch(() => undefined);
      }

      strapi.log.warn(
        `operations: local-law responded ${response.status} for ${method} ${path}`,
      );
      throw new LocalLawApiError(
        `local-law returned ${response.status} for ${path}`,
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
});
