import { openDemoDialog } from './DemoDialogHelpers';

export const createAlertBannerDialog = () => {
  openDemoDialog(
    {
      title: 'Alert Banner',
      body: {
        type: 'panel',
        items: [
          {
            type: 'alertbanner',
            level: 'warn',
            text: 'The alert bannner message',
            icon: 'iconsvg'
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
      onSubmit: (api) => {
        api.close();
      }
    }
  );
};
