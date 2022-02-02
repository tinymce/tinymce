import { Arr } from '@ephox/katamari';

import * as Traverse from '../search/Traverse';
import { SugarElement } from './SugarElement';

type ElementTuple<T> = { [K in keyof T]: SugarElement<T[K]> };

const fromHtml = <T extends Node[]> (html: string, scope?: Document | null): ElementTuple<T> => {
  const doc: Document = scope || document;
  const div = doc.createElement('div');
  div.innerHTML = html;
  return Traverse.children(SugarElement.fromDom(div)) as unknown as ElementTuple<T>;
};

const fromTags = (tags: string[], scope?: Document | null): SugarElement<HTMLElement>[] =>
  Arr.map(tags, (x) => SugarElement.fromTag(x, scope));

const fromText = (texts: string[], scope?: Document | null): SugarElement<Text>[] =>
  Arr.map(texts, (x) => SugarElement.fromText(x, scope));

const fromDom = <T extends (Node | Window)>(nodes: ArrayLike<T>): SugarElement<T>[] =>
  Arr.map(nodes, SugarElement.fromDom);

export { fromHtml, fromTags, fromText, fromDom };
