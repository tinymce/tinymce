/**
 * plugin.js
 *
 * @author Cristian Bujoreanu, cristian.buj@teamup.com
 */

/*global tinymce:true */
tinymce.PluginManager.add('teamuplinknewtab', function(editor) {
    editor.addMenuItem('teamuplinknewtab', {
        icon: 'image',
        text: 'Open in new tab',
        //shortcut: 'Ctrl+O',
        //disabled: true,
        onclick: function() {
            var node = editor.selection.getNode(), url;

            if (node.hasAttribute('data-mce-src')) {
                url = node.getAttribute('data-mce-src');
            } else if (node.hasAttribute('data-mce-href')) {
                url = node.getAttribute('data-mce-href');
            }

            if (url) {
                window.open(url, '_blank');
            }
        },
        context: 'insert'
    });
});