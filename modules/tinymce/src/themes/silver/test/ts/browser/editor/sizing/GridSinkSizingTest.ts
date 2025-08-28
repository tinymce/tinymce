import { UiFinder } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement, SugarHead, TextContent, Width } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.sizing.GridSinkSizingTest', () => {
  let style: SugarElement<HTMLStyleElement>;
  before(() => {
    style = SugarElement.fromTag('style');
    TextContent.set(style, `
body {
  display: grid;
  grid-template-columns: 200px 1fr;
}
`);
    Insert.append(SugarHead.head(), style);
  });

  after(() => {
    Remove.remove(style);
  });

  TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TINY-6783:  Sink width matches body width when in display grid', () => {
    const bodyWidth = Width.get(SugarBody.body());
    const sink = UiFinder.findIn<HTMLDivElement>(SugarBody.body(), '.tox-silver-sink').getOrDie();
    const sinkWidth = Width.get(sink);
    assert.equal(sinkWidth, bodyWidth, `Sink should be ${bodyWidth}px wide`);
  });
});
