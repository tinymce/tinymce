/**
 * FilePicker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

/**
 * This class creates a file picker control.
 *
 * @class tinymce.ui.FilePicker
 * @extends tinymce.ui.ComboBox
 */
define("tinymce/ui/FilePicker", [
	"tinymce/ui/ComboBox",
	"tinymce/util/Tools",
	"tinymce/util/Arr",
	"tinymce/content/LinkTargets"
], function(ComboBox, Tools, Arr, LinkTargets) {
	"use strict";

	var history = {};

	var hasFocus = function (elm) {
		return document.activeElement === elm;
	};

	var toMenuItems = function (targets) {
		return Tools.map(targets, function (item) {
			return {
				title: item.title,
				value: item
			};
		});
	};

	var createMenuItems = function (targets) {
		var separator = {title: '-'};

		var createMenuItems = function (type) {
			var filteredTargets = Arr.filter(targets, function (target) {
				return target.type == type;
			});

			return toMenuItems(filteredTargets);
		};

		var join = function (items) {
			return Arr.reduce(items, function (a, b) {
				return a.length === 0 || b.length === 0 ? a.concat(b) : a.concat(separator, b);
			}, []);
		};

		return join([
			createMenuItems('history'),
			createMenuItems('header'),
			createMenuItems('anchor')
		]);
	};

	var addToHistory = function (url, fileType) {
		var target = LinkTargets.createHistoricTarget(url);

		if (fileType in history) {
			if (url && isUniqueTarget(history[fileType])(target)) {
				history[fileType] = history[fileType].slice(0, 100).concat(target);
			}
		} else {
			history[fileType] = [target];
		}
	};

	var getHistory = function (fileType) {
		return fileType in history ? history[fileType] : [];
	};

	var isUniqueTarget = function (targets) {
		return function (target) {
			var foundTarget = Arr.find(targets, function (seekTarget) {
				return target.url === seekTarget.url;
			});

			return !foundTarget;
		};
	};

	var concatHistory = function (targets, fileType) {
		return targets.concat(Arr.filter(getHistory(fileType).slice(0, 5), isUniqueTarget(targets)));
	};

	var filterTargets = function (targets, term) {
		var lowerCaseTerm = term.toLowerCase();

		return Tools.grep(targets, function (target) {
			return (
				target.title.toLowerCase().indexOf(lowerCaseTerm) !== -1
			);
		});
	};

	var defaultAutoCompleteHandler = function (linkTargets, query, success) {
		success(filterTargets(linkTargets, query.term));
	};

	var setupAutoCompleteHandler = function (ctrl, bodyElm, fileType) {
		var autocomplete = function (term) {
			var linkTargets = concatHistory(LinkTargets.getTargets(bodyElm), fileType);

			defaultAutoCompleteHandler(linkTargets, {
				term: term,
				type: fileType
			}, function (targets) {
				var menuItems = createMenuItems(targets, fileType);
				if (menuItems.length > 0) {
					ctrl.showAutoComplete(menuItems, term);
				}
			});
		};

		ctrl.state.on('change:value', function (e) {
			if (hasFocus(ctrl.getEl('inp'))) {
				autocomplete(e.value);
			}
		});

		ctrl.on('selectitem', function (e) {
			var linkTarget = e.value;

			ctrl.value(linkTarget.url);

			if (fileType === 'image') {
				ctrl.fire('change', {meta: {alt: e.title, attach: linkTarget.attach}});
			} else {
				ctrl.fire('change', {meta: {text: e.title, attach: linkTarget.attach}});
			}

			ctrl.focus();
		});

		ctrl.on('click', function () {
			if (ctrl.value().length === 0) {
				autocomplete('');
			}
		});

		ctrl.on('PostRender', function () {
			ctrl.getRoot().on('submit', function (e) {
				if (!e.isDefaultPrevented()) {
					addToHistory(ctrl.value(), fileType);
				}
			});
		});
	};

	var setupLinkValidatorHandler = function (ctrl, editorSettings, fileType) {
		var validatorHandler = editorSettings.filepicker_validator_handler;
		if (validatorHandler) {
			var validateUrl = function (term) {
				if (term.length === 0) {
					ctrl.statusLevel('none');
					return;
				}

				validatorHandler({
					term: term,
					type: fileType
				}, function (result) {
					ctrl.statusMessage(result.message);
					ctrl.statusLevel(result.status);
				});
			};

			ctrl.state.on('change:value', function (e) {
				validateUrl(e.value);
			});
		}
	};

	return ComboBox.extend({
		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			var self = this, editor = tinymce.activeEditor, editorSettings = editor.settings;
			var actionCallback, fileBrowserCallback, fileBrowserCallbackTypes;
			var fileType = settings.filetype;

			settings.spellcheck = false;

			fileBrowserCallbackTypes = editorSettings.file_picker_types || editorSettings.file_browser_callback_types;
			if (fileBrowserCallbackTypes) {
				fileBrowserCallbackTypes = Tools.makeMap(fileBrowserCallbackTypes, /[, ]/);
			}

			if (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[fileType]) {
				fileBrowserCallback = editorSettings.file_picker_callback;
				if (fileBrowserCallback && (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[fileType])) {
					actionCallback = function() {
						var meta = self.fire('beforecall').meta;

						meta = Tools.extend({filetype: fileType}, meta);

						// file_picker_callback(callback, currentValue, metaData)
						fileBrowserCallback.call(
							editor,
							function(value, meta) {
								self.value(value).fire('change', {meta: meta});
							},
							self.value(),
							meta
						);
					};
				} else {
					// Legacy callback: file_picker_callback(id, currentValue, filetype, window)
					fileBrowserCallback = editorSettings.file_browser_callback;
					if (fileBrowserCallback && (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[fileType])) {
						actionCallback = function() {
							fileBrowserCallback(
								self.getEl('inp').id,
								self.value(),
								fileType,
								window
							);
						};
					}
				}
			}

			if (actionCallback) {
				settings.icon = 'browse';
				settings.onaction = actionCallback;
			}

			self._super(settings);

			setupAutoCompleteHandler(self, editor.getBody(), fileType);
			setupLinkValidatorHandler(self, editorSettings, fileType);
		}
	});
});