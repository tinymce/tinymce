import CommentGene from 'ephox/boss/api/CommentGene';
import { Gene } from 'ephox/boss/api/Gene';
import { TextGene } from 'ephox/boss/api/TextGene';
import Properties from 'ephox/boss/mutant/Properties';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('PropertiesTest', function() {
  const g = Gene('root', 'root', []);
  const t = TextGene('-gene-', 'post-image text');
  const c = CommentGene('-comment-', 'comment');

  const check = function (expected: boolean, element: Gene, pred: (e: Gene) => boolean) {
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

