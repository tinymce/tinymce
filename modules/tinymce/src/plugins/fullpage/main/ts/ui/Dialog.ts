/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Parser from '../core/Parser';

const open = function (editor: Editor, headState: Cell<string>) {
  const data = Parser.htmlToData(editor, headState.get());

  const defaultData = {
    title: '',
    keywords: '',
    description: '',
    robots: '',
    author: '',
    docencoding: ''
  };

  const initialData = { ...defaultData, ...data };

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
