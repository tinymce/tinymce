import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr, Fun } from '@ephox/katamari';

import { ZonePosition } from 'ephox/robin/api/general/ZonePosition';
import { ZoneViewports } from 'ephox/robin/api/general/ZoneViewports';
import { WordDecision } from 'ephox/robin/words/WordDecision';
import { ZoneDetails } from 'ephox/robin/zone/LanguageZones';
import * as ZoneWalker from 'ephox/robin/zone/ZoneWalker';

UnitTest.asyncTest('atomic.robin.zone.InViewportTest', (success, failure) => {
  const doc = TestUniverse(Gene('root', 'root', [
    Gene('a/p1', 'p', [
      TextGene('a/text1.1', 'Some text to walk'),
      TextGene('a/text1.2', 'Other text')
    ]),
    Gene('b/p2', 'p', [
      TextGene('b/text2.2', 'Text to walk'),
      Gene('b/p2.2', 'p', [
        TextGene('b/text2.2.1', 'Hallo'),
        TextGene('b/text2.2.2', 'Auf wiedersehen')
      ], {}, { lang: 'de' })
    ]),
    Gene('b/p3', 'p', [
      TextGene('b/text3.1', 'Different block, still within b')
    ]),
    Gene('c/p4', 'p', [
      TextGene('c/text4.1', 'Last block'),
      Gene('c/span4.2', 'span', [
        TextGene('c/text4.2.1', 'Last one')
      ])
    ])
  ]));

  // Decides whether an element is above, inside, or below the viewport based on comparing the first letters of the IDs
  const firstLetterViewport = (start: string, end: string): ZoneViewports<Gene> => ({
    assess: (item) => {
      const letter = item.id.charAt(0);

      if (item.id === 'root') {
        return ZonePosition.inView(item);
      }

      if (letter < start) {
        return ZonePosition.aboveView(item);
      } else if (letter > end) {
        return ZonePosition.belowView(item);
      } else {
        return ZonePosition.inView(item);
      }
    }
  });

  const assertZones = (startId: string, endId: string, viewport: ZoneViewports<Gene>) => {
    const start = doc.find(doc.get(), startId).getOrDie();
    const end = doc.find(doc.get(), endId).getOrDie();
    const transform = WordDecision.fromItem;
    const zones = ZoneWalker.walk<Gene, undefined>(doc, start, end, 'en', transform, viewport);
    const indexedZones = new Map<string, ZoneDetails<Gene>>();
    Arr.each(zones, (zone) => Arr.each(zone.details, (detail) => indexedZones.set(detail.item.id, zone)));

    let elements: Gene[] = [];
    // TODO: see if there's an existing function for this so we can lose the cheap / nasty DFS
    const visit = (el: Gene) => {
      const children = doc.property().children(el);
      elements = elements.concat(children);
      Arr.each(children, visit);
    };
    visit(doc.get());

    Arr.each(elements, (el) => {
      const isText = doc.property().isText(el);
      const withinViewport = viewport.assess(el).fold(Fun.never, Fun.always, Fun.never);

      const equalsOrInside = (g1: Gene, g2Id: string): boolean => {
        if (g1.id === g2Id) {
          return true;
        }

        if (doc.up().predicate(g1, (g2) => g2.id === g2Id).isSome()) {
          return true;
        }

        if (doc.down().predicate(g1, (g2) => g2.id === g2Id).length !== 0) {
          return true;
        }

        return false;
      };
      const afterOrEqualsStart = equalsOrInside(el, startId) || doc.query().comparePosition(el, start) === 2;
      const beforeOrEqualsEnd = equalsOrInside(el, endId) || doc.query().comparePosition(el, end) === 4;

      if (isText && withinViewport && afterOrEqualsStart && beforeOrEqualsEnd) {
        Assertions.assertEq('Ensuring element ' + el.name + ' is reached by the walker', true, indexedZones.has(el.id));
      } else {
        Assertions.assertEq('Ensuring element ' + el.name + ' is not reached by the walker', false, indexedZones.has(el.id));
      }

    });
  };

  const sAssertZones = (startId: string, endId: string, viewportStart: string, viewportEnd: string) => Step.sync(() =>
    assertZones(startId, endId, firstLetterViewport(viewportStart, viewportEnd))
  );

  Pipeline.async({}, [
    Log.step('TINY-6412', 'Can it walk the whole document',
      sAssertZones('a/p1', 'c/p4', 'a', 'c')
    ),
    Log.step('TINY-6412', 'Can it walk all nodes in a viewport',
      sAssertZones('a/p1', 'c/p4', 'b', 'b')
    ),
    Log.stepsAsStep('TINY-6412', 'Will it skip if the viewport and the start/end points have no overlap', [
      sAssertZones('b/p3', 'c/p4', 'a', 'a'),
      sAssertZones('a/p1', 'b/p2', 'c', 'c')
    ]),
    Log.stepsAsStep('TINY-6412', 'Can it handle partial overlaps between the viewport and the start/end points', [
      sAssertZones('a/p1', 'b/p2', 'b', 'b'),
      sAssertZones('b/p3', 'c/p4', 'b', 'b'),
      sAssertZones('b/p2', 'b/p3', 'a', 'b'),
      sAssertZones('b/p2', 'b/p3', 'b', 'c')
    ])
  ], success, failure);
});
