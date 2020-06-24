import { UnitTest, Assert } from '@ephox/bedrock-client';
import Element from 'ephox/sugar/api/node/Element';
import { tElement, eqElement } from 'ephox/sugar/test/ElementInstances';
import { Option, OptionInstances } from '@ephox/katamari';
import { HTMLDivElement, Element as DomElement } from '@ephox/dom-globals';

const tOption = OptionInstances.tOption;

UnitTest.test('Element testable/eq', () => {
  const span1: Element<DomElement> = Element.fromTag('span');
  Assert.eq('span === span', span1, span1, tElement<DomElement>());

  const span2 = Element.fromDom(span1.dom());
  Assert.eq('spans should be equal when they refer to the same underlying element', span1, span2, tElement<DomElement>());

  const span3 = Element.fromTag('span');
  Assert.eq('different spans should be inequal', false, tElement<DomElement>().eq(span1, span3));
  Assert.eq('different spans should be inequal', false, eqElement<DomElement>().eq(span1, span3));
});

UnitTest.test('TINY-6151: Element testable/eq - options', () => {
  const el1: Option<Element<HTMLDivElement>> = Option.some(Element.fromTag('div'));
  // Before TINY-6151, tElement was a value - a Testable<DomElement> - and statements like below wouldn't compile.
  // We changed it to be a polymorphic function.
  Assert.eq('same', el1, el1, tOption(tElement()));
});
