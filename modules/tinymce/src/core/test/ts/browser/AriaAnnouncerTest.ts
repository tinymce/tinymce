import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { SugarBody, type SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import AriaAnnouncer, { announcerContainerId } from 'tinymce/core/api/dom/AriaAnnouncer';
import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.AriaAnnouncerTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const containerSelector = `#${announcerContainerId}`;

  const pGetContainer = (): Promise<SugarElement<HTMLElement>> =>
    UiFinder.pWaitFor<HTMLElement>('aria announcer container should exist on the body', SugarBody.body(), containerSelector);

  afterEach(async () => {
    await Waiter.pTryUntil(
      'Announcer container should be cleaned up between tests',
      () => UiFinder.notExists(SugarBody.body(), containerSelector),
      100,
      3000
    );
  });

  it('Container is created lazily on first announce with offscreen styles', async () => {
    const editor = hook.editor();

    editor.announce('Setup');
    const container = (await pGetContainer()).dom;

    assert.equal(container.style.position, 'absolute');
    assert.equal(container.style.left, '-9999px');
    assert.equal(container.style.overflow, 'hidden');
  });

  it('Announce creates a polite token with correct attributes', async () => {
    const editor = hook.editor();

    editor.announce('Bold on');
    const container = await pGetContainer();

    const token = (await UiFinder.pWaitFor<HTMLElement>('polite token should exist', container, 'span[aria-live="polite"][aria-label="Bold on"]')).dom;
    assert.equal(token.getAttribute('aria-atomic'), 'true');
    assert.equal(token.getAttribute('role'), 'presentation');
    assert.equal(token.textContent, 'Bold on');
  });

  it('Assertive announce creates an assertive token with correct attributes', async () => {
    const editor = hook.editor();

    editor.announce('Error occurred', { assertive: true });
    const container = await pGetContainer();

    const token = (await UiFinder.pWaitFor<HTMLElement>('assertive token should exist', container, 'span[aria-live="assertive"]')).dom;
    assert.equal(token.getAttribute('aria-atomic'), 'true');
    assert.equal(token.getAttribute('role'), 'alert');
    assert.equal(token.textContent, 'Error occurred');
  });

  it('Token is removed after timeout', async () => {
    const editor = hook.editor();

    editor.announce('Italic on');
    const container = await pGetContainer();
    const tokenSelector = 'span[aria-label="Italic on"]';

    await UiFinder.pWaitFor('token "Italic on" should exist immediately', container, tokenSelector);

    await Waiter.pTryUntil(
      'Token should be removed after timeout',
      () => UiFinder.notExists(container, tokenSelector),
      100,
      2000
    );
  });

  it('Container is removed once all tokens have been cleaned up', async () => {
    const editor = hook.editor();

    editor.announce('Cleanup');
    await pGetContainer();

    await Waiter.pTryUntil(
      'Container should be removed once all tokens have been cleaned up',
      () => UiFinder.notExists(SugarBody.body(), containerSelector),
      100,
      3000
    );
  });

  it('Rapid calls create separate tokens for each message', async () => {
    const editor = hook.editor();

    editor.announce('First');
    editor.announce('Second');
    editor.announce('Third');
    const container = await pGetContainer();

    await UiFinder.pWaitFor('all three tokens should be present', container, 'span[aria-label="Third"]');
    const tokens = UiFinder.findAllIn<HTMLElement>(container, 'span[aria-live="polite"]');
    const labels = tokens.map((t) => t.dom.getAttribute('aria-label'));
    assert.include(labels, 'First');
    assert.include(labels, 'Second');
    assert.include(labels, 'Third');
  });

  it('Announcer is accessible via the tinymce.dom.AriaAnnouncer', async () => {
    AriaAnnouncer.announce('Global announce');
    const container = await pGetContainer();

    await UiFinder.pWaitFor('token should be created via the global singleton', container, 'span[aria-label="Global announce"]');
  });
});
