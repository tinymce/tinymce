/*global tinymce:true */
tinymce.PluginManager.add('d2l_textstylerollup', function(editor) {
       editor.addButton('d2l_textstylerollup',
              {type   : 'MenuButton',
               icon   : 'arrowdown',
               title  : 'Text Styles',
                menu   : [editor.menuItems.strikethrough,
                                 editor.menuItems.subscript,
                                 editor.menuItems.superscript]
       });
});
