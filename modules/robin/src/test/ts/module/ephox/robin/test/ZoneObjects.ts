import { Logger, RawAssertions } from '@ephox/agar';
import { Gene, TestUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { LanguageZones } from 'ephox/robin/zone/LanguageZones';
import { Zone } from 'ephox/robin/zone/Zones';

export interface RawZone {
  lang: string;
  elements: string[];
  words: string[];
}

const rawOne = function (universe: TestUniverse, zone: Zone<Gene>): RawZone {
  return {
    lang: zone.lang(),
    elements: Arr.map(zone.elements(), function (elem) {
      return elem.id;
    }),
    words: Arr.map(zone.words(), function (w) {
      return w.word();
    })
  };
};

const raw = function <E, D> (universe: TestUniverse, zones: Zone<Gene>[]) {
  return Arr.map(zones, function (zone) {
    return rawOne(universe, zone);
  });
};

const assertZones = function (label: string, universe: TestUniverse, expected: RawZone[], zones: Zone<Gene>[]) {
  const rawActual = raw(universe, zones);
  RawAssertions.assertEq(label + '\nChecking zones: ', expected, rawActual);
};

const assertProps = function (label: string, universe: TestUniverse, zones: Zone<Gene>[]) {
  Arr.each(zones, function (zone) {
    const elements = zone.elements();
    if (elements.length === 0) {
      return;
    }

    const first = elements[0];

    Logger.sync(
      '\nProperty test for zone: ' + JSON.stringify(rawOne(universe, zone), null, 2),
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
        const blockParent = universe.up().predicate(first, universe.property().isBoundary).getOrDie('No block parent tag found');
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

export { raw, rawOne, assertZones, assertProps };
