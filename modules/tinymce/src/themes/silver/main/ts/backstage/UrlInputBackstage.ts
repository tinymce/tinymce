/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Future, Obj, Option, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import { LinkTarget, LinkTargets } from '../ui/core/LinkTargets';
import { addToHistory, getHistory } from './UrlInputHistory';
import { Types } from '@ephox/bridge';

type PickerCallback = (value: string, meta: Record<string, any>) => void;
type Picker = (callback: PickerCallback, value: string, meta: Record<string, any>) => void;

export interface LinkInformation {
  targets: LinkTarget[];
  anchorTop?: string;
  anchorBottom?: string;
}

export type ValidationStatus = 'valid' | 'unknown' | 'invalid' | 'none';

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
}

export interface UrlValidationQuery {
  url: string;
  type: Types.UrlInput.UrlInput['filetype'];
}

export type UrlValidationCallback = (result: ValidationResult) => void;

export type UrlValidationHandler = (info: UrlValidationQuery, callback: UrlValidationCallback) => any;

export interface ApiUrlData {
  value: string;
  meta?: Record<string, any>;
}

export interface InternalUrlData extends ApiUrlData {
  fieldname: string;
}

export type UrlPicker = (entry: InternalUrlData) => Future<ApiUrlData>;

export interface UiFactoryBackstageForUrlInput {
  getHistory: (fileType: string) => string[];
  addToHistory: (url: string, fileType: string) => void;
  getLinkInformation: () => Option<LinkInformation>;
  getValidationHandler: () => Option<UrlValidationHandler>;
  getUrlPicker: (filetype: string) => Option<UrlPicker>;
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

const isTruthy = (value: any) => !!value;

const makeMap = (value: any): Record<string, boolean> => Obj.map(Tools.makeMap(value, /[, ]/), isTruthy);

const getOpt = <T, K extends keyof T> (obj: T, key: K): Option<T[K]> =>
  hasOwnProperty.call(obj, key) ? Option.some(obj[key]) : Option.none();

const getTextSetting = (settings: Record<string, any>, name: string, defaultValue: string): Option<string> => {
  const value = getOpt(settings, name).getOr(defaultValue);
  return Type.isString(value) ? Option.some(value) : Option.none();
};

const getPicker = (settings: Record<string, any>): Option<Picker> => {
  return Option.some(settings.file_picker_callback).filter(Type.isFunction) as Option<Picker>;
};

const getPickerTypes = (settings: Record<string, any>): boolean | Record<string, boolean> => {
  const optFileTypes = Option.some(settings.file_picker_types).filter(isTruthy);
  const optLegacyTypes = Option.some(settings.file_browser_callback_types).filter(isTruthy);
  const optTypes = optFileTypes.or(optLegacyTypes).map(makeMap);
  return getPicker(settings).fold(
    () => false,
    (_picker) => optTypes.fold<boolean | Record<string, boolean>>(
      () => true,
      (types) => Obj.keys(types).length > 0 ? types : false)
  );
};

const getPickerSetting = (settings: Record<string, any>, filetype: string): Option<Picker> => {
  const pickerTypes = getPickerTypes(settings);
  if (Type.isBoolean(pickerTypes)) {
    return pickerTypes ? getPicker(settings) : Option.none();
  } else {
    return pickerTypes[filetype] ? getPicker(settings) : Option.none();
  }
};

const getUrlPicker = (editor: Editor, filetype: string): Option<UrlPicker> => {
  return getPickerSetting(editor.settings, filetype).map((picker) => {
    return (entry: InternalUrlData): Future<ApiUrlData> => {
      return Future.nu((completer) => {
        const handler = (value: string, meta?: Record<string, any>) => {
          if (!Type.isString(value)) {
            throw new Error('Expected value to be string');
          }
          if (meta !== undefined && !Type.isObject(meta)) {
            throw new Error('Expected meta to be a object');
          }
          const r: ApiUrlData = { value, meta };
          completer(r);
        };
        const meta = {
          filetype,
          fieldname: entry.fieldname,
          ...Option.from(entry.meta).getOr({})
        };
        // file_picker_callback(callback, currentValue, metaData)
        picker.call(editor, handler, entry.value, meta);
      });
    };
  });
};

export const getLinkInformation = (editor: Editor): Option<LinkInformation> => {
  if (editor.settings.typeahead_urls === false) {
    return Option.none();
  }

  return Option.some({
    targets: LinkTargets.find(editor.getBody()),
    anchorTop: getTextSetting(editor.settings, 'anchor_top', '#top').getOrUndefined(),
    anchorBottom: getTextSetting(editor.settings, 'anchor_bottom', '#bottom').getOrUndefined()
  });
};

export const getValidationHandler = (editor: Editor): Option<UrlValidationHandler> => {
  const optValidator = Option.from(editor.settings.file_picker_validator_handler).filter(Type.isFunction);
  return optValidator.orThunk(() => Option.from(editor.settings.filepicker_validator_handler).filter(Type.isFunction));
};

export const getUrlPickerTypes = (editor: Editor): boolean | Record<string, boolean> => {
  return getPickerTypes(editor.settings);
};

export const UrlInputBackstage = (editor: Editor): UiFactoryBackstageForUrlInput => ({
  getHistory,
  addToHistory,
  getLinkInformation: () => getLinkInformation(editor),
  getValidationHandler: () => getValidationHandler(editor),
  getUrlPicker: (filetype: string) => getUrlPicker(editor, filetype),
});
