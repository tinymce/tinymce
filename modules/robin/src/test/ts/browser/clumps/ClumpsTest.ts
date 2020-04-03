import { assert, UnitTest } from '@ephox/bedrock-client';
import { DomUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Body, Compare, Element, Hierarchy, Insert, Remove } from '@ephox/sugar';
import * as Clumps from 'ephox/robin/clumps/Clumps';

UnitTest.test('ClumpsTest', function () {
  /* The purpose of this test is to take a large section of html and test dividing it into
   * inline clumps
   */
  const find = function (path: number[]) {
    return Hierarchy.follow(container, path).getOrDie('Could not find the path: ' + path.join(','));
  };

  const body = Body.body();

  const container = Element.fromTag('div');
  container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';

  Insert.append(body, container);

  const isRoot = function (elem: Element) {
    return Compare.eq(elem, container);
  };

  interface Expected {
    start: number[];
    end: number[];
  }

  const check = function (expected: Expected[], start: number[], soffset: number, finish: number[], foffset: number) {
    const actual = Clumps.collect(DomUniverse(), isRoot, find(start), soffset, find(finish), foffset);
    assert.eq(expected.length, actual.length, 'The length of Clumps was different. Expected: ' + expected.length + ', actual: ' + actual.length);
    Arr.each(expected, function (exp, i) {
      const act = actual[i];
      assert.eq(true, Compare.eq(find(exp.start), act.start));
      assert.eq(true, Compare.eq(find(exp.end), act.finish));
    });
  };

  container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';
  check([
    // the word -> before
    { start: [ 0, 1, 0 ], end: [ 0, 4 ] },
    // And -> <u>paragraph</u>
    { start: [ 1, 0 ], end: [ 1, 1 ] },
    // Plus -> Plus
    { start: [ 2, 0 ], end: [ 2, 0 ] },
    // Last one -> Last one
    { start: [ 3, 0 ], end: [ 3, 0 ] }
  ], [ 0, 1, 0 ], 'the'.length, [ 3, 0 ], 'Last'.length);

  container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';
  check([
    // the word ->  before
    { start: [ 0, 1, 0 ], end: [ 0, 4 ] },
    // And -> paragraph
    { start: [ 1, 0 ], end: [ 1, 1, 0 ] }
  ], [ 0, 1, 0 ], 'the'.length, [ 1, 1, 0 ], 'par'.length);

  container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';
  check([
    // the word -> the word
    { start: [ 0, 1, 0 ], end: [ 0, 1, 0 ] }
  ], [ 0, 1, 0 ], 'the'.length, [ 0, 1, 0 ], 'the wor'.length);

  container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';
  check([
    // the word -> it
    { start: [ 0, 1, 0 ], end: [ 0, 3, 0 ] }
  ], [ 0, 1, 0 ], 'the'.length, [ 0, 3, 0 ], 'i'.length);

  container.dom().innerHTML =
    '<p>This is <span>completely <i>different <b>from</b> </i>what you would<span>_expect_</span></span></p>' +
    '<p>And more <u>of this is <span>here</span> again</u>.</p>';
  check([
    // from -> </span>
    { start: [ 0, 1, 1, 1, 0 ], end: [ 0, 1 ] },
    // And -> here
    { start: [ 1, 0 ], end: [ 1, 1, 1, 0 ] }
  ], [ 0, 1, 1, 1, 0 ], 'f'.length, [ 1, 1, 1, 0 ], 'h'.length);

  container.dom().innerHTML =
    '<table><tbody><tr><td>One</td></td><td>Two</td></tr></tbody></table><p>Paragraph</p>';
  check([
    // One -> One
    { start: [ 0, 0, 0, 0, 0 ], end: [ 0, 0, 0, 0, 0 ] },
    // Two -> Two
    { start: [ 0, 0, 0, 1, 0 ], end: [ 0, 0, 0, 1, 0 ] }
  ], [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 1 ], 1);

  container.dom().innerHTML =
    '<p>Text</p><table><tbody><tr><td>One</td></td><td>Two</td></tr></tbody></table><p>Paragraph</p>';
  check([
    { start: [ 1, 0, 0, 0, 0 ], end: [ 1, 0, 0, 0, 0 ] },
    { start: [ 1, 0, 0, 1, 0 ], end: [ 1, 0, 0, 1, 0 ] },
    { start: [ 2, 0 ], end: [ 2, 0 ] }
  ], [], 1, [ 2 ], 0);

  Remove.remove(container);
});
