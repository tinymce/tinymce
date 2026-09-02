import { Fun } from '@ephox/katamari';
import { Confirmation } from 'oxide-components/components/confirmation/Confirmation';
import { ConfirmationHost, type ConfirmationHostHandle } from 'oxide-components/components/confirmation/internals/ConfirmationHost';
import * as Bem from 'oxide-components/utils/Bem';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.ConfirmationTest', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={Bem.block('tox')}>{children}</div>
  );

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
});
