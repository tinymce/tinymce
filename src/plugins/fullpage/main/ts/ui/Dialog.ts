/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Parser from '../core/Parser';
import { Merger } from '@ephox/katamari';

const open = function (editor, headState) {
  const data = Parser.htmlToData(editor, headState.get());

  const defaultData = {
    title: '',
    keywords: '',
    description: '',
    robots: '',
    author: '',
    docencoding: ''
  };

  const initialData = Merger.merge(defaultData, data);

  editor.windowManager.open({
    title: 'Metadata and Document Properties',
    size: 'normal',
    body: {
      type: 'panel',
      items: [
        {
          name: 'title',
          type: 'input',
          label: 'Title'
        },
        {
          name: 'keywords',
          type: 'input',
          label: 'Keywords'
        },
        {
          name: 'description',
          type: 'input',
          label: 'Description'
        },
        {
          name: 'robots',
          type: 'input',
          label: 'Robots'
        },
        {
          name: 'author',
          type: 'input',
          label: 'Author'
        },
        {
          name: 'docencoding',
          type: 'input',
          label: 'Encoding'
        },
      ]
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
    initialData,
    onSubmit: (api) => {
      const nuData = api.getData();

      const headHtml = Parser.dataToHtml(editor, Tools.extend(data, nuData), headState.get());

      headState.set(headHtml);

      api.close();
    }
  });
};

export default {
  open
};