/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DefaultFormats from './DefaultFormats';
import Tools from '../api/util/Tools';

export default function (editor) {
  const formats = {};

  const get = function (name: string) {
    return name ? formats[name] : formats;
  };

  const register = function (name, format?) {
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

  const unregister = function (name: string) {
    if (name && formats[name]) {
      delete formats[name];
    }

    return formats;
  };

  register(DefaultFormats.get(editor.dom));
  register(editor.settings.formats);

  return {
    get,
    register,
    unregister
  };
}