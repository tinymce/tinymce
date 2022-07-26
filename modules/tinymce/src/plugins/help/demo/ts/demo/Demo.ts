import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'help link table code emoticons fullscreen advlist anchor',
  toolbar: 'help',
  height: 300,
  menubar: 'view insert tools help'
});

tinymce.init({
  selector: 'textarea.tinymce2',
  plugins: 'help link table code emoticons fullscreen advlist anchor',
  toolbar: 'help',
  height: 300,
  menubar: 'view insert tools help',
  help_tabs: [
    'shortcuts',
    'plugins',
    {
      name: 'versions', // this will override the default versions tab
      title: 'Version',
      items: [{
        type: 'htmlpanel',
        html: '<p>This is a custom version panel...</p>'
      }]
    },
    {
      name: 'extraTab',
      title: 'Extra',
      items: [{
        type: 'htmlpanel',
        html: '<p>This is an extra tab</p>'
      }]
    }
  ]
});

tinymce.init({
  selector: 'textarea.tinymce3',
  plugins: 'help link table code emoticons fullscreen advlist anchor',
  toolbar: 'help addTab',
  height: 300,
  menubar: 'view insert tools help',
  setup: (editor) => {
    editor.on('init', () => {
      editor.plugins.help.addTab({
        name: 'extraTab3',
        title: 'Extra1',
        items: [{
          type: 'htmlpanel',
          html: '<p>This is an extra tab</p>'
        }]
      });
    });

    editor.ui.registry.addButton('addTab', {
      text: 'Add tab',
      onAction: () => {
        editor.plugins.help.addTab({
          name: 'extraTab4',
          title: 'Extra2',
          items: [{
            type: 'htmlpanel',
            html: '<p>This is another extra tab</p>'
          }]
        });
      }
    });
  }
});

tinymce.init({
  selector: 'textarea.tinymce4',
  plugins: 'help link table code emoticons fullscreen advlist anchor',
  toolbar: 'help addTab',
  height: 300,
  menubar: 'view insert tools help',
  help_tabs: [
    'shortcuts',
    'versions',
    'extra4',
    'extra3',
    {
      name: 'extra1',
      title: 'Extra',
      items: [
        {
          type: 'htmlpanel',
          html: '<p>This is an extra tab</p>'
        }
      ]
    },
    {
      name: 'extra2',
      title: 'Extra2',
      items: [
        {
          type: 'htmlpanel',
          html: '<p>This is another extra tab</p>'
        }
      ]
    }
  ],
  setup: (editor) => {
    editor.on('init', () => {
      editor.plugins.help.addTab({
        name: 'extra3',
        title: 'Extra3',
        items: [
          {
            type: 'htmlpanel',
            html: '<p>This is yet another extra tab</p>'
          }
        ] }
      );
      editor.plugins.help.addTab({
        name: 'extra5',
        title: 'Extra5',
        items: [
          {
            type: 'htmlpanel',
            html: '<p>This is another extra tab but it should not be displayed because it is not in help_tabs.</p>'
          }
        ]
      });
    });

    editor.ui.registry.addButton('addTab', {
      text: 'Add tab',
      onAction: () => {
        editor.plugins.help.addTab({
          name: 'extra4',
          title: 'Extra4',
          items: [
            {
              type: 'htmlpanel',
              html: '<p>This is yet another another extra tab</p>'
            }
          ]
        });
      }
    });
  }
});

export {};
