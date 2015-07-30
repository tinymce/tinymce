/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * ...
 */
define("tinymce/imagetoolsplugin/Dialog", [
	"tinymce/dom/DOMUtils",
	"tinymce/util/Tools",
	"tinymce/util/Promise",
	"tinymce/ui/Factory",
	"tinymce/ui/Form",
	"tinymce/ui/Container",
	"tinymce/imagetoolsplugin/ImagePanel",
	"tinymce/imagetoolsplugin/ImageTools",
	"tinymce/imagetoolsplugin/Filters",
	"tinymce/imagetoolsplugin/Conversions",
	"tinymce/imagetoolsplugin/UndoStack"
], function(DOMUtils, Tools, Promise, Factory, Form, Container, ImagePanel, ImageTools, Filters, Conversions, UndoStack) {
	function createState(blob) {
		return {
			blob: blob,
			url: URL.createObjectURL(blob)
		};
	}

	function destroyState(state) {
		if (state) {
			URL.revokeObjectURL(state.url);
		}
	}

	function destroyStates(states) {
		Tools.each(states, destroyState);
	}

	function open(currentState, resolve, reject) {
		var win, undoStack = new UndoStack(), mainPanel, filtersPanel, tempState,
			cropPanel, resizePanel, flipRotatePanel, imagePanel, sidePanel, mainViewContainer,
			invertPanel, brightnessPanel, huePanel, saturatePanel, contrastPanel, grayscalePanel,
			sepiaPanel, colorizePanel, sharpenPanel, embossPanel, gammaPanel, exposurePanel, panels,
			width, height, ratioW, ratioH;

		function recalcSize(e) {
			var widthCtrl, heightCtrl, newWidth, newHeight;

			widthCtrl = win.find('#w')[0];
			heightCtrl = win.find('#h')[0];

			newWidth = parseInt(widthCtrl.value(), 10);
			newHeight = parseInt(heightCtrl.value(), 10);

			if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
				if (e.control.settings.name == 'w') {
					newHeight = Math.round(newWidth * ratioW);
					heightCtrl.value(newHeight);
				} else {
					newWidth = Math.round(newHeight * ratioH);
					widthCtrl.value(newWidth);
				}
			}

			width = newWidth;
			height = newHeight;
		}

		function floatToPercent(value) {
			return Math.round(value * 100) + '%';
		}

		function updateButtonUndoStates() {
			win.find('#undo').disabled(!undoStack.canUndo());
			win.find('#redo').disabled(!undoStack.canRedo());
			win.statusbar.find('#save').disabled(!undoStack.canUndo());
		}

		function disableUndoRedo() {
			win.find('#undo').disabled(true);
			win.find('#redo').disabled(true);
		}

		function displayState(state) {
			if (state) {
				imagePanel.imageSrc(state.url);
			}
		}

		function switchPanel(targetPanel) {
			return function() {
				var hidePanels = Tools.filter(panels, function(panel) {
					return panel.settings.name != targetPanel;
				});

				Tools.each(hidePanels, function(panel) {
					panel.hide();
				});

				targetPanel.show();
			};
		}

		function addTempState(blob) {
			tempState = createState(blob);
			displayState(tempState);
		}

		function addBlobState(blob) {
			currentState = createState(blob);
			displayState(currentState);
			destroyStates(undoStack.add(currentState).removed);
			updateButtonUndoStates();
		}

		function crop() {
			var rect = imagePanel.selection();

			ImageTools.crop(currentState.blob, rect.x, rect.y, rect.w, rect.h).then(function(blob) {
				addBlobState(blob);
				cancel();
			});
		}

		function tempAction(fn) {
			var args = [].slice.call(arguments, 1);

			return function() {
				var state = tempState || currentState;

				fn.apply(this, [state.blob].concat(args)).then(addTempState);
			};
		}

		function action(fn) {
			var args = [].slice.call(arguments, 1);

			return function() {
				fn.apply(this, [currentState.blob].concat(args)).then(addBlobState);
			};
		}

		function cancel() {
			displayState(currentState);
			destroyState(tempState);
			switchPanel(mainPanel)();
			updateButtonUndoStates();
		}

		function applyTempState() {
			if (tempState) {
				addBlobState(tempState.blob);
				cancel();
			}
		}

		function zoomIn() {
			var zoom = imagePanel.zoom();

			if (zoom < 2) {
				zoom += 0.1;
			}

			imagePanel.zoom(zoom);
		}

		function zoomOut() {
			var zoom = imagePanel.zoom();

			if (zoom > 0.1) {
				zoom -= 0.1;
			}

			imagePanel.zoom(zoom);
		}

		function undo() {
			currentState = undoStack.undo();
			displayState(currentState);
			updateButtonUndoStates();
		}

		function redo() {
			currentState = undoStack.redo();
			displayState(currentState);
			updateButtonUndoStates();
		}

		function save() {
			resolve(currentState.blob);
			win.close();
		}

		function createPanel(items) {
			return new Form({
				layout: 'flex',
				direction: 'row',
				labelGap: 5,
				border: '0 0 1 0',
				align: 'center',
				pack: 'center',
				padding: '0 10 0 10',
				spacing: 5,
				flex: 0,
				minHeight: 60,
				defaults: {
					classes: 'imagetool',
					type: 'button'
				},
				items: items
			});
		}

		function createFilterPanel(title, filter) {
			return createPanel([
				{text: 'Back', onclick: cancel},
				{type: 'spacer', flex: 1},
				{text: 'Apply', subtype: 'primary', onclick: applyTempState}
			]).hide().on('show', function() {
				disableUndoRedo();

				filter(currentState.blob).then(function(blob) {
					var newTempState = createState(blob);

					displayState(newTempState);
					destroyState(tempState);
					tempState = newTempState;
				});
			});
		}

		function createVariableFilterPanel(title, filter, value, min, max) {
			function update(value) {
				filter(currentState.blob, value).then(function(blob) {
					var newTempState = createState(blob);
					displayState(newTempState);
					destroyState(tempState);
					tempState = newTempState;
				});
			}

			return createPanel([
				{text: 'Back', onclick: cancel},
				{type: 'spacer', flex: 1},
				{
					type: 'slider',
					flex: 1,
					ondragend: function(e) {
						update(e.value);
					},
					minValue: min,
					maxValue: max,
					value: value,
					previewFilter: floatToPercent
				},
				{type: 'spacer', flex: 1},
				{text: 'Apply', subtype: 'primary', onclick: applyTempState}
			]).hide().on('show', function() {
				this.find('slider').value(value);
				disableUndoRedo();
			});
		}

		function createRgbFilterPanel(title, filter) {
			function update() {
				var r, g, b;

				r = win.find('#r')[0].value();
				g = win.find('#g')[0].value();
				b = win.find('#b')[0].value();

				filter(currentState.blob, r, g, b).then(function(blob) {
					var newTempState = createState(blob);
					displayState(newTempState);
					destroyState(tempState);
					tempState = newTempState;
				});
			}

			return createPanel([
				{text: 'Back', onclick: cancel},
				{type: 'spacer', flex: 1},
				{
					type: 'slider', label: 'R', name: 'r', minValue: 0,
					value: 1, maxValue: 2, ondragend: update, previewFilter: floatToPercent
				},
				{
					type: 'slider', label: 'G', name: 'g', minValue: 0,
					value: 1, maxValue: 2, ondragend: update, previewFilter: floatToPercent
				},
				{
					type: 'slider', label: 'B', name: 'b', minValue: 0,
					value: 1, maxValue: 2, ondragend: update, previewFilter: floatToPercent
				},
				{type: 'spacer', flex: 1},
				{text: 'Apply', subtype: 'primary', onclick: applyTempState}
			]).hide().on('show', function() {
				win.find('#r,#g,#b').value(1);
				disableUndoRedo();
			});
		}

		cropPanel = createPanel([
			{text: 'Back', onclick: cancel},
			{type: 'spacer', flex: 1},
			{text: 'Apply', subtype: 'primary', onclick: crop}
		]).hide().on('show hide', function(e) {
			imagePanel.toggleCropRect(e.type == 'show');
		}).on('show', disableUndoRedo);

		function toggleConstrain(e) {
			if (e.control.value() === true) {
				ratioW = height / width;
				ratioH = width / height;
			}
		}

		resizePanel = createPanel([
			{text: 'Back', onclick: cancel},
			{type: 'spacer', flex: 1},
			{type: 'textbox', name: 'w', label: 'Width', size: 4, onkeyup: recalcSize},
			{type: 'textbox', name: 'h', label: 'Height', size: 4, onkeyup: recalcSize},
			{type: 'checkbox', name: 'constrain', text: 'Constrain proportions', checked: true, onchange: toggleConstrain},
			{type: 'spacer', flex: 1},
			{text: 'Apply', subtype: 'primary', onclick: 'submit'}
		]).hide().on('submit', function(e) {
			var width = parseInt(win.find('#w').value(), 10),
				height = parseInt(win.find('#h').value(), 10);

			e.preventDefault();

			action(ImageTools.resize, width, height)();
			cancel();
		}).on('show', disableUndoRedo);

		flipRotatePanel = createPanel([
			{text: 'Back', onclick: cancel},
			{type: 'spacer', flex: 1},
			{icon: 'fliph', tooltip: 'Flip horizontally', onclick: tempAction(ImageTools.flip, 'h')},
			{icon: 'flipv', tooltip: 'Flip vertically', onclick: tempAction(ImageTools.flip, 'v')},
			{icon: 'rotateleft', tooltip: 'Rotate counterclockwise', onclick: tempAction(ImageTools.rotate, -90)},
			{icon: 'rotateright', tooltip: 'Rotate clockwise', onclick: tempAction(ImageTools.rotate, 90)},
			{type: 'spacer', flex: 1},
			{text: 'Apply', subtype: 'primary', onclick: applyTempState}
		]).hide().on('show', disableUndoRedo);

		invertPanel = createFilterPanel("Invert", Filters.invert);
		sharpenPanel = createFilterPanel("Sharpen", Filters.sharpen);
		embossPanel = createFilterPanel("Emboss", Filters.emboss);

		brightnessPanel = createVariableFilterPanel("Brightness", Filters.brightness, 0, -1, 1);
		huePanel = createVariableFilterPanel("Hue", Filters.hue, 180, 0, 360);
		saturatePanel = createVariableFilterPanel("Saturate", Filters.saturate, 0, -1, 1);
		contrastPanel = createVariableFilterPanel("Contrast", Filters.contrast, 0, -1, 1);
		grayscalePanel = createVariableFilterPanel("Grayscale", Filters.grayscale, 0, 0, 1);
		sepiaPanel = createVariableFilterPanel("Sepia", Filters.sepia, 0, 0, 1);
		colorizePanel = createRgbFilterPanel("Colorize", Filters.colorize);
		gammaPanel = createVariableFilterPanel("Gamma", Filters.gamma, 0, -1, 1);
		exposurePanel = createVariableFilterPanel("Exposure", Filters.exposure, 1, 0, 2);

		filtersPanel = createPanel([
			{text: 'Back', onclick: cancel},
			{type: 'spacer', flex: 1},
			{text: 'hue', icon: 'hue', onclick: switchPanel(huePanel)},
			{text: 'saturate', icon: 'saturate', onclick: switchPanel(saturatePanel)},
			{text: 'sepia', icon: 'sepia', onclick: switchPanel(sepiaPanel)},
			{text: 'emboss', icon: 'emboss', onclick: switchPanel(embossPanel)},
			{text: 'exposure', icon: 'exposure', onclick: switchPanel(exposurePanel)},
			{type: 'spacer', flex: 1}
		]).hide();

		mainPanel = createPanel([
			{tooltip: 'Crop', icon: 'crop', onclick: switchPanel(cropPanel)},
			{tooltip: 'Resize', icon: 'resize2', onclick: switchPanel(resizePanel)},
			{tooltip: 'Orientation', icon: 'orientation', onclick: switchPanel(flipRotatePanel)},
			{tooltip: 'Brightness', icon: 'sun', onclick: switchPanel(brightnessPanel)},
			{tooltip: 'Sharpen', icon: 'sharpen', onclick: switchPanel(sharpenPanel)},
			{tooltip: 'Contrast', icon: 'contrast', onclick: switchPanel(contrastPanel)},
			{tooltip: 'Color levels', icon: 'drop', onclick: switchPanel(colorizePanel)},
			{tooltip: 'Gamma', icon: 'gamma', onclick: switchPanel(gammaPanel)},
			{tooltip: 'Invert', icon: 'invert', onclick: switchPanel(invertPanel)}
			//{text: 'More', onclick: switchPanel(filtersPanel)}
		]);

		imagePanel = new ImagePanel({
			flex: 1,
			imageSrc: currentState.url
		});

		sidePanel = new Container({
			layout: 'flex',
			direction: 'column',
			border: '0 1 0 0',
			padding: 5,
			spacing: 5,
			items: [
				{type: 'button', icon: 'undo', tooltip: 'Undo', name: 'undo', onclick: undo},
				{type: 'button', icon: 'redo', tooltip: 'Redo', name: 'redo', onclick: redo},
				{type: 'button', icon: 'zoomin', tooltip: 'Zoom in', onclick: zoomIn},
				{type: 'button', icon: 'zoomout', tooltip: 'Zoom out', onclick: zoomOut}
			]
		});

		mainViewContainer = new Container({
			type: 'container',
			layout: 'flex',
			direction: 'row',
			align: 'stretch',
			flex: 1,
			items: [sidePanel, imagePanel]
		});

		panels = [
			mainPanel,
			cropPanel,
			resizePanel,
			flipRotatePanel,
			filtersPanel,
			invertPanel,
			brightnessPanel,
			huePanel,
			saturatePanel,
			contrastPanel,
			grayscalePanel,
			sepiaPanel,
			colorizePanel,
			sharpenPanel,
			embossPanel,
			gammaPanel,
			exposurePanel
		];

		win = Factory.create('window', {
			layout: 'flex',
			direction: 'column',
			align: 'stretch',
			minWidth: Math.min(DOMUtils.DOM.getViewPort().w, 800),
			minHeight: Math.min(DOMUtils.DOM.getViewPort().h, 650),
			title: 'Edit image',
			items: panels.concat([mainViewContainer]),
			buttons: [
				{text: 'Save', name: 'save', subtype: 'primary', onclick: save},
				{text: 'Cancel', onclick: 'close'}
			]
		});

		win.renderTo(document.body).reflow();

		win.on('close', function() {
			reject();
			destroyStates(undoStack.data);
			undoStack = null;
			tempState = null;
		});

		undoStack.add(currentState);
		updateButtonUndoStates();

		imagePanel.on('load', function() {
			width = imagePanel.imageSize().w;
			height = imagePanel.imageSize().h;
			ratioW = height / width;
			ratioH = width / height;

			win.find('#w').value(width);
			win.find('#h').value(height);
		});
	}

	function edit(blob) {
		return new Promise(function(resolve, reject) {
			open(createState(blob), resolve, reject);
		});
	}

	//edit('img/dogleft.jpg');

	return {
		edit: edit
	};
});