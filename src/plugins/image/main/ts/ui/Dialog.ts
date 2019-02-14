/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { File } from '@ephox/dom-globals';
import { Arr, FutureResult, Option, Result, Type, Merger } from '@ephox/katamari';
import { URL } from '@ephox/sand';

import { Editor } from '../../../../../core/main/ts/api/Editor';
import { BlobCache } from '../../../../../core/main/ts/api/file/BlobCache';
import { MainTab } from './MainTab';
import { ImageData, getStyleValue } from '../core/ImageData';
import { insertOrUpdateImage, normalizeCss as doNormalizeCss } from '../core/ImageSelection';
import { ListUtils } from '../core/ListUtils';
import Uploader from '../core/Uploader';
import Utils from '../core/Utils';
import { AdvTab } from './AdvTab';
import { collect } from './DialogInfo';
import { API, ImageDialogData, ImageDialogInfo, ListValue } from './DialogTypes';
import { UploadTab } from './UploadTab';
import { StyleMap } from '../../../../../core/main/ts/api/html/Styles';
import { Types } from '@ephox/bridge';

interface ChangeEvent {
  name: string;
}

interface Size {
  width: string;
  height: string;
}

interface Helpers {
  onSubmit: (info: ImageDialogInfo) => (api: API) => void;
  imageSize: (url: string) => FutureResult<Size, void>;
  createBlobCache: (file: File, blobUri: string, dataUrl: string) => BlobCache;
  alertErr: (api: API, message: string) => void;
  normalizeCss: (cssText: string) => string;
  parseStyle: (cssText: string) => StyleMap;
  serializeStyle: (stylesArg: StyleMap, name?: string) => string;
}

interface ImageDialogState {
  prevImage: Option<ListValue>;
  prevAlt: string;
  open: boolean;
}

const createState = (info: ImageDialogInfo) => ({
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
  fileinput: []
});

const toImageData = (data: ImageDialogData): ImageData => ({
  src: data.src.value,
  alt: data.alt,
  title: data.title,
  width: data.dimensions.width,
  height: data.dimensions.height,
  class: data.classes,
  style: data.style,
  caption: data.caption,
  hspace: data.hspace,
  vspace: data.vspace,
  border: data.border,
  borderStyle: data.borderstyle
});

const addPrependUrl2 = (info: ImageDialogInfo, srcURL: string): Option<string> => {
  // Add the prependURL
  if (!/^(?:[a-zA-Z]+:)?\/\//.test(srcURL)) {
    return info.prependURL.bind((prependUrl) => {
      if (srcURL.substring(0, prependUrl.length) !== prependUrl) {
        return Option.some(prependUrl + srcURL);
      }
      return Option.none();
    });
  }
  return Option.none();
};

const addPrependUrl = (info: ImageDialogInfo, api: API) => {
  const data = api.getData();
  addPrependUrl2(info, data.src.value).each((srcURL) => {
    api.setData({ src: { value: srcURL, meta: data.src.meta } });
  });
};

const formFillFromMeta2 = (info: ImageDialogInfo, data: ImageDialogData): Option<ImageDialogData> => {
  const meta = data.src.meta;
  if (meta !== undefined) {
    const dataCopy: ImageDialogData = Merger.deepMerge({}, data);
    if (info.hasDescription && Type.isString(meta.alt)) {
      dataCopy.alt = meta.alt;
    }
    if (info.hasImageTitle && Type.isString(meta.title)) {
      dataCopy.title = meta.title;
    }
    if (info.hasDimensions) {
      if (Type.isString(meta.width)) {
        dataCopy.dimensions.width = meta.width;
      }
      if (Type.isString(meta.height)) {
        dataCopy.dimensions.height = meta.height;
      }
    }
    if (Type.isString(meta.class)) {
      ListUtils.findEntry(info.classList, meta.class).each((entry) => {
        dataCopy.classes = entry.value;
      });
    }
    if (info.hasAdvTab) {
      if (Type.isString(meta.vspace)) {
        dataCopy.vspace = meta.vspace;
      }
      if (Type.isString(meta.border)) {
        dataCopy.border = meta.border;
      }
      if (Type.isString(meta.hspace)) {
        dataCopy.hspace = meta.hspace;
      }
      if (Type.isString(meta.borderstyle)) {
        dataCopy.borderstyle = meta.borderstyle;
      }
    }
    return Option.some(dataCopy);
  }
  return Option.none();
};

