import type { Schema, Struct } from '@strapi/strapi';

export interface DocField extends Struct.ComponentSchema {
  collectionName: 'components_doc_fields';
  info: {
    description: 'One input field of a document generation form';
    displayName: 'Form Field';
    icon: 'pencil';
  };
  attributes: {
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    labelAr: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    options: Schema.Attribute.JSON;
    placeholder: Schema.Attribute.String;
    placeholderAr: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    section: Schema.Attribute.String;
    sectionAr: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<
      [
        'text',
        'textarea',
        'date',
        'select',
        'radio',
        'checkbox',
        'number',
        'email',
        'phone',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'text'>;
  };
}

export interface ReqFile extends Struct.ComponentSchema {
  collectionName: 'components_req_files';
  info: {
    description: 'Metadata of a client-uploaded file stored in the app storage';
    displayName: 'Request File';
    icon: 'file';
  };
  attributes: {
    fileName: Schema.Attribute.String & Schema.Attribute.Required;
    mimeType: Schema.Attribute.String;
    pageCount: Schema.Attribute.Integer;
    storageKey: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ScheduleBlackoutDate extends Struct.ComponentSchema {
  collectionName: 'components_schedule_blackout_dates';
  info: {
    description: 'A single date when bookings are closed';
    displayName: 'Blackout Date';
    icon: 'cross';
  };
  attributes: {
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    note: Schema.Attribute.String;
  };
}

export interface ScheduleTimeOff extends Struct.ComponentSchema {
  collectionName: 'components_schedule_time_offs';
  info: {
    description: 'Vacation, sick leave or a day off';
    displayName: 'Time Off';
    icon: 'sun';
  };
  attributes: {
    endDate: Schema.Attribute.Date & Schema.Attribute.Required;
    note: Schema.Attribute.String;
    startDate: Schema.Attribute.Date & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<['vacation', 'sick', 'dayOff']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'dayOff'>;
  };
}

export interface ScheduleWorkingDay extends Struct.ComponentSchema {
  collectionName: 'components_schedule_working_days';
  info: {
    description: 'Working hours for one weekday';
    displayName: 'Working Day';
    icon: 'clock';
  };
  attributes: {
    breakEnd: Schema.Attribute.Time;
    breakStart: Schema.Attribute.Time;
    enabled: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    endTime: Schema.Attribute.Time & Schema.Attribute.Required;
    startTime: Schema.Attribute.Time & Schema.Attribute.Required;
    weekday: Schema.Attribute.Enumeration<
      [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'doc.field': DocField;
      'req.file': ReqFile;
      'schedule.blackout-date': ScheduleBlackoutDate;
      'schedule.time-off': ScheduleTimeOff;
      'schedule.working-day': ScheduleWorkingDay;
      'shared.seo': SharedSeo;
    }
  }
}
