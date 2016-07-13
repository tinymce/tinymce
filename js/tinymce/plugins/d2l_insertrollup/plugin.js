/*global tinymce:true */
tinymce.PluginManager.add('d2l_insertrollup', function(editor) {
       editor.addButton('d2l_insertrollup',
              {type   : 'MenuButton',
               icon   : 'arrowdown',
               title  : 'Text Styles',
                menu   : [editor.menuItems.charmap,
                                 editor.menuItems.hr]
       });
});