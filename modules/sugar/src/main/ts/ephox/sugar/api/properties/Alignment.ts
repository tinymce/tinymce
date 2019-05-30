import * as Css from './Css';
import * as Direction from './Direction';
import * as Node from '../node/Node';
import Element from '../node/Element';

const normal = function (value: string) {
  return function (element: Element) {
    return value;
  };
};

const lookups = {
  'start': Direction.onDirection('left', 'right'),
  'end': Direction.onDirection('right', 'left'),
  'justify': normal('justify'),
  'center': normal('center'),
  'match-parent': normal('match-parent')
};

const getAlignment = function (element: Element, property: string): string {
  const raw = Css.get(element, property);
  return lookups[raw] !== undefined ? lookups[raw](element) : raw;
};

const hasAlignment = function (element: Element, property: string, value: string) {
  return Node.isText(element) ? false : getAlignment(element, property) === value;
};

export {
  hasAlignment
};