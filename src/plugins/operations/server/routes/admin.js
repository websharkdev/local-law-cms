'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/documents',
    handler: 'operations.findDocuments',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/translations',
    handler: 'operations.findTranslationRequests',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/notary-bookings',
    handler: 'operations.findNotaryBookings',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/custom-notary',
    handler: 'operations.findCustomNotaryRequests',
    config: {
      policies: [],
    },
  },
  {
    // Admin fetch client exposes put/post, not patch. Proxy still PATCHes local-law.
    method: 'PUT',
    path: '/:type/:id/status',
    handler: 'operations.updateStatus',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/:type/:id/files/:fileId/download',
    handler: 'operations.downloadFile',
    config: {
      policies: [],
    },
  },
];
