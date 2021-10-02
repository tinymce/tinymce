/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Merger, Optional, Strings, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import { StyleMap } from 'tinymce/core/api/html/Styles';
import { Dialog as DialogType } from 'tinymce/core/api/ui/Ui';
import ImageUploader, { UploadResult } from 'tinymce/core/api/util/ImageUploader';
import Promise from 'tinymce/core/api/util/Promise';

import { getStyleValue, ImageData } from '../core/ImageData';
import { normalizeCss as doNormalizeCss } from '../core/ImageSelection';
import { ListUtils } from '../core/ListUtils';
import * as Utils from '../core/Utils';
import { AdvTab } from './AdvTab';
import { collect } from './DialogInfo';
import { API, ImageDialogData, ImageDialogInfo, ListValue } from './DialogTypes';
import { MainTab } from './MainTab';
import { UploadTab } from './UploadTab';

interface ChangeEvent {
  readonly name: string;
}

interface Size {
  readonly width: string;
  readonly height: string;
}

interface Helpers {
  readonly onSubmit: (info: ImageDialogInfo) => (api: API) => void;
  readonly imageSize: (url: string) => Promise<Size>;
  readonly addToBlobCache: (blobInfo: BlobInfo) => void;
  readonly createBlobCache: (file: File, blobUri: string, dataUrl: string) => BlobInfo;
  readonly alertErr: (message: string) => void;
  readonly normalizeCss: (cssText: string) => string;
  readonly parseStyle: (cssText: string) => StyleMap;
  readonly serializeStyle: (stylesArg: StyleMap, name?: string) => string;
  readonly uploadImage: (blobInfo: BlobInfo) => Promise<UploadResult>;
}

interface ImageDialogState {
  prevImage: Optional<ListValue>;
  prevAlt: string;
  open: boolean;
}

const createState = (info: ImageDialogInfo): ImageDialogState => ({
  prevImage: ListUtils.findEntry(info.imageList, info.image.src),
  prevAlt: info.image.alt,
  open: true
});

const fromImageData = (image: ImageData): ImageDialogData => ({
  src: {
    value: image.src,
    meta: { }
  },
  images: image.src,
  alt: image.alt,
  title: image.title,
  dimensions: {
    width: image.width,
    height: image.height
  },
  classes: image.class,
  caption: image.caption,
  style: image.style,
  vspace: image.vspace,
  border: image.border,
  hspace: image.hspace,
  borderstyle: image.borderStyle,
  fileinput: [],
  isDecorative: image.isDecorative
});

const toImageData = (data: ImageDialogData, removeEmptyAlt: boolean): ImageData => ({
  src: data.src.value,
  alt: data.alt.length === 0 && removeEmptyAlt ? null : data.alt,
  title: data.title,
  width: data.dimensions.width,
  height: data.dimensions.height,
  class: data.classes,
  style: data.style,
  caption: data.caption,
  hspace: data.hspace,
  vspace: data.vspace,
  border: data.border,
  borderStyle: data.borderstyle,
  isDecorative: data.isDecorative
});

const addPrependUrl2 = (info: ImageDialogInfo, srcURL: string): Optional<string> => {
  // Add the prependURL
  if (!/^(?:[a-zA-Z]+:)?\/\//.test(srcURL)) {
    return info.prependURL.bind((prependUrl) => {
      if (srcURL.substring(0, prependUrl.length) !== prependUrl) {
        return Optional.some(prependUrl + srcURL);
      }
      return Optional.none();
    });
  }
  return Optional.none();
};

const addPrependUrl = (info: ImageDialogInfo, api: API) => {
  const data = api.getData();
  addPrependUrl2(info, data.src.value).each((srcURL) => {
    api.setData({ src: { value: srcURL, meta: data.src.meta }});
  });
};

