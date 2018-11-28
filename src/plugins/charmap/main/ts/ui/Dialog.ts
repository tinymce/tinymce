/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Throttler } from '@ephox/katamari';

import Actions from '../core/Actions';
import Scan from '../core/Scan';
import {UserDefined} from '../core/CharMap';

const patternName = 'pattern';

const open = function (editor, charMap) {
  const makeGroupItems = () => [
    {
      label: 'Search',
      type: 'input',
      name: patternName
    },
    {
      type: 'collection',
      name: 'results',
      columns: 'auto'
    }
  ];

  const makeTabs = () => {
    return Arr.map(charMap, (charGroup) => {
      return {
        title: charGroup.name,
        items: makeGroupItems()
      };
    });
  };

  const currentTab = charMap.length === 1 ? Cell(UserDefined) : Cell('All');

  const makeBodyItems = () => {
    if (charMap.length === 1) {
      return { items: makeGroupItems() };
    } else {
      return { tabs: makeTabs() };
    }
  };

  const scanAndSet = (dialogApi, pattern: string) => {
    Arr.find(charMap, (group) => group.name === currentTab.get()).each((f) => {
      const items = Scan.scan(f, pattern.toLowerCase());
      dialogApi.setData({
        results: items
      });
    });
  };

  const SEARCH_DELAY = 40;

  const updateFilter = Throttler.last((dialogApi) => {
    const pattern = dialogApi.getData().pattern;
    scanAndSet(dialogApi, pattern);
  }, SEARCH_DELAY);

  const bridgeSpec = {
    title: 'Special Character',
    size: 'normal',
    body: {
      type: charMap.length === 1 ? 'panel' : 'tabpanel',
      ...makeBodyItems()
    },
    buttons: [
      {
        type: 'cancel',
        name: 'close',
        text: 'Close'
      }
    ],
    initialData: {
      pattern: '',
      results: Scan.scan(charMap[0], '')
    },
    onAction(api, details) {
      if (details.name === 'results') {
        Actions.insertChar(editor, details.value);
        api.close();
      }
    },

    onTabChange: (dialogApi, title: string) => {
      currentTab.set(title);
      updateFilter.throttle(dialogApi);
    },

    onChange: (dialogApi, changeData) => {
      if (changeData.name === patternName) {
        updateFilter.throttle(dialogApi);
      }
    }
  };
  editor.windowManager.open(bridgeSpec);
};

export default {
  open
};