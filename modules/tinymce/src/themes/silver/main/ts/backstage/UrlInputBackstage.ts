import { Fun, Future, Obj, Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { FilePickerCallback, FilePickerValidationCallback } from 'tinymce/core/api/OptionTypes';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';
import { LinkTarget, LinkTargets } from '../ui/core/LinkTargets';
import { addToHistory, getHistory } from './UrlInputHistory';

export interface LinkInformation {
  readonly targets: LinkTarget[];
  readonly anchorTop?: string;
  readonly anchorBottom?: string;
}

export interface ApiUrlData {
  readonly value: string;
  readonly meta?: Record<string, any>;
}

export interface InternalUrlData extends ApiUrlData {
  readonly fieldname: string;
}

export type UrlPicker = (entry: InternalUrlData) => Future<ApiUrlData>;

export interface UiFactoryBackstageForUrlInput {
  readonly getHistory: (fileType: string) => string[];
  readonly addToHistory: (url: string, fileType: string) => void;
  readonly getLinkInformation: () => Optional<LinkInformation>;
  readonly getValidationHandler: () => Optional<FilePickerValidationCallback>;
  readonly getUrlPicker: (filetype: string) => Optional<UrlPicker>;
}

const isTruthy = (value: any) => !!value;

const makeMap = (value: string): Record<string, boolean> =>
  Obj.map(Tools.makeMap(value, /[, ]/), isTruthy);

const getPicker = (editor: Editor): Optional<FilePickerCallback> =>
  Optional.from(Options.getFilePickerCallback(editor));

const getPickerTypes = (editor: Editor): boolean | Record<string, boolean> => {
  const optFileTypes = Optional.from(Options.getFilePickerTypes(editor)).filter(isTruthy).map(makeMap);
  return getPicker(editor).fold(
    Fun.never,
    (_picker) => optFileTypes.fold<boolean | Record<string, boolean>>(
      Fun.always,
      (types) => Obj.keys(types).length > 0 ? types : false)
  );
};

const getPickerSetting = (editor: Editor, filetype: string): Optional<FilePickerCallback> => {
  const pickerTypes = getPickerTypes(editor);
  if (Type.isBoolean(pickerTypes)) {
    return pickerTypes ? getPicker(editor) : Optional.none();
  } else {
    return pickerTypes[filetype] ? getPicker(editor) : Optional.none();
  }
};

const getUrlPicker = (editor: Editor, filetype: string): Optional<UrlPicker> => getPickerSetting(editor, filetype).map((picker) => (entry: InternalUrlData): Future<ApiUrlData> => Future.nu((completer) => {
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
    ...Optional.from(entry.meta).getOr({})
  };
  // file_picker_callback(callback, currentValue, metaData)
  picker.call(editor, handler, entry.value, meta);
}));

const getTextSetting = (value: string | boolean): string | undefined =>
  Optional.from(value).filter(Type.isString).getOrUndefined();

export const getLinkInformation = (editor: Editor): Optional<LinkInformation> => {
  if (!Options.useTypeaheadUrls(editor)) {
    return Optional.none();
  }

  return Optional.some({
    targets: LinkTargets.find(editor.getBody()),
    anchorTop: getTextSetting(Options.getAnchorTop(editor)),
    anchorBottom: getTextSetting(Options.getAnchorBottom(editor))
  });
};
export const getValidationHandler = (editor: Editor): Optional<FilePickerValidationCallback> =>
  Optional.from(Options.getFilePickerValidatorHandler(editor));

export const UrlInputBackstage = (editor: Editor): UiFactoryBackstageForUrlInput => ({
  getHistory,
  addToHistory,
  getLinkInformation: () => getLinkInformation(editor),
  getValidationHandler: () => getValidationHandler(editor),
  getUrlPicker: (filetype: string) => getUrlPicker(editor, filetype)
});
