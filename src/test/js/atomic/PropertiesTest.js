test(
  'PropertiesTest',

  [
    'ephox.boss.api.CommentGene',
    'ephox.boss.api.Gene',
    'ephox.boss.api.TextGene',
    'ephox.boss.mutant.Properties'
  ],

  function (CommentGene, Gene, TextGene, Properties) {
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

  }
);
