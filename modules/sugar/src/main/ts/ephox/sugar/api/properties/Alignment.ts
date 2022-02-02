import { Obj } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';
import * as Node from '../node/SugarNode';
import * as Css from './Css';
import * as Direction from './Direction';

type Alignment = 'left' | 'right' | 'justify' | 'center' | 'match-parent';

const normal = (value: Alignment) => (_element: SugarElement<Element>): Alignment =>
  value;

const lookups: Record<string, (element: SugarElement<Element>) => string> = {
  'start': Direction.onDirection<Alignment>('left', 'right'),
  'end': Direction.onDirection<Alignment>('right', 'left'),
  'justify': normal('justify'),
  'center': normal('center'),
  'match-parent': normal('match-parent')
};

const getAlignment = (element: SugarElement<Element>, property: string): string => {
  const raw = Css.get(element, property);
  return Obj.get(lookups, raw)
    .map((f) => f(element))
    .getOr(raw);
};

const hasAlignment = (element: SugarElement<Element> | SugarElement<Text>, property: string, value: string): boolean =>
  Node.isText(element) ? false : getAlignment(element, property) === value;

export {
  hasAlignment
};
