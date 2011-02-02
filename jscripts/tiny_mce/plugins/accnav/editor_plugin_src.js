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
                if (e.keyCode === KEY_ESCAPE) {
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
                DOM.setAttrib(DOM.select("#"+ed.id+"_ifr"), "tabindex", -1);
                function enterCancel(e){
                    if (e.keyCode === KEY_ENTER)
                        return Event.cancel(e);

                }
                function enterHandler(e){
                    if (e.keyCode === KEY_ENTER) {
                        ed.focus();
                        Event.cancel(e);
                    }
                }
                Event.add(ed.getContainer(), "keyup", enterCancel);
                if (tinymce.isGecko) {
                    Event.add(ed.getContainer(), "keypress", enterHandler);
                    Event.add(ed.getContainer(), "keydown", enterCancel);
                } else
                    Event.add(ed.getContainer(), "keydown", enterHandler);

            });

		},

		getInfo : function() {
			return {
				longname : 'Accessible Navigation',
				author : 'Ephox Pty Ltd',
				authorurl : 'http://tinymce.ephox.com',
				infourl : 'http://tinymce.ephox.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('accnav', tinymce.plugins.AccessibleNavigationPlugin);
})();
