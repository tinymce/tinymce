import { assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import * as SugarComment from 'ephox/sugar/api/node/SugarComment';
import * as SugarComments from 'ephox/sugar/api/node/SugarComments';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';

UnitTest.test('CommentsTest', () => {
  const testPage = SugarElement.fromHtml('<div><!--one--></head><body><!--two--><p><!--three--></p></div>');

  const all = SugarComments.find(testPage, Optional.none());
  assert.eq(3, all.length);
  assert.eq('one', SugarComment.get(all[0]));
  assert.eq('two', SugarComment.get(all[1]));
  assert.eq('three', SugarComment.get(all[2]));

  const one = SugarComments.find(testPage, Optional.some((value) => value === 'one'));
  assert.eq(1, one.length);
  assert.eq('one', SugarComment.get(one[0]));
});
