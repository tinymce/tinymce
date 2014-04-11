/**
 * plugin.js
 *
 * Copyright, Fusonic GmbH
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('placeholder', function(editor) {
    editor.addButton('placeholder', {
        type: 'menubutton',
<<<<<<< HEAD
        title: 'Insert template',
=======
        title: 'Placeholder',
>>>>>>> First version of the placeholder plugin
        icon: 'template',
        menu: {
            type: 'menu',
            items: []
        },
        onPostRender: function() {
            var ctrl = this;

            tinymce.util.XHR.send({
                url: editor.getParam('placeholderUrl'),
                success: function(responseText) {
                    var res = tinymce.util.JSON.parse(responseText);

                    tinymce.each(res, function(value, key) {
                        ctrl.settings.menu.items.push({
                            text: value.caption,
                            id: value.id
                        });
                    });
                }
            });
        },
        onselect: function(e) {
            editor.insertContent(e.control.settings.id);
        }
    });
});
