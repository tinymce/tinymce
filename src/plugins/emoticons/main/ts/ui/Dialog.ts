/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Arr, Cell, Throttler, Option } from '@ephox/katamari';

import { ALL_CATEGORY, EmojiDatabase } from '../core/EmojiDatabase';
import { emojisFrom } from '../core/Lookup';
import { insertEmoticon } from '../core/Actions';
import { Editor } from 'tinymce/core/api/Editor';

const patternName = 'pattern';

const open = function (editor: Editor, database: EmojiDatabase) {

  const scan = (dialogApi, category: string) => {
    const dialogData = dialogApi.getData();
    const candidates = database.listCategory(category);
    const results = emojisFrom(candidates, dialogData[patternName].toLowerCase(), category === ALL_CATEGORY ? Option.some(50) : Option.none());
    dialogApi.setData({
      results
    });
  };

  const updateFilter = Throttler.last((dialogApi) => {
    const category = currentTab.get();
    scan(dialogApi, category);
  }, 200);

  const currentTab = Cell(ALL_CATEGORY);

  const searchField = {
    label: 'Search',
    type: 'input',
    name: patternName
  };

  const resultsField = {
    type: 'collection',
    name: 'results',
    columns: 'auto'
  };

  const getInitialState = () => ({
    title: 'Emoticons',
    size: 'normal',
    body: {
      type: 'tabpanel',
      // All tabs have the same fields.
      tabs: Arr.map(
        database.listCategories(),
        (cat) => ({
          title: cat,
          items: [ searchField, resultsField ]
        })
      )
    },
    initialData: {
      pattern: '',
      results: emojisFrom(database.listAll(), '', Option.some(50))
    },
    onTabChange: (dialogApi, title: string) => {
      currentTab.set(title);
      updateFilter.throttle(dialogApi);
    },
    onChange: updateFilter.throttle,
    onAction: (dialogApi, actionData) => {
      if (actionData.name === 'results') {
        insertEmoticon(editor, actionData.value);
        dialogApi.close();
      }
    },
    buttons: [
      {
        type: 'cancel',
        text: 'Close'
      }
    ]
  });

  const dialogApi = editor.windowManager.open(getInitialState());

  dialogApi.focus(patternName);

  if (! database.hasLoaded()) {
    dialogApi.block('Loading emoticons...');
    database.waitForLoad().then(() => {
      dialogApi.redial(getInitialState());
      updateFilter.throttle(dialogApi);
      dialogApi.focus(patternName);
      dialogApi.unblock();
    }).catch((err) => {
      dialogApi.redial({
        title: 'Emoticons',
        body: {
          type: 'panel',
          items: [
            {
              type: 'alertbanner',
              level: 'error',
              icon: '',
              text: '<p>Could not load emoticons</p>'
            }
          ]
        },
        buttons: [
          {
            type: 'cancel',
            text: 'Close'
          }
        ],
        initialData: { }
      });
      dialogApi.focus(patternName);
      dialogApi.unblock();
    });
  }
};

export default {
  open
};