import { Arr, Obj } from '@ephox/katamari';

import { NormalizedEditorOptions, RawEditorOptions } from './api/OptionTypes';
import Tools from './api/util/Tools';

const removedOptions = (
  'autoresize_on_init,content_editable_state,padd_empty_with_br,block_elements,' +
  'boolean_attributes,editor_deselector,editor_selector,elements,file_browser_callback_types,filepicker_validator_handler,' +
  'force_hex_style_colors,force_p_newlines,gecko_spellcheck,images_dataimg_filter,media_scripts,mode,move_caret_before_on_enter_elements,' +
  'non_empty_elements,self_closing_elements,short_ended_elements,special,spellchecker_select_languages,spellchecker_whitelist,' +
  'tab_focus,tabfocus_elements,table_responsive_width,text_block_elements,text_inline_elements,toolbar_drawer,types,validate,whitespace_elements,' +
  'paste_enable_default_filters,paste_filter_drop,paste_word_valid_elements,paste_retain_style_properties,paste_convert_word_fake_lists'
).split(',');

const deprecatedOptions = (
  'template_cdate_classes,template_mdate_classes,template_selected_content_classes,template_preview_replace_values,template_replace_values,templates,template_cdate_format,template_mdate_format'
).split(',');

const removedPlugins = 'bbcode,colorpicker,contextmenu,fullpage,legacyoutput,spellchecker,textcolor'.split(',');

const deprecatedPlugins = [
  {
    name: 'template',
    replacedWith: 'Advanced Template',
  },
  {
    name: 'rtc',
  },
];

const getMatchingOptions = (options: RawEditorOptions, searchingFor: string[]): string[] => {
  const settingNames = Arr.filter(searchingFor, (setting) => Obj.has(options, setting));
  return Arr.sort(settingNames);
};

const getRemovedOptions = (options: RawEditorOptions): string[] => {
  const settingNames = getMatchingOptions(options, removedOptions);
  // Forced root block is a special case whereby only the empty/false value is deprecated
  const forcedRootBlock = options.forced_root_block;
  // Note: This cast is required for old configurations as forced root block used to allow a boolean
  if ((forcedRootBlock as any) === false || forcedRootBlock === '') {
    settingNames.push('forced_root_block (false only)');
  }
  return Arr.sort(settingNames);
};

const getDeprecatedOptions = (options: RawEditorOptions): string[] =>
  getMatchingOptions(options, deprecatedOptions);

const getMatchingPlugins = (options: NormalizedEditorOptions, searchingFor: string[]): string[] => {
  const plugins = Tools.makeMap(options.plugins, ' ');
  const hasPlugin = (plugin: string) => Obj.has(plugins, plugin);
  const pluginNames = Arr.filter(searchingFor, hasPlugin);
  return Arr.sort(pluginNames);
};

const getRemovedPlugins = (options: NormalizedEditorOptions): string[] =>
  getMatchingPlugins(options, removedPlugins);

const getDeprecatedPlugins = (options: NormalizedEditorOptions): string[] =>
  getMatchingPlugins(options, deprecatedPlugins.map((entry) => entry.name));

const logRemovedWarnings = (rawOptions: RawEditorOptions, normalizedOptions: NormalizedEditorOptions): void => {
  // Note: Ensure we use the original user settings, not the final when logging
  const removedOptions = getRemovedOptions(rawOptions);
  const removedPlugins = getRemovedPlugins(normalizedOptions);

  const hasRemovedPlugins = removedPlugins.length > 0;
  const hasRemovedOptions = removedOptions.length > 0;
  const isLegacyMobileTheme = normalizedOptions.theme === 'mobile';
  if (hasRemovedPlugins || hasRemovedOptions || isLegacyMobileTheme) {
    const listJoiner = '\n- ';
    const themesMessage = isLegacyMobileTheme ? `\n\nThemes:${listJoiner}mobile` : '';
    const pluginsMessage = hasRemovedPlugins ? `\n\nPlugins:${listJoiner}${removedPlugins.join(listJoiner)}` : '';
    const optionsMessage = hasRemovedOptions ? `\n\nOptions:${listJoiner}${removedOptions.join(listJoiner)}` : '';
    // eslint-disable-next-line no-console
    console.warn(
      'The following deprecated features are currently enabled and have been removed in TinyMCE 6.0. These features will no longer work and should be removed from the TinyMCE configuration. ' +
      'See https://www.tiny.cloud/docs/tinymce/6/migration-from-5x/ for more information.' +
      themesMessage +
      pluginsMessage +
      optionsMessage
    );
  }
};

const getPluginDescription = (name: string) =>
  Arr.find(deprecatedPlugins, (entry) => entry.name === name).fold(
    () => name,
    (entry) => {
      if (entry.replacedWith) {
        return `${name}, replaced by ${entry.replacedWith}`;
      } else {
        return name;
      }

    }
  );

const logDeprecatedWarnings = (rawOptions: RawEditorOptions, normalizedOptions: NormalizedEditorOptions): void => {
  // Note: Ensure we use the original user settings, not the final when logging
  const deprecatedOptions = getDeprecatedOptions(rawOptions);
  const deprecatedPlugins = getDeprecatedPlugins(normalizedOptions);

  const hasDeprecatedPlugins = deprecatedPlugins.length > 0;
  const hasDeprecatedOptions = deprecatedOptions.length > 0;
  if (hasDeprecatedPlugins || hasDeprecatedOptions) {
    const listJoiner = '\n- ';
    const pluginsMessage = hasDeprecatedPlugins ? `\n\nPlugins:${listJoiner}${deprecatedPlugins.map(getPluginDescription).join(listJoiner)}` : '';
    const optionsMessage = hasDeprecatedOptions ? `\n\nOptions:${listJoiner}${deprecatedOptions.join(listJoiner)}` : '';
    // eslint-disable-next-line no-console
    console.warn(
      'The following deprecated features are currently enabled but will be removed soon.' +
      pluginsMessage +
      optionsMessage
    );
  }
};

const logWarnings = (rawOptions: RawEditorOptions, normalizedOptions: NormalizedEditorOptions): void => {
  logRemovedWarnings(rawOptions, normalizedOptions);
  logDeprecatedWarnings(rawOptions, normalizedOptions);
};

export {
  logWarnings
};
