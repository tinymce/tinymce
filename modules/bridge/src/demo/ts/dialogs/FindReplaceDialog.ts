import { openDemoDialog } from './DemoDialogHelpers';

export const createFindReplaceDialog = (): void => {
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
          enabled: false
        },
        {
          type: 'custom',
          name: 'replaceall',
          text: 'Replace all',
          align: 'start',
          enabled: false
        },
        // TODO: How do we make a spacer here?
        {
          type: 'custom',
          name: 'prev',
          text: 'Prev',
          align: 'end',
          enabled: false
        },
        {
          type: 'custom',
          name: 'next',
          text: 'Next',
          align: 'end',
          enabled: false
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

        // eslint-disable-next-line no-console
        console.log(details.name); // Show action find/replace etc

        // eslint-disable-next-line no-console
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
