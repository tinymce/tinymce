import * as Css from './Css';
import * as Direction from './Direction';
import * as Node from '../node/Node';
import Element from '../node/Element';
import { Node as DomNode, Element as DomElement } from '@ephox/dom-globals';

type Alignment = 'left' | 'right' | 'justify' | 'center' | 'match-parent';

const normal = function (value: Alignment) {
  return function (_element: Element<DomElement>) {
    return value;
  };
};

const lookups = {
  'start': Direction.onDirection<Alignment>('left', 'right'),
  'end': Direction.onDirection<Alignment>('right', 'left'),
  'justify': normal('justify'),
  'center': normal('center'),
  'match-parent': normal('match-parent')
};

const getAlignment = function (element: Element<DomElement>, property: string): string {
  const raw = Css.get(element, property);
  return lookups[raw] !== undefined ? lookups[raw](element) : raw;
};

const hasAlignment = function (element: Element<DomElement>, property: string, value: string) {
  return Node.isText(element) ? false : getAlignment(element, property) === value;
};

export {
  hasAlignment
};