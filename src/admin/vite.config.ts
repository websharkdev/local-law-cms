import path from 'node:path';
import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Force a single CodeMirror instance — duplicate copies break instanceof checks
  // and surface as: "Unrecognized extension value in extension set"
  // See: https://github.com/strapi/strapi/issues/26951
  return mergeConfig(config, {
    resolve: {
      dedupe: [
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/language',
        '@codemirror/commands',
        '@uiw/react-codemirror',
        '@strapi/design-system',
      ],
      alias: {
        '@codemirror/state': path.resolve(
          process.cwd(),
          'node_modules/@codemirror/state',
        ),
        '@codemirror/view': path.resolve(
          process.cwd(),
          'node_modules/@codemirror/view',
        ),
      },
    },
  });
};
