/// <reference path="../../tinymce.d.ts" />
/*
* plugin.ts / plugin.js
*
* Copyright, Fusonic GmbH
* Released under LGPL License.
*
* License: http://www.tinymce.com/license
* Contributing: http://www.tinymce.com/contributing
*/
/*global tinymce:true */
tinymce.PluginManager.add('placeholder', function (editor) {
    editor.addButton('placeholder', {
        type: 'menubutton',
        title: 'Insert template',
        icon: 'template',
        menu: {
            type: 'menu',
            items: []
        },
        onPostRender: function () {
            var ctrl = this;

            tinymce.util.XHR.send({
                url: editor.getParam('placeholderUrl'),
                success: function (responseText) {
                    var res = tinymce.util.JSON.parse(responseText);

                    tinymce.each(res, function (value) {
                        ctrl.settings.menu.items.push({
                            text: value.caption,
                            id: value.id
                        });
                    });
                }
            });
        },
        onSelect: function (e) {
            editor.insertContent(e.control.settings.id);
        }
    });
});
//# sourceMappingURL=plugin.js.map
