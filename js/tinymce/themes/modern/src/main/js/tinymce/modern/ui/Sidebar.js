/**
 * Sidebar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce.modern.ui.Sidebar', [
	'global!tinymce.util.Tools',
	'global!tinymce.ui.Factory'
], function (Tools, Factory) {
	var api = function (elm) {
		return {
			element: function () {
				return elm;
			}
		};
	};

	var trigger = function (callback) {
		return function (panel) {
			if (callback) {
				callback(api(panel.getEl('body')));
			}
		};
	};

	var showPanel = function (name, onrender, onshow, onhide) {
		return function (e) {
			var btnCtrl = e.control;
			var container = btnCtrl.parents().filter('panel')[0];
			var panel = container.find('#' + name)[0];

			container.items().filter(function (ctrl) {
				return ctrl.settings.name !== name && ctrl.settings.classes === 'sidebar-panel';
			}).each(trigger(onhide)).hide();

			btnCtrl.parent().items().each(function (ctrl) {
				ctrl.active(false);
			});

			if (panel && panel.visible()) {
				trigger(onhide)(panel);

				if (onhide) {
					onhide(api(panel.getEl()));
				}

				panel.hide();
				btnCtrl.active(false);
			} else {
				if (panel) {
					panel.show();
					trigger(onshow)(panel);
				} else {
					panel = Factory.create({
						type: 'container',
						name: name,
						layout: 'stack',
						classes: 'sidebar-panel',
						html: ''
					});

					container.prepend(panel);
					trigger(onrender)(panel);
					trigger(onshow)(panel);
				}

				btnCtrl.active(true);
			}
		};
	};

	var createSidebar = function (editor) {
		var buttons = Tools.map(editor.sidebars, function (sidebar) {
			var settings = sidebar.settings;

			return {
				type: 'button',
				icon: settings.icon,
				image: settings.image,
				tooltip: settings.tooltip,
				onclick: showPanel(sidebar.name, settings.onrender, settings.onshow, settings.onhide)
			};
		});

		return {
			type: 'panel',
			name: 'sidebar',
			layout: 'stack',
			classes: 'sidebar',
			items: [
				{
					type: 'toolbar',
					layout: 'stack',
					classes: 'sidebar-toolbar',
					items: buttons
				}
			]
		};
	};

	return {
		createSidebar: createSidebar
	};
});