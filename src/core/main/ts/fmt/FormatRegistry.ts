/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj, Type } from '@ephox/katamari';
import DefaultFormats from './DefaultFormats';
import { Format, Formats } from '../api/fmt/Format';
import Tools from '../api/util/Tools';
import Editor from '../api/Editor';

export interface FormatRegistry {
  get (name?: string): Formats | Format[];
  has (name: string): boolean;
  register (name: string | Formats, format?: Format[] | Format): void;
  unregister (name: string): Formats;
}

export function FormatRegistry(editor: Editor): FormatRegistry {
  const formats: Record<string, Format[]> = {};

  const get = (name?: string): Formats | Format[] => {
    return name ? formats[name] : formats;
  };

  const has = (name: string): boolean => {
    return Obj.has(formats, name);
  };

  const register = function (name: string | Formats, format?: Format | Format[]) {
    if (name) {
      if (typeof name !== 'string') {
        Tools.each(name, function (format, name) {
          register(name, format);
        });
      } else {
        // Force format into array and add it to internal collection
        if (!Type.isArray(format)) {
          format = [format];
        }

        Tools.each(format, function (format: any) {
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
    has,
    register,
    unregister
  };
}