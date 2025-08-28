import { Strings, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { UserListItem } from '../ui/DialogTypes';

type UserImageListCallback = (callback: (imageList: UserListItem[]) => void) => void;

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('image_dimensions', {
    processor: 'boolean',
    default: true
  });

  registerOption('image_advtab', {
    processor: 'boolean',
    default: false
  });

  registerOption('image_uploadtab', {
    processor: 'boolean',
    default: true
  });

  registerOption('image_prepend_url', {
    processor: 'string',
    default: ''
  });

  registerOption('image_class_list', {
    processor: 'object[]'
  });

  registerOption('image_description', {
    processor: 'boolean',
    default: true
  });

  registerOption('image_title', {
    processor: 'boolean',
    default: false
  });

  registerOption('image_caption', {
    processor: 'boolean',
    default: false
  });

  registerOption('image_list', {
    processor: (value) => {
      const valid = value === false || Type.isString(value) || Type.isArrayOf(value, Type.isObject) || Type.isFunction(value);
      return valid ? { value, valid } : { valid: false, message: 'Must be false, a string, an array or a function.' };
    },
    default: false
  });
};

const hasDimensions = option<boolean>('image_dimensions');
const hasAdvTab = option<boolean>('image_advtab');
const hasUploadTab = option<boolean>('image_uploadtab');
const getPrependUrl = option<string>('image_prepend_url');
const getClassList = option<UserListItem[] | undefined>('image_class_list');
const hasDescription = option<boolean>('image_description');
const hasImageTitle = option<boolean>('image_title');
const hasImageCaption = option<boolean>('image_caption');
const getImageList = option<string | UserListItem[] | UserImageListCallback | false>('image_list');
const showAccessibilityOptions = option('a11y_advanced_options');
const isAutomaticUploadsEnabled = option('automatic_uploads');

const hasUploadUrl = (editor: Editor): boolean =>
  Strings.isNotEmpty(editor.options.get('images_upload_url'));

const hasUploadHandler = (editor: Editor): boolean =>
  Type.isNonNullable(editor.options.get('images_upload_handler'));

export {
  register,
  hasDimensions,
  hasUploadTab,
  hasAdvTab,
  getPrependUrl,
  getClassList,
  hasDescription,
  hasImageTitle,
  hasImageCaption,
  getImageList,
  hasUploadUrl,
  hasUploadHandler,
  showAccessibilityOptions,
  isAutomaticUploadsEnabled
};
