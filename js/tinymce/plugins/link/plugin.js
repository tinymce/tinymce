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
		var win, linkListCtrl, relListCtrl, targetListCtrl;

		// URLs
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
					value: link.value || link.url,
					menu: link.menu
				});
			});

			return linkListItems;
		}
		
		
		// RELs
		function relListChangeHandler(e) {
			var textCtrl = win.find('#text');

			if (!textCtrl.value() || (e.lastControl && textCtrl.value() == e.lastControl.text())) {
				textCtrl.value(e.control.text());
			}

			win.find('#rel').value(e.control.value());
		}

		function buildRelList(rel) {
			var relListItems = [{text: 'None', value: ''}];

			tinymce.each(editor.settings.rel_list, function(rel) {
				relListItems.push({
					text: rel.text || rel.title,
					value: rel.value,
					selected: rel === rel.value
				});
			});

			return relListItems;
		}


		// TARGETs
		function targetListChangeHandler(e) {
			var textCtrl = win.find('#text');

			if (!textCtrl.value() || (e.lastControl && textCtrl.value() == e.lastControl.text())) {
				textCtrl.value(e.control.text());
			}

			win.find('#target').value(e.control.value());
		}

		function buildTargetList(target) {
			var targetListItems = [{text: 'None', value: ''}];
			
			if (!editor.settings.target_list) {
				// DEFAULTs
				targetListItems.push({text: 'Same Window/Tab', value: '_self'});
				targetListItems.push({text: 'New Window/Tab', value: '_blank'});
			} else {
				tinymce.each(editor.settings.target_list, function(target) {
					targetListItems.push({
						text: target.text || target.title,
						value: target.value,
						selected: target === target.value
					});
				});
			}

			return targetListItems;
		}
		
		
		// ANCHORs
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
		
		
		
		

		function updateText() {
			if (!initialText && data.text.length === 0) {
				this.parent().parent().find('#text')[0].value(this.value());
			}
		}

		selectedElm = selection.getNode();
		anchorElm = dom.getParent(selectedElm, 'a[href]');

		data.text = initialText = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({format: 'text'});
		data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';
		data.title = anchorElm ? dom.getAttrib(anchorElm, 'title') : '';
		data.rel = anchorElm ? dom.getAttrib(anchorElm, 'rel') : '';
		data.target = anchorElm ? dom.getAttrib(anchorElm, 'target') : '';

		if (selectedElm.nodeName == "IMG") {
			data.text = initialText = " ";
		}

		if (linkList) {
			linkListCtrl = {
				type: 'listbox',
				label: 'Links',
				values: buildLinkList(),
				onselect: linkListChangeHandler
			};
		}

		if (editor.settings.rel_list) {
			relListCtrl = {
				name: 'rellist',
				type: 'listbox',
				label: 'Rels',
				values: buildRelList(data.rel),
				onselect: relListChangeHandler
			};
		}

		targetListCtrl = {
			name: 'targetlist',
			type: 'listbox',
			label: 'Targets',
			values: buildTargetList(data.target),
			onselect: targetListChangeHandler
		};



		function onSubmitForm() {
			var data = win.toJSON();
			var data = data, href = data.href, target = data.target;

			// Delay confirm since onSubmit will move focus
			function delayedConfirm(message, callback) {
				window.setTimeout(function() {
					editor.windowManager.confirm(message, callback);
				}, 0);
			}

			function insertLink() {
				if (data.text != initialText) {
					if (anchorElm) {
						editor.focus();
						anchorElm.innerHTML = data.text;

						dom.setAttribs(anchorElm, {
							href: href,
							title: data.title ? data.title : null,
							target: data.target ? data.target : null,
							rel: data.rel ? data.rel : null
						});

						selection.select(anchorElm);
					} else {
						editor.insertContent(dom.createHTML('a', {
							href: href,
							title: data.title ? data.title : null,
							target: data.target ? data.target : null,
							rel: data.rel ? data.rel : null
						}, data.text));
					}
				} else {
					editor.execCommand('mceInsertLink', false, {
						href: href,
						title: data.title,
						target: data.target ? data.target : null,
						rel: data.rel ? data.rel : null
					});
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

		// General settings shared between simple and advanced dialogs
		var generalFormItems = [
			{name: 'text', type: 'textbox', size: 40, label: 'Text', onchange: function() {
				data.text = this.value();
			}},
			{
				name: 'href',
				type: 'filepicker',
				filetype: 'file',
				size: 40,
				autofocus: true,
				label: 'Url',
				onchange: updateText,
				onkeyup: updateText
			},
			buildAnchorListControl(data.href),
			linkListCtrl
		];


		if (editor.settings.link_advtab) {

			// Advanced dialog shows general+advanced tabs
			win = editor.windowManager.open({
				title: 'Insert/edit link',
				data: data,
				bodyType: 'tabpanel',
				body: [
					{
						title: 'General',
						type: 'form',
						items: generalFormItems
					},

					{
						title: 'Advanced',
						type: 'form',
						pack: 'start',
						items: [
							{name: 'title', type: 'textbox', size: 40, label: 'Title', onchange: function() {
								data.title = this.value();
							}}
							,
							{name: 'target', type: 'textbox', size: 40, label: 'Target', onchange: function() {
								data.target = this.value();
							}},
							targetListCtrl,
							{name: 'rel', type: 'textbox', size: 40, label: 'Rel', onchange: function() {
								data.rel = this.value();
							}},
							relListCtrl
						]
					}
				],
				onSubmit: onSubmitForm
			});
		} else {
			// Simple default dialog
			win = editor.windowManager.open({
				title: 'Insert/edit link',
				data: data,
				body: generalFormItems,
				onSubmit: onSubmitForm
			});
		}


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
