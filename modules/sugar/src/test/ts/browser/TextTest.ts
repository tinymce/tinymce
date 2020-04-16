import { assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLSpanElement } from '@ephox/dom-globals';
import Element from 'ephox/sugar/api/node/Element';
import * as Node from 'ephox/sugar/api/node/Node';
import * as Text from 'ephox/sugar/api/node/Text';
import * as Traverse from 'ephox/sugar/api/search/Traverse';

UnitTest.test('TextTest', () => {
  const ensureClobberedTextNodeDoesNotThrow = () => {
    const span = Element.fromHtml<HTMLSpanElement>('<span>hi</span>');
    Traverse.child(span, 0).filter(Node.isText).each((text0) => {
      span.dom().innerHTML = 'smashed';
      const v = Text.get(text0); // Throws in IE10.
      assert.eq('string', typeof(v));
    });
  };

  ensureClobberedTextNodeDoesNotThrow();

  const notText = Element.fromTag('span');
  const t = Element.fromText('a');
  assert.eq('a', Text.get(t));
  Text.set(t, 'blue');
  assert.eq('blue', t.dom().nodeValue);

  try {
    Text.get(notText as any);
    assert.fail('get on non-text did not throw');
  } catch (e) {
    // pass
  }

  try {
    Text.set(notText as any, 'bogus');
    assert.fail('set on non-text did not throw');
  } catch (e) {
    // pass
  }
});
