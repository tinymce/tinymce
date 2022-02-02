import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional, OptionalInstances } from '@ephox/katamari';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import { eqElement, tElement } from 'ephox/sugar/api/node/SugarElementInstances';

const tOptional = OptionalInstances.tOptional;

UnitTest.test('SugarElement testable/eq', () => {
  const span1: SugarElement<Element> = SugarElement.fromTag('span');
  Assert.eq('span === span', span1, span1, tElement<Element>());

  const span2 = SugarElement.fromDom(span1.dom);
  Assert.eq('spans should be equal when they refer to the same underlying element', span1, span2, tElement<Element>());

  const span3 = SugarElement.fromTag('span');
  Assert.eq('different spans should be inequal', false, tElement<Element>().eq(span1, span3));
  Assert.eq('different spans should be inequal', false, eqElement<Element>().eq(span1, span3));
});

UnitTest.test('TINY-6151: SugarElement testable/eq - options', () => {
  const el1: Optional<SugarElement<HTMLDivElement>> = Optional.some(SugarElement.fromTag('div'));
  // Before TINY-6151, tElement was a value - a Testable<DomElement> - and statements like below wouldn't compile.
  // We changed it to be a polymorphic function.
  Assert.eq('same', el1, el1, tOptional(tElement()));
});