const formFillFromMeta = (info: ImageDialogInfo, api: API) => {
  formFillFromMeta2(info, api.getData()).each((data) => api.setData(data));
};

const calculateImageSize = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState, api: API) => {
  const data = api.getData();
  const url = data.src.value;
  const meta = data.src.meta || {};
  if (!meta.width && !meta.height && info.hasDimensions) {
    helpers.imageSize(url).get((result) => {
      result.each((size) => {
        if (state.open) {
          api.setData({ dimensions: size });
        }
      });
    });
  }
};

const updateImagesDropdown = (info: ImageDialogInfo, state: ImageDialogState, api: API) => {
  const data = api.getData();
  const image = ListUtils.findEntry(info.imageList, data.src.value);
  state.prevImage = image;
  api.setData({ images: image.map((entry) => entry.value).getOr('') });
};

const changeSrc = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState, api: API) => {
  addPrependUrl(info, api);
  formFillFromMeta(info, api);
  calculateImageSize(helpers, info, state, api);
  updateImagesDropdown(info, state, api);
};

const changeImages = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState, api: API) => {
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
  const matchingTopBottom = css['margin-top'] && css['margin-bottom'] &&
    css['margin-top'] === css['margin-bottom'];
  return matchingTopBottom ? Utils.removePixelSuffix(String(css['margin-top'])) : '';
};

const calcHSpace = (css: StyleMap): string => {
  const matchingLeftRight = css['margin-right'] && css['margin-left'] &&
    css['margin-right'] === css['margin-left'];
  return matchingLeftRight ? Utils.removePixelSuffix(String(css['margin-right'])) : '';
};

const calcBorderWidth = (css: StyleMap): string => {
  return css['border-width'] ? Utils.removePixelSuffix(String(css['border-width'])) : '';
};

const calcBorderStyle = (css: StyleMap): string => {
  return css['border-style'] ? String(css['border-style']) : '';
};

const calcStyle = (parseStyle: Helpers['parseStyle'], serializeStyle: Helpers['serializeStyle'], css: StyleMap): string => {
  return serializeStyle(parseStyle(serializeStyle(css)));
};

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

const changeStyle = (helpers: Helpers, api: API) => {
  const data = api.getData();
  const newData = changeStyle2(helpers.parseStyle, helpers.serializeStyle, data);
  api.setData(newData);
};

const changeAStyle = (helpers: Helpers, info: ImageDialogInfo, api: API) => {
  const data: ImageDialogData = Merger.deepMerge(fromImageData(info.image), api.getData());
  const style = getStyleValue(helpers.normalizeCss, toImageData(data));
  api.setData({ style });
};

const changeFileInput = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState, api: API) => {
  const data = api.getData();
  api.block('Uploading image'); // What msg do we pass to the lock?
  Arr.head(data.fileinput)
    .fold(() => {
      api.unblock();
    }, (file) => {
      const blobUri: string = URL.createObjectURL(file);

      const uploader = Uploader({
        url: info.url,
        basePath: info.basePath,
        credentials: info.credentials,
        handler: info.handler
      });

      const finalize = () => {
        api.unblock();
        URL.revokeObjectURL(blobUri);
      };

      Utils.blobToDataUri(file).then((dataUrl) => {
        const blobInfo = helpers.createBlobCache(file, blobUri, dataUrl);
        uploader.upload(blobInfo).then((url: string) => {
          api.setData({ src: { value: url, meta: { } } });
          api.showTab('General');
          changeSrc(helpers, info, state, api);
          finalize();
        }).catch((err) => {
          finalize();
          helpers.alertErr(api, err);
        });
      });
    });
};