const formFillFromMeta2 = (info: ImageDialogInfo, data: ImageDialogData, meta: ImageDialogData['src']['meta']): void => {
  if (info.hasDescription && Type.isString(meta.alt)) {
    data.alt = meta.alt;
  }
  if (info.hasAccessibilityOptions) {
    data.isDecorative = meta.isDecorative || data.isDecorative || false;
  }
  if (info.hasImageTitle && Type.isString(meta.title)) {
    data.title = meta.title;
  }
  if (info.hasDimensions) {
    if (Type.isString(meta.width)) {
      data.dimensions.width = meta.width;
    }
    if (Type.isString(meta.height)) {
      data.dimensions.height = meta.height;
    }
  }
  if (Type.isString(meta.class)) {
    ListUtils.findEntry(info.classList, meta.class).each((entry) => {
      data.classes = entry.value;
    });
  }
  if (info.hasImageCaption) {
    if (Type.isBoolean(meta.caption)) {
      data.caption = meta.caption;
    }
  }
  if (info.hasAdvTab) {
    if (Type.isString(meta.style)) {
      data.style = meta.style;
    }
    if (Type.isString(meta.vspace)) {
      data.vspace = meta.vspace;
    }
    if (Type.isString(meta.border)) {
      data.border = meta.border;
    }
    if (Type.isString(meta.hspace)) {
      data.hspace = meta.hspace;
    }
    if (Type.isString(meta.borderstyle)) {
      data.borderstyle = meta.borderstyle;
    }
  }
};

const formFillFromMeta = (info: ImageDialogInfo, api: API): void => {
  const data = api.getData();
  const meta = data.src.meta;
  if (meta !== undefined) {
    const newData = Merger.deepMerge({}, data);
    formFillFromMeta2(info, newData, meta);
    api.setData(newData);
  }
};

const calculateImageSize = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState, api: API): void => {
  const data = api.getData();
  const url = data.src.value;
  const meta = data.src.meta || {};

  if (!meta.width && !meta.height && info.hasDimensions) {
    if (Strings.isNotEmpty(url)) {
      helpers.imageSize(url)
        .then((size) => {
          if (state.open) {
            api.setData({ dimensions: size });
          }
        })
        // eslint-disable-next-line no-console
        .catch((e) => console.error(e));
    } else {
      api.setData({ dimensions: { width: '', height: '' }});
    }
  }
};

const updateImagesDropdown = (info: ImageDialogInfo, state: ImageDialogState, api: API): void => {
  const data = api.getData();
  const image = ListUtils.findEntry(info.imageList, data.src.value);
  state.prevImage = image;
  api.setData({ images: image.map((entry) => entry.value).getOr('') });
};

const changeSrc = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState, api: API): void => {
  addPrependUrl(info, api);
  formFillFromMeta(info, api);
  calculateImageSize(helpers, info, state, api);
  updateImagesDropdown(info, state, api);
};

const changeImages = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState, api: API): void => {
  const data = api.getData();
  const image = ListUtils.findEntry(info.imageList, data.images);
  image.each((img) => {
    const updateAlt = data.alt === '' || state.prevImage.map((image) => image.text === data.alt).getOr(false);
    if (updateAlt) {
      if (img.value === '') {
        api.setData({ src: img, alt: state.prevAlt });
      } else {
        api.setData({ src: img, alt: img.text });
      }
    } else {
      api.setData({ src: img });
    }
  });
  state.prevImage = image;
  changeSrc(helpers, info, state, api);
};

const calcVSpace = (css: StyleMap): string => {
  const matchingTopBottom = css['margin-top'] && css['margin-bottom'] && css['margin-top'] === css['margin-bottom'];
  return matchingTopBottom ? Utils.removePixelSuffix(String(css['margin-top'])) : '';
};

const calcHSpace = (css: StyleMap): string => {
  const matchingLeftRight = css['margin-right'] && css['margin-left'] && css['margin-right'] === css['margin-left'];
  return matchingLeftRight ? Utils.removePixelSuffix(String(css['margin-right'])) : '';
};

const calcBorderWidth = (css: StyleMap): string =>
  css['border-width'] ? Utils.removePixelSuffix(String(css['border-width'])) : '';

