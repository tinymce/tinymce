import { Arr, Optional, Type } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import { isImage } from '../core/ImageData';
import { getSelectedImage, readImageDataFromSelection } from '../core/ImageSelection';
import { ListUtils } from '../core/ListUtils';
import * as Utils from '../core/Utils';

import type { ImageDialogInfo, ListItem, NaturalSize } from './DialogTypes';

const getNaturalSize = (editor: Editor): Optional<NaturalSize> =>
  Optional.from(getSelectedImage(editor))
    .filter(isImage)
    .filter((image) => image.naturalWidth > 0 && image.naturalHeight > 0)
    .map((image) => ({ width: image.naturalWidth, height: image.naturalHeight }));

const collect = (editor: Editor): Promise<ImageDialogInfo> => {
  const urlListSanitizer = ListUtils.sanitizer((item) => editor.convertURL(item.value || item.url || '', 'src'));

  const futureImageList = new Promise<Optional<ListItem[]>>((completer) => {
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

  const alertErr = (message: string, callback: () => void): void => {
    editor.windowManager.alert(message, callback);
  };

  const classList = ListUtils.sanitize(Options.getClassList(editor));
  const hasAdvTab = Options.hasAdvTab(editor);
  const hasUploadTab = Options.hasUploadTab(editor);
  const hasUploadUrl = Options.hasUploadUrl(editor);
  const hasUploadHandler = Options.hasUploadHandler(editor);
  const image = readImageDataFromSelection(editor);
  const naturalSize = getNaturalSize(editor);
  const hasDescription = Options.hasDescription(editor);
  const hasImageTitle = Options.hasImageTitle(editor);
  const hasDimensions = Options.hasDimensions(editor);
  const hasImageCaption = Options.hasImageCaption(editor);
  const hasAccessibilityOptions = Options.showAccessibilityOptions(editor);
  const automaticUploads = Options.isAutomaticUploadsEnabled(editor);
  const prependURL: Optional<string> = Optional.some(Options.getPrependUrl(editor)).filter(
    (preUrl) => Type.isString(preUrl) && preUrl.length > 0);

  return futureImageList.then((imageList): ImageDialogInfo => ({
    alertErr,
    image,
    naturalSize,
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
    prependURL,
    hasAccessibilityOptions,
    automaticUploads
  }));
};

export {
  collect
};
