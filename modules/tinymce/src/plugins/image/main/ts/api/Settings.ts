/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { UploadHandler } from 'tinymce/core/api/SettingsTypes';

export interface ListItem {
  title: string;
  value: string;
}

type ImageListSetting = ListItem[] | string | ((callback: (imageList: ListItem[]) => void) => void) | false;

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const hasDimensions = getSetting('image_dimensions', true, 'boolean');

const hasAdvTab = getSetting('image_advtab', false, 'boolean');

const hasUploadTab = getSetting('image_uploadtab', true, 'boolean');

const getPrependUrl = getSetting('image_prepend_url', '', 'string');

const getClassList = getSetting<ListItem[]>('image_class_list');

const hasDescription = getSetting('image_description', true, 'boolean');

const hasImageTitle = getSetting('image_title', false, 'boolean');

const hasImageCaption = getSetting('image_caption', false, 'boolean');

const getImageList = getSetting<ImageListSetting>('image_list', false);

const hasUploadUrl = (editor: Editor) => !!getUploadUrl(editor);

const hasUploadHandler = (editor: Editor) => !!getUploadHandler(editor);

const getUploadUrl = getSetting('images_upload_url', '', 'string');

const getUploadHandler = getSetting<UploadHandler>('images_upload_handler', undefined, 'function');

const getUploadBasePath = getSetting<string>('images_upload_base_path', undefined, 'string');

const getUploadCredentials = getSetting('images_upload_credentials', false, 'boolean');

const showAccessibilityOptions = getSetting('a11y_advanced_options', false, 'boolean');

const isAutomaticUploadsEnabled = getSetting('automatic_uploads', true, 'boolean');

export {
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
  getUploadUrl,
  getUploadHandler,
  getUploadBasePath,
  getUploadCredentials,
  showAccessibilityOptions,
  isAutomaticUploadsEnabled
};
