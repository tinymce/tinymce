/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Merger, Obj, Option, Strings, Struct, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import Editor from './api/Editor';
import { EditorSettings, RawEditorSettings } from './api/SettingsTypes';
import Tools from './api/util/Tools';

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

const sectionResult = Struct.immutable('sections', 'settings');
const detection = PlatformDetection.detect();
const isTouch = detection.deviceType.isTouch();
const isPhone = detection.deviceType.isPhone();
const mobilePlugins = [ 'lists', 'autolink', 'autosave' ];
const defaultMobileSettings = { theme: 'mobile' };

const normalizePlugins = function (plugins: string | string[]) {
  const pluginNames = Type.isArray(plugins) ? plugins.join(' ') : plugins;
  const trimmedPlugins = Arr.map(Type.isString(pluginNames) ? pluginNames.split(' ') : [ ], Strings.trim);
  return Arr.filter(trimmedPlugins, function (item) {
    return item.length > 0;
  });
};

const filterMobilePlugins = function (plugins: string[]) {
  return Arr.filter(plugins, Fun.curry(Arr.contains, mobilePlugins));
};

const extractSections = function (keys, settings) {
  const result = Obj.bifilter(settings, function (value, key) {
    return Arr.contains(keys, key);
  });

  return sectionResult(result.t, result.f);
};

const getSection = function (sectionResult: SectionResult, name: string, defaults: Partial<RawEditorSettings> = { }) {
  const sections = sectionResult.sections();
  const sectionSettings = sections.hasOwnProperty(name) ? sections[name] : { };
  return Tools.extend({}, defaults, sectionSettings);
};

const hasSection = function (sectionResult: SectionResult, name: string) {
  return sectionResult.sections().hasOwnProperty(name);
};

const isSectionTheme = function (sectionResult: SectionResult, name: string, theme: string) {
  const section = sectionResult.sections();
  return hasSection(sectionResult, name) && section[name].theme === theme;
};

const getSectionConfig = function (sectionResult: SectionResult, name: string) {
  return hasSection(sectionResult, name) ? sectionResult.sections()[name] : {};
};

const getDefaultSettings = function (id: string, documentBaseUrl: string, editor: Editor): RawEditorSettings {
  return {
    id,
    theme: 'silver',
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
    url_converter: editor.convertURL,
    url_converter_scope: editor
  };
};

const getExternalPlugins = function (overrideSettings: RawEditorSettings, settings: RawEditorSettings) {
  const userDefinedExternalPlugins = settings.external_plugins ? settings.external_plugins : { };
  if (overrideSettings && overrideSettings.external_plugins) {
    return Tools.extend({}, overrideSettings.external_plugins, userDefinedExternalPlugins);
  } else {
    return userDefinedExternalPlugins;
  }
};

const combinePlugins = function (forcedPlugins: string[], plugins: string[]): string[] {
  return [].concat(normalizePlugins(forcedPlugins)).concat(normalizePlugins(plugins));
};

const processPlugins = function (isTouchDevice: boolean, sectionResult: SectionResult, defaultOverrideSettings: RawEditorSettings, settings: RawEditorSettings): EditorSettings {
  const forcedPlugins = normalizePlugins(defaultOverrideSettings.forced_plugins);
  const desktopPlugins = normalizePlugins(settings.plugins);

  const mobileConfig = getSectionConfig(sectionResult, 'mobile');
  const mobilePlugins = mobileConfig.plugins ? normalizePlugins(mobileConfig.plugins) : desktopPlugins;

  const platformPlugins =
    // is a mobile device with mobile theme
    isTouchDevice && isSectionTheme(sectionResult, 'mobile', 'mobile') ? filterMobilePlugins(mobilePlugins) :
    // is a mobile device with any mobile settings
    isTouchDevice && hasSection(sectionResult, 'mobile') ? mobilePlugins :
    // is desktop
    desktopPlugins;

  const combinedPlugins = combinePlugins(forcedPlugins, platformPlugins);

  return Tools.extend(settings, {
    plugins: combinedPlugins.join(' ')
  });
};

const isOnMobile = function (isTouchDevice: boolean, sectionResult: SectionResult) {
  const isInline = sectionResult.settings().inline; // We don't support mobile inline yet
  return isTouchDevice && hasSection(sectionResult, 'mobile') && !isInline;
};

const combineSettings = (isTouchDevice: boolean, isPhone: boolean, defaultSettings: RawEditorSettings, defaultOverrideSettings: RawEditorSettings, settings: RawEditorSettings): EditorSettings => {
  // Use mobile mode by default on phones, so patch in the default mobile settings
  const defaultDeviceSettings = isPhone ? { mobile: defaultMobileSettings } : { };
  const sectionResult = extractSections(['mobile'], Merger.deepMerge(defaultDeviceSettings, settings));

  const extendedSettings = Tools.extend(
    // Default settings
    defaultSettings,

    // tinymce.overrideDefaults settings
    defaultOverrideSettings,

    // User settings
    sectionResult.settings(),

    // Sections
    isOnMobile(isTouchDevice, sectionResult) ? getSection(sectionResult, 'mobile') : { },

    // Forced settings
    {
      validate: true,
      external_plugins: getExternalPlugins(defaultOverrideSettings, sectionResult.settings())
    }
  );

  return processPlugins(isTouchDevice, sectionResult, defaultOverrideSettings, extendedSettings);
};

const getEditorSettings = function (editor: Editor, id: string, documentBaseUrl: string, defaultOverrideSettings: RawEditorSettings, settings: RawEditorSettings): EditorSettings {
  const defaultSettings = getDefaultSettings(id, documentBaseUrl, editor);
  return combineSettings(isTouch, isPhone, defaultSettings, defaultOverrideSettings, settings);
};

const getFiltered = <K extends keyof EditorSettings> (predicate: (x: any) => boolean, editor: Editor, name: K): Option<EditorSettings[K]> => {
  return Option.from(editor.settings[name]).filter(predicate);
};

const getParamObject = (value: string) => {
  let output = {};

  if (typeof value === 'string') {
    Arr.each(value.indexOf('=') > 0 ? value.split(/[;,](?![^=;,]*(?:[;,]|$))/) : value.split(','), function (val: string) {
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

export { getEditorSettings, getParam, combineSettings };
