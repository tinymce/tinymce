/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Arr, Cell, Throttler } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Actions from '../core/Actions';
import { CharMap, UserDefined } from '../core/CharMap';
import * as Scan from '../core/Scan';

const patternName = 'pattern';

const open = function (editor: Editor, charMap: CharMap[]) {
  const makeGroupItems = (): Types.Dialog.BodyComponentApi[] => [
    {
      label: 'Search',
      type: 'input',
      name: patternName
    },
    {
      type: 'collection',
      name: 'results'
      // TODO TINY-3229 implement collection columns properly
      // columns: 'auto'
    }
  ];

  const makeTabs = () => Arr.map(charMap, (charGroup) => ({
    title: charGroup.name,
    name: charGroup.name,
    items: makeGroupItems()
  }));

  const makePanel = (): Types.Dialog.PanelApi => ({ type: 'panel', items: makeGroupItems() });

  const makeTabPanel = (): Types.Dialog.TabPanelApi => ({ type: 'tabpanel', tabs: makeTabs() });

  const currentTab = charMap.length === 1 ? Cell(UserDefined) : Cell('All');

  const scanAndSet = (dialogApi: Types.Dialog.DialogInstanceApi<typeof initialData>, pattern: string) => {
    Arr.find(charMap, (group) => group.name === currentTab.get()).each((f) => {
      const items = Scan.scan(f, pattern);
      dialogApi.setData({
        results: items
      });
    });
  };

  const SEARCH_DELAY = 40;

  const updateFilter = Throttler.last((dialogApi: Types.Dialog.DialogInstanceApi<typeof initialData>) => {
    const pattern = dialogApi.getData().pattern;
    scanAndSet(dialogApi, pattern);
  }, SEARCH_DELAY);

  const body = charMap.length === 1 ? makePanel() : makeTabPanel();

  const initialData = {
    pattern: '',
    results: Scan.scan(charMap[0], '')
  };

  const bridgeSpec: Types.Dialog.DialogApi<typeof initialData> = {
    title: 'Special Character',
    size: 'normal',
    body,
    buttons: [
      {
        type: 'cancel',
        name: 'close',
        text: 'Close',
        primary: true
      }
    ],
    initialData,
    onAction(api, details) {
      if (details.name === 'results') {
        Actions.insertChar(editor, details.value);
        api.close();
      }
    },

    onTabChange: (dialogApi, details) => {
      currentTab.set(details.newTabName);
      updateFilter.throttle(dialogApi);
    },

    onChange: (dialogApi, changeData) => {
      if (changeData.name === patternName) {
        updateFilter.throttle(dialogApi);
      }
    }
  };
  const dialogApi = editor.windowManager.open(bridgeSpec);
  dialogApi.focus(patternName);
};

export {
  open
};
