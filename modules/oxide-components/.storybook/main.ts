import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("storybook-addon-pseudo-states")
  ],
  framework: {
    "name": "@storybook/react-vite",
    "options": {}
  },
  docs:{
    defaultName: "Documentation"
  },
  viteFinal: (config) => {
    config.server ??= {}
    config.server.allowedHosts = ['host.docker.internal'];
    return config;
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      propFilter: (prop) => prop.parent?.fileName.includes("src") ?? false,
      shouldRemoveUndefinedFromOptional: true,
    },
  }
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
