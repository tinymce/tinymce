import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code',
  toolbar: 'code tree',
  height: 600,
  setup: (ed) => {
    ed.ui.registry.addButton('tree', {
      text: 'Tree',
      onAction: () => {
        ed.windowManager.open({
          title: 'Tree',
          body: {
            type: 'panel',
            items: [
              {
                type: 'tree',
                items: [
                  {
                    type: 'directory',
                    title: 'Dir',
                    id: '1',
                    children: [{ type: 'leaf', title: 'File 1', id: '2' }]
                  },
                  {
                    type: 'leaf', title: 'File 2', id: '3'
                  }
                ]
              }
            ]
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Cancel'
            }
          ]
        });
      }
    });
  }
});

export {};
