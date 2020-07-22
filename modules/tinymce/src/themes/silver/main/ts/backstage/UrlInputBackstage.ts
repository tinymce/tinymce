/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Future, Obj, Option, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import { LinkTarget, LinkTargets } from '../ui/core/LinkTargets';
import { addToHistory, getHistory } from './UrlInputHistory';

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

const isTruthy = (value: any) => !!value;

const makeMap = (value: any): Record<string, boolean> => Obj.map(Tools.makeMap(value, /[, ]/), isTruthy);

const getPicker = (editor: Editor): Option<Picker> => Option.from(Settings.getFilePickerCallback(editor)).filter(Type.isFunction) as Option<Picker>;

const getPickerTypes = (editor: Editor): boolean | Record<string, boolean> => {
  const optFileTypes = Option.some(Settings.getFilePickerTypes(editor)).filter(isTruthy);
  const optLegacyTypes = Option.some(Settings.getFileBrowserCallbackTypes(editor)).filter(isTruthy);
  const optTypes = optFileTypes.or(optLegacyTypes).map(makeMap);
  return getPicker(editor).fold(
    () => false,
    (_picker) => optTypes.fold<boolean | Record<string, boolean>>(
      () => true,
      (types) => Obj.keys(types).length > 0 ? types : false)
  );
};

const getPickerSetting = (editor: Editor, filetype: string): Option<Picker> => {
  const pickerTypes = getPickerTypes(editor);
  if (Type.isBoolean(pickerTypes)) {
    return pickerTypes ? getPicker(editor) : Option.none();
  } else {
    return pickerTypes[filetype] ? getPicker(editor) : Option.none();
  }
};

const getUrlPicker = (editor: Editor, filetype: string): Option<UrlPicker> => getPickerSetting(editor, filetype).map((picker) => (entry: InternalUrlData): Future<ApiUrlData> => Future.nu((completer) => {
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
}));

const getTextSetting = (value: string | boolean): string | undefined => Option.from(value).filter(Type.isString).getOrUndefined();

export const getLinkInformation = (editor: Editor): Option<LinkInformation> => {
  if (Settings.noTypeaheadUrls(editor)) {
    return Option.none();
  }

  return Option.some({
    targets: LinkTargets.find(editor.getBody()),
    anchorTop: getTextSetting(Settings.getAnchorTop(editor)),
    anchorBottom: getTextSetting(Settings.getAnchorBottom(editor))
  });
};
export const getValidationHandler = (editor: Editor): Option<UrlValidationHandler> => Option.from(Settings.getFilePickerValidatorHandler(editor));

export const getUrlPickerTypes = (editor: Editor): boolean | Record<string, boolean> => getPickerTypes(editor);

export const UrlInputBackstage = (editor: Editor): UiFactoryBackstageForUrlInput => ({
  getHistory,
  addToHistory,
  getLinkInformation: () => getLinkInformation(editor),
  getValidationHandler: () => getValidationHandler(editor),
  getUrlPicker: (filetype: string) => getUrlPicker(editor, filetype)
});
