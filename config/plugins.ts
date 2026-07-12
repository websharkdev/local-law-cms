import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      // Cloudflare R2 (S3-compatible) when credentials are set, local disk otherwise.
      // R2 has no ACL support — public access goes through AWS_BASE_URL (custom domain / r2.dev).
      ...(env('AWS_ACCESS_KEY_ID')
        ? {
            provider: 'aws-s3',
            providerOptions: {
              baseUrl: env('AWS_BASE_URL'),
              s3Options: {
                credentials: {
                  accessKeyId: env('AWS_ACCESS_KEY_ID'),
                  secretAccessKey: env('AWS_ACCESS_SECRET'),
                },
                region: env('AWS_REGION', 'auto'),
                endpoint: env('AWS_ENDPOINT'),
                params: {
                  Bucket: env('AWS_BUCKET'),
                },
              },
            },
          }
        : {}),
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
    },
  },
});

export default config;
