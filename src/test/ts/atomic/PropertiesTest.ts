import CommentGene from 'ephox/boss/api/CommentGene';
import Gene from 'ephox/boss/api/Gene';
import TextGene from 'ephox/boss/api/TextGene';
import Properties from 'ephox/boss/mutant/Properties';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('PropertiesTest', function() {
  var g = Gene('root', 'root', []);
  var t = TextGene('-gene-', 'post-image text');
  var c = CommentGene('-comment-', 'comment');

  var check = function (expected, element, pred) {
    assert.eq(expected, pred(element));
  };

  check(true,  g, Properties.isElement);
  check(false, t, Properties.isElement);
  check(false, c, Properties.isElement);

  check(false, g, Properties.isText);
  check(true,  t, Properties.isText);
  check(false, c, Properties.isText);

  check(false, g, Properties.isComment);
  check(false, t, Properties.isComment);
  check(true,  c, Properties.isComment);
});