const calcBorderStyle = (css: StyleMap): string =>
  css['border-style'] ? String(css['border-style']) : '';

const calcStyle = (parseStyle: Helpers['parseStyle'], serializeStyle: Helpers['serializeStyle'], css: StyleMap): string =>
  serializeStyle(parseStyle(serializeStyle(css)));

const changeStyle2 = (parseStyle: Helpers['parseStyle'], serializeStyle: Helpers['serializeStyle'], data: ImageDialogData): ImageDialogData => {
  const css = Utils.mergeMargins(parseStyle(data.style));
  const dataCopy: ImageDialogData = Merger.deepMerge({}, data);
  // Move opposite equal margins to vspace/hspace field
  dataCopy.vspace = calcVSpace(css);
  dataCopy.hspace = calcHSpace(css);
  // Move border-width
  dataCopy.border = calcBorderWidth(css);
  // Move border-style
  dataCopy.borderstyle = calcBorderStyle(css);
  // Reserialize style
  dataCopy.style = calcStyle(parseStyle, serializeStyle, css);
  return dataCopy;
};

const changeStyle = (helpers: Helpers, api: API): void => {
  const data = api.getData();
  const newData = changeStyle2(helpers.parseStyle, helpers.serializeStyle, data);
  api.setData(newData);
};

const changeAStyle = (helpers: Helpers, info: ImageDialogInfo, api: API): void => {
  const data: ImageDialogData = Merger.deepMerge(fromImageData(info.image), api.getData());
  const style = getStyleValue(helpers.normalizeCss, toImageData(data, false));
  api.setData({ style });
};

const changeFileInput = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState, api: API): void => {
  const data = api.getData();
  api.block('Uploading image'); // What msg do we pass to the lock?
  Arr.head(data.fileinput)
    .fold(() => {
      api.unblock();
    }, (file) => {
      const blobUri: string = URL.createObjectURL(file);
      const finalize = () => {
        api.unblock();
        URL.revokeObjectURL(blobUri);
      };

      const updateSrcAndSwitchTab = (url: string) => {
        api.setData({ src: { value: url, meta: {}}});
        api.showTab('general');
        changeSrc(helpers, info, state, api);
      };

      Utils.blobToDataUri(file).then((dataUrl) => {
        const blobInfo = helpers.createBlobCache(file, blobUri, dataUrl);
        if (info.automaticUploads) {
          helpers.uploadImage(blobInfo).then((result) => {
            updateSrcAndSwitchTab(result.url);
            finalize();
          }).catch((err) => {
            finalize();
            helpers.alertErr(err);
          });
        } else {
          helpers.addToBlobCache(blobInfo);
          updateSrcAndSwitchTab(blobInfo.blobUri());
          api.unblock();
        }
      });
    });
};

const changeHandler = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState) => (api: API, evt: ChangeEvent): void => {
  if (evt.name === 'src') {
    changeSrc(helpers, info, state, api);
  } else if (evt.name === 'images') {
    changeImages(helpers, info, state, api);
  } else if (evt.name === 'alt') {
    state.prevAlt = api.getData().alt;
  } else if (evt.name === 'style') {
    changeStyle(helpers, api);
  } else if (evt.name === 'vspace' || evt.name === 'hspace' ||
    evt.name === 'border' || evt.name === 'borderstyle') {
    changeAStyle(helpers, info, api);
  } else if (evt.name === 'fileinput') {
    changeFileInput(helpers, info, state, api);
  } else if (evt.name === 'isDecorative') {
    if (api.getData().isDecorative) {
      api.disable('alt');
    } else {
      api.enable('alt');
    }
  }
};

const closeHandler = (state: ImageDialogState) => (): void => {
  state.open = false;
};

