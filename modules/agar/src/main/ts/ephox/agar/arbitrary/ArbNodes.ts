import { document } from '@ephox/dom-globals';
import { Comment, Element, Node, Text } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

import * as Truncate from '../alien/Truncate';

const createTag = function (name) {
  const partial = name.split('-');
  const tag = partial.length > 0  ? partial[0] : name;
  return Element.fromTag(tag);
};

const comment = Jsc.string.smap(
  function (s) {
    const raw = document.createComment(s);
    return Element.fromDom(raw);
  },
  Comment.get,
  function (c) {
    return 'Comment[' + Comment.get(c) + ']';
  }
);

const elementOfArb = function (arb) {
  return arb.smap(createTag, Node.name, Truncate.getHtml);
};

const elementOf = function (tag) {
  return createTag(tag);
};

const textOfArb = function (arb) {
  return arb.smap(Element.fromText, Text.get, Text.get);
};

const textOf = function (s) {
  return Element.fromText(s);
};

export default {
  elementOfArb: elementOfArb,
  elementOf: elementOf,
  comment: comment,
  textOf: textOf,
  textOfArb: textOfArb
};