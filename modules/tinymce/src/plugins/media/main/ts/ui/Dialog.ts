/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Element, HTMLElement } from '@ephox/dom-globals';
import { Arr, Cell, Merger, Obj, Type } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

import Settings from '../api/Settings';
import * as HtmlToData from '../core/HtmlToData';
import Service from '../core/Service';
import { MediaData } from '../core/Types';
import UpdateHtml from '../core/UpdateHtml';

type DialogData = {
  source1?: {
    value: string
  };
  source2?: {
    value: string
  };
  embed?: string;
  dimensions?: {
    width?: string;
    height?: string;
  };
  poster?: {
    value: string
  };
};

const unwrap = (data: DialogData): MediaData => {
  const unwrapped = Merger.merge(data, {
    source1: data.source1.value,
    source2: Obj.get(data, 'source2').bind((source2) => Obj.get(source2, 'value')).getOr(''),
    poster: Obj.get(data, 'poster').bind((poster) => Obj.get(poster, 'value')).getOr('')
  });

  // Add additional size values that may or may not have been in the data
  Obj.get(data, 'dimensions').each((dimensions) => {
    Arr.each([ 'width', 'height' ] as ('width' | 'height')[], (prop) => {
      Obj.get(dimensions, prop).each((value) => unwrapped[prop] = value);
    });
  });

  return unwrapped;
};

const wrap = (data: MediaData): DialogData => {
  const wrapped = Merger.merge(data, {
    source1: { value: Obj.get(data, 'source1').getOr('') },
    source2: { value: Obj.get(data, 'source2').getOr('') },
    poster: { value: Obj.get(data, 'poster').getOr('') }
  });

  // Add additional size values that may or may not have been in the html
  Arr.each([ 'width', 'height' ] as (keyof MediaData)[], (prop) => {
    Obj.get(data, prop).each((value) => {
      const dimensions = wrapped.dimensions || {};
      dimensions[prop] = value;
      wrapped.dimensions = dimensions;
    });
  });

  return wrapped;
};

const handleError = function (editor: Editor): (error?: { msg: string }) => void {
  return function (error) {
    const errorMessage = error && error.msg ?
      'Media embed handler error: ' + error.msg :
      'Media embed handler threw unknown error.';
    editor.notificationManager.open({ type: 'error', text: errorMessage });
  };
};

const snippetToData = (editor: Editor, embedSnippet: string): MediaData => {
  return HtmlToData.htmlToData(Settings.getScripts(editor), embedSnippet);
};

const isMediaElement = (element: Element) => element.getAttribute('data-mce-object') || element.getAttribute('data-ephox-embed-iri');

const getEditorData = function (editor: Editor): MediaData {
  const element = editor.selection.getNode();
  const snippet = isMediaElement(element) ? editor.serializer.serialize(element, { selection: true }) : '';
  return Merger.merge({ embed: snippet }, HtmlToData.htmlToData(Settings.getScripts(editor), snippet));
};

const addEmbedHtml = function (api: Types.Dialog.DialogInstanceApi<DialogData>, editor: Editor) {
  return function (response: { url: string; html: string }) {
    // Only set values if a URL has been defined
    if (Type.isString(response.url) && response.url.trim().length > 0) {
      const html = response.html;
      const snippetData = snippetToData(editor, html);
      const nuData: MediaData = {
        ...snippetData,
        source1: response.url,
        embed: html
      };

      api.setData(wrap(nuData));
    }
  };
};

const selectPlaceholder = function (editor: Editor, beforeObjects: HTMLElement[]) {
  const afterObjects = editor.dom.select('img[data-mce-object]');

  // Find new image placeholder so we can select it
  for (let i = 0; i < beforeObjects.length; i++) {
    for (let y = afterObjects.length - 1; y >= 0; y--) {
      if (beforeObjects[i] === afterObjects[y]) {
        afterObjects.splice(y, 1);
      }
    }
  }

  editor.selection.select(afterObjects[0]);
};

