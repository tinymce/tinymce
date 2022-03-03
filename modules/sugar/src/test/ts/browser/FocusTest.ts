import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional, OptionalInstances } from '@ephox/katamari';

import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Focus from 'ephox/sugar/api/dom/Focus';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import { tElement } from 'ephox/sugar/api/node/SugarElementInstances';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import { withShadowElement } from 'ephox/sugar/test/WithHelpers';

const tOptional = OptionalInstances.tOptional;

UnitTest.test('FocusTest', () => {
  const div = SugarElement.fromTag('div');
  Attribute.set(div, 'tabindex', '-1');

  const input = SugarElement.fromTag('input');

  Insert.append(div, input);
  Insert.append(SugarBody.body(), div);

  Focus.focus(input);
  Assert.eq('', true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focus(div);
  Assert.eq('', true, Compare.eq(Focus.active().getOrDie(), div));
  Focus.focus(input);
  Assert.eq('', true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focusInside(div);
  Assert.eq('', true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focusInside(input);
  Assert.eq('', true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focus(div);
  Assert.eq('', true, Compare.eq(Focus.active().getOrDie(), div));

  Remove.remove(div);
});

UnitTest.test('Focus.active in ShadowRoot', () => {
  withShadowElement((sr, id, sh) => {
    const innerInput: SugarElement<HTMLElement> = SugarElement.fromTag('input');
    Insert.append(sr, innerInput);

    const outerInput: SugarElement<HTMLElement> = SugarElement.fromTag('input');
    Insert.append(SugarBody.body(), outerInput);

    Focus.focus(innerInput);
    Assert.eq('ShadowRoot\'s active element is the inner input box', Focus.active(sr), Optional.some(innerInput), tOptional(tElement()));
    Assert.eq('Document\'s active element is the shadow host', Focus.active(), Optional.some(sh), tOptional(tElement()));

    Focus.focus(outerInput);
    Assert.eq('ShadowRoot\'s active element should be none', Focus.active(sr), Optional.none(), tOptional(tElement()));
    Assert.eq('Document\'s active element is the outer input box', Focus.active(), Optional.some(outerInput), tOptional(tElement()));

    Remove.remove(outerInput);
  });
});

UnitTest.test('Focus.search in ShadowRoot', () => {
  withShadowElement((sr, id, sh) => {
    const innerInput: SugarElement<HTMLElement> = SugarElement.fromTag('input');
    Insert.append(id, innerInput);

    const outerInput: SugarElement<HTMLElement> = SugarElement.fromTag('input');
    Insert.append(SugarBody.body(), outerInput);

    Focus.focus(innerInput);
    Assert.eq('Searching from div inside shadow root should yield focused input box', Focus.search(id), Optional.some(innerInput), tOptional(tElement()));
    Assert.eq('Searching from shadow root should yield focused input box', Focus.search(sr), Optional.some(innerInput), tOptional(tElement()));
    Assert.eq('Searching from shadow host should yield shadow host', Focus.search(sh), Optional.some(sh), tOptional(tElement()));
    Assert.eq('Searching from body should yield shadow host', Focus.search(SugarBody.body()), Optional.some(sh), tOptional(tElement()));

    Focus.focus(outerInput);
    Assert.eq('Searching from div inside shadow root should yield none', Focus.search(id), Optional.none(), tOptional(tElement()));
    Assert.eq('Searching from shadow root should yield none', Focus.search(sr), Optional.none(), tOptional(tElement()));
    Assert.eq('Searching from shadow host should yield none', Focus.search(sh), Optional.none(), tOptional(tElement()));
    Assert.eq('Searching from body should yield outer input box', Focus.search(SugarBody.body()), Optional.some(outerInput), tOptional(tElement()));

    Remove.remove(outerInput);
  });
});

UnitTest.test('Focus.hasFocus in ShadowRoot', () => {
  withShadowElement((shadowRoot, innerDiv, shadowHost) => {
    const innerInput: SugarElement<HTMLElement> = SugarElement.fromTag('input');
    Insert.append(innerDiv, innerInput);

    const outerInput: SugarElement<HTMLElement> = SugarElement.fromTag('input');
    Insert.append(SugarBody.body(), outerInput);

    Focus.focus(innerInput);
    Assert.eq('innerInput should have focus', true, Focus.hasFocus(innerInput));
    Assert.eq('shadowHost should have focus', true, Focus.hasFocus(shadowHost));
    Assert.eq('innerDiv should not have focus', false, Focus.hasFocus(innerDiv));
    Assert.eq('outerInput should not have focus', false, Focus.hasFocus(outerInput));
    Assert.eq('shadowRoot should not have focus', false, Focus.hasFocus(shadowRoot));

    Focus.focus(outerInput);
    Assert.eq('innerInput should not have focus', false, Focus.hasFocus(innerInput));
    Assert.eq('shadowHost should not have focus', false, Focus.hasFocus(shadowHost));
    Assert.eq('innerDiv should not have focus', false, Focus.hasFocus(innerDiv));
    Assert.eq('outerInput should have focus', true, Focus.hasFocus(outerInput));
    Assert.eq('shadowRoot should not have focus', false, Focus.hasFocus(shadowRoot));

    Remove.remove(outerInput);
  });
});

UnitTest.test('Focus.focusInside in ShadowRoot', () => {
  withShadowElement((shadowRoot, innerDiv, shadowHost) => {
    const innerInput: SugarElement<HTMLElement> = SugarElement.fromTag('input');
    Insert.append(innerDiv, innerInput);

    Attribute.set(innerDiv, 'tabindex', '-1');

    Focus.focus(innerInput);
    Assert.eq('innerInput should have focus', true, Focus.hasFocus(innerInput));
    Assert.eq('innerDiv should not have focus', false, Focus.hasFocus(innerDiv));
    Assert.eq('shadowHost should have focus', true, Focus.hasFocus(shadowHost));

    Focus.focusInside(innerDiv);
    Assert.eq('innerInput should have focus', true, Focus.hasFocus(innerInput));
    Assert.eq('innerDiv should not have focus', false, Focus.hasFocus(innerDiv));
    Assert.eq('shadowHost should have focus', true, Focus.hasFocus(shadowHost));

    Focus.focus(innerDiv);
    Assert.eq('innerInput should not have focus', false, Focus.hasFocus(innerInput));
    Assert.eq('innerDiv should have focus', true, Focus.hasFocus(innerDiv));
    Assert.eq('shadowHost should have focus', true, Focus.hasFocus(shadowHost));

  });
});
