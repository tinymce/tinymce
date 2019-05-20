/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Future, Option, Type } from '@ephox/katamari';

import Settings from '../api/Settings';
import { readImageDataFromSelection } from '../core/ImageSelection';
import { ListUtils } from '../core/ListUtils';
import Utils from '../core/Utils';
import { ImageDialogInfo, ListItem } from './DialogTypes';
import Editor from 'tinymce/core/api/Editor';

const collect = (editor: Editor): Future<ImageDialogInfo> => {
  const urlListSanitizer = ListUtils.sanitizer((item) => {
    return editor.convertURL(item.value || item.url, 'src');
  });

  const futureImageList = Future.nu<Option<ListItem[]>>((completer) => {
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
  const url = Settings.getUploadUrl(editor);
  const basePath = Settings.getUploadBasePath(editor);
  const credentials = Settings.getUploadCredentials(editor);
  const handler = Settings.getUploadHandler(editor);
  const prependURL: Option<string> = Option.some(Settings.getPrependUrl(editor)).filter(
    (preUrl) => Type.isString(preUrl) && preUrl.length > 0);

  return futureImageList.map((imageList): ImageDialogInfo => {
    return {
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
      prependURL
    };
  });
};

export {
  collect
};