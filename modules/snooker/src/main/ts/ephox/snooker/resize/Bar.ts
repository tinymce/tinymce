import { Attribute, Css, SugarElement } from '@ephox/sugar';

const col = (column: number, x: number, y: number, w: number, h: number): SugarElement<HTMLDivElement> => {
  const bar = SugarElement.fromTag('div');
  Css.setAll(bar, {
    position: 'absolute',
    left: x - w / 2 + 'px',
    top: y + 'px',
    height: h + 'px',
    width: w + 'px'
  });

  Attribute.setAll(bar, { 'data-column': column, 'role': 'presentation' });
  return bar;
};

const row = (r: number, x: number, y: number, w: number, h: number): SugarElement<HTMLDivElement> => {
  const bar = SugarElement.fromTag('div');
  Css.setAll(bar, {
    position: 'absolute',
    left: x + 'px',
    top: y - h / 2 + 'px',
    height: h + 'px',
    width: w + 'px'
  });

  Attribute.setAll(bar, { 'data-row': r, 'role': 'presentation' });
  return bar;
};

export {
  col,
  row
};
