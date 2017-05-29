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

tinymce.PluginManager.add('alignbtn', function(editor: tinymce.Editor) {
    var plugin: tinymce.Plugin = this;

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
            var ctrl: tinymce.ui.MenuButton = this;

            editor.on('init', function() {
                tinymce.each(ctrl.settings.menu.items, (option) => {
                    var align = option.text;

                    editor.formatter.formatChanged('align' + align.toLowerCase(), function(state) {
                        ctrl.icon('align' + (state ? align.toLowerCase() : 'left'));
                    });
                });
            });
        },
        onSelect: (e) => {
            var ctrl: tinymce.ui.MenuButton = e.control;
            var settings: any = ctrl.settings;
            editor.execCommand(settings.cmd);
        }
    });
});
