import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { Attribute, Css, Insert, Remove, SelectorFind, SugarBody, SugarElement, TextContent } from '@ephox/sugar';
import { assert } from 'chai';

import AriaAnnouncer from 'tinymce/core/api/dom/AriaAnnouncer';
import * as Announcer from 'tinymce/core/aria/Announcer';

type Live = 'polite' | 'assertive';

describe('browser.tinymce.core.AriaAnnouncerTest', () => {
  const containerSelector = `#${Announcer.announcerContainerId}`;

  const pGetContainer = (): Promise<SugarElement<HTMLElement>> =>
    UiFinder.pWaitFor<HTMLElement>('aria announcer container should exist on the body', SugarBody.body(), containerSelector);

  const getRegion = (container: SugarElement<HTMLElement>, live: Live): SugarElement<HTMLElement> => {
    const regions = UiFinder.findAllIn<HTMLElement>(container, `div[aria-live="${live}"]`);
    assert.lengthOf(regions, 1, `there should be exactly one ${live} region`);
    return regions[0];
  };

  const messagesOf = (container: SugarElement<HTMLElement>, live: Live): string[] =>
    Arr.bind(UiFinder.findAllIn<HTMLElement>(getRegion(container, live), 'div'), (el) => {
      const content = TextContent.get(el);
      return Type.isString(content) ? [ content ] : [];
    });

  const pMessage = (container: SugarElement<HTMLElement>, live: Live, text: string): Promise<void> =>
    Waiter.pTryUntil(`${live} region should contain a message "${text}"`, () => {
      assert.isTrue(Arr.contains(messagesOf(container, live), text), `message "${text}" not present in ${live} region`);
    });

  const assertLiveAttributes = (region: SugarElement<HTMLElement>, live: Live): void => {
    assert.equal(Attribute.get(region, 'aria-live'), live);
    assert.equal(Attribute.get(region, 'aria-atomic'), 'false');
    assert.equal(Attribute.get(region, 'aria-relevant'), 'additions');
  };

  const addExpiredMessages = (region: SugarElement<HTMLElement>, texts: string[]): void => {
    const expiredTimestamp = String(Date.now() - (10 * 60 * 1000 + 1000));
    Arr.each(texts, (text) => {
      const messageDiv = SugarElement.fromTag('div');
      Attribute.set(messageDiv, 'data-mce-announced-at', expiredTimestamp);
      TextContent.set(messageDiv, text);
      Insert.prepend(region, messageDiv);
    });
  };

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

  it('TINY-12791: Assertive announce does not affect polite messages already in the region', async () => {
    AriaAnnouncer.announce('Polite message');
    const container = await pGetContainer();
    await pMessage(container, 'polite', 'Polite message');

    AriaAnnouncer.announce('Urgent', { assertive: true });
    await pMessage(container, 'assertive', 'Urgent');

    await pMessage(container, 'polite', 'Polite message');
  });

  describe('Polite region', () => {
    const announce = (message: string): void => AriaAnnouncer.announce(message);

    it('TINY-12791: Polite region has the expected live attributes', async () => {
      announce('Setup');
      const container = await pGetContainer();

      assertLiveAttributes(getRegion(container, 'polite'), 'polite');
    });

    it('TINY-12791: Polite announce appends a message div to the polite region only', async () => {
      announce('Bold on');
      const container = await pGetContainer();

      await pMessage(container, 'polite', 'Bold on');
      assert.isFalse(Arr.contains(messagesOf(container, 'assertive'), 'Bold on'), 'message should not be present in the assertive region');
    });

    it('TINY-12791: Subsequent polite announces append additional message divs and keep prior ones', async () => {
      announce('First');
      const container = await pGetContainer();
      await pMessage(container, 'polite', 'First');

      announce('Second');
      await pMessage(container, 'polite', 'Second');

      assert.deepEqual(messagesOf(container, 'polite'), [ 'First', 'Second' ], 'both messages should be present in order');
    });

    it('TINY-12791: Polite messages older than 10 minutes are cleaned up on the next announce', async () => {
      announce('Setup');
      const container = await pGetContainer();
      await pMessage(container, 'polite', 'Setup');

      addExpiredMessages(getRegion(container, 'polite'), [ 'Old 1', 'Old 2', 'Old 3' ]);

      announce('Fresh');
      await pMessage(container, 'polite', 'Fresh');

      await Waiter.pTryUntil('expired polite messages should be removed', () => {
        assert.deepEqual(messagesOf(container, 'polite'), [ 'Setup', 'Fresh' ], 'only the non-expired messages should remain, in order');
      });
    });
  });

  describe('Assertive region', () => {
    const announce = (message: string): void => AriaAnnouncer.announce(message, { assertive: true });

    it('TINY-12791: Assertive region has the expected live attributes', async () => {
      announce('Setup');
      const container = await pGetContainer();

      assertLiveAttributes(getRegion(container, 'assertive'), 'assertive');
    });

    it('TINY-12791: Assertive announce appends a message div to the assertive region only', async () => {
      announce('Error A');
      const container = await pGetContainer();

      await pMessage(container, 'assertive', 'Error A');
      assert.isFalse(Arr.contains(messagesOf(container, 'polite'), 'Error A'), 'message should not be present in the polite region');
    });

    it('TINY-12791: Subsequent assertive announces append additional message divs and keep prior ones', async () => {
      announce('Error A');
      const container = await pGetContainer();
      await pMessage(container, 'assertive', 'Error A');

      announce('Error B');
      await pMessage(container, 'assertive', 'Error B');

      assert.deepEqual(messagesOf(container, 'assertive'), [ 'Error A', 'Error B' ], 'both messages should be present in order');
    });

    it('TINY-12791: Assertive messages older than 10 minutes are cleaned up on the next announce', async () => {
      announce('Setup');
      const container = await pGetContainer();
      await pMessage(container, 'assertive', 'Setup');

      addExpiredMessages(getRegion(container, 'assertive'), [ 'Old 1', 'Old 2', 'Old 3' ]);

      announce('Fresh');
      await pMessage(container, 'assertive', 'Fresh');

      await Waiter.pTryUntil('expired assertive messages should be removed', () => {
        assert.deepEqual(messagesOf(container, 'assertive'), [ 'Setup', 'Fresh' ], 'only the non-expired messages should remain, in order');
      });
    });
  });
});
