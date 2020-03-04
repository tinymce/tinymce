import { Attr, Css, Element } from '@ephox/sugar';

const col = function (column: number, x: number, y: number, w: number, h: number) {
  const bar = Element.fromTag('div');
  Css.setAll(bar, {
    position: 'absolute',
    left: x - w / 2 + 'px',
    top: y + 'px',
    height: h + 'px',
    width: w + 'px'
  });

  Attr.setAll(bar, { 'data-column': column, 'role': 'presentation' });
  return bar;
};

const row = function (r: number, x: number, y: number, w: number, h: number) {
  const bar = Element.fromTag('div');
  Css.setAll(bar, {
    position: 'absolute',
    left: x + 'px',
    top: y - h / 2 + 'px',
    height: h + 'px',
    width: w + 'px'
  });

  Attr.setAll(bar, { 'data-row': r, 'role': 'presentation' });
  return bar;
};

export {
  col,
  row
};
