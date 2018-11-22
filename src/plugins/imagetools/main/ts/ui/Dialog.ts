/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ImageTransformations, ResultConversions } from '@ephox/imagetools';
import { URL } from '@ephox/sand';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Factory from 'tinymce/core/api/ui/Factory';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';

import UndoStack from '../core/UndoStack';
import ImagePanel from './ImagePanel';

function createState(blob) {
  return {
    blob,
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

function open(editor, currentState, resolve, reject) {
  let win, undoStack = UndoStack(), mainPanel, filtersPanel, tempState,
    cropPanel, resizePanel, flipRotatePanel, imagePanel, sidePanel, mainViewContainer,
    invertPanel, brightnessPanel, huePanel, saturatePanel, contrastPanel, grayscalePanel,
    sepiaPanel, colorizePanel, sharpenPanel, embossPanel, gammaPanel, exposurePanel, panels,
    width, height, ratioW, ratioH;

  const reverseIfRtl = (items: any[]) => editor.rtl ? items.reverse() : items;

  function recalcSize(e) {
    let widthCtrl, heightCtrl, newWidth, newHeight;

    widthCtrl = win.find('#w')[0];
    heightCtrl = win.find('#h')[0];

    newWidth = parseInt(widthCtrl.value(), 10);
    newHeight = parseInt(heightCtrl.value(), 10);

    if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
      if (e.control.settings.name === 'w') {
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
    return function () {
      const hidePanels = Tools.grep(panels, function (panel) {
        return panel.settings.name !== targetPanel;
      });

      Tools.each(hidePanels, function (panel) {
        panel.hide();
      });

      targetPanel.show();
      targetPanel.focus();
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
    const rect = imagePanel.selection();

    ResultConversions.blobToImageResult(currentState.blob).
      then(function (ir) {
        ImageTransformations.crop(ir, rect.x, rect.y, rect.w, rect.h).
          then(imageResultToBlob).
          then(function (blob) {
            addBlobState(blob);
            cancel();
          });
      });
  }

  const tempAction: any = function (fn) {
    const args = [].slice.call(arguments, 1);

    return function () {
      const state = tempState || currentState;

      ResultConversions.blobToImageResult(state.blob).
        then(function (ir) {
          fn.apply(this, [ir].concat(args)).then(imageResultToBlob).then(addTempState);
        });
    };
  };

  function action(fn, ...arg): Function {
    const args = [].slice.call(arguments, 1);

    return function () {
      ResultConversions.blobToImageResult(currentState.blob).
        then(function (ir) {
          fn.apply(this, [ir].concat(args)).then(imageResultToBlob).then(addBlobState);
        });
    };
  }

  function cancel() {
    displayState(currentState);
    destroyState(tempState);
    switchPanel(mainPanel)();
    updateButtonUndoStates();
  }

  function waitForTempState(times, applyCall) {
    if (tempState) {
      applyCall();
    } else {
      setTimeout(function () {
        if (times-- > 0) {
          waitForTempState(times, applyCall);
        } else {
          editor.windowManager.alert('Error: failed to apply image operation.');
        }
      }, 10);
    }
  }

  function applyTempState() {
    if (tempState) {
      addBlobState(tempState.blob);
      cancel();
    } else {
      waitForTempState(100, applyTempState);
    }
  }

  function zoomIn() {
    let zoom = imagePanel.zoom();

    if (zoom < 2) {
      zoom += 0.1;
    }

    imagePanel.zoom(zoom);
  }

  function zoomOut() {
    let zoom = imagePanel.zoom();

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
    return Factory.create('Form', {
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
      items
    });
  }

  const imageResultToBlob = function (ir) {
    return ir.toBlob();
  };

  function createFilterPanel(title, filter) {
    return createPanel(reverseIfRtl([
      { text: 'Back', onclick: cancel },
      { type: 'spacer', flex: 1 },
      { text: 'Apply', subtype: 'primary', onclick: applyTempState }
    ])).hide().on('show', function () {
      disableUndoRedo();

      ResultConversions.blobToImageResult(currentState.blob).
        then(function (ir) {
          return filter(ir);
        }).
        then(imageResultToBlob).
        then(function (blob) {
          const newTempState = createState(blob);

          displayState(newTempState);
          destroyState(tempState);
          tempState = newTempState;
        });
    });
  }

  function createVariableFilterPanel(title, filter, value, min, max) {
    function update(value) {
      ResultConversions.blobToImageResult(currentState.blob).
        then(function (ir) {
          return filter(ir, value);
        }).
        then(imageResultToBlob).
        then(function (blob) {
          const newTempState = createState(blob);
          displayState(newTempState);
          destroyState(tempState);
          tempState = newTempState;
        });
    }

    return createPanel(reverseIfRtl([
      { text: 'Back', onclick: cancel },
      { type: 'spacer', flex: 1 },
      {
        type: 'slider',
        flex: 1,
        ondragend (e) {
          update(e.value);
        },
        minValue: editor.rtl ? max : min,
        maxValue: editor.rtl ? min : max,
        value,
        previewFilter: floatToPercent
      },
      { type: 'spacer', flex: 1 },
      { text: 'Apply', subtype: 'primary', onclick: applyTempState }
    ])).hide().on('show', function () {
      this.find('slider').value(value);
      disableUndoRedo();
    });
  }

  function createRgbFilterPanel(title, filter) {
    function update() {
      let r, g, b;

      r = win.find('#r')[0].value();
      g = win.find('#g')[0].value();
      b = win.find('#b')[0].value();

      ResultConversions.blobToImageResult(currentState.blob).
      then(function (ir) {
        return filter(ir, r, g, b);
      }).
      then(imageResultToBlob).
      then(function (blob) {
        const newTempState = createState(blob);
        displayState(newTempState);
        destroyState(tempState);
        tempState = newTempState;
      });
    }

    const min = editor.rtl ? 2 : 0;
    const max = editor.rtl ? 0 : 2;

    return createPanel(reverseIfRtl([
        { text: 'Back', onclick: cancel },
        { type: 'spacer', flex: 1 },
        {
          type: 'slider',
          label: 'R',
          name: 'r',
          minValue: min,
          value: 1,
          maxValue: max,
          ondragend: update,
          previewFilter: floatToPercent
        },
        {
          type: 'slider',
          label: 'G',
          name: 'g',
          minValue: min,
          value: 1,
          maxValue: max,
          ondragend: update,
          previewFilter: floatToPercent
        },
        {
          type: 'slider',
          label: 'B',
          name: 'b',
          minValue: min,
          value: 1,
          maxValue: max,
          ondragend: update,
          previewFilter: floatToPercent
        },
        { type: 'spacer', flex: 1 },
        { text: 'Apply', subtype: 'primary', onclick: applyTempState }
      ]))
      .hide()
      .on('show', function () {
        win.find('#r,#g,#b').value(1);
        disableUndoRedo();
      });
  }

  cropPanel = createPanel(reverseIfRtl([
    { text: 'Back', onclick: cancel },
    { type: 'spacer', flex: 1 },
    { text: 'Apply', subtype: 'primary', onclick: crop }
  ])).hide().on('show hide', function (e) {
    imagePanel.toggleCropRect(e.type === 'show');
  }).on('show', disableUndoRedo);

  function toggleConstrain(e) {
    if (e.control.value() === true) {
      ratioW = height / width;
      ratioH = width / height;
    }
  }

  resizePanel = createPanel(reverseIfRtl([
    { text: 'Back', onclick: cancel },
    { type: 'spacer', flex: 1 },
    { type: 'textbox', name: 'w', label: 'Width', size: 4, onkeyup: recalcSize },
    { type: 'textbox', name: 'h', label: 'Height', size: 4, onkeyup: recalcSize },
    { type: 'checkbox', name: 'constrain', text: 'Constrain proportions', checked: true, onchange: toggleConstrain },
    { type: 'spacer', flex: 1 },
    { text: 'Apply', subtype: 'primary', onclick: 'submit' }
  ])).hide().on('submit', function (e) {
    const width = parseInt(win.find('#w').value(), 10),
      height = parseInt(win.find('#h').value(), 10);

    e.preventDefault();

    action(ImageTransformations.resize, width, height)();
    cancel();
  }).on('show', disableUndoRedo);

  flipRotatePanel = createPanel(reverseIfRtl([
    { text: 'Back', onclick: cancel },
    { type: 'spacer', flex: 1 },
    { icon: 'fliph', tooltip: 'Flip horizontally', onclick: tempAction(ImageTransformations.flip, 'h') },
    { icon: 'flipv', tooltip: 'Flip vertically', onclick: tempAction(ImageTransformations.flip, 'v') },
    { icon: 'rotateleft', tooltip: 'Rotate counterclockwise', onclick: tempAction(ImageTransformations.rotate, -90) },
    { icon: 'rotateright', tooltip: 'Rotate clockwise', onclick: tempAction(ImageTransformations.rotate, 90) },
    { type: 'spacer', flex: 1 },
    { text: 'Apply', subtype: 'primary', onclick: applyTempState }
  ])).hide().on('show', disableUndoRedo);

  invertPanel = createFilterPanel('Invert', ImageTransformations.invert);
  sharpenPanel = createFilterPanel('Sharpen', ImageTransformations.sharpen);
  embossPanel = createFilterPanel('Emboss', ImageTransformations.emboss);

  brightnessPanel = createVariableFilterPanel('Brightness', ImageTransformations.brightness, 0, -1, 1);
  huePanel = createVariableFilterPanel('Hue', ImageTransformations.hue, 180, 0, 360);
  saturatePanel = createVariableFilterPanel('Saturate', ImageTransformations.saturate, 0, -1, 1);
  contrastPanel = createVariableFilterPanel('Contrast', ImageTransformations.contrast, 0, -1, 1);
  grayscalePanel = createVariableFilterPanel('Grayscale', ImageTransformations.grayscale, 0, 0, 1);
  sepiaPanel = createVariableFilterPanel('Sepia', ImageTransformations.sepia, 0, 0, 1);
  colorizePanel = createRgbFilterPanel('Colorize', ImageTransformations.colorize);
  gammaPanel = createVariableFilterPanel('Gamma', ImageTransformations.gamma, 0, -1, 1);
  exposurePanel = createVariableFilterPanel('Exposure', ImageTransformations.exposure, 1, 0, 2);

  filtersPanel = createPanel(reverseIfRtl([
    { text: 'Back', onclick: cancel },
    { type: 'spacer', flex: 1 },
    { text: 'hue', icon: 'hue', onclick: switchPanel(huePanel) },
    { text: 'saturate', icon: 'saturate', onclick: switchPanel(saturatePanel) },
    { text: 'sepia', icon: 'sepia', onclick: switchPanel(sepiaPanel) },
    { text: 'emboss', icon: 'emboss', onclick: switchPanel(embossPanel) },
    { text: 'exposure', icon: 'exposure', onclick: switchPanel(exposurePanel) },
    { type: 'spacer', flex: 1 }
  ])).hide();

  mainPanel = createPanel(reverseIfRtl([
    { tooltip: 'Crop', icon: 'crop', onclick: switchPanel(cropPanel) },
    { tooltip: 'Resize', icon: 'resize2', onclick: switchPanel(resizePanel) },
    { tooltip: 'Orientation', icon: 'orientation', onclick: switchPanel(flipRotatePanel) },
    { tooltip: 'Brightness', icon: 'sun', onclick: switchPanel(brightnessPanel) },
    { tooltip: 'Sharpen', icon: 'sharpen', onclick: switchPanel(sharpenPanel) },
    { tooltip: 'Contrast', icon: 'contrast', onclick: switchPanel(contrastPanel) },
    { tooltip: 'Color levels', icon: 'drop', onclick: switchPanel(colorizePanel) },
    { tooltip: 'Gamma', icon: 'gamma', onclick: switchPanel(gammaPanel) },
    { tooltip: 'Invert', icon: 'invert', onclick: switchPanel(invertPanel) }
    // {text: 'More', onclick: switchPanel(filtersPanel)}
  ]));

  imagePanel = ImagePanel.create({
    flex: 1,
    imageSrc: currentState.url
  });

  sidePanel = Factory.create('Container', {
    layout: 'flex',
    direction: 'column',
    pack: 'start',
    border: '0 1 0 0',
    padding: 5,
    spacing: 5,
    items: [
      { type: 'button', icon: 'undo', tooltip: 'Undo', name: 'undo', onclick: undo },
      { type: 'button', icon: 'redo', tooltip: 'Redo', name: 'redo', onclick: redo },
      { type: 'button', icon: 'zoomin', tooltip: 'Zoom in', onclick: zoomIn },
      { type: 'button', icon: 'zoomout', tooltip: 'Zoom out', onclick: zoomOut }
    ]
  });

  mainViewContainer = Factory.create('Container', {
    type: 'container',
    layout: 'flex',
    direction: 'row',
    align: 'stretch',
    flex: 1,
    items: reverseIfRtl([sidePanel, imagePanel])
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

  win = editor.windowManager.open({
    layout: 'flex',
    direction: 'column',
    align: 'stretch',
    minWidth: Math.min(DOMUtils.DOM.getViewPort().w, 800),
    minHeight: Math.min(DOMUtils.DOM.getViewPort().h, 650),
    title: 'Edit image',
    items: panels.concat([mainViewContainer]),
    buttons: reverseIfRtl([
      { text: 'Save', name: 'save', subtype: 'primary', onclick: save },
      { text: 'Cancel', onclick: 'close' }
    ])
  });

  win.on('close', function () {
    reject();
    destroyStates(undoStack.data);
    undoStack = null;
    tempState = null;
  });

  undoStack.add(currentState);
  updateButtonUndoStates();

  imagePanel.on('load', function () {
    width = imagePanel.imageSize().w;
    height = imagePanel.imageSize().h;
    ratioW = height / width;
    ratioH = width / height;

    win.find('#w').value(width);
    win.find('#h').value(height);
  });

  imagePanel.on('crop', crop);
}

function edit(editor, imageResult) {
  return new Promise(function (resolve, reject) {
    return imageResult.toBlob().then(function (blob) {
      open(editor, createState(blob), resolve, reject);
    });
  });
}

export default {
  edit
};