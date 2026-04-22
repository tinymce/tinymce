import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import { announcerContainerId } from 'tinymce/core/aria/AriaAnnouncer';

describe('browser.tinymce.core.AriaAnnouncerTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const getContainer = (): HTMLElement => {
    const container = document.body.querySelector(`#${announcerContainerId}`);
    assert.isNotNull(container, 'aria announcer container should exist on the body');
    return container as HTMLElement;
  };

  it('TINY-ARIA: aria announcer container is created on body with offscreen styles', () => {
    const container = getContainer();
    assert.equal(container.style.position, 'absolute');
    assert.equal(container.style.left, '-9999px');
    assert.equal(container.style.overflow, 'hidden');
  });

  it('TINY-ARIA: announce creates a polite token with correct attributes', () => {
    const editor = hook.editor();
    const container = getContainer();

    editor.announce('Bold on');

    const token = container.querySelector('span[aria-live="polite"]');
    assert.isNotNull(token, 'polite token should exist');
    assert.equal(token?.getAttribute('aria-atomic'), 'true');
    assert.equal(token?.getAttribute('aria-label'), 'Bold on');
    assert.equal(token?.getAttribute('role'), 'presentation');
    assert.equal(token?.textContent, 'Bold on');
  });

  it('TINY-ARIA: assertive announce creates an assertive token with correct attributes', () => {
    const editor = hook.editor();
    const container = getContainer();

    editor.announce('Error occurred', { assertive: true });

    const token = container.querySelector('span[aria-live="assertive"]');
    assert.isNotNull(token, 'assertive token should exist');
    assert.equal(token?.getAttribute('aria-atomic'), 'true');
    assert.equal(token?.getAttribute('role'), 'alert');
    assert.equal(token?.textContent, 'Error occurred');
  });

  it('TINY-ARIA: token is removed after timeout', async () => {
    const editor = hook.editor();
    const container = getContainer();

    editor.announce('Italic on');

    const token = container.querySelector('span[aria-label="Italic on"]');
    assert.isNotNull(token, 'token should exist immediately');

    await Waiter.pTryUntil('Token should be removed after timeout', () => {
      const removed = container.querySelector('span[aria-label="Italic on"]');
      assert.isNull(removed, 'token should have been removed');
    }, 100, 2000);
  });

  it('TINY-ARIA: rapid calls create separate tokens for each message', () => {
    const editor = hook.editor();
    const container = getContainer();

    editor.announce('First');
    editor.announce('Second');
    editor.announce('Third');

    const tokens = container.querySelectorAll('span[aria-live="polite"]');
    const labels = Array.from(tokens).map((t) => t.getAttribute('aria-label'));
    assert.include(labels, 'First');
    assert.include(labels, 'Second');
    assert.include(labels, 'Third');
  });
});