const makeDialogBody = (info: ImageDialogInfo): DialogType.TabPanelSpec | DialogType.PanelSpec => {
  if (info.hasAdvTab || info.hasUploadUrl || info.hasUploadHandler) {
    const tabPanel: DialogType.TabPanelSpec = {
      type: 'tabpanel',
      tabs: Arr.flatten([
        [ MainTab.makeTab(info) ],
        info.hasAdvTab ? [ AdvTab.makeTab(info) ] : [],
        info.hasUploadTab && (info.hasUploadUrl || info.hasUploadHandler) ? [ UploadTab.makeTab(info) ] : []
      ])
    };
    return tabPanel;
  } else {
    const panel: DialogType.PanelSpec = {
      type: 'panel',
      items: MainTab.makeItems(info)
    };
    return panel;
  }
};

const makeDialog = (helpers: Helpers) => (info: ImageDialogInfo): DialogType.DialogSpec<ImageDialogData> => {
  const state = createState(info);
  return {
    title: 'Insert/Edit Image',
    size: 'normal',
    body: makeDialogBody(info),
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData: fromImageData(info.image),
    onSubmit: helpers.onSubmit(info),
    onChange: changeHandler(helpers, info, state),
    onClose: closeHandler(state)
  };
};

const submitHandler = (editor: Editor) => (info: ImageDialogInfo) => (api: API): void => {
  const data: ImageDialogData = Merger.deepMerge(fromImageData(info.image), api.getData());

  editor.execCommand('mceUpdateImage', false, toImageData(data, info.hasAccessibilityOptions));
  editor.editorUpload.uploadImagesAuto();

  api.close();
};

const imageSize = (editor: Editor) => (url: string): Promise<Size> => {
  // If the URL isn't safe then don't attempt to load it to get the sizes
  if (!Utils.isSafeImageUrl(editor, url)) {
    return Promise.resolve({ width: '', height: '' });
  } else {
    return Utils.getImageSize(editor.documentBaseURI.toAbsolute(url)).then((dimensions) => ({
      width: String(dimensions.width),
      height: String(dimensions.height)
    }));
  }
};

const createBlobCache = (editor: Editor) => (file: File, blobUri: string, dataUrl: string): BlobInfo =>
  editor.editorUpload.blobCache.create({
    blob: file,
    blobUri,
    name: file.name ? file.name.replace(/\.[^\.]+$/, '') : null,
    filename: file.name,
    base64: dataUrl.split(',')[ 1 ]
  });

const addToBlobCache = (editor: Editor) => (blobInfo: BlobInfo): void => {
  editor.editorUpload.blobCache.add(blobInfo);
};

const alertErr = (editor: Editor) => (message: string): void => {
  editor.windowManager.alert(message);
};

const normalizeCss = (editor: Editor) => (cssText: string): string =>
  doNormalizeCss(editor, cssText);

const parseStyle = (editor: Editor) => (cssText: string): StyleMap =>
  editor.dom.parseStyle(cssText);

const serializeStyle = (editor: Editor) => (stylesArg: StyleMap, name?: string): string =>
  editor.dom.serializeStyle(stylesArg, name);

const uploadImage = (editor: Editor) => (blobInfo: BlobInfo): Promise<UploadResult> =>
  ImageUploader(editor).upload([ blobInfo ], false).then((results) => {
    if (results.length === 0) {
      return Promise.reject('Failed to upload image');
    } else if (results[0].status === false) {
      return Promise.reject(results[0].error.message);
    } else {
      return results[0];
    }
  });

export const Dialog = (editor: Editor): { open: () => void } => {
  const helpers: Helpers = {
    onSubmit: submitHandler(editor),
    imageSize: imageSize(editor),
    addToBlobCache: addToBlobCache(editor),
    createBlobCache: createBlobCache(editor),
    alertErr: alertErr(editor),
    normalizeCss: normalizeCss(editor),
    parseStyle: parseStyle(editor),
    serializeStyle: serializeStyle(editor),
    uploadImage: uploadImage(editor)
  };
  const open = () => {
    collect(editor)
      .then(makeDialog(helpers))
      .then(editor.windowManager.open);
  };
  return {
    open
  };
};
