/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const doSyncSize = function (widthCtrl, heightCtrl) {
  widthCtrl.state.set('oldVal', widthCtrl.value());
  heightCtrl.state.set('oldVal', heightCtrl.value());
};
const doSizeControls = function (win, f) {
  const widthCtrl = win.find('#width')[0];
  const heightCtrl = win.find('#height')[0];
  const constrained = win.find('#constrain')[0];
  if (widthCtrl && heightCtrl && constrained) {
    f(widthCtrl, heightCtrl, constrained.checked());
  }
};

const doUpdateSize = function (widthCtrl, heightCtrl, isContrained) {
  const oldWidth = widthCtrl.state.get('oldVal');
  const oldHeight = heightCtrl.state.get('oldVal');
  let newWidth = widthCtrl.value();
  let newHeight = heightCtrl.value();

  if (isContrained && oldWidth && oldHeight && newWidth && newHeight) {
    if (newWidth !== oldWidth) {
      newHeight = Math.round((newWidth / oldWidth) * newHeight);

      if (!isNaN(newHeight)) {
        heightCtrl.value(newHeight);
      }
    } else {
      newWidth = Math.round((newHeight / oldHeight) * newWidth);

      if (!isNaN(newWidth)) {
        widthCtrl.value(newWidth);
      }
    }
  }

  doSyncSize(widthCtrl, heightCtrl);
};

const syncSize = function (win) {
  doSizeControls(win, doSyncSize);
};

const updateSize = function (win) {
  doSizeControls(win, doUpdateSize);
};

const createUi = function (onChange) {
  const recalcSize = function () {
    onChange(function (win) {
      updateSize(win);
    });
  };

  return {
    type: 'container',
    label: 'Dimensions',
    layout: 'flex',
    align: 'center',
    spacing: 5,
    items: [
      {
        name: 'width', type: 'textbox', maxLength: 5, size: 5,
        onchange: recalcSize, ariaLabel: 'Width'
      },
      { type: 'label', text: 'x' },
      {
        name: 'height', type: 'textbox', maxLength: 5, size: 5,
        onchange: recalcSize, ariaLabel: 'Height'
      },
      { name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions' }
    ]
  };
};

export default {
  createUi,
  syncSize,
  updateSize
};