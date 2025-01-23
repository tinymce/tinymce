import { Editor, RawEditorOptions, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {

  const settings = (selector: string, skin?: string): RawEditorOptions => ({
    selector,
    setup: (ed) => {
      const Dialog = (editor: Editor): { open: () => void } => {
        return {
          open: () => {
            editor.windowManager.open(
              {
                title: 'This is a dummy dialog',
                size: 'medium',
                body: {
                  type: 'panel',
                  items: [
                    {
                      type: 'dummy',
                      inputLabel: 'Label',
                      buttonIcon: 'checkmark',
                      buttonText: 'This is a button',
                      buttonIconPlacement: 'left',
                    }
                  ]
                },
                buttons: [
                  {
                    type: 'cancel',
                    name: 'close',
                    text: 'Close',
                    primary: true
                  }
                ],
                initialData: {}
              }
            );
          }
        };
      };
      ed.ui.registry.addButton('demoButton', {
        text: 'Dummy',
        onAction: Dialog(ed).open,
      });
    },
    toolbar: 'demoButton',
  });

  tinymce.init(settings('textarea'));
};
