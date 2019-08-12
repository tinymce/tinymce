import { Fun } from '@ephox/katamari';
import { Attr, Css, Insert, Remove, Replication, Element } from '@ephox/sugar';

const setBorderColor = function (cell: Element, value: string) {
  Css.set(cell, 'border-color', value);
  Css.getRaw(cell, 'border-style').fold(function () {
    /* required by older browsers */
    Css.set(cell, 'border-style', 'solid');
  }, Fun.noop); // do nothing when already set
};

const setBackgroundColor = function (cell: Element, value: string) {
  Css.set(cell, 'background-color', value);
};

const setHeight = function (cell: Element, value: string) {
  Css.set(cell, 'height', value);
};

const setWidth = function (cell: Element, value: string) {
  Css.set(cell, 'width', value);
};

const setType = function (cell: Element, type: 'th' | 'td') {
  const replica = Replication.copy(cell, type);
  Insert.after(cell, replica);
  Remove.remove(cell);
};

const setScope = function (cell: Element, value: string) {
  Attr.set(cell, 'scope', value);
};

const setStyle = function (cell: Element, value: string) {
  Attr.set(cell, 'style', value);
};

const setClass = function (cell: Element, value: string) {
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