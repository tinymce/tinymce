import { Optional } from '@ephox/katamari';

import { Editor, RawEditorOptions, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {

  const loadCSS = (editor: Editor, rawCss: string) => {
    // Use the editors UI stylesheet loader if it's available
    const uiStyleSheetLoader = Optional.from(editor.ui?.styleSheetLoader).getOr(tinymce.DOM.styleSheetLoader);

    uiStyleSheetLoader.loadRawCss('poc-skin', rawCss);
    editor.on('remove', () => uiStyleSheetLoader.unloadRawCss('poc-skin'));
  };

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
                      type: 'input',
                      name: 'name',
                      label: 'Name',
                      placeholder: 'Enter your name'
                    }
                  ]
                },
                buttons: [
                  {
                    type: 'cancel',
                    name: 'close',
                    text: 'Close',
                    primary: true,
                  },
                  {
                    type: 'togglebutton',
                    name: 'icon-left',
                    text: 'Icon Left',
                    primary: true,
                    icon: 'copy',
                    align: 'end'
                  },
                  {
                    type: 'togglebutton',
                    name: 'icon-right',
                    text: 'Icon Right',
                    primary: true,
                    icon: 'format-code',
                    iconLocation: 'end',
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

      if (skin) {
        ed.on('PostRender', () => {
          loadCSS(ed, skin);
        });
      }
    },
    toolbar: 'demoButton',
  });

  tinymce.init(settings('textarea.default'));

  const pinkSkin = `
  :root {
    --light-bg: hsl(350, 100%, 90%);
    --dark-bg: hsl(350, 100%, 30%);
  }`;
  tinymce.init(settings('textarea.skin', pinkSkin ));

  /*
    Notes:
      1. We will need to make sure that the skin css is loaded AFTER our css.
      2. All of the CSS Custom Properties are global and public. User will see them and be able to change them easily.
      3. As the CSS Custom Properties are global both editors will be skinned. Appying a skin will mean all editors on the website will be skinned the same way. Not sure if there is a work around this or if this is a negative or not
  */
};
