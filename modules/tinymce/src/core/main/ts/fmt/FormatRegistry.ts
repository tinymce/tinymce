/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import * as DefaultFormats from './DefaultFormats';
import { Format, Formats } from './FormatTypes';
import { isInlineFormat, isSelectorFormat } from './FormatUtils';

export interface FormatRegistry {
  get: {
    (name: string): Format[] | undefined;
    (): Record<string, Format[]>;
  };
  has: (name: string) => boolean;
  register: (name: string | Formats, format?: Format[] | Format) => void;
  unregister: (name: string) => Formats;
}

export const FormatRegistry = (editor: Editor): FormatRegistry => {
  const formats: Record<string, Format[]> = {};

  const get = (name?: string): Format[] | Record<string, Format[]> | undefined =>
    Type.isNonNullable(name) ? formats[name] : formats;

  const has = (name: string): boolean => Obj.has(formats, name);

  const register = (name: string | Formats, format?: Format | Format[]) => {
    if (name) {
      if (!Type.isString(name)) {
        Obj.each(name, (format, name) => {
          register(name, format);
        });
      } else {
        // Force format into array and add it to internal collection
        if (!Type.isArray(format)) {
          format = [ format ];
        }

        Arr.each(format, (format) => {
          // Set deep to false by default on selector formats this to avoid removing
          // alignment on images inside paragraphs when alignment is changed on paragraphs
          if (Type.isUndefined(format.deep)) {
            format.deep = !isSelectorFormat(format);
          }

          // Default to true
          if (Type.isUndefined(format.split)) {
            format.split = !isSelectorFormat(format) || isInlineFormat(format);
          }

          // Default to true
          if (Type.isUndefined(format.remove) && isSelectorFormat(format) && !isInlineFormat(format)) {
            format.remove = 'none';
          }

          // Mark format as a mixed format inline + block level
          if (isSelectorFormat(format) && isInlineFormat(format)) {
            format.mixed = true;
            format.block_expand = true;
          }

          // Split classes if needed
          if (Type.isString(format.classes)) {
            format.classes = format.classes.split(/\s+/);
          }
        });

        formats[name] = format;
      }
    }
  };

  const unregister = (name: string) => {
    if (name && formats[name]) {
      delete formats[name];
    }

    return formats;
  };

  register(DefaultFormats.get(editor.dom));
  register(Settings.getFormats(editor));

  return {
    get: get as FormatRegistry['get'],
    has,
    register,
    unregister
  };
};
