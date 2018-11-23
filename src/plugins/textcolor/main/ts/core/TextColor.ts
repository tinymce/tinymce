/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getCurrentColor = function (editor, format) {
  let color;

  editor.dom.getParents(editor.selection.getStart(), function (elm) {
    let value;

    if ((value = elm.style[format === 'forecolor' ? 'color' : 'background-color'])) {
      color = color ? color : value;
    }
  });

  return color;
};

const mapColors = function (colorMap) {
  let i;
  const colors = [];

  for (i = 0; i < colorMap.length; i += 2) {
    colors.push({
      text: colorMap[i + 1],
      color: '#' + colorMap[i]
    });
  }

  return colors;
};

const applyFormat = function (editor, format, value) {
  editor.undoManager.transact(function () {
    editor.focus();
    editor.formatter.apply(format, { value });
    editor.nodeChanged();
  });
};

const removeFormat = function (editor, format) {
  editor.undoManager.transact(function () {
    editor.focus();
    editor.formatter.remove(format, { value: null }, null, true);
    editor.nodeChanged();
  });
};

export default {
  getCurrentColor,
  mapColors,
  applyFormat,
  removeFormat
};