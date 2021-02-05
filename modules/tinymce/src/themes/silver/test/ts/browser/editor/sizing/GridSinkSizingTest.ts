import { UiFinder } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { Insert, Remove, SugarBody, SugarElement, SugarHead, TextContent, Width } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

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
  }, [ Theme ]);

  it('TINY-6783:  Sink width matches body width when in display grid', () => {
    const bodyWidth = Width.get(SugarBody.body());
    const sink = UiFinder.findIn(SugarBody.body(), '.tox-silver-sink').getOrDie();
    const sinkWidth = Width.get(sink);
    assert.equal(sinkWidth, bodyWidth, `Sink should be ${bodyWidth}px wide`);
  });
});
