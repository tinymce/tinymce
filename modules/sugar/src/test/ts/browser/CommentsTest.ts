import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as SugarComment from 'ephox/sugar/api/node/SugarComment';
import * as SugarComments from 'ephox/sugar/api/node/SugarComments';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';

UnitTest.test('CommentsTest', () => {
  const testPage = SugarElement.fromHtml('<div><!--one--></head><body><!--two--><p><!--three--></p></div>');

  const all = SugarComments.find(testPage, Optional.none());
  Assert.eq('', 3, all.length);
  Assert.eq('', 'one', SugarComment.get(all[0]));
  Assert.eq('', 'two', SugarComment.get(all[1]));
  Assert.eq('', 'three', SugarComment.get(all[2]));

  const one = SugarComments.find(testPage, Optional.some((value) => value === 'one'));
  Assert.eq('', 1, one.length);
  Assert.eq('', 'one', SugarComment.get(one[0]));
});
