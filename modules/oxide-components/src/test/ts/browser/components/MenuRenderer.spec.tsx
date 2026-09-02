import { Fun } from '@ephox/katamari';
import * as MenuRenderer from 'oxide-components/components/menu/MenuRenderer';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.components.MenuRendererTest', () => {
  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for a menu rendered from a spec', () => {
      const { asFragment } = render(
        MenuRenderer.render({
          items: [
            { type: 'menuitem', text: 'Plain item', onAction: Fun.noop },
            { type: 'menuitem', text: 'Item with icon', icon: 'checkmark', shortcut: 'Ctrl+B', onAction: Fun.noop },
            { type: 'menuitem', text: 'Disabled item', enabled: false, onAction: Fun.noop },
            { type: 'togglemenuitem', text: 'Active toggle', active: true, onAction: Fun.noop },
            { type: 'togglemenuitem', text: 'Inactive toggle', active: false, onAction: Fun.noop },
            { type: 'submenu', text: 'Submenu', items: [
              { type: 'menuitem', text: 'Nested item', onAction: Fun.noop }
            ] }
          ]
        }),
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Menu from a spec');
    });

    it('TINYMCE-14505: Should match snapshot for a menu with left-hand submenus', () => {
      const { asFragment } = render(
        MenuRenderer.render({
          submenusSide: 'left',
          items: [
            { type: 'submenu', text: 'Submenu', items: [
              { type: 'menuitem', text: 'Nested item', onAction: Fun.noop }
            ] }
          ]
        }),
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Left-hand submenus');
    });
  });
});
