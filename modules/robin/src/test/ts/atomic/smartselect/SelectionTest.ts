import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import * as Selection from 'ephox/robin/smartselect/Selection';
import { KAssert } from '@ephox/katamari-assertions';
import { Unicode } from '@ephox/katamari';

UnitTest.test('SelectionTest', function () {
  const doc1 = TestUniverse(Gene('root', 'root', [
    Gene('p1', 'p', [
      TextGene('a', 'There i'),
      TextGene('b', 's something'),
      TextGene('c', ' going on here that can'),
      TextGene('d', 'not be de'),
      TextGene('e', 'termined '),
      TextGene('f', 'and'),
      TextGene('g', ` it's driving me in`),
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

  const doc2 = TestUniverse(Gene('root', 'root', [
    TextGene('a', 'This is '),
    Gene('b', 'span', [
      TextGene('c', 'som')
    ]),
    TextGene('d', 'eth'),
    Gene('e', 'b', [
      TextGene('f', 'ing that you should')
    ]),
    TextGene('g', ' see.'),
    TextGene('h', 'plus again'),
    TextGene('i', Unicode.zeroWidth)
  ]));

  const doc3 = TestUniverse(Gene('root', 'root', [
    TextGene('a', ' \uFEFF'),
    TextGene('b', '\uFEFF\uFEFF'),
    TextGene('c', '\uFEFF ')
  ]));

  interface Expected {
    startContainer: string;
    startOffset: number;
    endContainer: string;
    endOffset: number;
  }

  const check = function (expected: Expected, doc: TestUniverse, id: string, offset: number) {
    const item = doc.find(doc.get(), id).getOrDie('Could not find item: ' + id);
    const actual = Selection.word(doc, item, offset).getOrDie('Selection for: (' + id + ', ' + offset + ') yielded nothing');
    Assert.eq('Selection for: (' + id + ', ' + offset + ') => startContainer', expected.startContainer, actual.startContainer().id);
    Assert.eq('Selection for: (' + id + ', ' + offset + ') => startOffset', expected.startOffset, actual.startOffset());
    Assert.eq('Selection for: (' + id + ', ' + offset + ') => endContainer', expected.endContainer, actual.endContainer().id);
    Assert.eq('Selection for: (' + id + ', ' + offset + ') => endOffset', expected.endOffset, actual.endOffset());
  };

  const checkNone = function (doc: TestUniverse, id: string, offset: number) {
    const actual = doc.find(doc.get(), id).bind((item) =>
      Selection.word(doc, item, offset)
    );
    KAssert.eqNone('eq', actual);
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
    startOffset: ` it's driving me `.length,
    endContainer: 'h',
    endOffset: 'sane'.length
  }, doc1, 'g', ` it's driving me i`.length);

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
  ])), 'alpha', Unicode.zeroWidth.length);

  checkNone(doc3, 'b', ''.length);
  checkNone(doc3, 'b', Unicode.zeroWidth.length);
  checkNone(doc3, 'b', '\uFEFF\uFEFF'.length);

  const doc4 = TestUniverse(Gene('root', 'root', [
    Gene('s1-fr', 'span', [
      TextGene('t1-fr', 'da'),
      TextGene('t2-fr', 'aa bo'),
      TextGene('t3-fr', 'dytag')
    ], {}, { lang: 'fr' }),
    Gene('s2-en', 'span', [
      TextGene('t4-en', 'span'),
      TextGene('t5-en', 'ning')
    ], {}, { lang: 'en' }),
    Gene('s3-en', 'span', [
      TextGene('t6-en', 'bound'),
      TextGene('t7-en', 'aries and'),
      TextGene('t8-en', 'more')
    ], {}, { lang: 'en' }),
    Gene('s4-de', 'span', [
      TextGene('t9-de', 'di'),
      TextGene('t10-de', 'ee '),
      TextGene('t11-de', ' der')
    ], {}, { lang: 'de' })
  ]));

  check({
    startContainer: 't1-fr',
    startOffset: ''.length,
    endContainer: 't2-fr',
    endOffset: 'aa'.length
  }, doc4, 't1-fr', 'd'.length);

  check({
    startContainer: 't1-fr',
    startOffset: ''.length,
    endContainer: 't2-fr',
    endOffset: 'aa'.length
  }, doc4, 't2-fr', 'a'.length);

  check({
    startContainer: 't2-fr',
    startOffset: 'aa '.length,
    endContainer: 't3-fr',
    endOffset: 'dytag'.length
  }, doc4, 't2-fr', 'aa b'.length);

  check({
    startContainer: 't2-fr',
    startOffset: 'aa '.length,
    endContainer: 't3-fr',
    endOffset: 'dytag'.length
  }, doc4, 't3-fr', 'aa b'.length);

  check({
    startContainer: 't4-en',
    startOffset: ''.length,
    endContainer: 't7-en',
    endOffset: 'aries'.length
  }, doc4, 't4-en', 's'.length);

  check({
    startContainer: 't4-en',
    startOffset: ''.length,
    endContainer: 't7-en',
    endOffset: 'aries'.length
  }, doc4, 't5-en', 'n'.length);

  check({
    startContainer: 't4-en',
    startOffset: ''.length,
    endContainer: 't7-en',
    endOffset: 'aries'.length
  }, doc4, 't6-en', 'bou'.length);

  check({
    startContainer: 't4-en',
    startOffset: ''.length,
    endContainer: 't7-en',
    endOffset: 'aries'.length
  }, doc4, 't7-en', 'ari'.length);

  check({
    startContainer: 't7-en',
    startOffset: 'aries '.length,
    endContainer: 't8-en',
    endOffset: 'more'.length
  }, doc4, 't7-en', 'aries an'.length);

  check({
    startContainer: 't7-en',
    startOffset: 'aries '.length,
    endContainer: 't8-en',
    endOffset: 'more'.length
  }, doc4, 't8-en', 'mo'.length);

  check({
    startContainer: 't9-de',
    startOffset: ''.length,
    endContainer: 't10-de',
    endOffset: 'ee'.length
  }, doc4, 't9-de', 'd'.length);

  check({
    startContainer: 't9-de',
    startOffset: ''.length,
    endContainer: 't10-de',
    endOffset: 'ee'.length
  }, doc4, 't10-de', 'e'.length);

  check({
    startContainer: 't11-de',
    startOffset: ' '.length,
    endContainer: 't11-de',
    endOffset: ' der'.length
  }, doc4, 't11-de', ' d'.length);
});
