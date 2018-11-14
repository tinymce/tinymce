/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Merger } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';

import Settings from '../api/Settings';
import HtmlToData from '../core/HtmlToData';
import Service from '../core/Service';
import Size from '../core/Size';
import UpdateHtml from '../core/UpdateHtml';

const unwrap = (data) => Merger.merge(data, {
  source1: data.source1.value,
  source2: data.source2.value,
  poster: data.poster.value
});

const wrap = (data) => Merger.merge(data, {
  source1: { value: data.source1 || '' },
  source2: { value: data.source2 || '' },
  poster: { value: data.poster || '' }
});

const handleError = function (editor) {
  return function (error) {
    const errorMessage = error && error.msg ?
      'Media embed handler error: ' + error.msg :
      'Media embed handler threw unknown error.';
    editor.notificationManager.open({ type: 'error', text: errorMessage });
  };
};

const snippetToData = (editor, embedSnippet) => {
  return Tools.extend({}, HtmlToData.htmlToData(Settings.getScripts(editor), embedSnippet));
};

const getData = function (editor) {
  const element = editor.selection.getNode();
  const dataEmbed = element.getAttribute('data-ephox-embed-iri');

  if (dataEmbed) {
    return {
      'source1': dataEmbed,
      'data-ephox-embed-iri': dataEmbed,
      'dimensions': {
        width: Size.getMaxWidth(element),
        height: Size.getMaxHeight(element)
      }
    };
  }

  return element.getAttribute('data-mce-object') ?
    HtmlToData.htmlToData(Settings.getScripts(editor), editor.serializer.serialize(element, { selection: true })) :
    {};
};

const getSource = function (editor) {
  const elm = editor.selection.getNode();
  return elm.getAttribute('data-mce-object') || elm.getAttribute('data-ephox-embed-iri') ? editor.selection.getContent() : '';
};

const addEmbedHtml = function (win, editor) {
  return function (response) {
    const html = response.html;
    const snippetData = snippetToData(editor, html);
    const nuData = {
      source1: response.url,
      embed: html,
      dimensions: {
        width: snippetData.width ? snippetData.width : '',
        height: snippetData.height ? snippetData.height : ''
      }
    };

    win.setData(wrap(nuData));
  };
};

const selectPlaceholder = function (editor, beforeObjects) {
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

const handleInsert = function (editor, html) {
  const beforeObjects = editor.dom.select('img[data-mce-object]');

  editor.insertContent(html);
  selectPlaceholder(editor, beforeObjects);
  editor.nodeChanged();
};

const submitForm = function (data, editor) {
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

const showDialog = function (editor) {
  let win;

  const initialHtmlData = getData(editor);

  const defaultData = {
    source1: '',
    source2: '',
    embed: getSource(editor),
    poster: '',
    dimensions: {
      height: initialHtmlData.height ? initialHtmlData.height : '',
      width: initialHtmlData.width ? initialHtmlData.width : ''
    }
  };

  const initialData = wrap(Merger.merge(defaultData, initialHtmlData));

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

  const generalTab = Settings.hasDimensions(editor) ?
    {
      title: 'General',
      items: [
        {
          name: 'source1',
          type: 'urlinput',
          filetype: 'media',
          label: 'Source'
        },
        {
          type: 'sizeinput',
          name: 'dimensions',
          label: 'Constrain proportions',
          constrain: true
        }
      ]
    } : {
      title: 'General',
      items: [
        {
          name: 'source1',
          type: 'urlinput',
          filetype: 'media',
          label: 'Source'
        },
      ]
    };

  const embedTab = {
    title: 'Embed',
    items: [
      {
        type: 'textarea',
        name: 'embed',
        label: 'Paste your embed code below:'
      }
    ]
  };

  const advancedFormItems = [];

  if (Settings.hasAltSource(editor)) {
    advancedFormItems.push({
        name: 'source2',
        type: 'urlinput',
        filetype: 'media',
        label: 'Alternative image URL'
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

  win = editor.windowManager.open({
    title: 'Insert/Edit Media',
    size: 'normal',

    body: {
      type: 'tabpanel',
      tabs
    },
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

        case 'dimensions':
          handleSource1(api);

        case 'embed':
          handleEmbed(api);
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
