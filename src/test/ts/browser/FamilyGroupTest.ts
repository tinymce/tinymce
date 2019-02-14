import { UnitTest, assert } from '@ephox/bedrock';
import { DomUniverse } from '@ephox/boss';
import { Arr, Fun } from '@ephox/katamari';
import * as Family from 'ephox/phoenix/api/general/Family';
import { Element, Text } from '@ephox/sugar';

UnitTest.test('FamilyGroupTest', function () {
  var universe = DomUniverse();
  var toStr = function (subject) {
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

  var check = function (expected, input) {
    var rawActual = Family.group(universe, input, Fun.constant(false));
    var actual = Arr.map(rawActual, function (a) {
      return Arr.map(a, toStr);
    });
    assert.eq(expected, actual);
  };

  check([
    [ '"text"' ]
  ], [
    Element.fromHtml('text')
  ]);

  check([
    [ '"Dogs and cats"' ],
    [ '"Living together "', '"Mass hysteria"', '"."' ],
    [ '"-- Ghostbusters"' ]
  ], [
    Element.fromHtml('<p>Dogs and cats</p>'),
    Element.fromHtml('<p>Living together <span>Mass hysteria</span>.</p>'),
    Element.fromText('-- Ghostbusters')
  ]);

  check([
    [ '"Dogs and cats"' ],
    [ '"Living tog"' ],
    [ '/' ],
    [ '"ether "', '"Mass hyste"' ],
    [ '/' ],
    [ '"ria"', '"."' ],
    [ '/' ],
    [ '"-- Ghostbusters"' ]
  ], [
    Element.fromHtml('<p>Dogs and cats</p>'),
    Element.fromHtml('<p>Living tog<img />ether <span>Mass hyste<br />ria</span>.</p>'),
    Element.fromHtml('<hr />'),
    Element.fromText('-- Ghostbusters')
  ]);

  check([
    [ '"Dogs and cats"' ],
    [ '"Living tog"' ],
    [ '/' ],
    [ '"ether "', '"Mass hyste"' ],
    [ '/' ],
    [ '"ria"', '"."' ],
    [ '"-- Ghostbusters"' ],
    [ '"One"' ],
    [ '"Two"' ],
    [ '"Three"' ]
  ], [
    Element.fromHtml('<p>Dogs and cats</p>'),
    Element.fromHtml('<p>Living tog<img />ether <span>Mass hyste<br />ria</span>.</p>'),
    Element.fromText('-- Ghostbusters'),
    Element.fromHtml('<div><p>One</p><p>Two</p><p>Three</p></div>')
  ]);
});