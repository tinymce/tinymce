import { Fun } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Replication } from '@ephox/sugar';

var setBorderColor = function (cell, value) {
  Css.set(cell, 'border-color', value);
  Css.getRaw(cell, 'border-style').fold(function () {
    /* required by older browsers */
    Css.set(cell, 'border-style', 'solid');
  }, Fun.noop); // do nothing when already set
};

var setBackgroundColor = function (cell, value) {
  Css.set(cell, 'background-color', value);
};

var setHeight = function (cell, value) {
  Css.set(cell, 'height', value);
};

var setWidth = function (cell, value) {
  Css.set(cell, 'width', value);
};

var setType = function (cell, type) {
  var replica = Replication.copy(cell, type);
  Insert.after(cell, replica);
  Remove.remove(cell);
};

var setScope = function (cell, value) {
  Attr.set(cell, 'scope', value);
};

var setStyle = function (cell, value) {
  Attr.set(cell, 'style', value);
};

var setClass = function (cell, value) {
  Attr.set(cell, 'class', value);
};

export default {
  setBorderColor: setBorderColor,
  setBackgroundColor: setBackgroundColor,
  setHeight: setHeight,
  setWidth: setWidth,
  setType: setType,
  setScope: setScope,
  setStyle: setStyle,
  setClass: setClass
};