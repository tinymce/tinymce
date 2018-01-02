import Truncate from '../alien/Truncate';
import { Comment } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Text } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

var createTag = function (name) {
  var partial = name.split('-');
  var tag = partial.length > 0  ? partial[0] : name;
  return Element.fromTag(tag);
};

var comment = Jsc.string.smap(
  function (s) {
    var raw = document.createComment(s);
    return Element.fromDom(raw);
  },
  Comment.get,
  function (c) {
    return 'Comment[' + Comment.get(c) + ']';
  }
);

var elementOfArb = function (arb) {
  return arb.smap(createTag, Node.name, Truncate.getHtml);
};

var elementOf = function (tag) {
  return createTag(tag);
};

var textOfArb = function (arb) {
  return arb.smap(Element.fromText, Text.get, Text.get);
};

var textOf = function (s) {
  return Element.fromText(s);
};

export default {
  elementOfArb: elementOfArb,
  elementOf: elementOf,
  comment: comment,
  textOf: textOf,
  textOfArb: textOfArb
};