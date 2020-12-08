import { SugarComment, SugarElement, SugarNode, SugarText, Truncate } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const createTag = (name: string): SugarElement<any> => {
  const partial = name.split('-');
  const tag = partial.length > 0 ? partial[0] : name;
  return SugarElement.fromTag(tag);
};

const comment = Jsc.string.smap(
  (s) => {
    const raw = document.createComment(s);
    return SugarElement.fromDom(raw);
  },
  SugarComment.get,
  (c) => 'Comment[' + SugarComment.get(c) + ']'
);

const elementOfArb = (arb) =>
  arb.smap(createTag, SugarNode.name, Truncate.getHtml);

const elementOf = (tag) =>
  createTag(tag);

const textOfArb = (arb) =>
  arb.smap(SugarElement.fromText, SugarText.get, SugarText.get);

const textOf = (s: string) =>
  SugarElement.fromText(s);

export {
  elementOfArb,
  elementOf,
  comment,
  textOf,
  textOfArb
};
