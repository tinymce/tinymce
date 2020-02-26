import { Attr, Css, Element } from '@ephox/sugar';

const col = function (column: number, x: number, y: number, w: number, h: number) {
  const blocker = Element.fromTag('div');
  Css.setAll(blocker, {
    'position': 'absolute',
    'left': x - w / 2 + 'px',
    'top': y + 'px',
    'height': h + 'px',
    'width': w + 'px',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none'
  });

  Attr.setAll(blocker, { 'data-column': column, 'role': 'presentation' });
  return blocker;
};

const row = function (r: number, x: number, y: number, w: number, h: number) {
  const blocker = Element.fromTag('div');
  Css.setAll(blocker, {
    'position': 'absolute',
    'left': x + 'px',
    'top': y - h / 2 + 'px',
    'height': h + 'px',
    'width': w + 'px',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none'
  });

  Attr.setAll(blocker, { 'data-row': r, 'role': 'presentation' });
  return blocker;
};

export {
  col,
  row
};
