/**
 * editor_plugin_src.js
 *
 * Copyright 2013, Pablo Martin
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function () {
    tinymce.create("tinymce.plugins.OpenExternalToolbar", {
        init : function (ed, url) {
            var t = this;
            ed.onLoadContent.add(function (ed, ev, ob) {
                ed.settings.auto_focus = ed.id;
                setTimeout(function () {
                    ed.onMouseUp.dispatch(ed, ev);
                }, 500);
            });
        },
        getInfo: function () {
            return {
                longname : "Open External Toolbar",
                author : "Pablo Martin",
                authorurl : "http://github.com/goinnn",
                infourl : "http://github.com/goinnn",
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });
    tinymce.PluginManager.add("openexternaltoolbar", tinymce.plugins.OpenExternalToolbar);
}());
