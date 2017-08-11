/**
 * FormatRegistry.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.fmt.FormatRegistry',
  [
    'tinymce.core.fmt.DefaultFormats',
    'tinymce.core.util.Tools'
  ],
  function (DefaultFormats, Tools) {
    return function (editor) {
      var formats = {};

      var get = function (name) {
        return name ? formats[name] : formats;
      };

      var register = function (name, format) {
        if (name) {
          if (typeof name !== 'string') {
            Tools.each(name, function (format, name) {
              register(name, format);
            });
          } else {
            // Force format into array and add it to internal collection
            format = format.length ? format : [format];

            Tools.each(format, function (format) {
              // Set deep to false by default on selector formats this to avoid removing
              // alignment on images inside paragraphs when alignment is changed on paragraphs
              if (typeof format.deep === 'undefined') {
                format.deep = !format.selector;
              }

              // Default to true
              if (typeof format.split === 'undefined') {
                format.split = !format.selector || format.inline;
              }

              // Default to true
              if (typeof format.remove === 'undefined' && format.selector && !format.inline) {
                format.remove = 'none';
              }

              // Mark format as a mixed format inline + block level
              if (format.selector && format.inline) {
                format.mixed = true;
                format.block_expand = true;
              }

              // Split classes if needed
              if (typeof format.classes === 'string') {
                format.classes = format.classes.split(/\s+/);
              }
            });

            formats[name] = format;
          }
        }
      };

      var unregister = function (name) {
        if (name && formats[name]) {
          delete formats[name];
        }

        return formats;
      };

      register(DefaultFormats.get(editor.dom));
      register(editor.settings.formats);

      return {
        get: get,
        register: register,
        unregister: unregister
      };
    };
  }
);
