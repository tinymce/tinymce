/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Optional, Throttler } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { insertEmoticon } from '../core/Actions';
import { ALL_CATEGORY, EmojiDatabase } from '../core/EmojiDatabase';
import { emojisFrom } from '../core/Lookup';

const patternName = 'pattern';

const open = (editor: Editor, database: EmojiDatabase) => {

  const initialState = {
    pattern: '',
    results: emojisFrom(database.listAll(), '', Optional.some(300))
  };

  const currentTab = Cell(ALL_CATEGORY);

  const scan = (dialogApi) => {
    const dialogData = dialogApi.getData();
    const category = currentTab.get();
    const candidates = database.listCategory(category);
    const results = emojisFrom(candidates, dialogData[patternName], category === ALL_CATEGORY ? Optional.some(300) : Optional.none());
    dialogApi.setData({
      results
    });
  };

  const updateFilter = Throttler.last((dialogApi) => {
    scan(dialogApi);
  }, 200);

  const searchField: Dialog.BodyComponentSpec = {
    label: 'Search',
    type: 'input',
    name: patternName
  };

  const resultsField: Dialog.BodyComponentSpec = {
    type: 'collection',
    name: 'results'
    // TODO TINY-3229 implement collection columns properly
    // columns: 'auto'
  };

  const getInitialState = (): Dialog.DialogSpec<typeof initialState> => {
    const body: Dialog.TabPanelSpec = {
      type: 'tabpanel',
      // All tabs have the same fields.
      tabs: Arr.map(database.listCategories(), (cat) => ({
        title: cat,
        name: cat,
        items: [ searchField, resultsField ]
      }))
    };
    return {
      title: 'Emoticons',
      size: 'normal',
      body,
      initialData: initialState,
      onTabChange: (dialogApi, details) => {
        currentTab.set(details.newTabName);
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
          text: 'Close',
          primary: true
        }
      ]
    };
  };

  const dialogApi = editor.windowManager.open(getInitialState());

  dialogApi.focus(patternName);

  if (!database.hasLoaded()) {
    dialogApi.block('Loading emoticons...');
    database.waitForLoad().then(() => {
      dialogApi.redial(getInitialState());
      updateFilter.throttle(dialogApi);
      dialogApi.focus(patternName);
      dialogApi.unblock();
    }).catch((_err) => {
      dialogApi.redial({
        title: 'Emoticons',
        body: {
          type: 'panel',
          items: [
            {
              type: 'alertbanner',
              level: 'error',
              icon: 'warning',
              text: '<p>Could not load emoticons</p>'
            }
          ]
        },
        buttons: [
          {
            type: 'cancel',
            text: 'Close',
            primary: true
          }
        ],
        initialData: {
          pattern: '',
          results: []
        }
      });
      dialogApi.focus(patternName);
      dialogApi.unblock();
    });
  }
};

export {
  open
};
