test(
  'SelectionTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.robin.smartselect.Selection'
  ],

  function (Gene, TestUniverse, TextGene, Selection) {
    var doc1 = TestUniverse(Gene('root', 'root', [
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

    var doc2 = TestUniverse(Gene('root', 'root', [
      TextGene('a', 'This is '),
      Gene('b', 'span', [
        TextGene('c', 'som'),
      ]),
      TextGene('d', 'eth'),
      Gene('e', 'b', [
        TextGene('f', 'ing that you should')
      ]),
      TextGene('g', ' see.'),
      TextGene('h', 'plus again'),
      TextGene('i', '\uFEFF')
    ]));

    var check = function (expected, doc, id, offset) {
      var item = doc.find(doc.get(), id).getOrDie();
      var actual = Selection.word(doc, item, offset).getOrDie();
      assert.eq(expected.startContainer, actual.startContainer().id);
      assert.eq(expected.startOffset, actual.startOffset());
      assert.eq(expected.endContainer, actual.endContainer().id);
      assert.eq(expected.endOffset, actual.endOffset());
    };

    var checkNone = function (doc, id, offset) {
      var item = doc.find(doc.get(), id).getOrDie();
      var actual = Selection.word(doc, item, offset);
      assert.eq(true, actual.isNone());
    };

    check({
      startContainer: 'b',
      startOffset: 's '.length,
      // Note, this changed to end of node rather than start of new node.
      endContainer: 'b',
      endOffset: 's something'.length
    }, doc1, 'b', 's so'.length);

    check({
      startContainer: 'c',
      startOffset: ' going on '.length,
      endContainer: 'c',
      endOffset: ' going on here'.length
    }, doc1, 'c', ' going on he'.length);

    check({
      startContainer: 'a',
      startOffset: 'There '.length,
      endContainer: 'b',
      endOffset: 's'.length
    }, doc1, 'b', ''.length);

    check({
      startContainer: 'd',
      startOffset: 'not be '.length,
      endContainer: 'e',
      endOffset: 'termined'.length
    }, doc1, 'e', 'term'.length);

    check({
      startContainer: 'g',
      startOffset: ' it\'s driving me '.length,
      endContainer: 'h',
      endOffset: 'sane'.length
    }, doc1, 'g', ' it\'s driving me i'.length);

    check({
      startContainer: 'c',
      startOffset: ''.length,
      endContainer: 'f',
      endOffset: 'ing'.length
    }, doc2, 'f', 'i'.length);

    checkNone(doc2, 'f', 'ing that you should'.length);

    checkNone(doc2, 'b', 0);

    checkNone(doc2, 'h', 'plus again'.length);

    checkNone(TestUniverse(Gene('root', 'root', [
      TextGene('alpha', '\uFEFFfeff')
    ])), 'alpha', '\uFEFF'.length);
  }
);
