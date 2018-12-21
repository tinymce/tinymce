import Element from 'ephox/sugar/api/node/Element';
import * as Text from 'ephox/sugar/api/node/Text';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('TextTest', function () {
  const ensureClobberedTextNodeDoesNotThrow = function () {
    const span = Element.fromHtml('<span>hi</span>');
    Traverse.child(span, 0).each(function (text0) {
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
    Text.get(notText);
    assert.fail('get on non-text did not throw');
  } catch (e) {
    // pass
  }

  try {
    Text.set(notText, 'bogus');
    assert.fail('set on non-text did not throw');
  } catch (e) {
    // pass
  }
});
