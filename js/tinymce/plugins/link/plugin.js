/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('link', function(editor) {
	function createLinkList(callback) {
		return function() {
			var linkList = editor.settings.link_list;

			if (typeof(linkList) == "string") {
				tinymce.util.XHR.send({
					url: linkList,
					success: function(text) {
						callback(tinymce.util.JSON.parse(text));
					}
				});
			} else {
				callback(linkList);
			}
		};
	}

	function showDialog(linkList) {
		var data = {}, selection = editor.selection, dom = editor.dom, selectedElm, anchorElm, initialText;
		var win, textListCtrl, linkListCtrl, relListCtrl, targetListCtrl;

		function linkListChangeHandler(e) {
			var textCtrl = win.find('#text');

			if (!textCtrl.value() || (e.lastControl && textCtrl.value() == e.lastControl.text())) {
				textCtrl.value(e.control.text());
			}

			win.find('#href').value(e.control.value());
		}

		function buildLinkList() {
			var linkListItems = [{text: 'None', value: ''}];

			tinymce.each(linkList, function(link) {
				linkListItems.push({
					text: link.text || link.title,
					value: editor.convertURL(link.value || link.url, 'href'),
					menu: link.menu
				});
			});

			return linkListItems;
		}

		function buildRelList(relValue) {
			var relListItems = [{text: 'None', value: ''}];

			if (!editor.settings.rel_list) {
				// HTML5 DEFAULT TOKENS
				relListItems.push({text: 'alternate', value: 'alternate'});
				relListItems.push({text: 'author', value: 'author'});
				relListItems.push({text: 'bookmark', value: 'bookmark'});
				relListItems.push({text: 'help', value: 'help'});
				relListItems.push({text: 'license', value: 'license'});
				relListItems.push({text: 'next', value: 'next'});
				relListItems.push({text: 'nofollow', value: 'nofollow'});
				relListItems.push({text: 'noreferrer', value: 'noreferrer'});
				relListItems.push({text: 'prefetch', value: 'prefetch'});
				relListItems.push({text: 'prev', value: 'prev'});
				relListItems.push({text: 'search', value: 'search'});
				relListItems.push({text: 'tag', value: 'tag'});
			} else {
				tinymce.each(editor.settings.rel_list, function(rel) {
					relListItems.push({
						text: rel.text || rel.title,
						value: rel.value,
						selected: rel === rel.value
					});
				});
			}
			return relListItems;

		}

		function buildTargetList(targetValue) {
			var targetListItems = [];

			if (!editor.settings.target_list) {
				targetListItems.push({text: 'None', value: ''});
				targetListItems.push({text: 'New window', value: '_blank'});
			}

			tinymce.each(editor.settings.target_list, function(target) {
				targetListItems.push({
					text: target.text || target.title,
					value: target.value,
					selected: targetValue === target.value
				});
			});

			return targetListItems;
		}

		function buildAnchorListControl(url) {
			var anchorList = [];

			tinymce.each(editor.dom.select('a:not([href])'), function(anchor) {
				var id = anchor.name || anchor.id;

				if (id) {
					anchorList.push({
						text: id,
						value: '#' + id,
						selected: url.indexOf('#' + id) != -1
					});
				}
			});

			if (anchorList.length) {
				anchorList.unshift({text: 'None', value: ''});

				return {
					name: 'anchor',
					type: 'listbox',
					label: 'Anchors',
					values: anchorList,
					onselect: linkListChangeHandler
				};
			}
		}

		function urlChange() {
			if (linkListCtrl) {
				linkListCtrl.value(editor.convertURL(this.value(), 'href'));
			}

			if (!initialText && data.text.length === 0 && onlyText) {
				this.parent().parent().find('#text')[0].value(this.value());
			}
		}

		selectedElm = selection.getNode();
		anchorElm = dom.getParent(selectedElm, 'a[href]');

		var onlyText = true;
		if (/</.test(selection.getContent())) {
			onlyText = false;
		} else if (anchorElm) {
			var nodes = anchorElm.childNodes, i;
			if (nodes.length === 0) {
				onlyText = false;
			} else {
				for (i = nodes.length - 1; i >= 0; i--) {
					if (nodes[i].nodeType != 3) {
						onlyText = false;
						break;
					}
				}
			}
		}

		data.text = initialText = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({format: 'text'});
		data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';
		data.target = anchorElm ? dom.getAttrib(anchorElm, 'target') : (editor.settings.default_link_target || '');
		data.rel = anchorElm ? dom.getAttrib(anchorElm, 'rel') : '';

		if (onlyText) {
			textListCtrl = {
				name: 'text',
				type: 'textbox',
				size: 40,
				label: 'Text to display',
				onchange: function() {
					data.text = this.value();
				}
			};
		}

		if (linkList) {
			linkListCtrl = {
				type: 'listbox',
				label: 'Link list',
				values: buildLinkList(),
				onselect: linkListChangeHandler,
				value: editor.convertURL(data.href, 'href'),
				onPostRender: function() {
					linkListCtrl = this;
				}
			};
		}

		if (editor.settings.target_list !== false) {
			targetListCtrl = {
				name: 'target',
				type: 'listbox',
				label: 'Target',
				values: buildTargetList(data.target)
			};
		}

		relListCtrl = {
			name: 'rel',
			type: 'listbox',
			label: 'Rel',
			values: buildRelList(data.rel)
		};
		
		win = editor.windowManager.open({
			title: 'Insert link',
			data: data,
			body: [
				{
					name: 'href',
					type: 'filepicker',
					filetype: 'file',
					size: 40,
					autofocus: true,
					label: 'Url',
					onchange: urlChange,
					onkeyup: urlChange
				},
				textListCtrl,
				buildAnchorListControl(data.href),
				linkListCtrl,
				relListCtrl,
				targetListCtrl
			],
			onSubmit: function(e) {
				var data = e.data, href = data.href;

				// Delay confirm since onSubmit will move focus
				function delayedConfirm(message, callback) {
					var rng = editor.selection.getRng();

					window.setTimeout(function() {
						editor.windowManager.confirm(message, function(state) {
							editor.selection.setRng(rng);
							callback(state);
						});
					}, 0);
				}

				function insertLink() {
					if (anchorElm) {
						editor.focus();

						if (onlyText && data.text != initialText) {
							anchorElm.innerText = data.text;
						}

						dom.setAttribs(anchorElm, {
							href: href,
							target: data.target ? data.target : null,
							rel: data.rel ? data.rel : null
						});

						selection.select(anchorElm);
						editor.undoManager.add();
					} else {
						if (onlyText) {
							editor.insertContent(dom.createHTML('a', {
								href: href,
								target: data.target ? data.target : null,
								rel: data.rel ? data.rel : null
							}, dom.encode(data.text)));
						} else {
							editor.execCommand('mceInsertLink', false, {
								href: href,
								target: data.target,
								rel: data.rel ? data.rel : null
							});
						}
					}
				}

				if (!href) {
					editor.execCommand('unlink');
					return;
				}

				// Is email and not //user@domain.com
				if (href.indexOf('@') > 0 && href.indexOf('//') == -1 && href.indexOf('mailto:') == -1) {
					delayedConfirm(
						'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
						function(state) {
							if (state) {
								href = 'mailto:' + href;
							}

							insertLink();
						}
					);

					return;
				}

				// Is www. prefixed
				if (/^\s*www\./i.test(href)) {
					delayedConfirm(
						'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
						function(state) {
							if (state) {
								href = 'http://' + href;
							}

							insertLink();
						}
					);

					return;
				}

				insertLink();
			}
		});
	}

	editor.addButton('link', {
		icon: 'link',
		tooltip: 'Insert/edit link',
		shortcut: 'Ctrl+K',
		onclick: createLinkList(showDialog),
		stateSelector: 'a[href]'
	});

	editor.addButton('unlink', {
		icon: 'unlink',
		tooltip: 'Remove link',
		cmd: 'unlink',
		stateSelector: 'a[href]'
	});

	editor.addShortcut('Ctrl+K', '', createLinkList(showDialog));

	this.showDialog = showDialog;

	editor.addMenuItem('link', {
		icon: 'link',
		text: 'Insert link',
		shortcut: 'Ctrl+K',
		onclick: createLinkList(showDialog),
		stateSelector: 'a[href]',
		context: 'insert',
		prependToContext: true
	});
});
