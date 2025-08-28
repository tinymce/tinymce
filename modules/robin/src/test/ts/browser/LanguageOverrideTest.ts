import { describe, it } from '@ephox/bedrock-client';
import { DomUniverse, Universe } from '@ephox/boss';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import * as TextZones from 'ephox/robin/api/general/TextZones';
import { ZoneViewports } from 'ephox/robin/api/general/ZoneViewports';

// Strip out the bits of an actual Zone that aren't compatible with assert.deepEqual
interface AssertableZone {
  readonly words: string[];
  readonly lang: string;
}

describe('browser.robin.LanguageOverrideTest', () => {
  const top = SugarElement.fromHtml('<div>' +
    '<p lang="en">Hello <span>world</span></p>' +
    '<p>This is <span lang="pt">multi-lingual content</span></p>' +
    '</div>'
  );

  const walk = (universe: Universe<SugarElement, Document>): AssertableZone[] => {
    const start = Traverse.firstChild(top).getOrDie();
    const end = Traverse.lastChild(top).getOrDie();
    const walkResult = TextZones.range(universe, start, 0, end, 2, 'default', ZoneViewports.anything());
    return Arr.map(walkResult.zones, (zone) => ({
      words: Arr.map(zone.words, (w) => w.word),
      lang: zone.lang
    }));
  };

  const normal = DomUniverse();
  const override: Universe<SugarElement, Document> = {
    ...normal,
    property: Fun.constant({
      ...normal.property(),
      getLanguage: (ele: SugarElement) => normal.property().getLanguage(ele).map((lang) => 'custom:' + lang)
    })
  };

  it('TINY-7570: Correctly marks languages', () => {
    const zones = walk(normal);
    assert.deepEqual(zones, [
      {
        lang: 'en',
        words: [ 'Hello', 'world' ]
      }, {
        lang: 'default',
        words: [ 'This', 'is' ]
      }, {
        lang: 'pt',
        words: [ 'multi-lingual', 'content' ]
      }
    ]);
  });

  it('TINY-7570: Correctly marks overridden languages', () => {
    const zones = walk(override);
    assert.deepEqual(zones, [
      {
        lang: 'custom:en',
        words: [ 'Hello', 'world' ]
      }, {
        lang: 'default',
        words: [ 'This', 'is' ]
      }, {
        lang: 'custom:pt',
        words: [ 'multi-lingual', 'content' ]
      }
    ]);
  });
});
