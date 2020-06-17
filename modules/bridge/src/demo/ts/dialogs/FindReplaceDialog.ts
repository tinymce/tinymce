import { console } from '@ephox/dom-globals';
import { openDemoDialog } from './DemoDialogHelpers';

export const createFindReplaceDialog = () => {
  openDemoDialog(
    {
      title: 'Find and replace',
      body: {
        type: 'panel',
        items: [
          {
            name: 'find',
            type: 'input'
          },
          {
            name: 'replace',
            type: 'input'
          },
          {
            name: 'matchcase',
            type: 'checkbox',
            label: 'Match Case'
          },
          {
            name: 'wholewords',
            type: 'checkbox',
            label: 'Whole Words'
          }
        ]
      },
      buttons: [
        {
          type: 'custom',
          name: 'find',
          text: 'Find',
          align: 'start',
          primary: true
        },
        {
          type: 'custom',
          name: 'replace',
          text: 'Replace',
          align: 'start',
          disabled: true
        },
        {
          type: 'custom',
          name: 'replaceall',
          text: 'Replace all',
          align: 'start',
          disabled: true
        },
        // TODO: How do we make a spacer here?
        {
          type: 'custom',
          name: 'prev',
          text: 'Prev',
          align: 'end',
          disabled: true
        },
        {
          type: 'custom',
          name: 'next',
          text: 'Next',
          align: 'end',
          disabled: true
        }
      ],
      initialData: {
        find: '',
        replace: '',
        matchcase: 'checked',
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
      }
    }
  );
};
