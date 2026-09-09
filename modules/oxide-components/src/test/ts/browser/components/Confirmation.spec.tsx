import { Fun } from '@ephox/katamari';
import { Confirmation } from 'oxide-components/components/confirmation/Confirmation';
import { ConfirmationHost, type ConfirmationHostHandle } from 'oxide-components/components/confirmation/internals/ConfirmationHost';
import { UniverseProvider } from 'oxide-components/contexts/universecontext/UniverseProvider';
import * as Bem from 'oxide-components/utils/Bem';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.ConfirmationTest', () => {
  const wrapper = SnapshotTestUtils.snapshotWrapper;

  it('TINY-13783: should call onConfirm when the confirm button is clicked', async () => {
    const ref = createRef<ConfirmationHostHandle>();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    const { getByLabelText } = render(
      <ConfirmationHost ref={ref} />,
      { wrapper }
    );

    ref.current?.confirm({ text: 'Are you sure?', onConfirm });

    await expect.poll(() => document.querySelector(Bem.blockSelector('tox-dialog-wrap'))).not.toBeNull();
    await userEvent.click(getByLabelText('Yes'));

    await expect.poll(Fun.constant(onConfirm)).toHaveBeenCalledOnce();
    await expect.poll(() => document.querySelector(Bem.blockSelector('tox-dialog-wrap'))).toBeNull();
  });

  it('TINY-13783: should call onCancel when the cancel button is clicked', async () => {
    const ref = createRef<ConfirmationHostHandle>();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    const { getByLabelText } = render(
      <ConfirmationHost ref={ref} />,
      { wrapper }
    );

    ref.current?.confirm({ text: 'Are you sure?', onConfirm });

    await expect.poll(() => document.querySelector(Bem.blockSelector('tox-dialog-wrap'))).not.toBeNull();
    await userEvent.click(getByLabelText('No'));

    expect(onConfirm).not.toHaveBeenCalled();
    await expect.poll(() => document.querySelector(Bem.blockSelector('tox-dialog-wrap'))).toBeNull();
  });

  it('TINY-13783: should focus the confirm button when the dialog opens', async () => {
    const ref = createRef<ConfirmationHostHandle>();

    render(
      <ConfirmationHost ref={ref} />,
      { wrapper }
    );

    ref.current?.confirm({ text: 'Are you sure?', onConfirm: vi.fn().mockResolvedValue(undefined) });

    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('Yes');
  });

  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for the idle dialog', () => {
      const { asFragment } = render(
        <Confirmation
          text="Are you sure?"
          buttonName="Yes"
          cancelBtnName="No"
          onConfirm={() => Promise.resolve()}
          onCancel={() => Promise.resolve()}
        />,
        { wrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Idle dialog');
    });

    it('TINYMCE-14505: Should match snapshot for the confirming dialog', async () => {
      const { asFragment, getByLabelText, container } = render(
        <Confirmation
          text="Are you sure?"
          buttonName="Yes"
          cancelBtnName="No"
          onConfirm={() => new Promise<void>(Fun.noop)}
          onCancel={() => Promise.resolve()}
        />,
        { wrapper }
      );

      await userEvent.click(getByLabelText('Yes'));
      await expect.poll(() => container.querySelector(Bem.elementSelector('tox-ai', 'spinner'))).not.toBeNull();

      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Confirming dialog');
    });
  });

  describe('Universe translate', () => {

    it('TINYMCE-14751: should render the translated Yes/No labels when buttonName and cancelBtnName are not provided', async () => {
      const translate = vi.fn<(text: string) => string>((text) => `translated-${text}`);
      const mockUniverse = { getIcon: Fun.constant(''), translate };
      const ref = createRef<ConfirmationHostHandle>();

      const { getByLabelText } = render(
        <UniverseProvider resources={mockUniverse}>
          <ConfirmationHost ref={ref} />
        </UniverseProvider>,
        { wrapper }
      );

      ref.current?.confirm({ text: 'Are you sure?', onConfirm: vi.fn().mockResolvedValue(undefined) });

      await expect.poll(() => document.querySelector(Bem.blockSelector('tox-dialog-wrap'))).not.toBeNull();

      expect(getByLabelText('translated-Yes').element()).toBeVisible();
      expect(getByLabelText('translated-No').element()).toBeVisible();
      expect(translate).toHaveBeenCalledWith('Yes');
      expect(translate).toHaveBeenCalledWith('No');
    });

    it('TINYMCE-14751: should render the provided buttonName/cancelBtnName instead of calling translate', () => {
      const translate = vi.fn<(text: string) => string>((text) => `translated-${text}`);
      const mockUniverse = { getIcon: Fun.constant(''), translate };

      const { getByLabelText } = render(
        <UniverseProvider resources={mockUniverse}>
          <Confirmation
            text="Are you sure?"
            buttonName="Confirm"
            cancelBtnName="Deny"
            onConfirm={() => Promise.resolve()}
            onCancel={() => Promise.resolve()}
          />
        </UniverseProvider>,
        { wrapper }
      );

      expect(getByLabelText('Confirm').element()).toBeVisible();
      expect(getByLabelText('Deny').element()).toBeVisible();
      expect(translate).not.toHaveBeenCalled();
    });
  });
});
