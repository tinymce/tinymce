import { assert, UnitTest } from '@ephox/bedrock-client';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import * as SugarText from 'ephox/sugar/api/node/SugarText';
import * as Traverse from 'ephox/sugar/api/search/Traverse';

UnitTest.test('TextTest', () => {
  const ensureClobberedTextNodeDoesNotThrow = () => {
    const span = SugarElement.fromHtml<HTMLSpanElement>('<span>hi</span>');
    Traverse.child(span, 0).filter(SugarNode.isText).each((text0) => {
      span.dom.innerHTML = 'smashed';
      const v = SugarText.get(text0); // Throws in IE10.
      assert.eq('string', typeof v);
    });
  };

  ensureClobberedTextNodeDoesNotThrow();

  const notText = SugarElement.fromTag('span');
  const t = SugarElement.fromText('a');
  assert.eq('a', SugarText.get(t));
  SugarText.set(t, 'blue');
  assert.eq('blue', t.dom.nodeValue);

  try {
    SugarText.get(notText as any);
    assert.fail('get on non-text did not throw');
  } catch (e) {
    // pass
  }

  try {
    SugarText.set(notText as any, 'bogus');
    assert.fail('set on non-text did not throw');
  } catch (e) {
    // pass
  }
});
