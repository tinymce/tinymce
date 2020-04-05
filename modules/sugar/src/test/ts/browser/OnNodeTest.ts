import { assert, UnitTest } from '@ephox/bedrock-client';
import Element from 'ephox/sugar/api/node/Element';
import * as OnNode from 'ephox/sugar/api/properties/OnNode';

UnitTest.test('OnNodeTest', () => {
  const element = Element.fromTag('div');

  const addAlpha = OnNode.addClass('alpha');
  const addBeta = OnNode.addClass('beta');
  const removeAll = OnNode.removeClasses([ 'alpha', 'beta' ]);
  const removeAlpha = OnNode.removeClass('alpha');
  const hasAlpha = OnNode.hasClass('alpha');
  const hasBeta = OnNode.hasClass('beta');

  assert.eq(false, hasAlpha(element));
  addAlpha(element);
  assert.eq(true, hasAlpha(element));
  assert.eq(false, hasBeta(element));
  removeAlpha(element);
  assert.eq(false, hasAlpha(element));
  addAlpha(element);
  assert.eq(true, hasAlpha(element));
  addBeta(element);
  assert.eq(true, hasBeta(element));
  removeAll(element);
  assert.eq(false, hasAlpha(element));
  assert.eq(false, hasBeta(element));
});
