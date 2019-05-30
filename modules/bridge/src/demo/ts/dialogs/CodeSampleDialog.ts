import { console } from '@ephox/dom-globals';
import { openDemoDialog } from './DemoDialogHelpers';

export const createCodeSampleDialog = () => {
  openDemoDialog(
    {
      title: 'Insert/Edit code sample',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            name: 'language',
            type: 'selectbox',
            label: 'Language',
            items: [
              {
                text: 'HTML/XML',
                value: 'html'
              },
              {
                text: 'JavaScript',
                value: 'js'
              }
            ]
          },
          {
            name: 'code',
            type: 'textarea',
          }
        ]
      },
      buttons: [
        {
          type: 'submit',
          name: 'ok',
          text: 'Ok',
          primary: true
        },
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        }
      ],
      initialData: {
        language: 'js',
        code: 'some js code'
      },
      onSubmit: (api) => {
        const data = api.getData();

        // tslint:disable-next-line:no-console
        console.log({
          language: data.language,
          code: data.code
        });

        api.close();
      }
    }
  );
};
