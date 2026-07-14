'use strict';

function sendError(ctx, error) {
  const status = error.status || 500;
  ctx.status = status;
  ctx.body = {
    error: {
      status,
      name: error.name || 'Error',
      message: error.message || 'Unexpected error',
      details: error.details,
    },
  };
}

module.exports = {
  async health(ctx) {
    try {
      const data = await strapi.plugin('operations').service('local-law').health();
      ctx.status = data.ok ? 200 : data.configured ? 502 : 503;
      ctx.body = { data };
    } catch (error) {
      sendError(ctx, error);
    }
  },

  async findDocuments(ctx) {
    try {
      const data = await strapi.plugin('operations').service('local-law').list('documents');
      ctx.body = { data };
    } catch (error) {
      sendError(ctx, error);
    }
  },

  async findTranslationRequests(ctx) {
    try {
      const data = await strapi
        .plugin('operations')
        .service('local-law')
        .list('translation-requests');
      ctx.body = { data };
    } catch (error) {
      sendError(ctx, error);
    }
  },

  async findNotaryBookings(ctx) {
    try {
      const data = await strapi
        .plugin('operations')
        .service('local-law')
        .list('notary-bookings');
      ctx.body = { data };
    } catch (error) {
      sendError(ctx, error);
    }
  },

  async findCustomNotaryRequests(ctx) {
    try {
      const data = await strapi
        .plugin('operations')
        .service('local-law')
        .list('custom-notary-requests');
      ctx.body = { data };
    } catch (error) {
      sendError(ctx, error);
    }
  },

  async updateStatus(ctx) {
    try {
      const { type, id } = ctx.params;
      const status = ctx.request.body?.status;

      if (!status || typeof status !== 'string') {
        ctx.status = 400;
        ctx.body = {
          error: {
            status: 400,
            name: 'ValidationError',
            message: 'Body must include a string "status"',
          },
        };
        return;
      }

      // Payment status and deletes are intentionally unsupported.
      if (ctx.request.body?.payment || ctx.request.body?.paymentStatus) {
        ctx.status = 400;
        ctx.body = {
          error: {
            status: 400,
            name: 'ValidationError',
            message: 'Payment status cannot be changed from Operations',
          },
        };
        return;
      }

      const data = await strapi
        .plugin('operations')
        .service('local-law')
        .updateStatus(type, id, status);

      ctx.body = { data };
    } catch (error) {
      sendError(ctx, error);
    }
  },

  async downloadFile(ctx) {
    try {
      const { type, id, fileId } = ctx.params;
      const file = await strapi
        .plugin('operations')
        .service('local-law')
        .downloadFile(type, id, fileId);

      ctx.set('Content-Type', file.contentType);
      ctx.set('Content-Disposition', file.contentDisposition);
      ctx.body = file.body;
    } catch (error) {
      sendError(ctx, error);
    }
  },
};
