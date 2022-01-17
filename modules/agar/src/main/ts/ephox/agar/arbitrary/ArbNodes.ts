import { SugarElement } from '@ephox/sugar';
import * as fc from 'fast-check';

const createTag = <T extends HTMLElement>(name: string): SugarElement<T> => {
  const partial = name.split('-');
  const tag = partial.length > 0 ? partial[0] : name;
  return SugarElement.fromTag(tag) as SugarElement<T>;
};

const comment = fc.string()
  .map((s) => {
    const raw = document.createComment(s);
    return SugarElement.fromDom(raw);
  });

const elementOfArb = <T extends HTMLElement>(arb: fc.Arbitrary<string>): fc.Arbitrary<SugarElement<T>> =>
  arb.map((name) => createTag<T>(name));

const elementOf = <T extends HTMLElement>(tag: string): SugarElement<T> =>
  createTag<T>(tag);

const textOfArb = (arb: fc.Arbitrary<string>): fc.Arbitrary<SugarElement<Text>> =>
  arb.map(SugarElement.fromText);

const textOf = (s: string): SugarElement<Text> =>
  SugarElement.fromText(s);

export {
  elementOfArb,
  elementOf,
  comment,
  textOf,
  textOfArb
};
