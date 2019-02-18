/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Merger, Obj, Arr, Type } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';
import { Editor } from 'tinymce/core/api/Editor';

import Settings from '../api/Settings';
import HtmlToData from '../core/HtmlToData';
import Service from '../core/Service';
import Size from '../core/Size';
import UpdateHtml from '../core/UpdateHtml';
import { Types } from '@ephox/bridge';

type DialogData = {
  source1?: string;
  source2?: string;
  embed?: string;
  dimensions?: {
    width?: string;
    height?: string;
  };
  poster?: string;
};

// NOTE: This means the dialog doesn't actually comply with the DialogData type, but it's too complex to unwind now
const unwrap = (data) => Merger.merge(data, {
  source1: data.source1.value,
  source2: Obj.get(data, 'source2').bind((source2) => Obj.get(source2, 'value')).getOr(''),
  poster: Obj.get(data, 'poster').bind((poster) => Obj.get(poster, 'value')).getOr('')
});

const wrap = (data) => Merger.merge(data, {
  source1: { value: Obj.get(data, 'source1').getOr('') },
  source2: { value: Obj.get(data, 'source2').getOr('') },
  poster: { value: Obj.get(data, 'poster').getOr('') }
});

const handleError = function (editor: Editor) {
  return function (error) {
    const errorMessage = error && error.msg ?
      'Media embed handler error: ' + error.msg :
      'Media embed handler threw unknown error.';
    editor.notificationManager.open({ type: 'error', text: errorMessage });
  };
};

const snippetToData = (editor: Editor, embedSnippet) => {
  return Tools.extend({}, HtmlToData.htmlToData(Settings.getScripts(editor), embedSnippet));
};

const getEditorData = function (editor: Editor) {
  // This return type is 'any' almost entirely because 'htmlToDataSax' returns any
  const element = editor.selection.getNode();
  const dataEmbed = element.getAttribute('data-ephox-embed-iri');

  if (dataEmbed) {
    return {
      source1: dataEmbed,
      width: Size.getMaxWidth(element),
      height: Size.getMaxHeight(element)
    };
  }

  return element.getAttribute('data-mce-object') ?
    HtmlToData.htmlToData(Settings.getScripts(editor), editor.serializer.serialize(element, { selection: true })) :
    {};
};

const getSource = function (editor: Editor) {
  const elm = editor.selection.getNode();
  return elm.getAttribute('data-mce-object') || elm.getAttribute('data-ephox-embed-iri') ? editor.selection.getContent() : '';
};

const addEmbedHtml = function (win: Types.Dialog.DialogInstanceApi<DialogData>, editor: Editor) {
  return function (response) {
    // Only set values if a URL has been defined
    if (Type.isString(response.url) && response.url.trim().length > 0) {
      const html = response.html;
      const snippetData = snippetToData(editor, html);
      const nuData: Partial<DialogData> = {
        source1: response.url,
        embed: html
      };

      // Add additional values that might have been returned in the html
      Arr.each([ 'width', 'height' ], (prop) => {
        Obj.get(snippetData, prop).each((value) => {
          const dimensions = nuData.dimensions || {};
          dimensions[prop] = value;
          nuData.dimensions = dimensions;
        });
      });

      win.setData(wrap(nuData));
    }
  };
};

const selectPlaceholder = function (editor: Editor, beforeObjects) {
  let i;
  let y;
  const afterObjects = editor.dom.select('img[data-mce-object]');

  // Find new image placeholder so we can select it
  for (i = 0; i < beforeObjects.length; i++) {
    for (y = afterObjects.length - 1; y >= 0; y--) {
      if (beforeObjects[i] === afterObjects[y]) {
        afterObjects.splice(y, 1);
      }
    }
  }

  editor.selection.select(afterObjects[0]);
};

const handleInsert = function (editor: Editor, html) {
  const beforeObjects = editor.dom.select('img[data-mce-object]');

  editor.insertContent(html);
  selectPlaceholder(editor, beforeObjects);
  editor.nodeChanged();
};

const submitForm = function (data, editor: Editor) {
  data.embed = UpdateHtml.updateHtml(data.embed, data);

  if (data.embed && Service.isCached(data.source1)) {
    handleInsert(editor, data.embed);
  } else {
    Service.getEmbedHtml(editor, data)
      .then(function (response) {
        handleInsert(editor, response.html);
      }).catch(handleError(editor));
  }
};

const showDialog = function (editor: Editor) {
  const editorData = getEditorData(editor);

  const defaultData: DialogData = {
    source1: '',
    source2: '',
    embed: getSource(editor),
    poster: '',
    dimensions: {
      height: editorData.height ? editorData.height : '',
      width: editorData.width ? editorData.width : ''
    }
  };

  // This is a bit of a lie because the editor data doesn't have dimensions sub-objects, but that's handled above
  const initialData: DialogData = wrap(Merger.merge(defaultData, editorData));

  const getSourceData = (api) => {
    const data = unwrap(api.getData());

    return Settings.hasDimensions(editor) ? Merger.merge(data, {
      width: data.dimensions.width,
      height: data.dimensions.height
    }) : data;
  };

  const handleSource1 = (api) => {
    const serviceData = getSourceData(api);
    Service.getEmbedHtml(editor, serviceData)
      .then(addEmbedHtml(win, editor))
      .catch(handleError(editor));
  };

  const handleEmbed = (api) => {
    const data = unwrap(api.getData());

    const dataFromEmbed = snippetToData(editor, data.embed);
    dataFromEmbed.dimensions = {
      width: dataFromEmbed.width ? dataFromEmbed.width : data.dimensions.width,
      height: dataFromEmbed.height ? dataFromEmbed.height : data.dimensions.height
    };

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
      items: Arr.flatten<Types.Dialog.BodyComponentApi>([mediaInput, sizeInput])
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
      submitForm(serviceData, editor);
      api.close();
    },
    onChange (api, detail) {
      switch (detail.name) {
        case 'source1':
          handleSource1(api);
          break;

        case 'embed':
          handleEmbed(api);
          break;

        default:
          break;
      }
    },
    initialData
  });
};

export default {
  showDialog
};
