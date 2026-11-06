import { Waiter } from '@ephox/agar';
import { after, afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Attribute, Class, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import * as Disabled from 'tinymce/core/mode/Disabled';

describe('browser.tinymce.core.DisabledModeFocusTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    disabled: true
  };

  // A synthetic Tab key event does not move focus, so instead of pressing Tab these tests check the state the browser
  // builds its sequential focus navigation order from: an element is a tab stop when it is focusable and its tabindex
  // is not negative. Without a tabindex attribute an iframe is focusable and an element only when it is an editing host.
  const isTabStop = (elm: HTMLElement): boolean => {
    if (elm.hasAttribute('tabindex')) {
      return elm.tabIndex >= 0;
    } else {
      return elm.tagName === 'IFRAME' || elm.isContentEditable;
    }
  };

  const getTabStopElement = (editor: Editor): HTMLElement =>
    editor.inline ? editor.getBody() : editor.iframeElement as HTMLIFrameElement;

  const assertTabStop = (editor: Editor, expected: boolean, tabindex: string | null) => {
    const elm = getTabStopElement(editor);
    assert.equal(isTabStop(elm), expected, `The editor should ${expected ? '' : 'not '}be a tab stop`);
    assert.equal(elm.getAttribute('tabindex'), tabindex, 'Should have the expected tabindex attribute');
  };

  const pSetDisabled = async (editor: Editor, state: boolean) => {
    editor.options.set('disabled', state);
    await Waiter.pTryUntil(`Wait for the editor to be ${state ? 'disabled' : 'enabled'}`, () =>
      assert.equal(editor.getBody().contentEditable, String(!state)));
  };

  const setupTarget = (tag: string, attrs: Record<string, string>) => () => {
    const element = SugarElement.fromTag(tag);
    Attribute.setAll(element, attrs);
    Insert.append(SugarBody.body(), element);
    return {
      element,
      teardown: () => Remove.remove(element)
    };
  };

  context('Iframe editor', () => {
    const hook = TinyHooks.bddSetupLight<Editor>(settings, []);

    afterEach(() => hook.editor().options.set('disabled', true));

    it('TINYMCE-13514: An editor that starts disabled is not a tab stop', () => {
      const editor = hook.editor();
      assertTabStop(editor, false, '-1');
    });

    it('TINYMCE-13514: Enabling the editor makes it a tab stop again', async () => {
      const editor = hook.editor();
      await pSetDisabled(editor, false);
      assertTabStop(editor, true, null);
      await pSetDisabled(editor, true);
      assertTabStop(editor, false, '-1');
    });

    it('TINYMCE-13514: Disabling an already disabled editor still restores the tab order on enable', async () => {
      const editor = hook.editor();
      Disabled.toggleDisabled(editor, true);
      await pSetDisabled(editor, false);
      assertTabStop(editor, true, null);
    });
  });

  context('Iframe editor with a tabindex on the target', () => {
    const hook = TinyHooks.bddSetupFromElement<Editor>(settings, setupTarget('textarea', { tabindex: '7' }), []);

    afterEach(() => hook.editor().options.set('disabled', true));

    it('TINYMCE-13514: Enabling the editor restores the tabindex of the target', async () => {
      const editor = hook.editor();
      assertTabStop(editor, false, '-1');
      await pSetDisabled(editor, false);
      assertTabStop(editor, true, '7');
    });

    it('TINYMCE-13514: Disabling an already disabled editor keeps the tabindex of the target', async () => {
      const editor = hook.editor();
      Disabled.toggleDisabled(editor, true);
      await pSetDisabled(editor, false);
      assertTabStop(editor, true, '7');
    });
  });

  context('Iframe editor with a negative tabindex in iframe_attrs', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({ ...settings, iframe_attrs: { tabindex: '-1' }}, []);

    afterEach(() => hook.editor().options.set('disabled', true));

    it('TINYMCE-13514: Enabling the editor keeps a tabindex of -1 set by the integration', async () => {
      const editor = hook.editor();
      assertTabStop(editor, false, '-1');
      await pSetDisabled(editor, false);
      assertTabStop(editor, false, '-1');
    });
  });

  context('Iframe editor with a tabindex in iframe_attrs', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({ ...settings, iframe_attrs: { tabindex: '2' }}, []);

    afterEach(() => hook.editor().options.set('disabled', true));

    it('TINYMCE-13514: Enabling the editor restores the tabindex from iframe_attrs', async () => {
      const editor = hook.editor();
      assertTabStop(editor, false, '-1');
      await pSetDisabled(editor, false);
      assertTabStop(editor, true, '2');
    });
  });

  context('Inline editor', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({ ...settings, inline: true }, []);

    afterEach(() => hook.editor().options.set('disabled', true));

    it('TINYMCE-13514: An inline editor that starts disabled is not a tab stop', () => {
      const editor = hook.editor();
      assertTabStop(editor, false, null);
    });

    it('TINYMCE-13514: Enabling an inline editor makes it a tab stop without adding a tabindex', async () => {
      const editor = hook.editor();
      await pSetDisabled(editor, false);
      assertTabStop(editor, true, null);
    });
  });

  context('Inline editor with a tabindex and textbox role on the target', () => {
    const hook = TinyHooks.bddSetupFromElement<Editor>(
      { ...settings, inline: true },
      setupTarget('div', { tabindex: '3', role: 'textbox' }),
      []
    );

    afterEach(() => hook.editor().options.set('disabled', true));

    it('TINYMCE-13514: A disabled inline editor has no tabindex and is marked as disabled', () => {
      const editor = hook.editor();
      assertTabStop(editor, false, null);
      assert.equal(Attribute.get(TinyDom.body(editor), 'aria-disabled'), 'true');
    });

    it('TINYMCE-13514: Enabling an inline editor restores the tabindex and removes aria-disabled', async () => {
      const editor = hook.editor();
      await pSetDisabled(editor, false);
      assertTabStop(editor, true, '3');
      assert.isFalse(Attribute.has(TinyDom.body(editor), 'aria-disabled'));
    });

    it('TINYMCE-13514: Disabling an already disabled inline editor keeps the tabindex of the target', async () => {
      const editor = hook.editor();
      Disabled.toggleDisabled(editor, true);
      await pSetDisabled(editor, false);
      assertTabStop(editor, true, '3');
    });
  });

  context('Focus highlight', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({ ...settings, disabled: false }, []);
    let outsideButton: HTMLButtonElement;

    const assertHighlighted = (editor: Editor, expected: boolean) =>
      assert.equal(Class.has(TinyDom.container(editor), 'tox-edit-focus'), expected, `The editor should ${expected ? '' : 'not '}be highlighted`);

    before(() => {
      outsideButton = document.createElement('button');
      document.body.appendChild(outsideButton);
    });

    after(() => {
      outsideButton.remove();
    });

    it('TINYMCE-13514: Disabling a focused editor keeps focus and the highlight until focus leaves', async () => {
      const editor = hook.editor();
      editor.focus();
      await Waiter.pTryUntil('Wait for the editor to be highlighted', () => assertHighlighted(editor, true));

      await pSetDisabled(editor, true);
      assert.isTrue(editor.hasFocus(), 'The editor should keep focus');
      assertHighlighted(editor, true);

      outsideButton.focus();
      await Waiter.pTryUntil('Wait for the editor highlight to be removed', () => assertHighlighted(editor, false));
    });
  });

  context('auto_focus', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({ ...settings, auto_focus: true }, []);

    it('TINYMCE-13514: A disabled editor is not focused by auto_focus', async () => {
      const editor = hook.editor();
      // auto_focus runs on a 100ms timer after init
      await Waiter.pWait(200);
      assert.isFalse(editor.hasFocus(), 'The editor should not have focus');
    });
  });
});
