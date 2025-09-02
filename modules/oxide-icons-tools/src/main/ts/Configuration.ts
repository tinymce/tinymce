import type * as SVGO from 'svgo';

export interface PluginOptions {
  name: string;
  filePaths?: string[];
  diffDefault?: boolean;
  diffIgnore?: string[];
  svgo?: SVGO.OptimizeOptions;
  licenseHeader?: string;
}

const pluginName = 'gulp-oxide-icons';

const defaultIconPackage = '@tinymce/oxide-icons-default';

const requiredClasses: Record<string, string> = {
  'highlight-bg-color': 'tox-icon-highlight-bg-color__color',
  'text-color': 'tox-icon-text-color__color'
};

type KeysOfUnion<U> = U extends object ? keyof U : never;
type SvgoPluginName = KeysOfUnion<SVGO.Plugin>;

const mergeSvgoPluginConfig = (target: SVGO.Plugin[], source: SVGO.Plugin[]): SVGO.Plugin[] => {
  const merged = target.concat(source).reduce<Partial<Record<SvgoPluginName, SVGO.Plugin>>>(
    (acc, plugin) => {
      if (typeof plugin === 'string') {
        return { ...acc, [plugin]: plugin };
      } else if (plugin.name === 'preset-default') {
        // For preset-default we need to do a deep merge to ensure the default overrides are kept
        return {
          ...acc,
          [plugin.name]: {
            ...plugin,
            params: {
              ...(plugin.params ?? {}),
              overrides: {
                ...((plugin as SVGO.PresetDefault).params?.overrides ?? {})
              }
            }
          }
        };
      } else {
        return { ...acc, [plugin.name]: plugin };
      }
    },
    {}
  );

  return Object.values(merged);
};

const mergeSvgoOptions = (target: SVGO.OptimizeOptions, source: SVGO.OptimizeOptions): SVGO.OptimizeOptions => ({
  ...target,
  ...source,
  plugins: mergeSvgoPluginConfig(target.plugins || [], source.plugins || [])
});

const getPluginOptions = (overrides: PluginOptions): Required<PluginOptions> => {
  const defaultSvgoOptions: SVGO.OptimizeOptions = {
    floatPrecision: 1,
    plugins: [
      'removeTitle',
      'convertStyleToAttrs',
      {
        name: 'removeAttrs',
        params: {
          attrs: 'fill'
        }
      },
      'removeXMLNS',
      {
        name: 'preset-default',
        params: {
        }
      },
    ]
  };

  return {
    diffDefault: false,
    diffIgnore: [],
    filePaths: [],
    licenseHeader: '',
    ...overrides,
    svgo: mergeSvgoOptions(defaultSvgoOptions, overrides.svgo || {}),
  };
};

export default {
  requiredClasses,
  pluginName,
  getPluginOptions,
  defaultIconPackage
};