const changeHandler = (helpers: Helpers, info: ImageDialogInfo, state: ImageDialogState) => (api: API, evt: ChangeEvent) => {
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
  }
};

const closeHandler = (state: ImageDialogState) => () => {
  state.open = false;
};

const makeDialogBody = (info: ImageDialogInfo) => {
  if (info.hasAdvTab || info.hasUploadUrl || info.hasUploadHandler) {
    const tabPanel: Types.Dialog.TabPanelApi = {
      type: 'tabpanel',
      tabs: Arr.flatten([
        [MainTab.makeTab(info)],
        info.hasAdvTab ? [AdvTab.makeTab(info)] : [],
        info.hasUploadUrl || info.hasUploadHandler ? [UploadTab.makeTab(info)] : []
      ])
    };
    return tabPanel;
  } else {
    const panel: Types.Dialog.PanelApi = {
      type: 'panel',
      items: MainTab.makeItems(info)
    };
    return panel;
  }
};

const makeDialog = (helpers: Helpers) => (info: ImageDialogInfo): Types.Dialog.DialogApi<ImageDialogData> => {
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

const submitHandler = (editor: Editor) => (info: ImageDialogInfo) => (api: API) => {
  const data: ImageDialogData = Merger.deepMerge(fromImageData(info.image), api.getData());

  editor.undoManager.transact(() => {
    insertOrUpdateImage(editor, toImageData(data));
  });

  editor.editorUpload.uploadImagesAuto();

  api.close();
};

const imageSize = (editor: Editor) => (url: string): FutureResult<Size, void> => {
  return FutureResult.nu((completer) => {
    Utils.getImageSize(editor.documentBaseURI.toAbsolute(url), function (data) {
      const result = data.bind((dimensions) => {
        return ((Type.isString(dimensions.width) || Type.isNumber(dimensions.width)) && (Type.isString(dimensions.height) || Type.isNumber(dimensions.height))) ?
          Result.value({ width: String(dimensions.width), height: String(dimensions.height) }) :
          Result.error(undefined);
      });
      completer(result);
    });
  });
};

const createBlobCache = (editor: Editor) => (file: File, blobUri: string, dataUrl: string): BlobCache => {
  return editor.editorUpload.blobCache.create({
    blob: file,
    blobUri,
    name: file.name ? file.name.replace(/\.[^\.]+$/, '') : null,
    base64: dataUrl.split(',')[1]
  });
};

const alertErr = (editor: Editor) => (api: API, message: string) => {
  // TODO: it looks like the intention to close the entire dialog on an error. Is that really a good idea?
  editor.windowManager.alert(message, api.close);
};

const normalizeCss = (editor: Editor) => (cssText: string) => {
  return doNormalizeCss(editor, cssText);
};

const parseStyle = (editor: Editor) => (cssText: string): StyleMap => {
  return editor.dom.parseStyle(cssText);
};

const serializeStyle = (editor: Editor) => (stylesArg: StyleMap, name?: string): string => {
  return editor.dom.serializeStyle(stylesArg, name);
};

export const Dialog = (editor: Editor) => {
  const helpers: Helpers = {
    onSubmit: submitHandler(editor),
    imageSize: imageSize(editor),
    createBlobCache: createBlobCache(editor),
    alertErr: alertErr(editor),
    normalizeCss: normalizeCss(editor),
    parseStyle: parseStyle(editor),
    serializeStyle: serializeStyle(editor),
  };
  const open = () => collect(editor).map(makeDialog(helpers)).get((spec) => {
    editor.windowManager.open(spec);
  });

  return {
    open
  };
};