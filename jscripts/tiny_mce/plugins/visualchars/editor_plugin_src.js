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
	tinymce.create('tinymce.plugins.VisualChars', {
		counter: 0,
		tabImg: '<img alt="" class="mceItemTabImg" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAALCAYAAACQy8Z9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAA8SURBVDhPY/wPBAxUBkxQmqpg4A1lZGQEY0KALJcSMhhrRBHjGhDAFcckxT6yZfi0keV9Qu4Y0emUgQEADj0ZCU8rZicAAAAASUVORK5CYII=" />',
		tabWImg: '<img alt="" class="mceItemWTabImg" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAALCAYAAACQy8Z9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAgSURBVDhPY/wPBAxUBkxQmqpg1FDqg1FDqQ9oYCgDAwCwFAQSbdSnvAAAAABJRU5ErkJggg==" />',
		init : function(ed, url) {
			var t = this;

			t.editor = ed;

			// Register commands
			ed.addCommand('mceVisualChars', t._toggleVisualChars, t);

			// Register buttons
			ed.addButton('visualchars', {title : 'visualchars.desc', cmd : 'mceVisualChars'});

			ed.onBeforeGetContent.add(function(ed, o) {
				if (t.state && o.format != 'raw' && !o.draft) {
					t.state = true;
					t._toggleVisualChars(false);
				}
			});
			
			ed.onMouseDown.add(function(ed, e) {    
                var body = ed.getBody();
                if(jQuery(e.target).hasClass('mceItemTab')) {
                    jQuery(body).attr({'contenteditable': false})
                }else {
                    jQuery(body).attr({'contenteditable': true})
                }

            }); 
			
			ed.onBeforeSetContent.add(function(ed, o) {
				o.content = o.content.replace(/<span[^>]+>.*<\/span>/g, function(im) {
					if (im.indexOf('mso-tab-count') !== -1)
						im = t.tabWImg;
					return im;
				});
			});
			
			ed.onPostProcess.add(function(ed, o) {
				if (o.get)
					o.content = o.content.replace(/<img[^>]+>/g, function(im) {
//						console.log(im);
						if (im.indexOf('data:image') !== -1)
							im = '<span style="mso-tab-count: 1" >&nbsp;&nbsp; </span>';

						return im;
					});
			});
			
			ed.onKeyDown.add(function(ed, event) {
				
				if (t.state) {		
					
					if (event.keyCode==9) {
						
						ed.execCommand('mceInsertContent', false, t.tabImg+'\uFEFF');
						
						tinymce.dom.Event.cancel(event);
						event.preventDefault();
					} 
					

					if (event.keyCode==32) {
						
						t.counter=(t.counter+1) % 2;
						var alt = new Array('\u00B7\u200B','\u0387\u200B');
						if(document.selection){
							var sel = document.selection.createRange();
							sel.text=alt[t.counter];	
						}
						else {
							ed.execCommand('mceInsertContent', false, alt[t.counter]);	
						}
						
						tinymce.dom.Event.cancel(event);
						event.preventDefault();
						return false;
					}
					
				}
				else {
					if (event.keyCode==9) {
						

						//inserire immagine bianca
						ed.execCommand('mceInsertContent', false, t.tabWImg+'\uFEFF');
						tinymce.dom.Event.cancel(event);
						event.preventDefault();
					} 
				}
			});
			
	  
			
		},
		
		setVisualChars: function (ed, b) {
			
			var nl, i, nv, div;
			
			nl = [];
			tinymce.walk(b, function(n) {
				if (n.nodeType == 3 && n.nodeValue && (n.nodeValue.indexOf('\u00a0') != -1 || n.nodeValue.indexOf('\u0020') != -1 
						|| n.nodeValue.indexOf('\u0009') != -1 || n.nodeValue.indexOf('\t') != -1))
					nl.push(n);
				
			}, 'childNodes');

			for (i = 0; i < nl.length; i++) {

				nv = $(nl[i]).text();

				nv = nv.replace(/(\u00a0)/g, '\u00B7\u200B');
				nv = nv.replace(/ /g, '\u0387\u200B');

				
				div = ed.dom.create('div', null, nv);
				while (node = div.lastChild)
					ed.dom.insertAfter(node, nl[i]);

				ed.dom.remove(nl[i]);
				
			}
			ed.dom.addClass(ed.dom.select('p'), 'paragraph');
			ed.dom.addClass(ed.dom.select('li'), 'paragraph');
			
			//cambiare immagine bianca con tab
			$(ed.dom.select('img.mceItemWTabImg')).replaceWith(this.tabImg);
			
		},

		getInfo : function() {
			return {
				longname : 'Visual characters',
				author : 'Moxiecode Systems AB - reviewd by Giambattista Pisasale',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://www.tinymce.com/wiki.php/Plugin:visualchars',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		// Private methods

		_toggleVisualChars : function(bookmark) {
			var t = this, ed = t.editor, nl, i, h, d = ed.getDoc(), b = ed.getBody(), nv, s = ed.selection, bo, div, bm;

			t.state = !t.state;
			ed.controlManager.setActive('visualchars', t.state);

			if (bookmark)
				bm = s.getBookmark();

			if (t.state) {
				t.setVisualChars(ed, b);
			} else {
				nl = ed.dom.select('.mceItemNbsp', b);
				
				$(nl).replaceWith("&nbsp;");
				
				tinymce.walk(b, function(n) {
					if (n.nodeType == 3 && n.nodeValue && (n.nodeValue.indexOf('\u00B7') != -1 || n.nodeValue.indexOf('\u0387') != -1))
						nl.push(n);
					
				}, 'childNodes');

				var nv;
				for (i = 0; i < nl.length; i++) {
					nv = $(nl[i]).text();
					nv = nv.replace(/(\u00B7)/g, '\u00a0');
					nv = nv.replace(/(\u0387)/g, ' ');
					nv = nv.replace(/(\u200B)/g, '');
					
					div = ed.dom.create('div', null, nv);
					while (node = div.lastChild)
						ed.dom.insertAfter(node, nl[i]);

					ed.dom.remove(nl[i]);
				}				
				
				ed.dom.removeClass(ed.dom.select('.paragraph'), 'paragraph');
				

				
				//cambiare immagine tab con bianca
				$(ed.dom.select('img.mceItemTabImg')).replaceWith(t.tabWImg);
				
			}

			s.moveToBookmark(bm);
		}
	});
	
	/**
	 * css to add to content.css
	 *
	 * .paragraph:after{content:'¶'; color: #000000; }
	 * .paragraph{ 
	 * 	border-bottom: 1px dashed lightgrey; 
	 * 	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAKCAIAAAAGpYjXAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAArSURBVBhXY/iPA0AlDh8+zIAA7VAJZFGQEITEJwEEcDmQELIEBNBX4v9/AKGEohMKi64FAAAAAElFTkSuQmCC);
	 * 	background-position: right bottom;
	 * 	background-repeat: no-repeat;
	 * 	word-wrap:break-word;	
	 * }
	 * 
	 */
	

	// Register plugin
	tinymce.PluginManager.add('visualchars', tinymce.plugins.VisualChars);
})();
