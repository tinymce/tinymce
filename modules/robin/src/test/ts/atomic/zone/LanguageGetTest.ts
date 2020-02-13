import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import { LanguageZones } from 'ephox/robin/zone/LanguageZones';

UnitTest.test('LanguageGetTest', function () {
  const check = function (doc: TestUniverse, id: string, lang: Option<string>) {
    const item = doc.find(doc.get(), id).getOrDie();
    const itemLang = LanguageZones.calculate(doc, item);
    Assert.eq(
      () => 'check lang(). Expected: ' + lang.getOr('none') + ', actual: ' + itemLang.getOr('none'),
      true,
      lang.equals(itemLang)
    );
  };

  const doc = TestUniverse(
    Gene('root', 'root', [
      // <p id=p1> <span1> "sp" <span2> "l" <span3 lang=FR> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
      Gene('p1', 'p', [
        Gene('p1s1', 'span', [
          TextGene('p1sp', 'sp'),
          Gene('p1s2', 'span', [
            TextGene('p1l', 'l'),
            Gene('p1s3', 'span', [
              TextGene('p1it', 'it'),
              TextGene('p1word', 'word')
            ], {}, { lang: 'FR' }),
            TextGene('p1and', 'and')
          ]),
          TextGene('p1_not_', ' not ')
        ]),
        TextGene('p1_this_', ' this ')
      ]),
      // <p id=p2 lang=DE> <span1> "sp" <span2> "l" <span3> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
      Gene('p2', 'p', [
        Gene('p2s1', 'span', [
          TextGene('p2sp', 'sp'),
          Gene('p2s2', 'span', [
            TextGene('p2l', 'l'),
            Gene('p2s3', 'span', [
              TextGene('p2it', 'it'),
              TextGene('p2word', 'word')
            ]),
            TextGene('p2and', 'and')
          ]),
          TextGene('p2_not_', ' not ')
        ]),
        TextGene('p2_this_', ' this ')
      ], {}, { lang: 'DE' }),
      // <p id=p3 lang=DE> <span1> "sp" <span2> "l" <span3 lang=FR> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
      Gene('p3', 'p', [
        Gene('p3s1', 'span', [
          TextGene('p3sp', 'sp'),
          Gene('p3s2', 'span', [
            TextGene('p3l', 'l'),
            Gene('p3s3', 'span', [
              TextGene('p3it', 'it'),
              TextGene('p3word', 'word')
            ], {}, { lang: 'FR' }),
            TextGene('p3and', 'and')
          ]),
          TextGene('p3_not_', ' not ')
        ]),
        TextGene('p3_this_', ' this ')
      ], {}, { lang: 'DE' })
    ]) // root
  );

  check(doc, 'p1', Option.none());
  check(doc, 'p1s1', Option.none());
  check(doc, 'p1s2', Option.none());
  check(doc, 'p1s3', Option.some('FR'));
  check(doc, 'p2', Option.some('DE'));
  check(doc, 'p2s1', Option.some('DE'));
  check(doc, 'p2s2', Option.some('DE'));
  check(doc, 'p2s3', Option.some('DE'));
  check(doc, 'p3', Option.some('DE'));
  check(doc, 'p3s1', Option.some('DE'));
  check(doc, 'p3s2', Option.some('DE'));
  check(doc, 'p3s3', Option.some('FR'));
});
