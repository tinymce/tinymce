import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as SugarComment from 'ephox/sugar/api/node/SugarComment';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import * as Traverse from 'ephox/sugar/api/search/Traverse';

UnitTest.test('CommentTest', () => {
  const ensureClobberedTextNodeDoesNotThrow = () => {
    const span = SugarElement.fromHtml<HTMLSpanElement>('<span><!--a--></span>');
    Traverse.child(span, 0).filter(SugarNode.isComment).each((text0) => {
      span.dom.innerHTML = 'smashed';
      const v = SugarComment.get(text0); // Throws in IE10.
      Assert.eq('', 'string', typeof v);
    });
  };

  ensureClobberedTextNodeDoesNotThrow();

  const notComment = SugarElement.fromTag('span');
  const c = SugarElement.fromHtml<Comment>('<!--a-->');
  Assert.eq('', 'a', SugarComment.get(c));
  SugarComment.set(c, 'blue');
  Assert.eq('', 'blue', c.dom.nodeValue);

  try {
    SugarComment.get(notComment as any);
    Assert.fail('get on non-comment did not throw');
  } catch (e) {
    // pass
  }

  try {
    SugarComment.set(notComment as any, 'bogus');
    Assert.fail('set on non-comment did not throw');
  } catch (e) {
    // pass
  }
});
