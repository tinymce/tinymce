import { Element as DomElement, Text } from '@ephox/dom-globals';
import { Obj } from '@ephox/katamari';
import Element from '../node/Element';
import * as Node from '../node/Node';
import * as Css from './Css';
import * as Direction from './Direction';

type Alignment = 'left' | 'right' | 'justify' | 'center' | 'match-parent';

const normal = (value: Alignment) => (_element: Element<DomElement>) => value;

const lookups: Record<string, (element: Element<DomElement>) => string> = {
  'start': Direction.onDirection<Alignment>('left', 'right'),
  'end': Direction.onDirection<Alignment>('right', 'left'),
  'justify': normal('justify'),
  'center': normal('center'),
  'match-parent': normal('match-parent')
};

const getAlignment = (element: Element<DomElement>, property: string): string => {
  const raw = Css.get(element, property);
  return Obj.get(lookups, raw)
    .map((f) => f(element))
    .getOr(raw);
};

const hasAlignment = (element: Element<DomElement> | Element<Text>, property: string, value: string) =>
  Node.isText(element) ? false : getAlignment(element, property) === value;

export {
  hasAlignment
};
