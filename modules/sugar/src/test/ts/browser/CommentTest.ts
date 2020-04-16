import { assert, UnitTest } from '@ephox/bedrock-client';
import { Comment as DomComment, HTMLSpanElement } from '@ephox/dom-globals';
import * as Comment from 'ephox/sugar/api/node/Comment';
import Element from 'ephox/sugar/api/node/Element';
import * as Node from 'ephox/sugar/api/node/Node';
import * as Traverse from 'ephox/sugar/api/search/Traverse';

UnitTest.test('CommentTest', () => {
  const ensureClobberedTextNodeDoesNotThrow = () => {
    const span = Element.fromHtml<HTMLSpanElement>('<span><!--a--></span>');
    Traverse.child(span, 0).filter(Node.isComment).each((text0) => {
      span.dom().innerHTML = 'smashed';
      const v = Comment.get(text0); // Throws in IE10.
      assert.eq('string', typeof(v));
    });
  };

  ensureClobberedTextNodeDoesNotThrow();

  const notComment = Element.fromTag('span');
  const c = Element.fromHtml<DomComment>('<!--a-->');
  assert.eq('a', Comment.get(c));
  Comment.set(c, 'blue');
  assert.eq('blue', c.dom().nodeValue);

  try {
    Comment.get(notComment as any);
    assert.fail('get on non-comment did not throw');
  } catch (e) {
    // pass
  }

  try {
    Comment.set(notComment as any, 'bogus');
    assert.fail('set on non-comment did not throw');
  } catch (e) {
    // pass
  }
});
