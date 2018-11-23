/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import HtmlToData from '../core/HtmlToData';
import Service from '../core/Service';
import Size from '../core/Size';
import UpdateHtml from '../core/UpdateHtml';
import SizeManager from './SizeManager';

const embedChange = (Env.ie && Env.ie <= 8) ? 'onChange' : 'onInput';

const handleError = function (editor) {
  return function (error) {
    const errorMessage = error && error.msg ?
      'Media embed handler error: ' + error.msg :
      'Media embed handler threw unknown error.';
    editor.notificationManager.open({ type: 'error', text: errorMessage });
  };
};

const getData = function (editor) {
  const element = editor.selection.getNode();
  const dataEmbed = element.getAttribute('data-ephox-embed-iri');

  if (dataEmbed) {
    return {
      'source1': dataEmbed,
      'data-ephox-embed-iri': dataEmbed,
      'width': Size.getMaxWidth(element),
      'height': Size.getMaxHeight(element)
    };
  }

  return element.getAttribute('data-mce-object') ?
    HtmlToData.htmlToData(Settings.getScripts(editor), editor.serializer.serialize(element, { selection: true })) :
    {};
};

const getSource = function (editor) {
  const elm = editor.selection.getNode();

  if (elm.getAttribute('data-mce-object') || elm.getAttribute('data-ephox-embed-iri')) {
    return editor.selection.getContent();
  }
};

const addEmbedHtml = function (win, editor) {
  return function (response) {
    const html = response.html;
    const embed = win.find('#embed')[0];
    const data = Tools.extend(HtmlToData.htmlToData(Settings.getScripts(editor), html), { source1: response.url });
    win.fromJSON(data);

    if (embed) {
      embed.value(html);
      SizeManager.updateSize(win);
    }
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

const submitForm = function (win, editor) {
  const data = win.toJSON();

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

const populateMeta = function (win, meta) {
  Tools.each(meta, function (value, key) {
    win.find('#' + key).value(value);
  });
};

const showDialog = function (editor) {
  let win;
  let data;

  const generalFormItems: any[] = [
    {
      name: 'source1',
      type: 'filepicker',
      filetype: 'media',
      size: 40,
      autofocus: true,
      label: 'Source',
      onpaste () {
        setTimeout(function () {
          Service.getEmbedHtml(editor, win.toJSON())
            .then(
            addEmbedHtml(win, editor)
            ).catch(handleError(editor));
        }, 1);
      },
      onchange (e) {
        Service.getEmbedHtml(editor, win.toJSON())
          .then(
          addEmbedHtml(win, editor)
          ).catch(handleError(editor));

        populateMeta(win, e.meta);
      },
      onbeforecall (e) {
        e.meta = win.toJSON();
      }
    }
  ];

  const advancedFormItems = [];

  const reserialise = function (update) {
    update(win);
    data = win.toJSON();
    win.find('#embed').value(UpdateHtml.updateHtml(data.embed, data));
  };

  if (Settings.hasAltSource(editor)) {
    advancedFormItems.push({ name: 'source2', type: 'filepicker', filetype: 'media', size: 40, label: 'Alternative source' });
  }

  if (Settings.hasPoster(editor)) {
    advancedFormItems.push({ name: 'poster', type: 'filepicker', filetype: 'image', size: 40, label: 'Poster' });
  }

  if (Settings.hasDimensions(editor)) {
    const control = SizeManager.createUi(reserialise);
    generalFormItems.push(control);
  }

  data = getData(editor);

  const embedTextBox = {
    id: 'mcemediasource',
    type: 'textbox',
    flex: 1,
    name: 'embed',
    value: getSource(editor),
    multiline: true,
    rows: 5,
    label: 'Source'
  };

  const updateValueOnChange = function () {
    data = Tools.extend({}, HtmlToData.htmlToData(Settings.getScripts(editor), this.value()));
    this.parent().parent().fromJSON(data);
  };

  embedTextBox[embedChange] = updateValueOnChange;

  const body = [
    {
        title: 'General',
        type: 'form',
        items: generalFormItems
    },
    {
        title: 'Embed',
        type: 'container',
        layout: 'flex',
        direction: 'column',
        align: 'stretch',
        padding: 10,
        spacing: 10,
        items: [
          {
            type: 'label',
            text: 'Paste your embed code below:',
            forId: 'mcemediasource'
          },
          embedTextBox
        ]
      }
  ];

  if (advancedFormItems.length > 0) {
    body.push({ title: 'Advanced', type: 'form', items: advancedFormItems });
  }

  win = editor.windowManager.open({
    title: 'Insert/edit media',
    data,
    bodyType: 'tabpanel',
    body,
    onSubmit () {
      SizeManager.updateSize(win);
      submitForm(win, editor);
    }
  });

  SizeManager.syncSize(win);
};

export default {
  showDialog
};