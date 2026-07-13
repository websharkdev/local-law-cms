import type { Schema, Struct } from "@strapi/strapi";

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: "components_blocks_ctas";
  info: {
    displayName: "CTA";
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    buttonUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksFaq extends Struct.ComponentSchema {
  collectionName: "components_blocks_faqs";
  info: {
    displayName: "FAQ";
    icon: "question";
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    items: Schema.Attribute.Component<"blocks.faq-item", true>;
  };
}

export interface BlocksFaqItem extends Struct.ComponentSchema {
  collectionName: "components_blocks_faq_items";
  info: {
    displayName: "FAQ Item";
    icon: "question-circle";
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    answer: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    question: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface BlocksFeatureList extends Struct.ComponentSchema {
  collectionName: "components_blocks_feature_lists";
  info: {
    displayName: "Feature List";
  };
  attributes: {
    features: Schema.Attribute.Component<"shared.feature", true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: "components_blocks_heroes";
  info: {
    displayName: "Hero";
    icon: "car";
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<"images">;
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    secondaryCtaHref: Schema.Attribute.String;
    secondaryCtaLabel: Schema.Attribute.String;
    subheadline: Schema.Attribute.Text;
    videoUrl: Schema.Attribute.String;
  };
}

export interface BlocksLawyerGrid extends Struct.ComponentSchema {
  collectionName: "components_blocks_lawyer_grids";
  info: {
    displayName: "Lawyer Grid";
  };
  attributes: {
    limit: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<6>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksMedia extends Struct.ComponentSchema {
  collectionName: "components_blocks_medias";
  info: {
    displayName: "Media";
  };
  attributes: {
    caption: Schema.Attribute.String;
    media: Schema.Attribute.Media<"images" | "videos">;
  };
}

export interface BlocksPricing extends Struct.ComponentSchema {
  collectionName: "components_blocks_pricings";
  info: {
    displayName: "Pricing";
    icon: "money-bill-wave";
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    currency: Schema.Attribute.Enumeration<["AED", "USD", "EUR", "GBP"]> &
      Schema.Attribute.DefaultTo<"AED">;
    features: Schema.Attribute.Component<"shared.feature-item", true>;
    period: Schema.Attribute.String & Schema.Attribute.DefaultTo<"month">;
    price: Schema.Attribute.Integer & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: "components_blocks_rich_texts";
  info: {
    displayName: "Rich Text";
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface BlocksTestimonial extends Struct.ComponentSchema {
  collectionName: "components_blocks_testimonials";
  info: {
    displayName: "Testimonial";
    icon: "quote";
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    items: Schema.Attribute.Component<"blocks.testimonial-item", true>;
  };
}

export interface BlocksTestimonialItem extends Struct.ComponentSchema {
  collectionName: "components_blocks_testimonial_items";
  info: {
    displayName: "Testimonial Item";
    icon: "user";
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    avatar: Schema.Attribute.Media<"images">;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    quote: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    role: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface DashboardChatChip extends Struct.ComponentSchema {
  collectionName: "components_dashboard_chat_chips";
  info: {
    description: "AI chat suggestion chip on the dashboard";
    displayName: "Chat Chip";
    icon: "message";
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    prompt: Schema.Attribute.Text;
  };
}

export interface DashboardHelpBanner extends Struct.ComponentSchema {
  collectionName: "components_dashboard_help_banners";
  info: {
    description: "Dashboard help / CTA banner";
    displayName: "Help Banner";
    icon: "information";
  };
  attributes: {
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface DashboardTrendingQuestion extends Struct.ComponentSchema {
  collectionName: "components_dashboard_trending_questions";
  info: {
    description: "Promoted question for the AI chat";
    displayName: "Trending Question";
    icon: "question";
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface DocField extends Struct.ComponentSchema {
  collectionName: "components_doc_fields";
  info: {
    description: "One input field of a document generation form";
    displayName: "Form Field";
    icon: "pencil";
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
        "text",
        "textarea",
        "date",
        "select",
        "radio",
        "checkbox",
        "number",
        "email",
        "phone",
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"text">;
  };
}

export interface LawyerConsultationOption extends Struct.ComponentSchema {
  collectionName: "components_lawyer_consultation_options";
  info: {
    description: "How a consultation can be delivered";
    displayName: "Consultation Option";
    icon: "calendar";
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<["inPerson", "video", "phone"]> &
      Schema.Attribute.DefaultTo<"inPerson">;
  };
}

export interface LawyerEducationItem extends Struct.ComponentSchema {
  collectionName: "components_lawyer_education_items";
  info: {
    description: "Degree, certificate or qualification";
    displayName: "Education Item";
    icon: "graduation-cap";
  };
  attributes: {
    degree: Schema.Attribute.String & Schema.Attribute.Required;
    institution: Schema.Attribute.String;
    year: Schema.Attribute.String;
  };
}

export interface LawyerNotableCase extends Struct.ComponentSchema {
  collectionName: "components_lawyer_notable_cases";
  info: {
    description: "Landmark case or achievement";
    displayName: "Notable Case";
    icon: "briefcase";
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    year: Schema.Attribute.String;
  };
}

export interface LawyerPracticeArea extends Struct.ComponentSchema {
  collectionName: "components_lawyer_practice_areas";
  info: {
    description: "Area of legal practice shown on the profile";
    displayName: "Practice Area";
    icon: "layer";
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LawyerServiceOffered extends Struct.ComponentSchema {
  collectionName: "components_lawyer_services_offered";
  info: {
    description: "Service listed on the lawyer profile";
    displayName: "Service Offered";
    icon: "check";
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ReqFile extends Struct.ComponentSchema {
  collectionName: "components_req_files";
  info: {
    description: "Metadata of a client-uploaded file stored in the app storage";
    displayName: "Request File";
    icon: "file";
  };
  attributes: {
    fileName: Schema.Attribute.String & Schema.Attribute.Required;
    mimeType: Schema.Attribute.String;
    pageCount: Schema.Attribute.Integer;
    storageKey: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ScheduleBlackoutDate extends Struct.ComponentSchema {
  collectionName: "components_schedule_blackout_dates";
  info: {
    description: "A single date when bookings are closed";
    displayName: "Blackout Date";
    icon: "cross";
  };
  attributes: {
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    note: Schema.Attribute.String;
  };
}

export interface ScheduleTimeOff extends Struct.ComponentSchema {
  collectionName: "components_schedule_time_offs";
  info: {
    description: "Vacation, sick leave or a day off";
    displayName: "Time Off";
    icon: "sun";
  };
  attributes: {
    endDate: Schema.Attribute.Date & Schema.Attribute.Required;
    note: Schema.Attribute.String;
    startDate: Schema.Attribute.Date & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<["vacation", "sick", "dayOff"]> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"dayOff">;
  };
}

export interface ScheduleWorkingDay extends Struct.ComponentSchema {
  collectionName: "components_schedule_working_days";
  info: {
    description: "Working hours for one weekday";
    displayName: "Working Day";
    icon: "clock";
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
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface SharedFeature extends Struct.ComponentSchema {
  collectionName: "components_shared_features";
  info: {
    displayName: "Feature";
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFeatureItem extends Struct.ComponentSchema {
  collectionName: "components_shared_feature_items";
  info: {
    displayName: "Feature Item";
  };
  attributes: {
    included: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMenuLink extends Struct.ComponentSchema {
  collectionName: "components_shared_menu_links";
  info: {
    displayName: "Menu Link";
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: "components_shared_seos";
  info: {
    description: "";
    displayName: "Seo";
    icon: "allergies";
    name: "Seo";
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    shareImage: Schema.Attribute.Media<"images">;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: "components_shared_social_links";
  info: {
    displayName: "Social Link";
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      [
        "facebook",
        "instagram",
        "linkedin",
        "x",
        "youtube",
        "telegram",
        "whatsapp",
        "tiktok",
      ]
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTag extends Struct.ComponentSchema {
  collectionName: "components_shared_tags";
  info: {
    displayName: "Tag";
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module "@strapi/strapi" {
  export namespace Public {
    export interface ComponentSchemas {
      "blocks.cta": BlocksCta;
      "blocks.faq": BlocksFaq;
      "blocks.faq-item": BlocksFaqItem;
      "blocks.feature-list": BlocksFeatureList;
      "blocks.hero": BlocksHero;
      "blocks.lawyer-grid": BlocksLawyerGrid;
      "blocks.media": BlocksMedia;
      "blocks.pricing": BlocksPricing;
      "blocks.rich-text": BlocksRichText;
      "blocks.testimonial": BlocksTestimonial;
      "blocks.testimonial-item": BlocksTestimonialItem;
      "dashboard.chat-chip": DashboardChatChip;
      "dashboard.help-banner": DashboardHelpBanner;
      "dashboard.trending-question": DashboardTrendingQuestion;
      "doc.field": DocField;
      "lawyer.consultation-option": LawyerConsultationOption;
      "lawyer.education-item": LawyerEducationItem;
      "lawyer.notable-case": LawyerNotableCase;
      "lawyer.practice-area": LawyerPracticeArea;
      "lawyer.service-offered": LawyerServiceOffered;
      "req.file": ReqFile;
      "schedule.blackout-date": ScheduleBlackoutDate;
      "schedule.time-off": ScheduleTimeOff;
      "schedule.working-day": ScheduleWorkingDay;
      "shared.feature": SharedFeature;
      "shared.feature-item": SharedFeatureItem;
      "shared.menu-link": SharedMenuLink;
      "shared.seo": SharedSeo;
      "shared.social-link": SharedSocialLink;
      "shared.tag": SharedTag;
    }
  }
}
