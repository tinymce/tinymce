import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Element } from '@ephox/sugar';

var col = function (column, x, y, w, h) {
  var blocker = Element.fromTag('div');
  Css.setAll(blocker, {
    position: 'absolute',
    left: x - w/2 + 'px',
    top: y + 'px',
    height: h + 'px',
    width: w + 'px'
  });

  Attr.setAll(blocker, { 'data-column': column, 'role': 'presentation' });
  return blocker;
};

var row = function (row, x, y, w, h) {
  var blocker = Element.fromTag('div');
  Css.setAll(blocker, {
    position: 'absolute',
    left: x + 'px',
    top: y - h/2 + 'px',
    height: h + 'px',
    width: w + 'px'
  });

  Attr.setAll(blocker, { 'data-row': row, 'role': 'presentation' });
  return blocker;
};

export default {
  col: col,
  row: row
};