import { Button, type ButtonProps } from 'oxide-components/components/button/Button';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.components.ButtonTest', () => {
  const renderStates = (variant: ButtonProps['variant']) => render(
    <>
      <Button variant={variant}>Default</Button>
      <Button variant={variant} active>Active</Button>
      <Button variant={variant} disabled>Disabled</Button>
    </>,
    { wrapper: SnapshotTestUtils.snapshotWrapper }
  );

  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for the primary variant', () => {
      const { asFragment } = renderStates('primary');
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Primary variant');
    });

    it('TINYMCE-14505: Should match snapshot for the secondary variant', () => {
      const { asFragment } = renderStates('secondary');
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Secondary variant');
    });

    it('TINYMCE-14505: Should match snapshot for the outlined variant', () => {
      const { asFragment } = renderStates('outlined');
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Outlined variant');
    });

    it('TINYMCE-14505: Should match snapshot for the naked variant', () => {
      const { asFragment } = renderStates('naked');
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Naked variant');
    });

    it('TINYMCE-14505: Should match snapshot for a button with a custom className', () => {
      const { asFragment } = render(<Button className="custom-class">Custom</Button>, { wrapper: SnapshotTestUtils.snapshotWrapper });
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Custom className');
    });
  });
});
