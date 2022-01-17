import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/searchreplace/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.searchreplace.SearchReplacePrevNextTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ]);

  const body = SugarBody.body();

  const pAssertButtonsEnabled = async () => {
    await UiFinder.pWaitFor('next button enabled', body, 'button[title="Next"]:not([disabled])');
    await UiFinder.pWaitFor('prev button enabled', body, 'button[title="Previous"]:not([disabled])');
    await UiFinder.pWaitFor('replace button enabled', body, 'button[title="Replace"]:not([disabled])');
  };

  const pAssertNextPrevButtonsDisabled = async () => {
    await UiFinder.pWaitFor('next button disabled', body, 'button[title="Next"][disabled]');
    await UiFinder.pWaitFor('prev button disabled', body, 'button[title="Previous"][disabled]');
  };

  it('TBA: Test Prev and Next buttons become enabled and disabled at right places when multiple matches exist', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish fish fish</p>');
    await Utils.pOpenDialog(editor);
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'fish');
    Utils.clickFind(editor);

    // Initial button states for first match
    await pAssertButtonsEnabled();

    // Click next and assert states for second match
    Utils.clickNext(editor);
    await pAssertButtonsEnabled();

    // Click next and assert states for third/final match
    Utils.clickNext(editor);
    await pAssertButtonsEnabled();

    // Click next and cycle back to first match
    Utils.clickNext(editor);
    await pAssertButtonsEnabled();

    // replace all but one value and assert next/previous are disabled
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Replace with"]', 'squid');
    Utils.clickReplace(editor);
    await pAssertButtonsEnabled();
    Utils.clickReplace(editor);
    await pAssertNextPrevButtonsDisabled();

    // Ensure the replace button is still enabled, for the last match
    await UiFinder.pWaitFor('wait for replace button to be enabled', body, 'button[title="Replace"]:not([disabled])');
    TinyAssertions.assertContent(editor, '<p>squid squid fish</p>');
  });
});
