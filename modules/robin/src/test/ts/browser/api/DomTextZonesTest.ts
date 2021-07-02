import { context, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';
import { DomTextZones, ZonePosition } from 'ephox/robin/api/Main';

describe('DomTextZonesTest', () => {
  context('Custom shouldSkip function', () => {
    const viewport = {
      assess: (element: SugarElement<Node>) => ZonePosition.inView(element)
    };

    it('TINY-7607: Skip anchor tags', () => {
      const html = `<div><p>word1</p><a href="https://tiny.cloud">word2</a><p>word3</p></div>`;
      const area = SugarElement.fromHtml(html);
      Insert.append(SugarBody.body(), area);

      const groups = DomTextZones.single(area, 'en_us', viewport);
      assert.lengthOf(groups.zones, 3);
      assert.equal(groups.zones[0].words[0].word, 'word1');
      assert.equal(groups.zones[1].words[0].word, 'word2');
      assert.equal(groups.zones[2].words[0].word, 'word3');

      const groupsWithoutAnchors = DomTextZones.single(area, 'en_us', viewport, SugarNode.isTag('a'));
      assert.lengthOf(groupsWithoutAnchors.zones, 2);
      assert.equal(groupsWithoutAnchors.zones[0].words[0].word, 'word1');
      assert.equal(groupsWithoutAnchors.zones[1].words[0].word, 'word3');

      Remove.remove(area);
    });

    it('TINY-7607: Skips entire zone including children', () => {
      const html = `<div><p>word1 <span>word2</span></p><span>word3</span></div>`;
      const area = SugarElement.fromHtml(html);
      Insert.append(SugarBody.body(), area);

      const groups = DomTextZones.single(area, 'en_us', viewport);
      assert.lengthOf(groups.zones, 2);
      assert.equal(groups.zones[0].words[0].word, 'word1');
      assert.equal(groups.zones[0].words[1].word, 'word2');
      assert.equal(groups.zones[1].words[0].word, 'word3');

      const groupsWithoutAnchors = DomTextZones.single(area, 'en_us', viewport, SugarNode.isTag('p'));
      assert.lengthOf(groupsWithoutAnchors.zones, 1);
      assert.equal(groupsWithoutAnchors.zones[0].words[0].word, 'word3');

      Remove.remove(area);
    });
  });
});

