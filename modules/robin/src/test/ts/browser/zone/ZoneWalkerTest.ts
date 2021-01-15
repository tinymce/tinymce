import { after, before, describe, it } from '@ephox/bedrock-client';
import { DomUniverse } from '@ephox/boss';
import { Insert, Remove, SugarBody, SugarElement, SugarText } from '@ephox/sugar';
import { assert } from 'chai';
import { ZoneViewports } from 'ephox/robin/api/general/ZoneViewports';
import * as ZoneWalker from 'ephox/robin/zone/ZoneWalker';

const hook = (html: string) => {
  let element: SugarElement<HTMLElement> | undefined;

  before(() => {
    element = SugarElement.fromHtml(html);
    Insert.append(SugarBody.body(), element);
  });

  after(() => {
    Remove.remove(element!);
  });

  return () => element!;
};

describe('browser.robin.zone.ZoneWalkerTest', () => {
  const getElement = hook([
    '<div>',
    '<p>Some text here please</p>',
    '<style>',
    'p { text-decoration: underline; }',
    '</style>',
    '<p>The end</p>',
    '</div>'
  ].join(''));

  it('does not walk into the style', () => {
    const root = getElement();
    const items = ZoneWalker.walk(DomUniverse(), root, root, 'en_us', (_universe, item) => {
      return {
        item,
        start: 0,
        finish: 1,
        text: SugarText.get(item)
      };
    }, ZoneViewports.anything());

    console.log(items);

    assert.isEmpty(items);
  });
});