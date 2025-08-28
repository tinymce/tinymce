import fc, { Arbitrary } from 'fast-check';

export const htmlBlockTagName = (): Arbitrary<string> =>
  // note: list is incomplete
  fc.constantFrom('div', 'article', 'section', 'main', 'h1', 'h2', 'h3', 'aside', 'nav');

export const htmlInlineTagName = (): Arbitrary<string> =>
  // note: list is incomplete
  fc.constantFrom('span', 'b', 'i', 'u', 'strong', 'em');
