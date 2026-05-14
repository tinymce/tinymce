import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Remove, SelectorFind, SugarBody, type SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import AriaAnnouncer, { announcerContainerId } from 'tinymce/core/api/dom/AriaAnnouncer';

describe('browser.tinymce.core.AriaAnnouncerTest', () => {
  const containerSelector = `#${announcerContainerId}`;

  const pGetContainer = (): Promise<SugarElement<HTMLElement>> =>
    UiFinder.pWaitFor<HTMLElement>('aria announcer container should exist on the body', SugarBody.body(), containerSelector);

  const pPoliteMessage = (container: SugarElement<HTMLElement>, text: string): Promise<void> =>
    Waiter.pTryUntil(`polite region should contain a message "${text}"`, () => {
      const politeRegions = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="polite"]');
      assert.isAtLeast(politeRegions.length, 1, 'polite region not present');
      const messageDivs = UiFinder.findAllIn<HTMLElement>(politeRegions[0], 'div');
      const found = messageDivs.some((m) => m.dom.textContent === text);
      assert.isTrue(found, `message "${text}" not present in polite region`);
    });

  const pAssertiveText = (container: SugarElement<HTMLElement>, text: string): Promise<void> =>
    Waiter.pTryUntil(`assertive region should contain "${text}"`, () => {
      const matches = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="assertive"]')
        .filter((r) => r.dom.textContent === text);
      assert.isAtLeast(matches.length, 1, `text "${text}" not present in any assertive region`);
    });

  afterEach(() => {
    SelectorFind.descendant(SugarBody.body(), containerSelector).each(Remove.remove);
  });

  it('Container is created lazily on first announce with offscreen styles', async () => {
    AriaAnnouncer.announce('Setup');
    const container = (await pGetContainer()).dom;

    assert.equal(container.style.position, 'absolute');
    assert.equal(container.style.left, '-9999px');
    assert.equal(container.style.overflow, 'hidden');
  });

  it('Container starts with one persistent polite region and no assertive region', async () => {
    AriaAnnouncer.announce('Setup');
    const container = await pGetContainer();

    const polite = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="polite"]');
    const assertive = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="assertive"]');
    assert.lengthOf(polite, 1, 'should have one polite region');
    assert.lengthOf(assertive, 0, 'no assertive region should exist until an assertive announce');
    assert.equal(polite[0].dom.getAttribute('aria-atomic'), 'false');
    assert.equal(polite[0].dom.getAttribute('aria-relevant'), 'additions');
  });

  it('Polite announce appends a message div as a child of the polite region', async () => {
    AriaAnnouncer.announce('Bold on');
    const container = await pGetContainer();

    await pPoliteMessage(container, 'Bold on');
  });

  it('Subsequent polite announces append additional message divs and keep prior ones', async () => {
    AriaAnnouncer.announce('First');
    const container = await pGetContainer();
    await pPoliteMessage(container, 'First');

    AriaAnnouncer.announce('Second');
    await pPoliteMessage(container, 'Second');

    const polite = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="polite"]');
    assert.lengthOf(polite, 1, 'still only one polite region');
    const messageDivs = UiFinder.findAllIn<HTMLElement>(polite[0], 'div');
    const texts = messageDivs.map((m) => m.dom.textContent);
    assert.deepEqual(texts, [ 'First', 'Second' ], 'both messages should be present in order');
  });

  it('Assertive announce creates a single assertive region with correct attributes', async () => {
    AriaAnnouncer.announce('Error occurred', { assertive: true });
    const container = await pGetContainer();

    await pAssertiveText(container, 'Error occurred');
    const assertive = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="assertive"]');
    assert.lengthOf(assertive, 1, 'exactly one assertive region after a single announce');
    assert.equal(assertive[0].dom.getAttribute('aria-atomic'), 'true');
    assert.equal(assertive[0].dom.getAttribute('role'), 'alert');
  });

  it('A new assertive announce removes the prior assertive region from the DOM', async () => {
    AriaAnnouncer.announce('Error A', { assertive: true });
    const container = await pGetContainer();
    await pAssertiveText(container, 'Error A');
    const priorRegion = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="assertive"]')[0];

    AriaAnnouncer.announce('Error B', { assertive: true });
    await pAssertiveText(container, 'Error B');

    assert.isFalse(priorRegion.dom.isConnected, 'prior assertive region should be removed from the DOM');
    const assertive = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="assertive"]');
    assert.lengthOf(assertive, 1, 'exactly one assertive region remains after the second announce');
    assert.equal(assertive[0].dom.textContent, 'Error B');
  });

  it('Assertive announce does not affect polite messages already in the region', async () => {
    AriaAnnouncer.announce('Polite message');
    const container = await pGetContainer();
    await pPoliteMessage(container, 'Polite message');

    AriaAnnouncer.announce('Urgent', { assertive: true });
    await pAssertiveText(container, 'Urgent');

    await pPoliteMessage(container, 'Polite message');
  });
});
