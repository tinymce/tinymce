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
      TextGene('g', ' see.')
    ]));

    var check = function (expected, doc, id, offset) {
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
      startContainer: 'a',
      startOffset: 'This is '.length,
      endContainer: 'f',
      endOffset: 'ing'.length
    }, doc2, 'f', 'i'.length);

    check({
      startContainer: 'f',
      startOffset: 'ing that you should'.length,
      endContainer: 'f',
      endOffset: 'ing that you should'.length
    }, doc2, 'f', 'ing that you should'.length);
  }
);
