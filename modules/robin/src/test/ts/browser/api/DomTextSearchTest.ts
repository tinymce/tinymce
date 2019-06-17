import { assert, UnitTest } from '@ephox/bedrock';
import { Spot } from '@ephox/phoenix';
import { Pattern } from '@ephox/polaris';
import { Compare, Element, Html, Insert, InsertAll } from '@ephox/sugar';
import DomTextSearch from 'ephox/robin/api/dom/DomTextSearch';
import { TextSeekerOutcome, TextSeekerPhaseConstructor } from 'ephox/robin/textdata/TextSeeker';

UnitTest.test('DomTextSearchTest', function () {
  const wordbreaker = function () {
    return new RegExp(Pattern.wordbreak(), 'i');
  };
  const wordfinder = function () {
    return new RegExp(Pattern.wordchar(), 'i');
  };

  const stopAtGap = function <E> (phase: TextSeekerPhaseConstructor, element: E, text: string, index: number) {
    return phase.finish(Spot.point(element, index));
  };

  const checkInfo = function (result: TextSeekerOutcome<Element>, expectedElement: Element, expectedOffset: number) {
    result.fold(function () {
      assert.fail('Unexpected abort');
    }, function (edge) {
      assert.fail('Unexpected edge');
    }, function (info) {
      const isSame = Compare.eq(info.element(), expectedElement);
      assert.eq(true, isSame);
      assert.eq(info.offset(), expectedOffset);
    });
  };

  const checkEdge = function (result: TextSeekerOutcome<Element>, expectedElement: Element) {
    result.fold(function () {
      assert.fail('Unexpected abort');
    }, function (edge) {
      const isSame = Compare.eq(edge, expectedElement);
      assert.eq(true, isSame);
    }, function (info) {
      assert.fail('Unexpected info');
    });
  };
  const checkAbort = function (result: TextSeekerOutcome<Element>) {
    result.fold(function () {
    }, function (edge) {
      assert.fail('Unexpected edge');
    }, function (info) {
      assert.fail('Unexpected info found');
    });
  };

  // const outcome = Adt.generate([
  //   { aborted: [] },
  //   { edge: [ 'element' ] },
  //   { success: [ 'info' ] }
  // ]);
  let element = Element.fromTag('div');
  const text = Element.fromText('@maurizio@ ');
  Insert.append(element, text);

  assert.eq(1, element.dom().childNodes.length); // Range offsets [0, 1)
  assert.eq(11, text.dom().length);              // Range offsets [0, 11)

  const elemResult = DomTextSearch.expandRight(element, 0, { regex: wordbreaker, attempt: stopAtGap });
  checkAbort(elemResult);

  const elemResultB = DomTextSearch.expandRight(element, 8, { regex: wordbreaker, attempt: stopAtGap });
  checkAbort(elemResultB);

  const textResult1 = DomTextSearch.expandRight(text, 0, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(textResult1, text, 0);

  const textResult2 = DomTextSearch.expandRight(text, 1, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(textResult2, text, 9);

  const textResult = DomTextSearch.expandRight(text, 8, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(textResult, text, 9);

  const textResult3 = DomTextSearch.expandRight(text, 9, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(textResult3, text, 9);

  const textB = Element.fromText('@one ');
  const textBResult = DomTextSearch.expandRight(textB, 0, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(textBResult, textB, 0);

  const textBResult1 = DomTextSearch.expandRight(textB, 1, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(textBResult1, textB, 4);

  checkAbort(DomTextSearch.expandLeft(element, 0, { regex: wordbreaker, attempt: stopAtGap }));
  checkAbort(DomTextSearch.expandLeft(element, 1, { regex: wordbreaker, attempt: stopAtGap }));
  checkAbort(DomTextSearch.expandLeft(element, 2, { regex: wordbreaker, attempt: stopAtGap }));
  checkEdge(DomTextSearch.expandLeft(text, 0, { regex: wordbreaker, attempt: stopAtGap }), text);
  checkInfo(DomTextSearch.expandLeft(text, 1, { regex: wordbreaker, attempt: stopAtGap }), text, 0); // before the first '@'
  checkInfo(DomTextSearch.expandLeft(text, 3, { regex: wordbreaker, attempt: stopAtGap }), text, 0); // before the first '@'
  checkInfo(DomTextSearch.expandLeft(text, '@maurizio@'.length, { regex: wordbreaker, attempt: stopAtGap }), text,
    '@maurizio@'.length - 1); // before the last '@'
  checkInfo(DomTextSearch.expandLeft(text, '@maurizio@ '.length, { regex: wordbreaker, attempt: stopAtGap }), text,
    '@maurizio@ '.length - 1); // before the ' '

  //
  // tests left and right looking for words or spaces
  //
  const textR = Element.fromText('   words');
  //                     Pos:  0  23    8
  assert.eq(8, textR.dom().length);
  checkInfo(DomTextSearch.expandRight(textR, 0, { regex: wordfinder, attempt: stopAtGap }),
    textR, 3); // 3 is the location after the last space, starting from the left
  checkInfo(DomTextSearch.expandLeft(textR, 8, { regex: wordbreaker, attempt: stopAtGap }),
    textR, 2); // 2 is the location after the last character, starting from the right
  const textL = Element.fromText('words   ');
  //                     Pos:  0    45  8
  assert.eq(8, textL.dom().length);
  checkInfo(DomTextSearch.expandRight(textL, 0, { regex: wordbreaker, attempt: stopAtGap }),
    textL, 5); // 5 is the location after the last character, starting from the left
  checkInfo(DomTextSearch.expandLeft(textL, 8, { regex: wordfinder, attempt: stopAtGap }),
    textL, 4); // 4 is the location after the last space, starting from the right

  //
  // tests moving right and left by words
  //
  element = Element.fromTag('div');
  const span2 = Element.fromTag('span');
  //                    Pos: 0123456789
  const w1 = Element.fromText('  wordy  ');
  const w2 = Element.fromText('  words  ');
  const w3 = Element.fromText('  wordd  ');
  Insert.append(span2, w2);
  InsertAll.append(element, [w1, span2, w3]);

  assert.eq(3, element.dom().childNodes.length); // Range offsets [0, 3)
  assert.eq(1, span2.dom().childNodes.length);              // Range offsets [0, 1)
  assert.eq(9, w1.dom().length);                 // Range offsets [0, 7)
  assert.eq('<div>  wordy  <span>  words  </span>  wordd  </div>', Html.getOuter(element));

  const r0 = DomTextSearch.expandRight(w1, 0, { regex: wordfinder, attempt: stopAtGap });
  const r1 = DomTextSearch.expandRight(w1, 3, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(r0, w1, 2);
  checkInfo(r1, w1, 7);
  const r2 = DomTextSearch.expandRight(w1, 7, { regex: wordfinder, attempt: stopAtGap });
  const r3 = DomTextSearch.expandRight(w2, 2, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(r2, w2, 2);
  checkInfo(r3, w2, 7);
  const r4 = DomTextSearch.expandRight(w2, 7, { regex: wordfinder, attempt: stopAtGap });
  const r5 = DomTextSearch.expandRight(w3, 2, { regex: wordbreaker, attempt: stopAtGap });
  checkInfo(r4, w3, 2);
  checkInfo(r5, w3, 7);
  const r6 = DomTextSearch.expandRight(w3, 7, { regex: wordfinder, attempt: stopAtGap });
  const r7 = DomTextSearch.expandRight(w3, 9, { regex: wordbreaker, attempt: stopAtGap });
  checkEdge(r6, w3); // hit the edge without finding a word so return 'edge' element not 'success' point
  checkEdge(r7, w3);

  // expandLeft, starting from the RHS:
  // '<div>  wordy  <span>  words  </span>  wordd  </div>'
  //                                               ^
  const l1 = DomTextSearch.expandLeft(w3, 9, { regex: wordfinder, attempt: stopAtGap });
  // '<div>  wordy  <span>  words  </span>  wordd  </div>'
  //                                            ^
  checkInfo(l1, w3, 6);
  const l2 = DomTextSearch.expandLeft(w3, 6, { regex: wordbreaker, attempt: stopAtGap });
  // '<div>  wordy  <span>  words  </span>  wordd  </div>'
  //                                       ^
  checkInfo(l2, w3, 1);
  const l3 = DomTextSearch.expandLeft(w3, 1, { regex: wordfinder, attempt: stopAtGap });
  // '<div>  wordy  <span>  words  </span>  wordd  </div>'
  //                            ^
  checkInfo(l3, w2, 6);
  const l4 = DomTextSearch.expandLeft(w2, 6, { regex: wordbreaker, attempt: stopAtGap });
  // '<div>  wordy  <span>  words  </span>  wordd  </div>'
  //                       ^
  checkInfo(l4, w2, 1);
  const l5 = DomTextSearch.expandLeft(w2, 1, { regex: wordfinder, attempt: stopAtGap });
  // '<div>  wordy  <span>  words  </span>  wordd  </div>'
  //             ^
  checkInfo(l5, w1, 6);
  const l6 = DomTextSearch.expandLeft(w1, 6, { regex: wordbreaker, attempt: stopAtGap });
  // '<div>  wordy  <span>  words  </span>  wordd  </div>'
  //        ^
  checkInfo(l6, w1, 1);
  const l7 = DomTextSearch.expandLeft(w1, 1, { regex: wordfinder, attempt: stopAtGap });
  // '<div>  wordy  <span>  words  </span>  wordd  </div>'
  //       ^
  checkEdge(l7, w1); // hit the edge looking for a word

  //
  // scanRight returns Option({element, offset})
  //
  (function () {
    const container = Element.fromTag('div');
    const alphaText = Element.fromText('alpha');
    const betaSpan = Element.fromTag('span');
    const betaText1 = Element.fromText('be');
    const betaText2 = Element.fromText('ta');
    const gammaText = Element.fromText('');
    const deltaText = Element.fromText('\uFEFF');
    const epsilonText = Element.fromText('epsilon');

    InsertAll.append(container, [alphaText, betaSpan, gammaText, deltaText, epsilonText]);
    InsertAll.append(betaSpan, [betaText1, betaText2]);

    const checkNoneScan = function (label: string, start: Element, offset: number) {
      assert.eq(true, DomTextSearch.scanRight(start, offset).isNone(), 'There should be no scanning (' + label + ')');
    };

    const checkScan = function (label: string, expected: { element: Element, offset: number }, start: Element, offset: number) {
      const actual = DomTextSearch.scanRight(start, offset).getOrDie('Could not find scan result for: ' + label);
      assert.eq(expected.offset, actual.offset());
      assert.eq(true, Compare.eq(expected.element, actual.element()), 'Element did not match scan: (' + label + ')');
    };

    checkNoneScan('Alpha:exceed', alphaText, 'alphabeta\uFEFFepisilon!'.length);
    checkScan('Alpha:eof', { element: epsilonText, offset: 'epsilon'.length }, alphaText, 'alphabeta\uFEFFepsilon'.length);
    checkScan('Alpha:2', { element: alphaText, offset: 2 }, alphaText, 2);
    checkScan('Alpha:into beta:2', { element: betaText1, offset: 'be'.length }, alphaText, 'alphabe'.length);
    checkScan('Alpha:into beta:3', { element: betaText2, offset: 't'.length }, alphaText, 'alphabet'.length);
    checkScan('Beta:0', { element: betaText1, offset: 0 }, betaText1, ''.length);
  })();
});