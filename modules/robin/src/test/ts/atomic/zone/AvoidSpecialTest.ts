import { describe, it } from '@ephox/bedrock-client';
import { Gene, SpecialGene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { assert } from 'chai';
import { ZoneViewports } from 'ephox/robin/api/general/ZoneViewports';
import { WordDecision } from 'ephox/robin/words/WordDecision';
import { ZoneDetails } from 'ephox/robin/zone/LanguageZones';
import * as ZoneWalker from 'ephox/robin/zone/ZoneWalker';

describe('atomic.robin.zone.AvoidSpecialTest', () => {
  const doc = TestUniverse(Gene('root', 'root', [
    Gene('1', 'p', [
      TextGene('1.1', 'Hello world'),
      TextGene('1.2', 'More text')
    ]),
    SpecialGene('2', [
      TextGene('2.1', 'We do not want this text'),
      TextGene('2.2', 'This is not good text that we want to walk over')
    ]),
    Gene('3', 'p', [
      TextGene('3.1', 'The ending')
    ]),
    Gene('4', 'p', [
      TextGene('4.1', 'Skip this also')
    ], {}, { contenteditable: 'false' })
  ]));
  const root = doc.get();

  const idInZone = (id: string, zones: ZoneDetails<Gene>[]) =>
    Arr.exists(zones, (zone) =>
      Arr.exists(zone.details, (detail) =>
        detail.item.id === id
      )
    );

  it('skips special and CEF elements while walking the entire document', () => {
    const zones = ZoneWalker.walk(doc, root, root, 'en_us', WordDecision.fromItem, ZoneViewports.anything());
    for (let id of [ '1.1', '1.2', '3.1' ]) {
      assert.isTrue(idInZone(id, zones), 'Zones contains ' + id);
    }
    for (let id of [ '2.1', '2.2', '4.1' ]) {
      assert.isFalse(idInZone(id, zones), 'Zone does not contain ' + id);
    }
  });

  it('skips special elements while walking through special elements', () => {
    const ele = doc.find(root, '2').getOrDie();
    const zones = ZoneWalker.walk(doc, ele, ele, 'en_us', WordDecision.fromItem, ZoneViewports.anything());
    assert.isEmpty(zones);
  });

  it('skips CEF elements while walking through CEF elements', () => {
    const ele = doc.find(root, '4').getOrDie();
    const zones = ZoneWalker.walk(doc, ele, ele, 'en_us', WordDecision.fromItem, ZoneViewports.anything());
    assert.isEmpty(zones);
  });
});