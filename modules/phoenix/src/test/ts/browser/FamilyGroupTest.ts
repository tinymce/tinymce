import { assert, UnitTest } from '@ephox/bedrock';
import { DomUniverse } from '@ephox/boss';
import { Document } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Element, Text } from '@ephox/sugar';
import * as Family from 'ephox/phoenix/api/general/Family';
import { TypedItem } from 'ephox/phoenix/api/Main';

UnitTest.test('FamilyGroupTest', function () {
  const universe = DomUniverse();
  const toStr = function (subject: TypedItem<Element, Document>) {
    return subject.fold(function () {
      return '|';
    }, function () {
      return '/';
    }, function (text) {
      return '"' + Text.get(text) + '"';
    });
  };

  // Family.group is used to break a list of elements in a list of list of elements, where each sublist
  // is a section that is bounded by blocks.

  const check = function (expected: string[][], input: Element[]) {
    const rawActual = Family.group(universe, input, Fun.constant(false) as (e: Element) => boolean);
    const actual = Arr.map(rawActual, function (a) {
      return Arr.map(a, toStr);
    });
    assert.eq(expected, actual);
  };

  check([
    ['"text"']
  ], [
      Element.fromHtml('text')
    ]);

  check([
    ['"Dogs and cats"'],
    ['"Living together "', '"Mass hysteria"', '"."'],
    ['"-- Ghostbusters"']
  ], [
      Element.fromHtml('<p>Dogs and cats</p>'),
      Element.fromHtml('<p>Living together <span>Mass hysteria</span>.</p>'),
      Element.fromText('-- Ghostbusters')
    ]);

  check([
    ['"Dogs and cats"'],
    ['"Living tog"'],
    ['/'],
    ['"ether "', '"Mass hyste"'],
    ['/'],
    ['"ria"', '"."'],
    ['/'],
    ['"-- Ghostbusters"']
  ], [
      Element.fromHtml('<p>Dogs and cats</p>'),
      Element.fromHtml('<p>Living tog<img />ether <span>Mass hyste<br />ria</span>.</p>'),
      Element.fromHtml('<hr />'),
      Element.fromText('-- Ghostbusters')
    ]);

  check([
    ['"Dogs and cats"'],
    ['"Living tog"'],
    ['/'],
    ['"ether "', '"Mass hyste"'],
    ['/'],
    ['"ria"', '"."'],
    ['"-- Ghostbusters"'],
    ['"One"'],
    ['"Two"'],
    ['"Three"']
  ], [
      Element.fromHtml('<p>Dogs and cats</p>'),
      Element.fromHtml('<p>Living tog<img />ether <span>Mass hyste<br />ria</span>.</p>'),
      Element.fromText('-- Ghostbusters'),
      Element.fromHtml('<div><p>One</p><p>Two</p><p>Three</p></div>')
    ]);
});