/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option, Type } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';

import * as Settings from '../api/Settings';
import { readImageDataFromSelection } from '../core/ImageSelection';
import { ListUtils } from '../core/ListUtils';
import * as Utils from '../core/Utils';
import { ImageDialogInfo, ListItem } from './DialogTypes';

const collect = (editor: Editor): Promise<ImageDialogInfo> => {
  const urlListSanitizer = ListUtils.sanitizer((item) => editor.convertURL(item.value || item.url, 'src'));

  const futureImageList = new Promise<Option<ListItem[]>>((completer) => {
    Utils.createImageList(editor, (imageList) => {
      completer(
        urlListSanitizer(imageList).map(
          (items) => Arr.flatten([
            [{ text: 'None', value: '' }],
            items
          ])
        )
      );
    });
  });

  const classList = ListUtils.sanitize(Settings.getClassList(editor));
  const hasAdvTab = Settings.hasAdvTab(editor);
  const hasUploadTab = Settings.hasUploadTab(editor);
  const hasUploadUrl = Settings.hasUploadUrl(editor);
  const hasUploadHandler = Settings.hasUploadHandler(editor);
  const image = readImageDataFromSelection(editor);
  const hasDescription = Settings.hasDescription(editor);
  const hasImageTitle = Settings.hasImageTitle(editor);
  const hasDimensions = Settings.hasDimensions(editor);
  const hasImageCaption = Settings.hasImageCaption(editor);
  const hasAccessibilityOptions = Settings.showAccessibilityOptions(editor);
  const url = Settings.getUploadUrl(editor);
  const basePath = Settings.getUploadBasePath(editor);
  const credentials = Settings.getUploadCredentials(editor);
  const handler = Settings.getUploadHandler(editor);
  const automaticUploads = Settings.isAutomaticUploadsEnabled(editor);
  const prependURL: Option<string> = Option.some(Settings.getPrependUrl(editor)).filter(
    (preUrl) => Type.isString(preUrl) && preUrl.length > 0);

  return futureImageList.then((imageList): ImageDialogInfo => ({
    image,
    imageList,
    classList,
    hasAdvTab,
    hasUploadTab,
    hasUploadUrl,
    hasUploadHandler,
    hasDescription,
    hasImageTitle,
    hasDimensions,
    hasImageCaption,
    url,
    basePath,
    credentials,
    handler,
    prependURL,
    hasAccessibilityOptions,
    automaticUploads
  }));
};

export {
  collect
};
