import { SimRange, SugarElement } from '@ephox/sugar';

export interface TinyDom {
  fromDom: (elm: Node) => SugarElement;
  fromRange: (rng: Range) => SimRange;
}

const fromDom = (elm: Node): SugarElement<Node> =>
  SugarElement.fromDom(elm);

const fromRange = (rng: Range): SimRange =>
  SimRange.create(
    SugarElement.fromDom(rng.startContainer),
    rng.startOffset,
    SugarElement.fromDom(rng.endContainer), rng.endOffset
  );

export const TinyDom: TinyDom = {
  fromDom,
  fromRange
};
