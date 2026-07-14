export const TABS = [
  {
    id: 'documents',
    label: 'Documents',
    endpoint: '/operations/documents',
    resourceType: 'documents',
    statuses: ['completed', 'reviewed', 'archived', 'error'],
  },
  {
    id: 'translations',
    label: 'Translations',
    endpoint: '/operations/translations',
    resourceType: 'translation-requests',
    statuses: ['pending', 'in_progress', 'completed', 'cancelled'],
  },
  {
    id: 'notary-bookings',
    label: 'Notary bookings',
    endpoint: '/operations/notary-bookings',
    resourceType: 'notary-bookings',
    statuses: ['confirmed', 'cancelled', 'refunded'],
  },
  {
    id: 'custom-notary',
    label: 'Custom notary',
    endpoint: '/operations/custom-notary',
    resourceType: 'custom-notary-requests',
    statuses: ['pending', 'in_progress', 'completed', 'cancelled'],
  },
];

export const DETAIL_FIELDS = {
  documents: [
    'documentType',
    'templateId',
    'formData',
    'generatedText',
    'isSaved',
  ],
  translation: ['pageCount', 'totalAmountAed', 'ratePerPageAed'],
  'translation-requests': ['pageCount', 'totalAmountAed', 'ratePerPageAed'],
  notaryBooking: [
    'service',
    'appointmentDate',
    'emirate',
    'notes',
    'calendlyUrl',
    'calendlyEventUri',
    'calendlyCancelUrl',
    'calendlyRescheduleUrl',
  ],
  'notary-bookings': [
    'service',
    'appointmentDate',
    'emirate',
    'notes',
    'calendlyUrl',
    'calendlyEventUri',
    'calendlyCancelUrl',
    'calendlyRescheduleUrl',
  ],
  customNotary: ['service', 'fullName', 'phone', 'description'],
  'custom-notary-requests': ['service', 'fullName', 'phone', 'description'],
};

export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function customerLabel(customer) {
  if (!customer) return '—';
  if (customer.name && customer.email) {
    return `${customer.name} (${customer.email})`;
  }
  return customer.email || customer.name || customer.userId || '—';
}
