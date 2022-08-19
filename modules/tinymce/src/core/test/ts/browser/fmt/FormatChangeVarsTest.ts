import { Waiter } from '@ephox/agar';
import { after, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.FormatChangeVarsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const events: Record<string, boolean[]> = {
    general: [],
    helvetica: [],
    comicSans: []
  };

  const generalCleanup = Singleton.unbindable();
  const helveticaCleanup = Singleton.unbindable();
  const comicSansCleanup = Singleton.unbindable();

  const clearEvents = () => {
    events.general = [];
    events.helvetica = [];
    events.comicSans = [];
  };

  const helveticaFont = 'helvetica, arial, sans-serif';
  const comicSansFont = '\'comic sans ms\', sans-serif';

  before(() => {
    const editor = hook.editor();
    generalCleanup.set(editor.formatter.formatChanged('fontname', (evt) => events.general.push(evt), true));
    helveticaCleanup.set(editor.formatter.formatChanged('fontname', (evt) => events.helvetica.push(evt), false, {
      value: helveticaFont
    }));
    comicSansCleanup.set(editor.formatter.formatChanged('fontname', (evt) => events.comicSans.push(evt), false, {
      value: comicSansFont
    }));
  });

  after(() => {
    generalCleanup.clear();
    helveticaCleanup.clear();
    comicSansCleanup.clear();
  });

  context('Simple cases', () => {
    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent(`<p>Unstyled content <span style="font-family: ${comicSansFont}">Styled content</span></p>`);
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      clearEvents();
    });

    it('TINY-7713: Fires when entering styled content', () => {
      const editor = hook.editor();
      // Inside the span
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);

      assert.deepEqual(events.general, [ true ], 'font-family has been turned on');
      assert.deepEqual(events.comicSans, [ true ], 'font-family comic sans has been turned on');
    });

    it('TINY-7713: Fires when leaving styled content', () => {
      const editor = hook.editor();
      // Move into the styled area
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      clearEvents();
      // Move back out
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      assert.deepEqual(events.general, [ false ], 'font-family was turned off');
      assert.deepEqual(events.comicSans, [ false ], 'font-family comic sans was turned off');
    });

    it('TINY-7713: Fires when changing formats', () => {
      const editor = hook.editor();
      // Select the entire styled content
      TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 'Styled content'.length);
      clearEvents();
      // Change it
      editor.formatter.apply('fontname', { value: helveticaFont });

      assert.deepEqual(events.general, [], 'font-family was not turned on or off');
      assert.deepEqual(events.comicSans, [ false ], 'font-family comic sans was turned off');
      assert.deepEqual(events.helvetica, [ true ], 'font-family helvetica was turned on');
    });

    it('TINY-7713: Fires when removing or applying formats', () => {
      const editor = hook.editor();
      // Move the cursor into the styled content
      TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 'Styled content'.length);
      clearEvents();

      // Remove it
      editor.formatter.remove('fontname', { value: comicSansFont });
      assert.deepEqual(events.general, [ false ], 'font-family was turned off');
      assert.deepEqual(events.comicSans, [ false ], 'font-family comic sans was turned off');
      clearEvents();

      // Bring it back
      editor.formatter.apply('fontname', { value: comicSansFont });
      assert.deepEqual(events.general, [ true ], 'font-family was turned on');
      assert.deepEqual(events.comicSans, [ true ], 'fony-family comic sans was turned on');
    });
  });

  context('Other formats also applied', () => {
    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('<p>' +
        'Unstyled content ' +
        `<span style="color: red; font-family: ${helveticaFont}">styled content</span>` +
        '</p>'
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      clearEvents();
    });

    it('TINY-7713: Fires when editing styles without wrapping or unwrapping spans', async () => {
      const editor = hook.editor();
      TinySelections.setCursor(editor, [ 0, 1 ], 0);
      clearEvents();

      editor.formatter.remove('fontname', { value: helveticaFont });
      await Waiter.pWait(0);
      assert.deepEqual(events.general, [ false ], 'font-family has been turned off');
      assert.deepEqual(events.helvetica, [ false ], 'font-family helvetica has been turned off');
      clearEvents();

      editor.formatter.apply('fontname', { value: helveticaFont });
      assert.deepEqual(events.general, [ true ], 'font-family has been turned on');
      assert.deepEqual(events.helvetica, [ true ], 'font-family helvetica has been turned on');
    });
  });

  context('Nested spans with conflicting styles', () => {
    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('<p>' +
        'Unstyled content ' +
        `<span style="font-family: ${comicSansFont};">` +
        `Content <span style="font-family: ${helveticaFont};">content</span> content` +
        '</span>' +
        '</p>'
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      clearEvents();
    });

    it('TINY-7713: Does not fire on outer spans when entering nested content', () => {
      const editor = hook.editor();
      // Inside the nested span
      TinySelections.setCursor(editor, [ 0, 1, 1, 0 ], 0);

      assert.deepEqual(events.general, [ true ], 'font-family has been turned on');
      assert.deepEqual(events.helvetica, [ true ], 'font-family helvetica has been turned on');
      assert.deepEqual(events.comicSans, [], 'font-family comic sans has not been turned on');
    });

    it('TINY-7713: Fires both +inner and -outer when moving selection into nested content', () => {
      const editor = hook.editor();
      // Inside the first span
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      clearEvents();

      // Then inside the nested span
      TinySelections.setCursor(editor, [ 0, 1, 1, 0 ], 0);

      assert.deepEqual(events.general, [ ], 'font-family was not changed');
      assert.deepEqual(events.helvetica, [ true ], 'font-family helvetica was turned on');
      assert.deepEqual(events.comicSans, [ false ], 'font-family comic sans was turned off');
    });

    it('TINY-7713: Fires +outer and -inner when removing innermost format with nested content', async () => {
      const editor = hook.editor();
      TinySelections.setCursor(editor, [ 0, 1, 1, 0 ], 0);
      clearEvents();

      editor.formatter.remove('fontname', { value: helveticaFont });
      await Waiter.pWait(0);

      assert.deepEqual(events.general, [ ], 'font-family was not changed');
      assert.deepEqual(events.helvetica, [ false ], 'font-family helvetica was turned off');
      assert.deepEqual(events.comicSans, [ true ], 'font-family comic sans was turned on');
    });
  });
});
