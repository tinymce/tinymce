import { Types } from '@ephox/bridge';
import { console } from '@ephox/dom-globals';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { setupDemo } from '../DemoHelpers';

export const SearchReplaceDialogSpec: Types.Dialog.DialogApi<any> = {
  title: 'Find and replace',
  body: {
    type: 'panel',
    items: [
      {
        type: 'input',
        name: 'findtext',
        label: 'Find',
        inputMode: 'search'
      },
      {
        type: 'input',
        name: 'replacetext',
        label: 'Replace with',
        inputMode: 'search'
      },
      {
        type: 'grid',
        columns: 2,
        items: [
          {
            type: 'checkbox',
            name: 'matchcase',
            label: 'Match case'
          },
          {
            type: 'checkbox',
            name: 'wholewords',
            label: 'Find whole words only'
          }
        ]
      }
    ]
  },
  buttons: [
    {
      type: 'custom',
      name: 'findbutton',
      text: 'Find',
      align: 'start',
      primary: true
    },
    {
      type: 'custom',
      name: 'replacebutton',
      text: 'Replace',
      align: 'start'
    },
    {
      type: 'custom',
      name: 'replaceall',
      text: 'Replace All',
      align: 'start'
    },
    {
      type: 'custom',
      name: 'prev',
      text: 'Previous',
      align: 'end'
    },
    {
      type: 'custom',
      name: 'next',
      text: 'Next',
      align: 'end'
    }
  ],
  initialData: {
    findtext: '',
    replacetext: '',
    matchcase: 'unchecked',
    wholewords: 'unchecked'
  },
  onAction: (api, details) => {
    const data = api.getData();

    // tslint:disable-next-line:no-console
    console.log(details.name); // Show action find/replace etc

    // tslint:disable-next-line:no-console
    console.log({
      find: data.find,
      replace: data.replace,
      matchcase: data.matchcase,
      wholewords: data.wholewords
    });
  },
  onClose: () => {
    // tslint:disable-next-line:no-console
    console.log('dialog closing');
  }
};
export const open = () => {
  const helpers = setupDemo();
  const winMgr = WindowManager.setup(helpers.extras);
  // The end user will use this as config
  winMgr.open(SearchReplaceDialogSpec, {}, () => {});
};
