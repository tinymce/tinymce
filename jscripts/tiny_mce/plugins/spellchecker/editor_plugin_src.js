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
	var JSONRequest = tinymce.util.JSONRequest, each = tinymce.each, DOM = tinymce.DOM;

	tinymce.create('tinymce.plugins.SpellcheckerPlugin', {
		getInfo : function() {
			return {
				longname : 'Spellchecker',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/spellchecker',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		init : function(ed, url) {
			var t = this, cm;

			t.url = url;
			t.editor = ed;
			t.rpcUrl = ed.getParam("spellchecker_rpc_url", "{backend}");

			if (t.rpcUrl == '{backend}') {
				// Sniff if the browser supports native spellchecking (Don't know of a better way)
				if (tinymce.isIE)
					return;

				t.hasSupport = true;

				// Disable the context menu when spellchecking is active
				ed.onContextMenu.addToTop(function(ed, e) {
					if (t.active)
						return false;
				});
			}

			// Register commands
			ed.addCommand('mceSpellCheck', function() {
				if (t.rpcUrl == '{backend}') {
					// Enable/disable native spellchecker
					t.editor.getBody().spellcheck = t.active = !t.active;
					return;
				}

				if (!t.active) {
					ed.setProgressState(1);
					t._sendRPC('checkWords', [t.selectedLang, t._getWords()], function(r) {
						if (r.length > 0) {
							t.active = 1;
							t._markWords(r);
							ed.setProgressState(0);
							ed.nodeChanged();
						} else {
							ed.setProgressState(0);

							if (ed.getParam('spellchecker_report_no_misspellings', true))
								ed.windowManager.alert('spellchecker.no_mpell');
						}
					});
				} else
					t._done();
			});

			if (ed.settings.content_css !== false)
				ed.contentCSS.push(url + '/css/content.css');

			ed.onClick.add(t._showMenu, t);
			ed.onContextMenu.add(t._showMenu, t);
			ed.onBeforeGetContent.add(function() {
				if (t.active)
					t._removeWords();
			});

			ed.onNodeChange.add(function(ed, cm) {
				cm.setActive('spellchecker', t.active);
			});

			ed.onSetContent.add(function() {
				t._done();
			});

			ed.onBeforeGetContent.add(function() {
				t._done();
			});

			ed.onBeforeExecCommand.add(function(ed, cmd) {
				if (cmd == 'mceFullScreen')
					t._done();
			});

			// Find selected language
			t.languages = {};
			each(ed.getParam('spellchecker_languages', '+English=en,Danish=da,Dutch=nl,Finnish=fi,French=fr,German=de,Italian=it,Polish=pl,Portuguese=pt,Spanish=es,Swedish=sv', 'hash'), function(v, k) {
				if (k.indexOf('+') === 0) {
					k = k.substring(1);
					t.selectedLang = v;
				}

				t.languages[k] = v;
			});
		},

		createControl : function(n, cm) {
			var t = this, c, ed = t.editor;

			if (n == 'spellchecker') {
				// Use basic button if we use the native spellchecker
				if (t.rpcUrl == '{backend}') {
					// Create simple toggle button if we have native support
					if (t.hasSupport)
						c = cm.createButton(n, {title : 'spellchecker.desc', cmd : 'mceSpellCheck', scope : t});

					return c;
				}

				c = cm.createSplitButton(n, {title : 'spellchecker.desc', cmd : 'mceSpellCheck', scope : t});

				c.onRenderMenu.add(function(c, m) {
					m.add({title : 'spellchecker.langs', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
					each(t.languages, function(v, k) {
						var o = {icon : 1}, mi;

						o.onclick = function() {
							if (v == t.selectedLang) {
								return;
							}
							mi.setSelected(1);
							t.selectedItem.setSelected(0);
							t.selectedItem = mi;
							t.selectedLang = v;
						};

						o.title = k;
						mi = m.add(o);
						mi.setSelected(v == t.selectedLang);

						if (v == t.selectedLang)
							t.selectedItem = mi;
					})
				});

				return c;
			}
		},

		// Internal functions

		_walk : function(n, f) {
			var d = this.editor.getDoc(), w;

			if (d.createTreeWalker) {
				w = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

				while ((n = w.nextNode()) != null)
					f.call(this, n);
			} else
				tinymce.walk(n, f, 'childNodes');
		},

		_getSeparators : function() {
			var re = '', i, str = this.editor.getParam('spellchecker_word_separator_chars', '\\s!"#$%&()*+,-./:;<=>?@[\]^_{|}§©«®±¶·¸»¼½¾¿×÷¤\u201d\u201c');

			// Build word separator regexp
			for (i=0; i<str.length; i++)
				re += '\\' + str.charAt(i);

			return re;
		},

		_getWords : function() {
			var ed = this.editor, wl = [], tx = '', lo = {}, rawWords = [];

			// Get area text
			this._walk(ed.getBody(), function(n) {
				if (n.nodeType == 3)
					tx += n.nodeValue + ' ';
			});

			// split the text up into individual words
			if (ed.getParam('spellchecker_word_pattern')) {
				// look for words that match the pattern
				rawWords = tx.match('(' + ed.getParam('spellchecker_word_pattern') + ')', 'gi');
			} else {
				// Split words by separator
				tx = tx.replace(new RegExp('([0-9]|[' + this._getSeparators() + '])', 'g'), ' ');
				tx = tinymce.trim(tx.replace(/(\s+)/g, ' '));
				rawWords = tx.split(' ');
			}

			// Build word array and remove duplicates
			each(rawWords, function(v) {
				if (!lo[v]) {
					wl.push(v);
					lo[v] = 1;
				}
			});

			return wl;
		},

		_removeWords : function(w) {
			var ed = this.editor, dom = ed.dom, se = ed.selection, r = se.getRng(true);

			each(dom.select('span').reverse(), function(n) {
				if (n && (dom.hasClass(n, 'mceItemHiddenSpellWord') || dom.hasClass(n, 'mceItemHidden'))) {
					if (!w || dom.decode(n.innerHTML) == w)
						dom.remove(n, 1);
				}
			});

			se.setRng(r);
		},

		_markWords : function(wl) {
			var ed = this.editor, dom = ed.dom, doc = ed.getDoc(), se = ed.selection, r = se.getRng(true), nl = [],
				w = wl.join('|'), re = this._getSeparators(), rx = new RegExp('(^|[' + re + '])(' + w + ')(?=[' + re + ']|$)', 'g');

			// Collect all text nodes
			this._walk(ed.getBody(), function(n) {
				if (n.nodeType == 3) {
					nl.push(n);
				}
			});

			// Wrap incorrect words in spans
			each(nl, function(n) {
				var node, elem, txt, pos, v = n.nodeValue;

				if (rx.test(v)) {
					// Encode the content
					v = dom.encode(v);
					// Create container element
					elem = dom.create('span', {'class' : 'mceItemHidden'});

					// Following code fixes IE issues by creating text nodes
					// using DOM methods instead of innerHTML.
					// Bug #3124: <PRE> elements content is broken after spellchecking.
					// Bug #1408: Preceding whitespace characters are removed
					// @TODO: I'm not sure that both are still issues on IE9.
					if (tinymce.isIE) {
						// Enclose mispelled words with temporal tag
						v = v.replace(rx, '$1<mcespell>$2</mcespell>');
						// Loop over the content finding mispelled words
						while ((pos = v.indexOf('<mcespell>')) != -1) {
							// Add text node for the content before the word
							txt = v.substring(0, pos);
							if (txt.length) {
								node = doc.createTextNode(dom.decode(txt));
								elem.appendChild(node);
							}
							v = v.substring(pos+10);
							pos = v.indexOf('</mcespell>');
							txt = v.substring(0, pos);
							v = v.substring(pos+11);
							// Add span element for the word
							elem.appendChild(dom.create('span', {'class' : 'mceItemHiddenSpellWord'}, txt));
						}
						// Add text node for the rest of the content
						if (v.length) {
							node = doc.createTextNode(dom.decode(v));
							elem.appendChild(node);
						}
					} else {
						// Other browsers preserve whitespace characters on innerHTML usage
						elem.innerHTML = v.replace(rx, '$1<span class="mceItemHiddenSpellWord">$2</span>');
					}

					// Finally, replace the node with the container
					dom.replace(elem, n);
				}
			});

			se.setRng(r);
		},

		_showMenu : function(ed, e) {
			var t = this, ed = t.editor, m = t._menu, p1, dom = ed.dom, vp = dom.getViewPort(ed.getWin()), wordSpan = e.target;

			e = 0; // Fixes IE memory leak

			if (!m) {
				m = ed.controlManager.createDropMenu('spellcheckermenu', {'class' : 'mceNoIcons'});
				t._menu = m;
			}

			if (dom.hasClass(wordSpan, 'mceItemHiddenSpellWord')) {
				m.removeAll();
				m.add({title : 'spellchecker.wait', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

				t._sendRPC('getSuggestions', [t.selectedLang, dom.decode(wordSpan.innerHTML)], function(r) {
					var ignoreRpc;

					m.removeAll();

					if (r.length > 0) {
						m.add({title : 'spellchecker.sug', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
						each(r, function(v) {
							m.add({title : v, onclick : function() {
								dom.replace(ed.getDoc().createTextNode(v), wordSpan);
								t._checkDone();
							}});
						});

						m.addSeparator();
					} else
						m.add({title : 'spellchecker.no_sug', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

					if (ed.getParam('show_ignore_words', true)) {
						ignoreRpc = t.editor.getParam("spellchecker_enable_ignore_rpc", '');
						m.add({
							title : 'spellchecker.ignore_word',
							onclick : function() {
								var word = wordSpan.innerHTML;

								dom.remove(wordSpan, 1);
								t._checkDone();

								// tell the server if we need to
								if (ignoreRpc) {
									ed.setProgressState(1);
									t._sendRPC('ignoreWord', [t.selectedLang, word], function(r) {
										ed.setProgressState(0);
									});
								}
							}
						});

						m.add({
							title : 'spellchecker.ignore_words',
							onclick : function() {
								var word = wordSpan.innerHTML;

								t._removeWords(dom.decode(word));
								t._checkDone();

								// tell the server if we need to
								if (ignoreRpc) {
									ed.setProgressState(1);
									t._sendRPC('ignoreWords', [t.selectedLang, word], function(r) {
										ed.setProgressState(0);
									});
								}
							}
						});
					}

					if (t.editor.getParam("spellchecker_enable_learn_rpc")) {
						m.add({
							title : 'spellchecker.learn_word',
							onclick : function() {
								var word = wordSpan.innerHTML;

								dom.remove(wordSpan, 1);
								t._checkDone();

								ed.setProgressState(1);
								t._sendRPC('learnWord', [t.selectedLang, word], function(r) {
									ed.setProgressState(0);
								});
							}
						});
					}

					m.update();
				});

				p1 = DOM.getPos(ed.getContentAreaContainer());
				m.settings.offset_x = p1.x;
				m.settings.offset_y = p1.y;

				ed.selection.select(wordSpan);
				p1 = dom.getPos(wordSpan);
				m.showMenu(p1.x, p1.y + wordSpan.offsetHeight - vp.y);

				return tinymce.dom.Event.cancel(e);
			} else
				m.hideMenu();
		},

		_checkDone : function() {
			var t = this, ed = t.editor, dom = ed.dom, o;

			each(dom.select('span'), function(n) {
				if (n && dom.hasClass(n, 'mceItemHiddenSpellWord')) {
					o = true;
					return false;
				}
			});

			if (!o)
				t._done();
		},

		_done : function() {
			var t = this, la = t.active;

			if (t.active) {
				t.active = 0;
				t._removeWords();

				if (t._menu)
					t._menu.hideMenu();

				if (la)
					t.editor.nodeChanged();
			}
		},

		_sendRPC : function(m, p, cb) {
			var t = this;

			JSONRequest.sendRPC({
				url : t.rpcUrl,
				method : m,
				params : p,
				success : cb,
				error : function(e, x) {
					t.editor.setProgressState(0);
					t.editor.windowManager.alert(e.errstr || ('Error response: ' + x.responseText));
				}
			});
		}
	});
	
	/**
	*
	* Spellchecker plugin modification by development team.
	* The modificaton is overriding on basic TinyMCE 3.5.8
	* implementation.
	*
	*/
	
	/*
	* First we disable this part to use the modified spellchecker
	*
	* // Register plugin
	* tinymce.PluginManager.add('spellchecker', tinymce.plugins.SpellcheckerPlugin);
	*/
	
	// Some <=IE8 fixes
	if(!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(n) {
			for(var i = 0; i < this.length; ++i) {
				if(this[i] === n) {
					return i;
				}
			}
			return -1;
		};
	}
	
	// Subclass the original spellchecker plugin
	tinymce.create('tinymce.plugins.SpellcheckerPluginMod:tinymce.plugins.SpellcheckerPlugin', {
		
		// @Override
		getInfo : function() {
			var res = this.parent();
			res.longname += ' modified by development team.';
			return res;
		},
		
		// @Override
		init : function(ed, url) {
			var res = this.parent(ed, url);
			var t = this;
				
			// Ignored element tag list, the default contains mostly presentational and commonly used tags in WYSIWYG formatting.
			// It is used to avoid a single word but in two/more formats being split into two/more words. Format: comma separated.
			t.ignoredElementTags = ed.getParam('spellchecker_ignored_element_tags', 'abbr,em,strong,b,i,u,small,s,big,strike,tt,font,span,sub,sup');
			t.ignoredElementTags = t.ignoredElementTags.split(',');
					
			return res;
		},
		
		// @Override
		// Overriden to support walking through non-text node
		_walk : function(n, f) {
			var d = this.editor.getDoc(), w;

			if (d.createTreeWalker) {
				w = d.createTreeWalker(n, NodeFilter.SHOW_ALL, null, false);

				while ((n = w.nextNode()) != null)
					f.call(this, n);
			} else
				tinymce.walk(n, f, 'childNodes');
		},
		
		// @Override
		// Overriden to add more separator such as nbsp
		_getSeparators : function() {
			// Addition: nbsp 0xa0 and zero width nbsp \ufeff
			var re = '', i, str = this.editor.getParam('spellchecker_word_separator_chars', '\\s!"#$%&()*+,-./:;<=>?@[\]^_{|} §©«®±¶·¸»¼½¾¿×÷¤\u201d\u201c\ufeff');

			// Build word separator regexp
			for (i=0; i<str.length; i++)
				re += '\\' + str.charAt(i);

			return re;
		},
		
		// @Override
		// Overriden to return word list which include word separated by ignored element tags
		_getWords : function() {
			var t = this, ed = this.editor, wl = [], tx = '', lo = {}, rawWords;
			
			// Normalize the body first
			// ed.getBody().normalize();

			// Get area text
			this._walk(ed.getBody(), function(n) {
				if (n.nodeType == 3)
				{
					tx += n.nodeValue;
				}
				if (n.nodeType == 1)
				{
					// Treat element not in the ignored element tags list as word separators
					if (t.ignoredElementTags.indexOf(n.nodeName.toLowerCase()) == -1)
					{
						tx += ' ';
					}
				}
			});
			
			tx = this._removeURLs(tx);
			rawWords = this._splitTextToWords(tx);

			// Build word array and remove duplicates
			// Also ignore words with single quote (') as it causes trouble with the marker
			// The original spellchecker is already failed to detect any word with (')
			each(rawWords, function(v) {
				if (!lo[v] && v.indexOf("'") == -1) {
					wl.push(v);
					lo[v] = 1;
				}
			});

			return wl;
		},
		
		// @Override
		// Overriden to add ability to remove words which span multiple nodes
		_removeWords : function(w, rng) {
			var t = this, ed = t.editor, dom = ed.dom, se = ed.selection, r = se.getRng(true);

			each(dom.select('span').reverse(), function(n) {
				if (n && (dom.hasClass(n, 'mceItemHiddenSpellWord') || dom.hasClass(n, 'mceItemHidden'))) {
					if (!w || t._findFirstWord(n) == w)
						dom.remove(n, 1);
				}
			});

			se.setRng(r);
		},
		
		// @Override
		// Overriden to add ability to mark misspelt words which separated by ignored element tags 
		_markWords : function(wl) {
			var t = this, ed = t.editor, dom = ed.dom, doc = ed.getDoc(), se = ed.selection, r = se.getRng(true), nl = [],
				w = wl.join('|'), re = this._getSeparators(), rx = new RegExp('([' + re + '])(' + w + ')(?=[' + re + '])', 'g');
				// rx modified to not match the first and last word, it's a special case
			
			// Collect all element and text nodes
			this._walk(ed.getBody(), function(n) {
				if (n.nodeType == 1 || n.nodeType == 3) {
					nl.push(n);
				}
			});

			// Wrap incorrect words in spans
			for (var i = 0; i < nl.length; ++i) {
				var node, elem, words, txt, pos, v = nl[i].nodeValue, anyMisspell = false, fwFound = false, lwFound = false;
				
				// Here we use the same codepath for all browser (original spellchecker use special case for IE)
				// Lowest common denominator: IE8
				if (nl[i].nodeType == 3) {						
					// Encode the content
					v = dom.encode(v);
					// Create container element
					elem = dom.create('span', {'class' : 'mceItemHidden'});
					
					// Check whether the first word is misspelt
					if (txt = this._findFirstWord(nl[i])) {
						if ((new RegExp('^(' + w + ')$')).test(txt)){
							// Replace only the first word
							v = v.replace(new RegExp('(^[^' + re + ']+)'), '<mcespell>$1</mcespell>');
							anyMisspell = true;
						}
					}

					// Check whether the last word is misspelt
					if (txt = this._findLastWord(nl[i])) {
						if ((new RegExp('^(' + w + ')$')).test(txt)){
							// Replace only the last word
							v = v.replace(new RegExp('([^' + re + ']+$)'), '<mcespell>$1</mcespell>');
							anyMisspell = true;
						}
					}
	
					// Use original spellchecker algorithm to mark words, except for the last word.
					if (rx.test(v)) {
						if (anyMisspell) {
							// There's already misspelt word detected
							if (v.indexOf('</mcespell>') < v.lastIndexOf('<mcespell>')) {
								// The first and the last word are misspelt
								v = v.slice(0, v.indexOf('</mcespell>') + 11)
									+ v.slice(v.indexOf('</mcespell>') + 11, v.lastIndexOf('<mcespell>'))
									.replace(rx, '$1<mcespell>$2</mcespell>')
									+ v.slice(v.lastIndexOf('<mcespell>'));								
							} else if (v.indexOf('<mcespell') == 0) {
								// Only the first word are misspelt
								v = v.slice(0, v.indexOf('</mcespell>') + 11)
									+ v.slice(v.indexOf('</mcespell>') + 11).replace(rx, '$1<mcespell>$2</mcespell>');
							} else {
								// Only the last word are misspelt
								v = v.slice(0, v.indexOf('<mcespell>')).replace(rx, '$1<mcespell>$2</mcespell>')
									+ v.slice(v.indexOf('<mcespell>'));
							}
						} else {
							// The first and the last word aren't misspelt
							v = v.replace(rx, '$1<mcespell>$2</mcespell>');
						}
						anyMisspell = true;
					}
					
					if (anyMisspell) {
						// Loop over the content finding mispelled words
						while ((pos = v.indexOf('<mcespell>')) != -1) {
							// Add text node for the content before the word
							txt = v.substring(0, pos);
							if (txt.length) {
								node = doc.createTextNode(dom.decode(txt));
								elem.appendChild(node);
							}
							v = v.substring(pos+10);
							pos = v.indexOf('</mcespell>');
							txt = v.substring(0, pos);
							v = v.substring(pos+11);
							// Add span element for the word
							elem.appendChild(dom.create('span', {'class' : 'mceItemHiddenSpellWord'}, txt));
						}
						// Add text node for the rest of the content
						if (v.length) {
							node = doc.createTextNode(dom.decode(v));
							elem.appendChild(node);
						}
	
						// Finally, replace the node with the container
						dom.replace(elem, nl[i]);
					}
				}
			}

			se.setRng(r);
		},
		
		// @Override
		// Overriden to add ability to find and replace the whole word instead of just in the word span
		_showMenu : function(ed, e) {
			var t = this, ed = t.editor, doc = ed.getDoc(), m = t._menu, p1, dom = ed.dom, vp = dom.getViewPort(ed.getWin()),
				wordSpan = e.target, se = ed.selection, rng;

			e = 0; // Fixes IE memory leak

			if (!m) {
				m = ed.controlManager.createDropMenu('spellcheckermenu', {'class' : 'mceNoIcons'});
				t._menu = m;
			}

			if (dom.hasClass(wordSpan, 'mceItemHiddenSpellWord')) {
				m.removeAll();
				m.add({title : 'spellchecker.wait', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

				rng = dom.createRng();
				t._sendRPC('getSuggestions', [t.selectedLang, t._findFirstWord(wordSpan, rng)], function(r) {
					var ignoreRpc;

					m.removeAll();

					if (r.length > 0) {
						m.add({title : 'spellchecker.sug', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
						each(r, function(v) {
							m.add({title : v, onclick : function() {
								// Use the DOM range object instead of just dom.replace
								var cn = rng.startContainer, sn = [];
								
								// Save the whole run of nodes except the first
								while (cn != rng.endContainer) {
									cn = t._getNextNode(cn);
									sn.push(cn);
								}
								
								// Replace the first node
								cn = rng.startContainer.parentNode;
								dom.replace(doc.createTextNode(v), cn);
								
								// Remove the remaining nodes
								each(sn, function(n) {
									if (dom.hasClass(n, 'mceItemHiddenSpellWord')) {
										dom.remove(n);
									}
								});
								se.collapse(true);
								
								t._checkDone();
							}});
						});

						m.addSeparator();
					} else
						m.add({title : 'spellchecker.no_sug', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

					if (ed.getParam('show_ignore_words', true)) {
						ignoreRpc = t.editor.getParam("spellchecker_enable_ignore_rpc", '');
						m.add({
							title : 'spellchecker.ignore_word',
							onclick : function() {
								var word = t._findFirstWord(wordSpan), cn = rng.startContainer, sn = [];

								// Use the DOM range object instead of just dom.remove

								// Save the whole run of nodes except the first
								while (cn != rng.endContainer) {
									cn = t._getNextNode(cn);
									sn.push(cn);
								}
								
								// Remove the first span node
								dom.remove(rng.startContainer.parentNode, true);
								
								// Remove the remaining nodes
								each(sn, function(n) {
									if (dom.hasClass(n, 'mceItemHiddenSpellWord')) {
										dom.remove(n, true);
									}
								});
								
								se.collapse(true);
								t._checkDone();
								
								// tell the server if we need to
								if (ignoreRpc) {
									ed.setProgressState(1);
									t._sendRPC('ignoreWord', [t.selectedLang, word], function(r) {
										ed.setProgressState(0);
									});
								}
							}
						});

						m.add({
							title : 'spellchecker.ignore_words',
							onclick : function() {
								var word = t._findFirstWord(wordSpan);

								t._removeWords(dom.decode(word));
								t._checkDone();

								// tell the server if we need to
								if (ignoreRpc) {
									ed.setProgressState(1);
									t._sendRPC('ignoreWords', [t.selectedLang, word], function(r) {
										ed.setProgressState(0);
									});
								}
							}
						});
					}

					if (t.editor.getParam("spellchecker_enable_learn_rpc")) {
						m.add({
							title : 'spellchecker.learn_word',
							onclick : function() {
								var word = t._findFirstWord(wordSpan);

								t._removeWords(dom.decode(word));
								t._checkDone();

								ed.setProgressState(1);
								t._sendRPC('learnWord', [t.selectedLang, word], function(r) {
									ed.setProgressState(0);
								});
							}
						});
					}

					m.update();
				});

				p1 = DOM.getPos(ed.getContentAreaContainer());
				m.settings.offset_x = p1.x;
				m.settings.offset_y = p1.y;

				se.collapse(true);
				se.setRng(rng);
				p1 = dom.getPos(wordSpan);
				m.showMenu(p1.x, p1.y + wordSpan.offsetHeight - vp.y);

				return tinymce.dom.Event.cancel(e);
			} else
				m.hideMenu();
		},
		
		/**
		 * Function to check whether the given node is an element node and in the given ignored element list, or a text node
		 * but contains no text
		 * 
		 * @param n the node 
		 */
		_isInIgnoredElement : function(n) {
			return (n.nodeType == 1 && this.ignoredElementTags.indexOf(n.nodeName.toLowerCase()) != -1) ||
				n.nodeType != 1;
		},
		
		/**
		 * Function to replace separator character with a blank space.
		 * 
		 * @param tx the text 
		 */
		_stripOutSeparator : function(tx) {
			return tx.replace(new RegExp('([0-9]|[' + this._getSeparators() + '])', 'g'), ' ');
		},
		
		/**
		 * Function to return a words array from a text.
		 * 
		 * @param tx the text
		 */
		_splitTextToWords : function(tx) {
			var ed = this.editor; rawWords = [];
			
			// split the text up into individual words
			if (ed.getParam('spellchecker_word_pattern')) {
				// look for words that match the pattern
				rawWords = tx.match('(' + ed.getParam('spellchecker_word_pattern') + ')', 'gi');
			} else {
				// Split words by separator
				tx = this._stripOutSeparator(tx);
				tx = tinymce.trim(tx.replace(/(\s+)/g, ' '));
				rawWords = tx.split(' ');
			}
			
			return rawWords;		
		},
		
		/**
		 * Function to return an array of URL regexes. 
		 */
		_getURLRegExes : function() {
			if(!this.URLRegExes) {
				var regExes = [];
				regExes.push(new RegExp("http://.+?(?= |$)", "g"));
				regExes.push(new RegExp("ftp://.+?(?= |$)", "g"));
				regExes.push(new RegExp("file://.+?(?= |$)", "g"));
				regExes.push(new RegExp("www\\..+?(?= |$)", "g"));
				this.URLRegExes = regExes;
			}
			return this.URLRegExes;
		},
		
		/**
		 * Function to strip URL from the list of words 
		 */
		_removeURLs : function(text) {
			var regExes = this._getURLRegExes(), i;
			for(i = 0; i < regExes.length; i++) {
				text = text.replace(regExes[i], "");
			}
			return text;
		},
		
		/**
		 * Function to return the whole word of the first word in a text
		 * node except when there's a separator in the beginning of the node.
		 * Also set the starting point and end point the given DOM Range object.
		 * 
		 * @param n node
		 * @param rng DOM Range object to be set
		 * 
		 * @return will return null if there's a separator in the beginning of the node, else the whole first word
		 */
		_findFirstWord : function(n, rng) {
			var t = this, s, w, el, last, sfound = false;
			
			if (n.nodeType == 3) {
				last = n;
				// Check if there's a separator in the beginning
				s = this._stripOutSeparator(n.nodeValue);
				if (w = s.match(/^\S+/)) {
					// There is no separator
					w = w[0];
					while (this._getPrevNode(n) != t.editor.getBody()) {
						if (el = n.previousSibling) {
							if (!this._isInIgnoredElement(el)) {
								// If the previous node in same DOM hierarchy is a block element
								sfound = true;
							}
						}
						
						if (!sfound) {
							n = this._getPrevNode(n);	// To the previous node						
							if (n.nodeType == 3 && n.nodeValue.length > 0) {
								s = this._stripOutSeparator(n.nodeValue);
								// Previous node may contain other part if there's no separator in the end
								if (s.match(/\S+$/)) {
									if (s.match(/\s\S+$/)) {
										// If the previous node contains a separator before the last word, that is,
										// the starting point is in the middle of the previous node then proceed
										// the from the last word
										if (rng) {
											// Set the DOM range starting point
											rng.setStart(n, s.length - s.match(/\s\S+$/)[0].length)
										}
										return this._findLastWord(n, rng);
									}
									last = n;
								} else {
									// There's a separator in the end of the previous node
									sfound = true;
								}
							} else if (!this._isInIgnoredElement(n)) {
								// There's a block element
								sfound = true;
							}
						}
						
						if (sfound) {
							// Starting point of the first word is found in the beginning of the text node
							n = last; // Return to the last text node
							s = this._stripOutSeparator(n.nodeValue);
							if (rng) {
								// Set the DOM range starting point
								rng.setStart(n, 0);
							}
							if (s.match(/^\S+\s/)) {
								// If there's a separator after the first word of the last text node
								// then return the word before the separator 
								return s.match(/^\S+/);
							} else {
								// If there's no separator in the end of the last text node therefore
								// it has continuation in the next node
								return this._findLastWord(n, rng);
							}							
						}
					}
				}
				return w;
			} else if (n.firstChild) {
				// In case targetted at the outer element, get the child node
				return this._findFirstWord(n.firstChild, rng);
			} else {
				return null;
			}
		},
		
		/**
		 * Function to return the whole word of the last word in a text
		 * node except when there's a separator in the end of the node.
		 * Also set the end point (but not the starting point) of the given
		 * DOM Range object.
		 * 
		 * @param n node
		 * @param rng DOM Range object to be set
		 * 
		 * @return will return null if there's a separator in the end of the node, else the whole last word
		 */
		_findLastWord : function(n, rng) {
			var t = this, w, nw, s, el, found = false;
			
			if (n.nodeType == 3) {	
				// Check if there's a separator in the end
				w = this._stripOutSeparator(n.nodeValue).match(/\S+$/);
				if(w != null) {	// There is no separator
					w = w[0];
					if (rng) {
						// Set the DOM range starting point
						rng.setEnd(n, w.length);
					}
					// To the next node
					while ((n = this._getNextNode(n)) && !found) {
						if (n.nodeType == 3 && n.nodeValue.length > 0) {
							s = this._stripOutSeparator(n.nodeValue);
							// Next node may contain other part if there's no separator in the beginning
							if (nw = s.match(/^\S+/)) {
								if (s.match(/^\S+\s/)) {
									// If the next node contains a separator after the first word, get the first word only 
									w += nw[0];
									if (rng) {
										// Set the DOM range starting point
										rng.setEnd(n, nw[0].length);
									}
								} else {
									// If there's no separator in the next node then recursively process it
									w += this._findLastWord(n, rng);
								}
							}
							found = true;
						} else if (!this._isInIgnoredElement(n)) {
							found = true;	// There's an unignored element
						} else if (el = n.previousSibling) {
							if (!this._isInIgnoredElement(el)) {
								found = true;	// There's an unignored element
							}
						}
					}
				}
				return w;
			} else if (n.firstChild) {
				// In case targetted at the outer element, get the child node
				return this._findLastWord(n.firstChild, rng);
			} else {
				return null;
			}
		},
		
		/**
		 * Function to get previous node
		 * 
		 * @param n node
		 */
		_getPrevNode : function(n) {
			if (!n.previousSibling)
			{
				return n.parentNode;
			}
			else {
				n = n.previousSibling;
				while (n.lastChild)
				{
					n = n.lastChild;
				}
				return n;
			}
		},
		
		/**
		 * Function to get next node
		 * 
		 * @param n node
		 */
		_getNextNode : function(n) {
			if (n.firstChild) {
				return n.firstChild;
			} else {
				while (n && !n.nextSibling) {
					n = n.parentNode;
				}
				if (n) {
					return n.nextSibling;
				} else {
					return n;
				}
			}
		}
		
	});
	
	// Now we register the modified plugin
	tinymce.PluginManager.add('spellchecker', tinymce.plugins.SpellcheckerPluginMod);
	
	/**
	* End of modification.
	*/
	
})();
