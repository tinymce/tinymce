import { UiFinder } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { Insert, Remove, SugarBody, SugarElement, Width } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.sizing.ResizeNotInRootTest', () => {
  const expectedWidth = 300;
  let toolbarContainer: SugarElement<HTMLDivElement>;
  before(() => {
    toolbarContainer = SugarElement.fromHtml(`<div id="toolbar" style="width: ${expectedWidth}px;"></div>`);
    Insert.append(SugarBody.body(), toolbarContainer);
  });

  after(() => {
    Remove.remove(toolbarContainer);
  });

  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    fixed_toolbar_container: '#toolbar',
    inline: true,
  }, [ Theme ]);

  it('TINY-6683: Should not resize the sink to the body width', async () => {
    const editor = hook.editor();
    editor.setContent('fixed_toolbar_container test');
    editor.focus();

    const sink = await UiFinder.pWaitFor('Wait for the sink to be rendered', SugarBody.body(), '.tox-silver-sink') as SugarElement<HTMLElement>;
    const sinkWidth = Width.get(sink);
    assert.equal(sinkWidth, expectedWidth, `Sink should be ${expectedWidth}px wide`);
  });
});
