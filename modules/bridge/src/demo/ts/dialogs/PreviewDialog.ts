import { openDemoDialog } from './DemoDialogHelpers';

export const createPreviewDialog = (): void => {
  openDemoDialog(
    {
      title: 'Preview',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            name: 'preview',
            type: 'iframe',
            sandboxed: true
          }
        ]
      },
      buttons: [
        {
          type: 'submit',
          name: 'ok',
          text: 'Ok',
          buttonType: 'primary',
        },
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        }
      ],
      initialData: {
        preview: 'some html url'
      }
    }
  );
};
