/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
    var KEY_ESCAPE = 27, KEY_ENTER= 13;
    var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, explode = tinymce.explode;
	tinymce.create('tinymce.plugins.AccessibleNavigationPlugin', {
		init : function(ed, url) {
            function escapeCancel(ed, e){
                if (e.keyCode === KEY_ESCAPE)
                    return Event.cancel(e);

            }
            function escapeHandler(ed, e){
                console.log("HERE");
                if (e.keyCode === KEY_ESCAPE) {
                    //TODO: move this?
                    window.focus();
                    ed.getContainer().focus();
                }
            }
            // key escape listener
            ed.onKeyUp.add(escapeCancel);

            if (tinymce.isGecko) {
                ed.onKeyPress.add(escapeHandler);
                ed.onKeyDown.add(escapeCancel);
            } else
                ed.onKeyDown.add(escapeHandler);



            ed.onInit.add(function() {
                DOM.setAttrib(ed.getContainer(), "tabindex", 0);
                function enterCancel(ed, e){
                    if (e.keyCode === KEY_ENTER)
                        return Event.cancel(e);

                }
                function enterHandler(e){
                    if (e.keyCode === KEY_ENTER) {
                        //TODO: move this?
                        ed.focus();
                        Event.cancel(e);
                    }
                }

                Event.add(ed.getContainer(), "keydown", enterHandler);

//                each(DOM.select('a:first,a:last', ed.getContainer()), function(n) {
//                    Event.add(n, 'focus', function() {ed.focus();});
//                });
            });

		},

		getInfo : function() {
			return {
				longname : 'Accessible Navigation',
				author : 'Ephox Pty LTD',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://tinymce.moxiecode.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('accnav', tinymce.plugins.AccessibleNavigationPlugin);
})();
