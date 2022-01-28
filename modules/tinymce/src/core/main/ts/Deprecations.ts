/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';

import { NormalizedEditorOptions, RawEditorOptions } from './api/OptionTypes';
import Tools from './api/util/Tools';

const removedOptions = (
  'autoresize_on_init,content_editable_state,padd_empty_with_br,block_elements,' +
  'boolean_attributes,editor_deselector,editor_selector,elements,file_browser_callback_types,filepicker_validator_handler,' +
  'force_hex_style_colors,force_p_newlines,gecko_spellcheck,images_dataimg_filter,media_scripts,mode,move_caret_before_on_enter_elements,' +
  'non_empty_elements,self_closing_elements,short_ended_elements,special,spellchecker_select_languages,spellchecker_whitelist,' +
  'tab_focus,table_responsive_width,text_block_elements,text_inline_elements,toolbar_drawer,types,validate,whitespace_elements,' +
  'paste_word_valid_elements,paste_retain_style_properties,paste_convert_word_fake_lists'
).split(',');

const removedPlugins = 'bbcode,colorpicker,contextmenu,fullpage,legacyoutput,spellchecker,textcolor'.split(',');

const getRemovedOptions = (options: RawEditorOptions): string[] => {
  const settingNames = Arr.filter(removedOptions, (setting) => Obj.has(options, setting));
  // Forced root block is a special case whereby only the empty/false value is deprecated
  const forcedRootBlock = options.forced_root_block;
  // Note: This cast is required for old configurations as forced root block used to allow a boolean
  if ((forcedRootBlock as any) === false || forcedRootBlock === '') {
    settingNames.push('forced_root_block (false only)');
  }
  return Arr.sort(settingNames);
};

const getRemovedPlugins = (options: NormalizedEditorOptions): string[] => {
  const plugins = Tools.makeMap(options.plugins, ' ');
  const hasPlugin = (plugin: string) => Obj.has(plugins, plugin);
  const pluginNames = Arr.filter(removedPlugins, hasPlugin);
  return Arr.sort(pluginNames);
};

const logRemovedWarnings = (rawOptions: RawEditorOptions, normalizedOptions: NormalizedEditorOptions): void => {
  // Note: Ensure we use the original user settings, not the final when logging
  const removedSettings = getRemovedOptions(rawOptions);
  const removedPlugins = getRemovedPlugins(normalizedOptions);

  const hasRemovedPlugins = removedPlugins.length > 0;
  const hasRemovedSettings = removedSettings.length > 0;
  const isLegacyMobileTheme = normalizedOptions.theme === 'mobile';
  if (hasRemovedPlugins || hasRemovedSettings || isLegacyMobileTheme) {
    const listJoiner = '\n- ';
    const themesMessage = isLegacyMobileTheme ? `\n\nThemes:${listJoiner}mobile` : '';
    const pluginsMessage = hasRemovedPlugins ? `\n\nPlugins:${listJoiner}${removedPlugins.join(listJoiner)}` : '';
    const settingsMessage = hasRemovedSettings ? `\n\nSettings:${listJoiner}${removedSettings.join(listJoiner)}` : '';
    // eslint-disable-next-line no-console
    console.warn(
      'The following deprecated features are currently enabled and have been removed in TinyMCE 6.0. These features will no longer work and should be removed from the TinyMCE configuration. ' +
      'See https://www.tiny.cloud/docs/release-notes/6.0-upcoming-changes/ for more information.' +
      themesMessage +
      pluginsMessage +
      settingsMessage
    );
  }
};

const logDeprecatedWarnings = (_rawOptions: RawEditorOptions, _normalizedOptions: NormalizedEditorOptions): void => {
  // No current deprecations
};

const logWarnings = (rawOptions: RawEditorOptions, normalizedOptions: NormalizedEditorOptions): void => {
  logRemovedWarnings(rawOptions, normalizedOptions);
  logDeprecatedWarnings(rawOptions, normalizedOptions);
};

export {
  logWarnings
};
