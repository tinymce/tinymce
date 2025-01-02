import { Editor, RawEditorOptions, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {

  const settings: RawEditorOptions = {
    selector: 'textarea',
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
                      type: 'dummy'
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
  };

  tinymce.init(settings);
};
