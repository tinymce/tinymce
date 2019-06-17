import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { normalizeNbspMiddle } from 'tinymce/core/keyboard/Nbsps';

UnitTest.test('atomic.tinymce.core.keyboard.NbspsTest', () => {
  RawAssertions.assertEq('Should remain unchanged empty string', '', normalizeNbspMiddle(''));
  RawAssertions.assertEq('Should remain unchanged single letter', 'a', normalizeNbspMiddle('a'));
  RawAssertions.assertEq('Should remain unchanged two letters', 'ab', normalizeNbspMiddle('ab'));
  RawAssertions.assertEq('Should remain unchanged three letters', 'abc', normalizeNbspMiddle('abc'));
  RawAssertions.assertEq('Should remain unchanged nbsp at start', '\u00a0a', normalizeNbspMiddle('\u00a0a'));
  RawAssertions.assertEq('Should remain unchanged nbsp at end', 'a\u00a0', normalizeNbspMiddle('a\u00a0'));
  RawAssertions.assertEq('Should remain unchanged 2 consecutive nbsps', 'a\u00a0\u00a0b', normalizeNbspMiddle('a\u00a0\u00a0b'));
  RawAssertions.assertEq('Should remain unchanged nbsp followed by space', 'a\u00a0 b', normalizeNbspMiddle('a\u00a0 b'));
  RawAssertions.assertEq('Should remain unchanged space followed by nbsp', 'a \u00a0b', normalizeNbspMiddle('a \u00a0b'));
  RawAssertions.assertEq('Should remain unchanged space followed by space', 'a  b', normalizeNbspMiddle('a  b'));

  RawAssertions.assertEq('Should change middle nbsp to space', 'a b', normalizeNbspMiddle('a\u00a0b'));
  RawAssertions.assertEq('Should change two nbsps to spaces', 'a b c', normalizeNbspMiddle('a\u00a0b\u00a0c'));
});
