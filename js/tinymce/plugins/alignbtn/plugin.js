/**
 * plugin.js
 *
 * Copyright, Fusonic GmbH
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

tinymce.PluginManager.add('alignbtn', function(editor) {
    var plugin = this;

    editor.addButton('align', {
        type: 'menubutton',
        title: 'Alignment',
        icon: 'alignleft',
        menu: {
            type: 'menu',
            items: [
                {
                    text: 'Left',
                    icon: 'alignleft',
                    cmd: 'JustifyLeft'
                },
                {
                    text: 'Center',
                    icon: 'aligncenter',
                    cmd: 'JustifyCenter'
                },
                {
                    text: 'Right',
                    icon: 'alignright',
                    cmd: 'JustifyRight'
                },
                {
                    text: 'Justify',
                    icon: 'alignjustify',
                    cmd: 'JustifyFull'
                }
            ]
        },
        onPostRender: function() {
            var ctrl = this;

            editor.on('init', function() {
                tinymce.each(ctrl.settings.menu.items, function(option) {
                    var align = option.text;

                    editor.formatter.formatChanged('align' + align.toLowerCase(), function(state) {
                        ctrl.icon('align' + (state ? align : 'left'));
                    });
                });
            });
        },
        onselect: function(e) {
            editor.execCommand(e.control.settings.cmd);
        }
    });
});