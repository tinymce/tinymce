/**
 * DefaultSettings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.EditorSettings',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'ephox.katamari.api.Type',
    'ephox.sand.api.PlatformDetection',
    'tinymce.core.util.Tools'
  ],
  function (Arr, Fun, Obj, Option, Struct, Type, PlatformDetection, Tools) {
    var sectionResult = Struct.immutable('sections', 'settings');
    var detection = PlatformDetection.detect();
    var isTouch = detection.deviceType.isTouch();

    var extractSections = function (keys, settings) {
      var result = Obj.bifilter(settings, function (value, key) {
        return Arr.contains(keys, key);
      });

      return sectionResult(result.t, result.f);
    };

    var getSection = function (sectionResult, name) {
      var sections = sectionResult.sections();
      return sections.hasOwnProperty(name) ? sections[name] : { };
    };

    var getDefaultSettings = function (id, documentBaseUrl, editor) {
      return {
        id: id,
        theme: 'modern',
        delta_width: 0,
        delta_height: 0,
        popup_css: '',
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
        font_size_style_values: 'xx-small,x-small,small,medium,large,x-large,xx-large',

        // See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
        font_size_legacy_values: 'xx-small,small,medium,large,x-large,xx-large,300%',
        forced_root_block: 'p',
        hidden_input: true,
        padd_empty_editor: true,
        render_ui: true,
        indentation: '30px',
        inline_styles: true,
        convert_fonts_to_spans: true,
        indent: 'simple',
        indent_before: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
        'tfoot,tbody,tr,section,article,hgroup,aside,figure,figcaption,option,optgroup,datalist',
        indent_after: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
        'tfoot,tbody,tr,section,article,hgroup,aside,figure,figcaption,option,optgroup,datalist',
        entity_encoding: 'named',
        url_converter: editor.convertURL,
        url_converter_scope: editor,
        ie7_compat: true
      };
    };

    var getExternalPlugins = function (overrideSettings, settings) {
      var userDefinedExternalPlugins = settings.external_plugins ? settings.external_plugins : { };

      if (overrideSettings && overrideSettings.external_plugins) {
        return Tools.extend({}, overrideSettings.external_plugins, userDefinedExternalPlugins);
      } else {
        return userDefinedExternalPlugins;
      }
    };

    var combineSettings = function (defaultSettings, defaultOverrideSettings, settings) {
      var sectionResult = extractSections(['mobile'], settings);
      var extendedSettings = Tools.extend(
        // Default settings
        defaultSettings,

        // tinymce.overrideDefaults settings
        defaultOverrideSettings,

        // User settings
        sectionResult.settings(),

        // Sections
        isTouch ? getSection(sectionResult, 'mobile') : { },

        // Forced settings
        {
          validate: true,
          content_editable: sectionResult.settings().inline,
          external_plugins: getExternalPlugins(defaultOverrideSettings, sectionResult.settings())
        }
      );

      return extendedSettings;
    };

    var getEditorSettings = function (editor, id, documentBaseUrl, defaultOverrideSettings, settings) {
      var defaultSettings = getDefaultSettings(id, documentBaseUrl, editor);
      return combineSettings(defaultSettings, defaultOverrideSettings, settings);
    };

    var get = function (editor, name) {
      return Option.from(editor.settings[name]);
    };

    var getFiltered = function (predicate, editor, name) {
      return Option.from(editor.settings[name]).filter(predicate);
    };

    return {
      getEditorSettings: getEditorSettings,
      get: get,
      getString: Fun.curry(getFiltered, Type.isString)
    };
  }
);
