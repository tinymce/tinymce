import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';
import { normalizeNbspMiddle, normalizeNbspWithElements } from 'tinymce/core/keyboard/Nbsps';

describe('atomic.tinymce.core.keyboard.NbspsTest', () => {
  it('normalizeNbspMiddle', () => {
    assert.isEmpty(normalizeNbspMiddle(''), 'Should remain unchanged empty string');
    assert.equal(normalizeNbspMiddle('a'), 'a', 'Should remain unchanged single letter');
    assert.equal(normalizeNbspMiddle('ab'), 'ab', 'Should remain unchanged two letters');
    assert.equal(normalizeNbspMiddle('abc'), 'abc', 'Should remain unchanged three letters');
    assert.equal(normalizeNbspMiddle('\u00a0a'), '\u00a0a', 'Should remain unchanged nbsp at start');
    assert.equal(normalizeNbspMiddle('a\u00a0'), 'a\u00a0', 'Should remain unchanged nbsp at end');
    assert.equal(normalizeNbspMiddle('a\u00a0\u00a0b'), 'a\u00a0\u00a0b', 'Should remain unchanged 2 consecutive nbsps');
    assert.equal(normalizeNbspMiddle('a\u00a0\u00a0\u00a0b'), 'a\u00a0\u00a0\u00a0b', 'Should remain unchanged 3 consecutive nbsps');
    assert.equal(normalizeNbspMiddle('a\u00a0 b'), 'a\u00a0 b', 'Should remain unchanged nbsp followed by space');
    assert.equal(normalizeNbspMiddle('a \u00a0b'), 'a \u00a0b', 'Should remain unchanged space followed by nbsp');
    assert.equal(normalizeNbspMiddle('a  b'), 'a  b', 'Should remain unchanged space followed by space');

    assert.equal(normalizeNbspMiddle('a\u00a0b'), 'a b', 'Should change middle nbsp to space');
    assert.equal(normalizeNbspMiddle('a\u00a0b\u00a0c'), 'a b c', 'Should change two nbsps to spaces');
  });

  it('normalizeNbspWithElements', () => {
    const assertForNormalizeNbspWithElements = (initial: string, expected: string, message: string) => {
      assert.deepEqual(
        normalizeNbspWithElements(initial, Schema()),
        expected,
        message
      );
    };
    assertForNormalizeNbspWithElements('a\u00a0<strong>b</strong>', 'a <strong>b</strong>', 'Should change nbsp to space');

    assertForNormalizeNbspWithElements('a\u00a0\u00a0<strong>b</strong>', 'a&nbsp;&nbsp;<strong>b</strong>', 'Should not change nbsp to space');
    assertForNormalizeNbspWithElements('a<strong>\u00a0\u00a0b</strong>', 'a<strong>&nbsp;&nbsp;b</strong>', 'Should not change nbsp to space');
    assertForNormalizeNbspWithElements('a \u00a0<strong>b</strong>', 'a &nbsp;<strong>b</strong>', 'Should not change nbsp to space');
    assertForNormalizeNbspWithElements('a<strong> \u00a0b</strong>', 'a<strong> &nbsp;b</strong>', 'Should not change nbsp to space');
    assertForNormalizeNbspWithElements('a\u00a0 <strong>b</strong>', 'a&nbsp; <strong>b</strong>', 'Should not change nbsp to space');
    assertForNormalizeNbspWithElements('a<strong>\u00a0 b</strong>', 'a<strong>&nbsp; b</strong>', 'Should not change nbsp to space');

    assertForNormalizeNbspWithElements('<strong>a</strong>\u00a0\u00a0<strong>b</strong>', '<strong>a</strong>&nbsp;&nbsp;<strong>b</strong>', 'Should not change nbsp to space');
    assertForNormalizeNbspWithElements('<strong>a</strong><strong>\u00a0\u00a0b</strong>', '<strong>a</strong><strong>&nbsp;&nbsp;b</strong>', 'Should not change nbsp to space');

    assertForNormalizeNbspWithElements('a\u00a0<strong>\u00a0b</strong>', 'a&nbsp;<strong>&nbsp;b</strong>', 'Should not change nbsp to space');
    assertForNormalizeNbspWithElements('<strong>a\u00a0</strong><strong>b</strong>', '<strong>a </strong><strong>b</strong>', 'Should change nbsp to space');

    assertForNormalizeNbspWithElements('a<strong>\u00a0b</strong>', 'a<strong> b</strong>', 'Should change nbsp to space');
    assertForNormalizeNbspWithElements('<strong>a</strong><strong>\u00a0b</strong>', '<strong>a</strong><strong> b</strong>', 'Should change nbsp to space');

    assertForNormalizeNbspWithElements('<p>a\u00a0<strong>b</strong>\u00a0c</p>', '<p>a <strong>b</strong> c</p>', 'Should change nbsp to space');
  });
});
