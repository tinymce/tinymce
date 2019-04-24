declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor',
  toolbar: 'help',
  height: 300,
  menubar: 'view insert tools help'
});

tinymce.init({
  selector: 'textarea.tinymce2',
  plugins: 'help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor',
  toolbar: 'help',
  height: 300,
  menubar: 'view insert tools help',
  help_version: () => {
    const htmlPanel = {
      type: 'htmlpanel',
      html: '<p>This is a custom version panel...</p>'
    };
    return htmlPanel;
  }
});

tinymce.init({
  selector: 'textarea.tinymce3',
  plugins: 'help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor',
  toolbar: 'help addTab',
  height: 300,
  menubar: 'view insert tools help',
  help_extend_tabs: [
    {
      title: 'Extra',
      items: [
        {
          type: 'htmlpanel',
          html: '<p>This is an extra tab</p>',
        }
      ]
    },
    {
      title: 'Extra2',
      items: [
        {
          type: 'htmlpanel',
          html: '<p>This is another extra tab</p>',
        }
      ]
    }
  ],
  setup: (editor) => {
    editor.on('init', () => {
      editor.plugins.help.addTabs([
        {
          title: 'Extra3',
          items: [
            {
              type: 'htmlpanel',
              html: '<p>This is yet another extra tab</p>',
            }
          ]
        }
      ]);
    });

    editor.ui.registry.addButton('addTab', {
      text: 'Add tab',
      onAction: () => {
        editor.plugins.help.addTabs([
          {
            title: 'Extra4',
            items: [
              {
                type: 'htmlpanel',
                html: '<p>This is yet another another extra tab</p>',
              }
            ]
          }
        ]);
      }
    });
  }
});

export {};