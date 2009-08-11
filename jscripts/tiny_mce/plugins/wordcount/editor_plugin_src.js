/**
 * $Id: editor_plugin_src.js 201 2007-02-12 15:56:56Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
    tinymce.create('tinymce.plugins.WordCount', {
		block : 0,
		id : null,
		countre : null,
		cleanre : null,

		init : function(ed, url) {
			var t = this, last = 0;

			t.countre = ed.getParam('wordcount_countregex', /\S\s+/g);
			t.cleanre = ed.getParam('wordcount_cleanregex', /[0-9.(),;:!?%#$¿'"_+=\\/-]*/g);
			t.id = ed.id + '-word-count';

			ed.onPostRender.add(function(ed, cm) {
				var row, id;

				// Add it to the specified id or the theme advanced path
				id = ed.getParam('wordcount_target_id');
				if (!id) {
					row = tinymce.DOM.get(ed.id + '_path_row');

					if (row)
						tinymce.DOM.add(row.parentNode, 'div', {'style': 'float: right'}, ed.getLang('wordcount.words', 'Words: ') + '<span id="' + t.id + '">0</span>');
				} else
					tinymce.DOM.add(id, 'span', {}, '<span id="' + t.id + '">0</span>');
			});

            ed.onInit.add(function(ed) {
				ed.selection.onSetContent.add(function() {
					t._count(ed);
				});

				t._count(ed);
			});

			ed.onSetContent.add(function(ed) {
				t._count(ed);
			});

			ed.onKeyUp.add(function(ed, e) {
				if (e.keyCode == last)
					return;

				if (13 == e.keyCode || 8 == last || 46 == last)
					t._count(ed);

				last = e.keyCode;
			});
		},

		_count : function(ed) {
			var t = this, tc = 0;

			// Keep multiple calls from happening at the same time
			if (t.block)
				return;

			t.block = 1;

			setTimeout(function() {
				var tx = ed.getContent({format : 'raw'});

				if (tx) {
					tx = tx.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' '); // remove html tags and space chars
					tx = tx.replace(t.cleanre, ''); // remove numbers and punctuation
					tx.replace(t.countre, function() {tc++;}); // count the words
				}

				tinymce.DOM.setHTML(t.id, tc.toString());

				setTimeout(function() {t.block = 0;}, 2000);
			}, 1);
		},

        getInfo: function() {
			return {
				longname : 'Word Count plugin',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/wordcount',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
        }
    });

    tinymce.PluginManager.add('wordcount', tinymce.plugins.WordCount);
})();
