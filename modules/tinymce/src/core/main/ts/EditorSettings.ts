/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Merger, Obj, Optional, Strings, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import Editor from './api/Editor';
import Env from './api/Env';
import { EditorSettings, RawEditorSettings, ToolbarMode } from './api/SettingsTypes';
import Tools from './api/util/Tools';
import { logDeprecationsWarning } from './Deprecations';

export interface ParamTypeMap {
  'hash': Record<string, string>;
  'string': string;
  'number': number;
  'boolean': boolean;
  'string[]': string[];
  'array': any[];
}

interface SectionResult {
  sections: () => Record<string, Partial<RawEditorSettings>>;
  settings: () => RawEditorSettings;
}

const sectionResult = (sections: Record<string, Partial<RawEditorSettings>>, settings: RawEditorSettings): SectionResult => ({
  sections: Fun.constant(sections),
  settings: Fun.constant(settings)
});

const deviceDetection = PlatformDetection.detect().deviceType;
const isTouch = deviceDetection.isTouch();
const isPhone = deviceDetection.isPhone();
const isTablet = deviceDetection.isTablet();
const legacyMobilePlugins = [ 'lists', 'autolink', 'autosave' ];
const defaultTouchSettings: RawEditorSettings = {
  table_grid: false,          // Table grid relies on hover, which isn't available so use the dialog instead
  object_resizing: false,     // No nice way to do object resizing at this stage
  resize: false              // Editor resize doesn't work on touch devices at this stage
};

const normalizePlugins = (plugins: string | string[]) => {
  const pluginNames = Type.isArray(plugins) ? plugins.join(' ') : plugins;
  const trimmedPlugins = Arr.map(Type.isString(pluginNames) ? pluginNames.split(' ') : [ ], Strings.trim);
  return Arr.filter(trimmedPlugins, (item) => {
    return item.length > 0;
  });
};

// Filter out plugins for the legacy mobile theme
const filterLegacyMobilePlugins = (plugins: string[]) => {
  return Arr.filter(plugins, Fun.curry(Arr.contains, legacyMobilePlugins));
};

const extractSections = (keys, settings) => {
  const result = Obj.bifilter(settings, (value, key) => {
    return Arr.contains(keys, key);
  });

  return sectionResult(result.t, result.f);
};

const getSection = (sectionResult: SectionResult, name: string, defaults: Partial<RawEditorSettings> = { }) => {
  const sections = sectionResult.sections();
  const sectionSettings = Obj.get(sections, name).getOr({});
  return Tools.extend({}, defaults, sectionSettings);
};

const hasSection = (sectionResult: SectionResult, name: string) => {
  return Obj.has(sectionResult.sections(), name);
};

const isSectionTheme = (sectionResult: SectionResult, name: string, theme: string) => {
  const section = sectionResult.sections();
  return hasSection(sectionResult, name) && section[name].theme === theme;
};

const getSectionConfig = (sectionResult: SectionResult, name: string) => {
  return hasSection(sectionResult, name) ? sectionResult.sections()[name] : {};
};

const getToolbarMode = (settings: RawEditorSettings, defaultVal: ToolbarMode) =>
  // If toolbar_mode is unset by the user, fall back to:
  Obj.get(settings, 'toolbar_mode')
    .orThunk(() => Obj.get(settings, 'toolbar_drawer').map((val) => val === false ? 'wrap' : val))     // #1 toolbar_drawer
    .getOr(defaultVal);                                // #2 defaultVal

