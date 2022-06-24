import { Arr, Fun, Merger, Obj, Strings, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { NormalizedEditorOptions, RawEditorOptions } from '../api/OptionTypes';
import Tools from '../api/util/Tools';

interface SectionResult {
  sections: () => Record<string, Partial<RawEditorOptions>>;
  options: () => RawEditorOptions;
}

const sectionResult = (sections: Record<string, Partial<RawEditorOptions>>, settings: RawEditorOptions): SectionResult => ({
  sections: Fun.constant(sections),
  options: Fun.constant(settings)
});

const deviceDetection = PlatformDetection.detect().deviceType;
const isPhone = deviceDetection.isPhone();
const isTablet = deviceDetection.isTablet();

const normalizePlugins = (plugins: string | string[] | undefined) => {
  if (Type.isNullable(plugins)) {
    return [];
  } else {
    const pluginNames = Type.isArray(plugins) ? plugins : plugins.split(/[ ,]/);
    const trimmedPlugins = Arr.map(pluginNames, Strings.trim);
    return Arr.filter(trimmedPlugins, Strings.isNotEmpty);
  }
};

const extractSections = (keys: string[], options: RawEditorOptions) => {
  const result = Obj.bifilter(options, (value, key) => {
    return Arr.contains(keys, key);
  });

  return sectionResult(result.t, result.f);
};

const getSection = (sectionResult: SectionResult, name: string, defaults: Partial<RawEditorOptions> = { }) => {
  const sections = sectionResult.sections();
  const sectionOptions = Obj.get(sections, name).getOr({});
  return Tools.extend({}, defaults, sectionOptions);
};

const hasSection = (sectionResult: SectionResult, name: string) => {
  return Obj.has(sectionResult.sections(), name);
};

const getSectionConfig = (sectionResult: SectionResult, name: string) => {
  return hasSection(sectionResult, name) ? sectionResult.sections()[name] : {};
};

// Get a list of options to override any desktop options
const getMobileOverrideOptions = (mobileOptions: RawEditorOptions, isPhone: boolean): RawEditorOptions => {
  const defaultMobileOptions: RawEditorOptions = {
    table_grid: false,           // Table grid relies on hover, which isn't available for touch devices so use the dialog instead
    object_resizing: false,      // No nice way to do object resizing at this stage
    resize: false,               // Editor resize doesn't make sense on mobile
    toolbar_mode: Obj.get(mobileOptions, 'toolbar_mode').getOr('scrolling'),   // Use the default side-scrolling toolbar for tablets/phones
    toolbar_sticky: false        // Only enable sticky toolbar on desktop by default
  };

  const defaultPhoneOptions: RawEditorOptions = {
    menubar: false               // Phones don't have a lot of screen space, so disable the menubar
  };

  return {
    ...defaultMobileOptions,
    ...isPhone ? defaultPhoneOptions : { }
  };
};

const getExternalPlugins = (overrideOptions: RawEditorOptions, options: RawEditorOptions) => {
  const userDefinedExternalPlugins = options.external_plugins ?? { };
  if (overrideOptions && overrideOptions.external_plugins) {
    return Tools.extend({}, overrideOptions.external_plugins, userDefinedExternalPlugins);
  } else {
    return userDefinedExternalPlugins;
  }
};

const combinePlugins = (forcedPlugins: string[], plugins: string[]): string[] => [
  ...normalizePlugins(forcedPlugins),
  ...normalizePlugins(plugins)
];

const getPlatformPlugins = (isMobileDevice: boolean, sectionResult: SectionResult, desktopPlugins: string[], mobilePlugins: string[]): string[] => {
  // is a mobile device with any mobile options
  if (isMobileDevice && hasSection(sectionResult, 'mobile')) {
    return mobilePlugins;
  // is desktop
  } else {
    return desktopPlugins;
  }
};

const processPlugins = (isMobileDevice: boolean, sectionResult: SectionResult, defaultOverrideOptions: RawEditorOptions, options: RawEditorOptions & { external_plugins: Record<string, string> }): NormalizedEditorOptions => {
  const forcedPlugins = normalizePlugins(defaultOverrideOptions.forced_plugins);
  const desktopPlugins = normalizePlugins(options.plugins);

  const mobileConfig = getSectionConfig(sectionResult, 'mobile');
  const mobilePlugins = mobileConfig.plugins ? normalizePlugins(mobileConfig.plugins) : desktopPlugins;

  const platformPlugins = getPlatformPlugins(isMobileDevice, sectionResult, desktopPlugins, mobilePlugins);

  const combinedPlugins = combinePlugins(forcedPlugins, platformPlugins);

  return Tools.extend(options, {
    forced_plugins: forcedPlugins,
    plugins: combinedPlugins
  });
};

const isOnMobile = (isMobileDevice: boolean, sectionResult: SectionResult) => {
  return isMobileDevice && hasSection(sectionResult, 'mobile');
};

const combineOptions = (isMobileDevice: boolean, isPhone: boolean, defaultOptions: RawEditorOptions, defaultOverrideOptions: RawEditorOptions, options: RawEditorOptions): NormalizedEditorOptions => {
  // Use mobile mode by default on phones, so patch in the mobile override options
  const deviceOverrideOptions = isMobileDevice ? { mobile: getMobileOverrideOptions(options.mobile ?? {}, isPhone) } : { };
  const sectionResult = extractSections([ 'mobile' ], Merger.deepMerge(deviceOverrideOptions, options));

  const extendedOptions = Tools.extend(
    // Default options
    defaultOptions,

    // tinymce.overrideOptions options
    defaultOverrideOptions,

    // User options
    sectionResult.options(),

    // Sections
    isOnMobile(isMobileDevice, sectionResult) ? getSection(sectionResult, 'mobile') : { },

    // Forced options
    {
      external_plugins: getExternalPlugins(defaultOverrideOptions, sectionResult.options())
    }
  );

  return processPlugins(isMobileDevice, sectionResult, defaultOverrideOptions, extendedOptions);
};

const normalizeOptions = (defaultOverrideOptions: RawEditorOptions, options: RawEditorOptions): NormalizedEditorOptions =>
  combineOptions(isPhone || isTablet, isPhone, options, defaultOverrideOptions, options);

export {
  normalizeOptions,
  combineOptions,
  getMobileOverrideOptions
};
