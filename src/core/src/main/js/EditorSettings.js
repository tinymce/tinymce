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
    'tinymce.core.util.Tools'
  ],
  function (Tools) {
    var getEditorSettings = function (editor, id, documentBaseUrl, defaultOverrideSettings, settings) {
      settings = Tools.extend(
        // Default settings
        {
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
        },

        // tinymce.overrideDefaults settings
        defaultOverrideSettings,

        // User settings
        settings,

        // Forced settings
        {
          validate: true,
          content_editable: settings.inline
        }
      );

      // Merge external_plugins
      if (defaultOverrideSettings && defaultOverrideSettings.external_plugins && settings.external_plugins) {
        settings.external_plugins = Tools.extend({}, defaultOverrideSettings.external_plugins, settings.external_plugins);
      }

      return settings;
    };

    return {
      getEditorSettings: getEditorSettings
    };
  }
);
