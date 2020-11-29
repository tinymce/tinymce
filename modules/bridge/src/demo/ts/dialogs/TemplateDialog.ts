import { openDemoDialog } from './DemoDialogHelpers';

export const createTemplateDialog = (): void => {
  openDemoDialog(
    {
      title: 'Insert template',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            name: 'template',
            type: 'selectbox',
            label: 'Template',
            items: [
              {
                text: 'Some template 1',
                value: 'url1.html'
              },
              {
                text: 'Some template 2',
                value: 'url2.html'
              }
            ]
          },
          {
            name: 'preview',
            type: 'iframe',
            label: 'Preview of template',
            sandboxed: false
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
        template: 'url2.html',
        preview: 'some html url'
      },
      onSubmit: (api) => {
        const data = api.getData();

        // eslint-disable-next-line no-console
        console.log({
          template: data.template
        });

        api.close();
      }
    }
  );
};
