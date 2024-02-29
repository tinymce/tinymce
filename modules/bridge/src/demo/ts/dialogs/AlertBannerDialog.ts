import { openDemoDialog } from './DemoDialogHelpers';

export const createAlertBannerDialog = (): void => {
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
          buttonType: 'primary',
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
