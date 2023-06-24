import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code',
  toolbar: 'code validation',
  height: 600,
  setup: (editor) => {
    editor.ui.registry.addButton('validation', {
      icon: 'bomb',
      onAction: () => {
        editor.windowManager.open({
          title: 'Validation',
          onSubmit: (api) => {
            console.log(api.getData());
          },
          buttons: [
            {
              type: 'submit',
              text: 'submit'
            },
            {
              type: 'cancel',
              text: 'Cancel'
            }
          ],
          body: {
            type: 'panel',
            items: [
              {
                type: 'input',
                name: 'url',
                validation: {
                  validator: (value) => {
                    return value.length === 3 ? true : 'The value should be three chars long' ;
                  }
                }
              }
            ]
          }
        });
      }
    });
  }
});

export {};
