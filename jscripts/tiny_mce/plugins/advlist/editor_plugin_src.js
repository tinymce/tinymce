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
	var each = tinymce.each;

	tinymce.create('tinymce.plugins.AdvListPlugin', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;

			function buildFormats(str) {
				var formats = [];

				each(str.split(/,/), function(type) {
					formats.push({
						title : 'advlist.' + (type == 'default' ? 'def' : type.replace(/-/g, '_')),
						styles : {
							listStyleType : type == 'default' ? '' : type
						}
					});
				});

				return formats;
			};

			// Setup number formats from config or default
			t.numlist = ed.getParam("advlist_number_styles") || buildFormats("default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman");
			t.bullist = ed.getParam("advlist_bullet_styles") || buildFormats("default,circle,disc,square");
		},

		createControl: function(name, cm) {
			var t = this, btn, format;

			if (name == 'numlist' || name == 'bullist') {
				// Default to first item if it's a default item
				if (t[name][0].title == 'advlist.def')
					format = t[name][0];

				function hasFormat(node, format) {
					var state = true;

					each(format.styles, function(value, name) {
						// Format doesn't match
						if (t.editor.dom.getStyle(node, name) != value) {
							state = false;
							return false;
						}
					});

					return state;
				};

				function applyListFormat() {
					var list, ed = t.editor, dom = ed.dom, sel = ed.selection;

					// Check for existing list element
					list = dom.getParent(sel.getNode(), 'ol,ul');

					// Switch/add list type if needed
					if (!list || list.nodeName == (name == 'bullist' ? 'OL' : 'UL') || hasFormat(list, format))
						ed.execCommand(name == 'bullist' ? 'InsertUnorderedList' : 'InsertOrderedList');

					// Append styles to new list element
					if (format) {
						list = dom.getParent(sel.getNode(), 'ol,ul');

						if (list) {
							dom.setStyles(list, format.styles);
							list.removeAttribute('_mce_style');
						}
					}
				};

				btn = cm.createSplitButton(name, {
					title : 'advanced.' + name + '_desc',
					'class' : 'mce_' + name,
					onclick : function() {
						applyListFormat();
					}
				});

				btn.onRenderMenu.add(function(btn, menu) {
					menu.onShowMenu.add(function() {
						var dom = t.editor.dom, list = dom.getParent(t.editor.selection.getNode(), 'ol,ul'), fmtList;

						if (list || format) {
							fmtList = t[name];

							// Unselect existing items
							each(menu.items, function(item) {
								var state = true;

								item.setSelected(0);

								if (list && !item.isDisabled()) {
									each(fmtList, function(fmt) {
										if (fmt.id == item.id) {
											if (!hasFormat(list, fmt)) {
												state = false;
												return false;
											}
										}
									});

									if (state)
										item.setSelected(1);
								}
							});

							// Select the current format
							if (!list)
								menu.items[format.id].setSelected(1);
						}
					});

					menu.add({id : t.editor.dom.uniqueId(), title : 'advlist.types', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

					each(t[name], function(item) {
						item.id = t.editor.dom.uniqueId();

						menu.add({id : item.id, title : item.title, onclick : function() {
							format = item;
							applyListFormat();
						}});
					});
				});

				return btn;
			}
		},

		getInfo : function() {
			return {
				longname : 'Advanced lists',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/advlist',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('advlist', tinymce.plugins.AdvListPlugin);
})();