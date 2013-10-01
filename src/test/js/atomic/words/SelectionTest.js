test(
  'SelectionTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.robin.words.Selection'
  ],

  function (Gene, TestUniverse, TextGene, Selection) {
    var doc = TestUniverse(Gene('root', 'root', [
      Gene('p1', 'p', [
        TextGene('a', 'There i'),
        TextGene('b', 's something'),
        TextGene('c', ' going on here that can'),
        TextGene('d', 'not be de'),
        TextGene('e', 'termined '),
        TextGene('f', 'and'),
        TextGene('g', ' it\'s driving me in'),
        Gene('s1', 'span', [
          TextGene('h', 'sane')
        ]),
        Gene('image', 'img', []),
        TextGene('i', 'again.')
      ]),
      Gene('p2', 'p', [
        TextGene('j', 'What now?')
      ])
    ]));

    var check = function (expected, id, offset) {
      var item = doc.find(doc.get(), id).getOrDie();
      var actual = Selection.current(doc, item, offset);
      assert.eq(expected.startContainer, actual.startContainer().id);
      assert.eq(expected.startOffset, actual.startOffset());
      assert.eq(expected.endContainer, actual.endContainer().id);
      assert.eq(expected.endOffset, actual.endOffset());
    };

    // check({
    //   startContainer: 'b',
    //   startOffset: 's '.length,
    //   endContainer: 'b',
    //   endOffset: 's something'.length
    // }, 'b', 's so'.length);
  }
);