const handleInsert = function (editor: Editor, html: string) {
  const beforeObjects = editor.dom.select('img[data-mce-object]');

  editor.insertContent(html);
  selectPlaceholder(editor, beforeObjects);
  editor.nodeChanged();
};

const submitForm = function (prevData: MediaData, newData: MediaData, editor: Editor) {
  newData.embed = UpdateHtml.updateHtml(newData.embed, newData);

  // Only fetch the embed HTML content if the URL has changed from what it previously was
  if (newData.embed && (prevData.source1 === newData.source1 || Service.isCached(newData.source1))) {
    handleInsert(editor, newData.embed);
  } else {
    Service.getEmbedHtml(editor, newData)
      .then(function (response) {
        handleInsert(editor, response.html);
      }).catch(handleError(editor));
  }
};

const showDialog = function (editor: Editor) {
  const editorData = getEditorData(editor);
  const currentData = Cell<MediaData>(editorData);
  const initialData = wrap(editorData);

  const getSourceData = (api: Types.Dialog.DialogInstanceApi<DialogData>): MediaData => {
    return unwrap(api.getData());
  };

  const handleSource1 = (prevData: MediaData, api: Types.Dialog.DialogInstanceApi<DialogData>) => {
    const serviceData = getSourceData(api);

    // If a new URL is entered, then clear the embed html and fetch the new data
    if (prevData.source1 !== serviceData.source1) {
      addEmbedHtml(win, editor)({ url: serviceData.source1, html: '' });

      Service.getEmbedHtml(editor, serviceData)
        .then(addEmbedHtml(win, editor))
        .catch(handleError(editor));
    }
  };

  const handleEmbed = (api: Types.Dialog.DialogInstanceApi<DialogData>) => {
    const data = unwrap(api.getData());
    const dataFromEmbed = snippetToData(editor, data.embed);
    api.setData(wrap(dataFromEmbed));
  };

  const mediaInput: Types.Dialog.BodyComponentApi[] = [{
    name: 'source1',
    type: 'urlinput',
    filetype: 'media',
    label: 'Source'
  }];
  const sizeInput: Types.Dialog.BodyComponentApi[] = !Settings.hasDimensions(editor) ? [] : [{
    type: 'sizeinput',
    name: 'dimensions',
    label: 'Constrain proportions',
    constrain: true
  }];

  const generalTab = {
    title: 'General',
    name: 'general',
    items: Arr.flatten([ mediaInput, sizeInput ])
  };

  const embedTextarea: Types.Dialog.BodyComponentApi = {
    type: 'textarea',
    name: 'embed',
    label: 'Paste your embed code below:'
  };
  const embedTab = {
    title: 'Embed',
    items: [
      embedTextarea
    ]
  };

  const advancedFormItems: Types.Dialog.BodyComponentApi[] = [];

  if (Settings.hasAltSource(editor)) {
    advancedFormItems.push({
        name: 'source2',
        type: 'urlinput',
        filetype: 'media',
        label: 'Alternative source URL'
      }
    );
  }

  if (Settings.hasPoster(editor)) {
    advancedFormItems.push({
      name: 'poster',
      type: 'urlinput',
      filetype: 'image',
      label: 'Media poster (Image URL)'
    });
  }

  const advancedTab = {
    title: 'Advanced',
    name: 'advanced',
    items: advancedFormItems
  };

  const tabs = [
    generalTab,
    embedTab
  ];

  if (advancedFormItems.length > 0) {
    tabs.push(advancedTab);
  }

  const body: Types.Dialog.TabPanelApi = {
    type: 'tabpanel',
    tabs
  };
  const win = editor.windowManager.open({
    title: 'Insert/Edit Media',
    size: 'normal',

    body,
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
    onSubmit (api) {
      const serviceData = getSourceData(api);
      submitForm(currentData.get(), serviceData, editor);
      api.close();
    },
    onChange (api, detail) {
      switch (detail.name) {
        case 'source1':
          handleSource1(currentData.get(), api);
          break;

        case 'embed':
          handleEmbed(api);
          break;

        default:
          break;
      }
      currentData.set(getSourceData(api));
    },
    initialData
  });
};

export default {
  showDialog
};
