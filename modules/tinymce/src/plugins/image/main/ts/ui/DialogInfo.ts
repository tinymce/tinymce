import { Arr, Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import { readImageDataFromSelection } from '../core/ImageSelection';
import { ListUtils } from '../core/ListUtils';
import * as Utils from '../core/Utils';
import { ImageDialogInfo, ListItem } from './DialogTypes';

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

  const classList = ListUtils.sanitize(Options.getClassList(editor));
  const hasAdvTab = Options.hasAdvTab(editor);
  const hasUploadTab = Options.hasUploadTab(editor);
  const hasUploadUrl = Options.hasUploadUrl(editor);
  const hasUploadHandler = Options.hasUploadHandler(editor);
  const image = readImageDataFromSelection(editor);
  const hasDescription = Options.hasDescription(editor);
  const hasImageTitle = Options.hasImageTitle(editor);
  const hasDimensions = Options.hasDimensions(editor);
  const hasImageCaption = Options.hasImageCaption(editor);
  const hasAccessibilityOptions = Options.showAccessibilityOptions(editor);
  const automaticUploads = Options.isAutomaticUploadsEnabled(editor);
  const prependURL: Optional<string> = Optional.some(Options.getPrependUrl(editor)).filter(
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
    prependURL,
    hasAccessibilityOptions,
    automaticUploads
  }));
};

export {
  collect
};
