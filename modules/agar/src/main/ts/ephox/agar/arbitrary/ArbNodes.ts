import { document } from '@ephox/dom-globals';
import { Comment, Element, Node, Text } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

import * as Truncate from '../alien/Truncate';

const createTag = (name): Element<any> => {
  const partial = name.split('-');
  const tag = partial.length > 0  ? partial[0] : name;
  return Element.fromTag(tag);
};

const comment = Jsc.string.smap(
  (s) => {
    const raw = document.createComment(s);
    return Element.fromDom(raw);
  },
  Comment.get,
  (c) => 'Comment[' + Comment.get(c) + ']'
);

const elementOfArb = (arb) =>
  arb.smap(createTag, Node.name, Truncate.getHtml);

const elementOf = (tag) =>
  createTag(tag);

const textOfArb = (arb) =>
  arb.smap(Element.fromText, Text.get, Text.get);

const textOf = (s) =>
  Element.fromText(s);

export {
  elementOfArb,
  elementOf,
  comment,
  textOf,
  textOfArb
};
