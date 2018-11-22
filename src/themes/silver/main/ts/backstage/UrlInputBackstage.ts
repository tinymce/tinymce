/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Future, Obj, Option, Type } from '@ephox/katamari';

import { Editor } from '../../../../../core/main/ts/api/Editor';
import Tools from '../../../../../core/main/ts/api/util/Tools';
import { LinkTarget, LinkTargets } from '../ui/core/LinkTargets';
import { addToHistory, getHistory } from './UrlInputHistory';
import { Types } from '@ephox/bridge';

type PickerCallback = (value: string, meta: Record<string, any>) => void;
type Picker = (callback: PickerCallback, value: string, meta: Record<string, any>) => void;

export interface LinkInformation {
  targets: LinkTarget[];
  anchorTop: Option<string>;
  anchorBottom: Option<string>;
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

export interface UrlData {
  value: string;
  meta?: Record<string, any>;
}

export type UrlPicker = (entry: UrlData) => Future<UrlData>;

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

const getPickerSetting = (settings: Record<string, any>, filetype: string): Option<Picker> => {

  const optFileTypes = Option.some(settings.file_picker_types).filter(isTruthy);
  const optLegacyTypes = Option.some(settings.file_browser_callback_types).filter(isTruthy);
  const optTypes = optFileTypes.or(optLegacyTypes).map(makeMap);

  const on = optTypes.fold(() => true, (types) => getOpt(types, filetype).getOr(false));
  const optPicker = Option.some(settings.file_picker_callback).filter(Type.isFunction);

  return !on ? Option.none() : optPicker;
};

const getLinkInformation = (editor: Editor) => (): Option<LinkInformation> => {
  if (editor.settings.typeahead_urls === false) {
    return Option.none();
  }

  return Option.some({
    targets: LinkTargets.find(editor.getBody()),
    anchorTop: getTextSetting(editor.settings, 'anchor_top', '#top'),
    anchorBottom: getTextSetting(editor.settings, 'anchor_bottom', '#bottom')
  });
};

const getValidationHandler = (editor: Editor) => (): Option<UrlValidationHandler> => {
  const validatorHandler = editor.settings.filepicker_validator_handler;
  return Type.isFunction(validatorHandler) ? Option.some(validatorHandler) : Option.none();
};

const getUrlPicker = (editor: Editor) => (filetype: string): Option<UrlPicker> => {
  return getPickerSetting(editor.settings, filetype).map((picker) => {
    return (entry: UrlData): Future<UrlData> => {
      return Future.nu((completer) => {
        const handler = (value: string, meta?: Record<string, any>) => {
          if (!Type.isString(value)) {
            throw new Error('Expected value to be string');
          }
          if (meta !== undefined && !Type.isObject(meta)) {
            throw new Error('Expected meta to be a object');
          }
          const r: UrlData = { value, meta };
          completer(r);
        };
        const meta = Tools.extend({ filetype }, Option.from(entry.meta).getOr({}));
        // file_picker_callback(callback, currentValue, metaData)
        picker.call(editor, handler, entry.value, meta);
      });
    };
  });
};

export const UrlInputBackstage = (editor: Editor): UiFactoryBackstageForUrlInput => ({
  getHistory,
  addToHistory,
  getLinkInformation: getLinkInformation(editor),
  getValidationHandler: getValidationHandler(editor),
  getUrlPicker: getUrlPicker(editor),
});