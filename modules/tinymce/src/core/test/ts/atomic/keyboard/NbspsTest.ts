import { Assert, UnitTest } from '@ephox/bedrock-client';
import { normalizeNbspMiddle } from 'tinymce/core/keyboard/Nbsps';

UnitTest.test('atomic.tinymce.core.keyboard.NbspsTest', () => {
  Assert.eq('Should remain unchanged empty string', '', normalizeNbspMiddle(''));
  Assert.eq('Should remain unchanged single letter', 'a', normalizeNbspMiddle('a'));
  Assert.eq('Should remain unchanged two letters', 'ab', normalizeNbspMiddle('ab'));
  Assert.eq('Should remain unchanged three letters', 'abc', normalizeNbspMiddle('abc'));
  Assert.eq('Should remain unchanged nbsp at start', '\u00a0a', normalizeNbspMiddle('\u00a0a'));
  Assert.eq('Should remain unchanged nbsp at end', 'a\u00a0', normalizeNbspMiddle('a\u00a0'));
  Assert.eq('Should remain unchanged 2 consecutive nbsps', 'a\u00a0\u00a0b', normalizeNbspMiddle('a\u00a0\u00a0b'));
  Assert.eq('Should remain unchanged nbsp followed by space', 'a\u00a0 b', normalizeNbspMiddle('a\u00a0 b'));
  Assert.eq('Should remain unchanged space followed by nbsp', 'a \u00a0b', normalizeNbspMiddle('a \u00a0b'));
  Assert.eq('Should remain unchanged space followed by space', 'a  b', normalizeNbspMiddle('a  b'));

  Assert.eq('Should change middle nbsp to space', 'a b', normalizeNbspMiddle('a\u00a0b'));
  Assert.eq('Should change two nbsps to spaces', 'a b c', normalizeNbspMiddle('a\u00a0b\u00a0c'));
});
