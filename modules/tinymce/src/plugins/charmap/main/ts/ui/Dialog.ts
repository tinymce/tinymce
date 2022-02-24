import { Arr, Cell, Throttler } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Actions from '../core/Actions';
import { CharMap, UserDefined } from '../core/CharMap';
import * as Scan from '../core/Scan';

const patternName = 'pattern';

const open = (editor: Editor, charMap: CharMap[]): void => {
  const makeGroupItems = (): Dialog.BodyComponentSpec[] => [
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

  const makePanel = (): Dialog.PanelSpec => ({ type: 'panel', items: makeGroupItems() });

  const makeTabPanel = (): Dialog.TabPanelSpec => ({ type: 'tabpanel', tabs: makeTabs() });

  const currentTab = charMap.length === 1 ? Cell(UserDefined) : Cell('All');

  const scanAndSet = (dialogApi: Dialog.DialogInstanceApi<typeof initialData>, pattern: string) => {
    Arr.find(charMap, (group) => group.name === currentTab.get()).each((f) => {
      const items = Scan.scan(f, pattern);
      dialogApi.setData({
        results: items
      });
    });
  };

  const SEARCH_DELAY = 40;

  const updateFilter = Throttler.last((dialogApi: Dialog.DialogInstanceApi<typeof initialData>) => {
    const pattern = dialogApi.getData().pattern;
    scanAndSet(dialogApi, pattern);
  }, SEARCH_DELAY);

  const body = charMap.length === 1 ? makePanel() : makeTabPanel();

  const initialData = {
    pattern: '',
    results: Scan.scan(charMap[0], '')
  };

  const bridgeSpec: Dialog.DialogSpec<typeof initialData> = {
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
    onAction: (api, details) => {
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
