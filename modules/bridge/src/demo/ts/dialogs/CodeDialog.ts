import { openDemoDialog } from './DemoDialogHelpers';

export const createCodeDialog = (): void => {
  openDemoDialog(
    {
      title: 'Source code',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            name: 'code',
            type: 'textarea'
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
        code: 'some code'
      },
      onSubmit: (api) => {
        const data = api.getData();

        // eslint-disable-next-line no-console
        console.log({
          code: data.code
        });

        api.close();
      }
    }
  );
};
