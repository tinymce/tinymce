import { Assert, assert, UnitTest } from '@ephox/bedrock-client';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Focus from 'ephox/sugar/api/dom/Focus';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import { withShadowElement } from 'ephox/sugar/test/WithHelpers';
import { Option, OptionInstances } from '@ephox/katamari';
import { tElement } from 'ephox/sugar/test/ElementInstances';
import { HTMLElement } from '@ephox/dom-globals';

const tOption = OptionInstances.tOption;

UnitTest.test('FocusTest', () => {
  const div = Element.fromTag('div');
  Attr.set(div, 'tabindex', '-1');

  const input = Element.fromTag('input');

  Insert.append(div, input);
  Insert.append(Body.body(), div);

  Focus.focus(input);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focus(div);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), div));
  Focus.focus(input);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focusInside(div);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focusInside(input);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focus(div);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), div));

  Remove.remove(div);
});

UnitTest.test('Focus.active in ShadowRoot', () => {
  withShadowElement((sr, id, sh) => {
    const innerInput: Element<HTMLElement> = Element.fromTag('input');
    Insert.append(sr, innerInput);

    const outerInput: Element<HTMLElement> = Element.fromTag('input');
    Insert.append(Body.body(), outerInput);

    Focus.focus(innerInput);
    Assert.eq('ShadowRoot\'s active element is the inner input box', Focus.active(sr), Option.some(innerInput), tOption(tElement()));
    Assert.eq('Document\'s active element is the shadow host', Focus.active(), Option.some(sh), tOption(tElement()));

    Focus.focus(outerInput);
    Assert.eq('ShadowRoot\'s active element should be none', Focus.active(sr), Option.none(), tOption(tElement()));
    Assert.eq('Document\'s active element is the outer input box', Focus.active(), Option.some(outerInput), tOption(tElement()));

    Remove.remove(outerInput);
  });
});

UnitTest.test('Focus.search in ShadowRoot', () => {
  withShadowElement((sr, id, sh) => {
    const innerInput: Element<HTMLElement> = Element.fromTag('input');
    Insert.append(id, innerInput);

    const outerInput: Element<HTMLElement> = Element.fromTag('input');
    Insert.append(Body.body(), outerInput);

    Focus.focus(innerInput);
    Assert.eq('Searching from div inside shadow root should yield focused input box', Focus.search(id), Option.some(innerInput), tOption(tElement()));
    Assert.eq('Searching from shadow root should yield focused input box', Focus.search(sr), Option.some(innerInput), tOption(tElement()));
    Assert.eq('Searching from shadow host should yield shadow host', Focus.search(sh), Option.some(sh), tOption(tElement()));
    Assert.eq('Searching from body should yield shadow host', Focus.search(Body.body()), Option.some(sh), tOption(tElement()));

    Focus.focus(outerInput);
    Assert.eq('Searching from div inside shadow root should yield none', Focus.search(id), Option.none(), tOption(tElement()));
    Assert.eq('Searching from shadow root should yield none', Focus.search(sr), Option.none(), tOption(tElement()));
    Assert.eq('Searching from shadow host should yield none', Focus.search(sh), Option.none(), tOption(tElement()));
    Assert.eq('Searching from body should yield outer input box', Focus.search(Body.body()), Option.some(outerInput), tOption(tElement()));

    Remove.remove(outerInput);
  });
});

UnitTest.test('Focus.hasFocus in ShadowRoot', () => {
  withShadowElement((shadowRoot, innerDiv, shadowHost) => {
    const innerInput: Element<HTMLElement> = Element.fromTag('input');
    Insert.append(innerDiv, innerInput);

    const outerInput: Element<HTMLElement> = Element.fromTag('input');
    Insert.append(Body.body(), outerInput);

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
    const innerInput: Element<HTMLElement> = Element.fromTag('input');
    Insert.append(innerDiv, innerInput);

    Attr.set(innerDiv, 'tabindex', '-1');

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
