import type { Config } from 'svgo';

export interface PluginOptions {
  name: string;
  diffDefault?: boolean;
  diffIgnore?: string[];
  licenseHeader?: string;
  svgo?: Config;
}

const defaultSvgoOptions: Config = {
  plugins: [
    'removeXMLNS',
    'removeDimensions',
    'removeUselessDefs',
    'removeUselessStrokeAndFill',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'removeEmptyText',
    'removeHiddenElems',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeOffCanvasPaths',
    'removeStyleElement',
    'removeScriptElement',
    'removeComments',
    'convertStyleToAttrs',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'cleanupAttrs',
    'cleanupEnableBackground',
    'cleanupIds',
    'cleanupNumericValues',
    'collapseGroups',
    'mergePaths',
    'minifyStyles',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'prefixIds',
    'removeEmptyAttrs',
    'removeRasterImages',
    'removeViewBox',
    'sortAttrs',
    'sortDefsChildren'
  ]
};

const defaultOptions: PluginOptions = {
  name: 'default',
  diffDefault: false,
  diffIgnore: [],
  licenseHeader: '/* Icons generated using the Oxide Icons Tool */\n',
  svgo: defaultSvgoOptions
};

export default {
  pluginName: 'oxide-icons-tools',
  getPluginOptions: (options: Partial<PluginOptions>): PluginOptions => ({
    ...defaultOptions,
    ...options,
    svgo: options.svgo ? { ...defaultSvgoOptions, ...options.svgo } : defaultSvgoOptions
  })
};