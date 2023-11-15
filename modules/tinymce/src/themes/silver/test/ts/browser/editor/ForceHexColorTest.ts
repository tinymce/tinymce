import { Transformations } from '@ephox/acid';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.ForceHexColorTest', () => {
  const applyAndAssertForeColor = (editor: Editor, appliedColor: string, expectedColor: string) => {
    // Reset content
    editor.setContent('<p>colour me</p>');

    return {
      /** Apply color using 'mceApplyTextcolor' command. */
      usingCommand: () => {
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'color me'.length + 1);
        editor.execCommand('mceApplyTextcolor', 'forecolor' as any, appliedColor);
        TinyAssertions.assertContentPresence(editor, { [`span[data-mce-style="color: ${expectedColor};"]`]: 1 });
        TinyAssertions.assertContent(editor, `<p><span style="color: ${expectedColor};">colour me</span></p>`);
      },
      /** Apply color using the 'forecolor' part of the toolbar. */
      usingToolbar: async () => {
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'color me'.length + 1);
        TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, `div[data-mce-color="${appliedColor}"]`);
        TinyAssertions.assertContentPresence(editor, { [`span[data-mce-style="color: ${expectedColor};"]`]: 1 });
        TinyAssertions.assertContent(editor, `<p><span style="color: ${expectedColor};">colour me</span></p>`);
      },
    };
  };

  context('force_hex_color option set to default ("off")', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
    }, []);

    it('TINY-9819: data-mce-style colors are left as RGB', () => {
      const editor = hook.editor();
      assert.equal(editor.options.get('force_hex_color'), 'off', 'force_hex_color must be set to "off"');
      applyAndAssertForeColor(editor, '#E03E2D', 'rgb(224, 62, 45)').usingCommand();
      applyAndAssertForeColor(editor, '#FF0000', 'rgb(255, 0, 0)').usingCommand();
      applyAndAssertForeColor(editor, '#00FF00', 'rgb(0, 255, 0)').usingCommand();
      applyAndAssertForeColor(editor, 'rgb(40, 120, 200)', 'rgb(40, 120, 200)').usingCommand();
    });

    it('TINY-9819: alpha channel is unaffected', () => {
      const editor = hook.editor();
      applyAndAssertForeColor(editor, 'rgba(224, 62, 45, 0.5)', 'rgba(224, 62, 45, 0.5)').usingCommand();
      applyAndAssertForeColor(editor, 'rgba(3, 2, 1, 0.01)', 'rgba(3, 2, 1, 0.01)').usingCommand();
    });
  });

  context('force_hex_color option set to "rgb_only"', () => {
    const color_map = [ '#E03E2D', 'Red', 'rgb(10, 200, 10)', 'Green' ];
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      force_hex_color: 'rgb_only',
      toolbar: 'forecolor',
      color_map,
    }, []);

    it('TINY-9819: will leave RGBA colors unaffected', () => {
      const editor = hook.editor();
      assert.equal(editor.options.get('force_hex_color'), 'rgb_only', 'force_hex_color must be set to "rgb_only"');
      applyAndAssertForeColor(editor, 'rgba(50, 60, 70, 0.4)', 'rgba(50, 60, 70, 0.4)').usingCommand();
    });

    it('TINY-9819: will convert RGB to HEX', () => {
      applyAndAssertForeColor(hook.editor(), 'rgb(50, 60, 70)', '#323C46').usingCommand();
      applyAndAssertForeColor(hook.editor(), 'rgb(105, 72, 72)', '#694848').usingCommand();
    });

    it('TINY-9819: will convert RGB to HEX with toolbar & color_map', async () => {
      const editor = hook.editor();
      await applyAndAssertForeColor(editor, color_map[0], color_map[0]).usingToolbar();
      const hex = Transformations.rgbaToHexString(color_map[2]);
      await applyAndAssertForeColor(editor, hex, hex).usingToolbar();
    });
  });

  context('force_hex_color option set to "always"', () => {
    const color_map = [ '#E03E2D', 'Red', 'rgb(10, 200, 10)', 'Green', 'rgba(10, 10, 200, 0.9)', 'Blue' ];
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      force_hex_color: 'always',
      toolbar: 'forecolor',
      color_map,
    }, []);

    it('TINY-9819: will convert RGB & RGBA to HEX', () => {
      const editor = hook.editor();
      assert.equal(editor.options.get('force_hex_color'), 'always', 'force_hex_color must be set to "always"');
      applyAndAssertForeColor(editor, 'rgb(50, 60, 70)', '#323C46').usingCommand();
      applyAndAssertForeColor(editor, 'rgba(50, 60, 70, 0.4)', '#323C46').usingCommand();
    });

    it('TINY-9819: will convert RGB & RGBA to HEX with toolbar & color_map', async () => {
      const editor = hook.editor();
      await applyAndAssertForeColor(editor, color_map[0], color_map[0]).usingToolbar();
      let hex = Transformations.rgbaToHexString(color_map[2]);
      await applyAndAssertForeColor(editor, hex, hex).usingToolbar();
      hex = Transformations.rgbaToHexString(color_map[4]);
      await applyAndAssertForeColor(editor, hex, hex).usingToolbar();
    });
  });

  context('force_hex_color option set to "always" and without color_map', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      force_hex_color: 'always',
      toolbar: 'forecolor',
    }, []);

    it('TINY-9819: will convert RGB & RGBA to HEX', () => {
      const editor = hook.editor();
      assert.isFalse(editor.options.isSet('color_map'));

      applyAndAssertForeColor(editor, '#00FF00', '#00FF00').usingCommand();
      applyAndAssertForeColor(editor, 'rgb(10, 200, 10)', '#0AC80A').usingCommand();
      applyAndAssertForeColor(editor, 'rgba(10, 10, 200, 0.9)', '#0A0AC8').usingCommand();
    });

    it('TINY-9819: will convert RGB & RGBA to HEX with toolbar & without color_map', async () => {
      const editor = hook.editor();
      await applyAndAssertForeColor(editor, '#BA372A', '#BA372A').usingToolbar();
      await applyAndAssertForeColor(editor, '#3598DB', '#3598DB').usingToolbar();
      await applyAndAssertForeColor(editor, '#B96AD9', '#B96AD9').usingToolbar();
    });
  });
});
