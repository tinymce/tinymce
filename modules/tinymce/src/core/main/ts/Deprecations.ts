/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';

import { EditorSettings, RawEditorSettings } from './api/SettingsTypes';
import Tools from './api/util/Tools';

const deprecatedSettings = (
  'autoresize_on_init,content_editable_state,convert_fonts_to_spans,inline_styles,padd_empty_with_br,block_elements,' +
  'boolean_attributes,editor_deselector,editor_selector,elements,file_browser_callback_types,filepicker_validator_handler,' +
  'force_hex_style_colors,force_p_newlines,gecko_spellcheck,images_dataimg_filter,media_scripts,mode,move_caret_before_on_enter_elements,' +
  'non_empty_elements,self_closing_elements,short_ended_elements,special,spellchecker_select_languages,spellchecker_whitelist,' +
  'tab_focus,table_responsive_width,text_block_elements,text_inline_elements,toolbar_drawer,types,validate,whitespace_elements,' +
  'paste_word_valid_elements,paste_retain_style_properties,paste_convert_word_fake_lists'
).split(',');

const deprecatedPlugins = 'bbcode,colorpicker,contextmenu,fullpage,legacyoutput,spellchecker,textcolor'.split(',');
const movedToPremiumPlugins = 'imagetools,toc'.split(',');

const getDeprecatedSettings = (settings: RawEditorSettings): string[] => {
  const settingNames = Arr.filter(deprecatedSettings, (setting) => Obj.has(settings, setting));
  // Forced root block is a special case whereby only the empty/false value is deprecated
  const forcedRootBlock = settings.forced_root_block;
  if (forcedRootBlock === false || forcedRootBlock === '') {
    settingNames.push('forced_root_block (false only)');
  }
  return Arr.sort(settingNames);
};

const getDeprecatedPlugins = (settings: EditorSettings): string[] => {
  const plugins = Tools.makeMap(settings.plugins, ' ');
  const hasPlugin = (plugin: string) => Obj.has(plugins, plugin);
  const pluginNames = [
    ...Arr.filter(deprecatedPlugins, hasPlugin),
    ...Arr.bind(movedToPremiumPlugins, (plugin) => {
      return hasPlugin(plugin) ? [ `${plugin} (moving to premium)` ] : [];
    })
  ];
  return Arr.sort(pluginNames);
};

const logDeprecationsWarning = (rawSettings: RawEditorSettings, finalSettings: EditorSettings): void => {
  // Note: Ensure we use the original user settings, not the final when logging
  const deprecatedSettings = getDeprecatedSettings(rawSettings);
  const deprecatedPlugins = getDeprecatedPlugins(finalSettings);

  const hasDeprecatedPlugins = deprecatedPlugins.length > 0;
  const hasDeprecatedSettings = deprecatedSettings.length > 0;
  const isLegacyMobileTheme = finalSettings.theme === 'mobile';
  if (hasDeprecatedPlugins || hasDeprecatedSettings || isLegacyMobileTheme) {
    const listJoiner = '\n- ';
    const themesMessage = isLegacyMobileTheme ? `\n\nThemes:${listJoiner}mobile` : '';
    const pluginsMessage = hasDeprecatedPlugins ? `\n\nPlugins:${listJoiner}${deprecatedPlugins.join(listJoiner)}` : '';
    const settingsMessage = hasDeprecatedSettings ? `\n\nSettings:${listJoiner}${deprecatedSettings.join(listJoiner)}` : '';
    // eslint-disable-next-line no-console
    console.warn(
      'The following deprecated features are currently enabled, these will be removed in TinyMCE 6.0. ' +
      'See https://www.tiny.cloud/docs/release-notes/6.0-upcoming-changes/ for more information.' +
      themesMessage +
      pluginsMessage +
      settingsMessage
    );
  }
};

export {
  logDeprecationsWarning
};