const getDefaultSettings = (settings: RawEditorSettings, id: string, documentBaseUrl: string, isTouch: boolean, editor: Editor): RawEditorSettings => {
  const baseDefaults: RawEditorSettings = {
    id,
    theme: 'silver',
    toolbar_mode: getToolbarMode(settings, 'floating'),
    plugins: '',
    document_base_url: documentBaseUrl,
    add_form_submit_trigger: true,
    submit_patch: true,
    add_unload_trigger: true,
    convert_urls: true,
    relative_urls: true,
    remove_script_host: true,
    object_resizing: true,
    doctype: '<!DOCTYPE html>',
    visual: true,

    // See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
    font_size_legacy_values: 'xx-small,small,medium,large,x-large,xx-large,300%',
    forced_root_block: 'p',
    hidden_input: true,
    inline_styles: true,
    convert_fonts_to_spans: true,
    indent: true,
    indent_before: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
    'tfoot,tbody,tr,section,summary,article,hgroup,aside,figure,figcaption,option,optgroup,datalist',
    indent_after: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
    'tfoot,tbody,tr,section,summary,article,hgroup,aside,figure,figcaption,option,optgroup,datalist',
    entity_encoding: 'named',
    // Note: Don't bind here, as the binding is handled via the `url_converter_scope`
    // eslint-disable-next-line @typescript-eslint/unbound-method
    url_converter: editor.convertURL,
    url_converter_scope: editor
  };

  return {
    ...baseDefaults,
    ...isTouch ? defaultTouchSettings : { }
  };
};

const getDefaultMobileSettings = (mobileSettings: RawEditorSettings, isPhone: boolean): RawEditorSettings => {
  const defaultMobileSettings: RawEditorSettings = {
    resize: false,               // Editor resize doesn't make sense on mobile
    toolbar_mode: getToolbarMode(mobileSettings, 'scrolling'),   // Use the default side-scrolling toolbar for tablets/phones
    toolbar_sticky: false        // Only enable sticky toolbar on desktop by default
  };

  const defaultPhoneSettings: RawEditorSettings = {
    menubar: false               // Phones don't have a lot of screen space, so disable the menubar
  };

  return {
    ...defaultTouchSettings,
    ...defaultMobileSettings,
    ...isPhone ? defaultPhoneSettings : { }
  };
};

const getExternalPlugins = (overrideSettings: RawEditorSettings, settings: RawEditorSettings) => {
  const userDefinedExternalPlugins = settings.external_plugins ? settings.external_plugins : { };
  if (overrideSettings && overrideSettings.external_plugins) {
    return Tools.extend({}, overrideSettings.external_plugins, userDefinedExternalPlugins);
  } else {
    return userDefinedExternalPlugins;
  }
};

const combinePlugins = (forcedPlugins: string[], plugins: string[]): string[] => {
  return [].concat(normalizePlugins(forcedPlugins)).concat(normalizePlugins(plugins));
};

const getPlatformPlugins = (isMobileDevice: boolean, sectionResult: SectionResult, desktopPlugins: string[], mobilePlugins: string[]): string[] => {
  // is a mobile device with mobile theme
  if (isMobileDevice && isSectionTheme(sectionResult, 'mobile', 'mobile')) {
    return filterLegacyMobilePlugins(mobilePlugins);
  // is a mobile device with any mobile settings
  } else if (isMobileDevice && hasSection(sectionResult, 'mobile')) {
    return mobilePlugins;
  // is desktop
  } else {
    return desktopPlugins;
  }
};

const processPlugins = (isMobileDevice: boolean, sectionResult: SectionResult, defaultOverrideSettings: RawEditorSettings, settings: RawEditorSettings & { external_plugins: Record<string, string> }): EditorSettings => {
  const forcedPlugins = normalizePlugins(defaultOverrideSettings.forced_plugins);
  const desktopPlugins = normalizePlugins(settings.plugins);

  const mobileConfig = getSectionConfig(sectionResult, 'mobile');
  const mobilePlugins = mobileConfig.plugins ? normalizePlugins(mobileConfig.plugins) : desktopPlugins;

  const platformPlugins = getPlatformPlugins(isMobileDevice, sectionResult, desktopPlugins, mobilePlugins);

  const combinedPlugins = combinePlugins(forcedPlugins, platformPlugins);

  if (Env.browser.isIE() && Arr.contains(combinedPlugins, 'rtc')) {
    throw new Error('RTC plugin is not supported on IE 11.');
  }

  return Tools.extend(settings, {
    plugins: combinedPlugins.join(' ')
  });
};

