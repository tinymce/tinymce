import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, Css, Remove, SelectorFind, SugarBody, TextContent, type SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import AriaAnnouncer from 'tinymce/core/api/dom/AriaAnnouncer';
import * as Announcer from 'tinymce/core/aria/Announcer';

describe('browser.tinymce.core.AriaAnnouncerTest', () => {
  const containerSelector = `#${Announcer.announcerContainerId}`;

  const pGetContainer = (): Promise<SugarElement<HTMLElement>> =>
    UiFinder.pWaitFor<HTMLElement>('aria announcer container should exist on the body', SugarBody.body(), containerSelector);

  const pPoliteMessage = (container: SugarElement<HTMLElement>, text: string): Promise<void> =>
    Waiter.pTryUntil(`polite region should contain a message "${text}"`, () => {
      const politeRegions = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="polite"]');
      assert.isAtLeast(politeRegions.length, 1, 'polite region not present');
      const messageDivs = UiFinder.findAllIn<HTMLElement>(politeRegions[0], 'div');
      const found = Arr.exists(messageDivs, (m) => TextContent.get(m) === text);
      assert.isTrue(found, `message "${text}" not present in polite region`);
    });

  const pAssertiveText = (container: SugarElement<HTMLElement>, text: string): Promise<void> =>
    Waiter.pTryUntil(`assertive region should contain "${text}"`, () => {
      const matches = Arr.filter(UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="assertive"]'), (r) => TextContent.get(r) === text);
      assert.isAtLeast(matches.length, 1, `text "${text}" not present in any assertive region`);
    });

  afterEach(() => {
    SelectorFind.descendant(SugarBody.body(), containerSelector).each(Remove.remove);
  });

  it('TINY-12791: Container is created lazily on first announce with offscreen styles', async () => {
    AriaAnnouncer.announce('Setup');
    const container = await pGetContainer();

    assert.equal(Css.get(container, 'position'), 'absolute');
    assert.equal(Css.get(container, 'left'), '-9999px');
    assert.equal(Css.get(container, 'overflow'), 'hidden');
  });

  it('TINY-12791: Container starts with polite region and assertive regions', async () => {
    AriaAnnouncer.announce('Setup');
    const container = await pGetContainer();

    const polite = await UiFinder.pWaitFor<HTMLElement>('waited for polite container', container, 'div[aria-live="polite"]');
    assert.equal(Attribute.get(polite, 'aria-atomic'), 'false');
    assert.equal(Attribute.get(polite, 'aria-relevant'), 'additions');

    const assertive = await UiFinder.pWaitFor<HTMLElement>('waited for assertive container', container, 'div[aria-live="assertive"]');
    assert.equal(Attribute.get(assertive, 'aria-atomic'), 'true');
  });

  it('TINY-12791: Polite announce appends a message div as a child of the polite region', async () => {
    AriaAnnouncer.announce('Bold on');
    const container = await pGetContainer();

    await pPoliteMessage(container, 'Bold on');
  });

  it('TINY-12791: Subsequent polite announces append additional message divs and keep prior ones', async () => {
    AriaAnnouncer.announce('First');
    const container = await pGetContainer();
    await pPoliteMessage(container, 'First');

    AriaAnnouncer.announce('Second');
    await pPoliteMessage(container, 'Second');

    const polite = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="polite"]');
    assert.lengthOf(polite, 1, 'still only one polite region');
    const messageDivs = UiFinder.findAllIn<HTMLElement>(polite[0], 'div');
    const texts = Arr.map(messageDivs, TextContent.get);
    assert.deepEqual(texts, [ 'First', 'Second' ], 'both messages should be present in order');
  });

  it('TINY-12791: A new assertive announce removes the prior assertive content from the DOM', async () => {
    AriaAnnouncer.announce('Error A', { assertive: true });
    const container = await pGetContainer();
    await pAssertiveText(container, 'Error A');

    AriaAnnouncer.announce('Error B', { assertive: true });
    await pAssertiveText(container, 'Error B');

    const assertive = UiFinder.findAllIn<HTMLElement>(container, 'div[aria-live="assertive"]');
    assert.lengthOf(assertive, 1, 'exactly one assertive region remains after the second announce');
    assert.equal(TextContent.get(assertive[0]), 'Error B');
  });

  it('TINY-12791: Assertive announce does not affect polite messages already in the region', async () => {
    AriaAnnouncer.announce('Polite message');
    const container = await pGetContainer();
    await pPoliteMessage(container, 'Polite message');

    AriaAnnouncer.announce('Urgent', { assertive: true });
    await pAssertiveText(container, 'Urgent');

    await pPoliteMessage(container, 'Polite message');
  });
});
