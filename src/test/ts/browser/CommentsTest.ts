import { Option } from '@ephox/katamari';
import Comment from 'ephox/sugar/api/node/Comment';
import Comments from 'ephox/sugar/api/node/Comments';
import Element from 'ephox/sugar/api/node/Element';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('CommentsTest', function() {
  var testPage = Element.fromHtml('<div><!--one--></head><body><!--two--><p><!--three--></p></div>');

  var all  = Comments.find(testPage, Option.none());
  assert.eq(3, all.length);
  assert.eq('one', Comment.get(all[0]));
  assert.eq('two', Comment.get(all[1]));
  assert.eq('three', Comment.get(all[2]));

  var one = Comments.find(testPage, Option.some(function (value) { return value === 'one'; }));
  assert.eq(1, one.length);
  assert.eq('one', Comment.get(one[0]));
});