const isOnMobile = (isMobileDevice: boolean, sectionResult: SectionResult) => {
  return isMobileDevice && hasSection(sectionResult, 'mobile');
};

const combineSettings = (isMobileDevice: boolean, isPhone: boolean, defaultSettings: RawEditorSettings, defaultOverrideSettings: RawEditorSettings, settings: RawEditorSettings): EditorSettings => {
  // Use mobile mode by default on phones, so patch in the default mobile settings
  const defaultDeviceSettings = isMobileDevice ? { mobile: getDefaultMobileSettings(settings.mobile || {}, isPhone) } : { };
  const sectionResult = extractSections([ 'mobile' ], Merger.deepMerge(defaultDeviceSettings, settings));

  const extendedSettings = Tools.extend(
    // Default settings
    defaultSettings,

    // tinymce.overrideDefaults settings
    defaultOverrideSettings,

    // User settings
    sectionResult.settings(),

    // Sections
    isOnMobile(isMobileDevice, sectionResult) ? getSection(sectionResult, 'mobile') : { },

    // Forced settings
    {
      validate: true,
      external_plugins: getExternalPlugins(defaultOverrideSettings, sectionResult.settings())
    }
  );

  return processPlugins(isMobileDevice, sectionResult, defaultOverrideSettings, extendedSettings);
};

const getEditorSettings = (editor: Editor, id: string, documentBaseUrl: string, defaultOverrideSettings: RawEditorSettings, settings: RawEditorSettings): EditorSettings => {
  const defaultSettings = getDefaultSettings(settings, id, documentBaseUrl, isTouch, editor);
  const finalSettings = combineSettings(isPhone || isTablet, isPhone, defaultSettings, defaultOverrideSettings, settings);
  if (finalSettings.deprecation_warnings !== false) {
    logDeprecationsWarning(settings, finalSettings);
  }
  return finalSettings;
};

const getFiltered = <K extends keyof EditorSettings> (predicate: (x: any) => boolean, editor: Editor, name: K): Optional<EditorSettings[K]> => Optional.from(editor.settings[name]).filter(predicate);

const getParamObject = (value: string) => {
  let output = {};

  if (typeof value === 'string') {
    Arr.each(value.indexOf('=') > 0 ? value.split(/[;,](?![^=;,]*(?:[;,]|$))/) : value.split(','), (val: string) => {
      const arr = val.split('=');

      if (arr.length > 1) {
        output[Tools.trim(arr[0])] = Tools.trim(arr[1]);
      } else {
        output[Tools.trim(arr[0])] = Tools.trim(arr[0]);
      }
    });
  } else {
    output = value;
  }

  return output;
};

const isArrayOf = (p: (a: any) => boolean) => (a: any) => Type.isArray(a) && Arr.forall(a, p);

const getParam = (editor: Editor, name: string, defaultVal?: any, type?: string) => {
  const value = name in editor.settings ? editor.settings[name] : defaultVal;

  if (type === 'hash') {
    return getParamObject(value);
  } else if (type === 'string') {
    return getFiltered(Type.isString, editor, name).getOr(defaultVal);
  } else if (type === 'number') {
    return getFiltered(Type.isNumber, editor, name).getOr(defaultVal);
  } else if (type === 'boolean') {
    return getFiltered(Type.isBoolean, editor, name).getOr(defaultVal);
  } else if (type === 'object') {
    return getFiltered(Type.isObject, editor, name).getOr(defaultVal);
  } else if (type === 'array') {
    return getFiltered(Type.isArray, editor, name).getOr(defaultVal);
  } else if (type === 'string[]') {
    return getFiltered(isArrayOf(Type.isString), editor, name).getOr(defaultVal);
  } else if (type === 'function') {
    return getFiltered(Type.isFunction, editor, name).getOr(defaultVal);
  } else {
    return value;
  }
};

export { getEditorSettings, getParam, combineSettings, getDefaultSettings, getDefaultMobileSettings };
