import { Logger } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import LanguageZones from 'ephox/robin/zone/LanguageZones';
import { JSON as Json } from '@ephox/sand';

var rawOne = function (universe, zone) {
  return {
    lang: zone.lang(),
    elements: Arr.map(zone.elements(), function (elem) { return elem.id; }),
    words: Arr.map(zone.words(), function (w) { return w.word(); })
  };
};

var raw = function (universe, zones) {
  return Arr.map(zones, function (zone) {
    return rawOne(universe, zone);
  });
};

var assertZones = function (label, universe, expected, zones) {
  var rawActual = raw(universe, zones);
  RawAssertions.assertEq(label + '\nChecking zones: ', expected, rawActual);
};

var assertProps = function (label, universe, zones) {
  Arr.each(zones, function (zone) {
    var elements = zone.elements();
    if (elements.length === 0) return;

    var first = elements[0];

    Logger.sync(
      '\nProperty test for zone: ' + Json.stringify(rawOne(universe, zone), null, 2),
      function () {
        // Check languages all match the zone language
        Arr.each(elements, function (x, i) {
          RawAssertions.assertEq(
            'Checking everything in ' + label + ' has same language. Item: ' + x.id,
            LanguageZones.calculate(universe, x).getOr('none'), zone.lang()
          );
          RawAssertions.assertEq(
            'Check that everything in the ' + label + ' is a text node',
            true,
            universe.property().isText(x)
          );
        });

        // Check block tags match across zones
        var blockParent = universe.up().predicate(first, universe.property().isBoundary).getOrDie('No block parent tag found');
        Arr.each(elements, function (x, i) {
          RawAssertions.assertEq(
            'All block ancestor tags should be the same as the original',
            blockParent,
            universe.up().predicate(x, universe.property().isBoundary).getOrDie('No block parent tag found')
          );
        });
      }
    );
  });
};

export default <any> {
  raw: raw,
  rawOne: rawOne,
  assertZones: assertZones,
  assertProps: assertProps
};