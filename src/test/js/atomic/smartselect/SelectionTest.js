test(
  'SelectionTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.robin.smartselect.Selection'
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
      console.log('checking: ', expected);
      var item = doc.find(doc.get(), id).getOrDie();
      var actual = Selection.word(doc, item, offset);
      assert.eq(expected.startContainer, actual.startContainer().id);
      assert.eq(expected.startOffset, actual.startOffset());
      assert.eq(expected.endContainer, actual.endContainer().id);
      assert.eq(expected.endOffset, actual.endOffset());
    };

    check({
      startContainer: 'b',
      startOffset: 's '.length,
      endContainer: 'c',
      endOffset: ''.length
    }, 'b', 's so'.length);

    check({
      startContainer: 'c',
      startOffset: ' going on '.length,
      endContainer: 'c',
      endOffset: ' going on here'.length
    }, 'c', ' going on he'.length);

    check({
      startContainer: 'a',
      startOffset: 'There '.length,
      endContainer: 'b',
      endOffset: 's'.length
    }, 'b', ''.length);

    check({
      startContainer: 'd',
      startOffset: 'not be '.length,
      endContainer: 'e',
      endOffset: 'termined'.length
    }, 'e', 'term'.length);

    check({
      startContainer: 'g',
      startOffset: ' it\'s driving me '.length,
      endContainer: 'h',
      endOffset: 'sane'.length
    }, 'g', ' it\'s driving me i'.length);
  }
);
