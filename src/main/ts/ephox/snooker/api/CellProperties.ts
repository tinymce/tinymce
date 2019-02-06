import { Fun } from '@ephox/katamari';
import { Attr, Css, Insert, Remove, Replication } from '@ephox/sugar';

const setBorderColor = function (cell, value) {
  Css.set(cell, 'border-color', value);
  Css.getRaw(cell, 'border-style').fold(function () {
    /* required by older browsers */
    Css.set(cell, 'border-style', 'solid');
  }, Fun.noop); // do nothing when already set
};

const setBackgroundColor = function (cell, value) {
  Css.set(cell, 'background-color', value);
};

const setHeight = function (cell, value) {
  Css.set(cell, 'height', value);
};

const setWidth = function (cell, value) {
  Css.set(cell, 'width', value);
};

const setType = function (cell, type) {
  const replica = Replication.copy(cell, type);
  Insert.after(cell, replica);
  Remove.remove(cell);
};

const setScope = function (cell, value) {
  Attr.set(cell, 'scope', value);
};

const setStyle = function (cell, value) {
  Attr.set(cell, 'style', value);
};

const setClass = function (cell, value) {
  Attr.set(cell, 'class', value);
};

export default {
  setBorderColor,
  setBackgroundColor,
  setHeight,
  setWidth,
  setType,
  setScope,
  setStyle,
  setClass
};