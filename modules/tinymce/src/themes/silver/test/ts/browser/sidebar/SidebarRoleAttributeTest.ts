import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const enum SidebarStateRoleAttr {
  Grown = 'region',
  Shrunk = 'presentation'
}

describe('browser.tinymce.themes.silver.sidebar.SidebarRoleAttributeTest', () => {
  const baseSettings = {
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'sidebarone sidebartwo',
    setup: (ed: Editor) => {
      ed.ui.registry.addSidebar('sidebarone', {
        tooltip: 'side bar one',
        icon: 'comment',
      });
      ed.ui.registry.addSidebar('SideBarTwo', {
        tooltip: 'side bar two',
        icon: 'comment',
      });
    }
  };

  const assertSidebarStructure = (sidebarState: SidebarStateRoleAttr) => {
    const sidebar = UiFinder.findIn(SugarBody.body(), '.tox-sidebar').getOrDie();
    Assertions.assertStructure(
      `Checking role attribute of sidebar`,
      ApproxStructure.build((s, str, _) => s.element('div', {
        attrs: {
          role: str.is(sidebarState)
        },
        children: [
          s.theRest()
        ]
      })),
      sidebar
    );
  };

  it('TINY-9517: No sidebar shown, role should be presentation', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...baseSettings
    });
    assertSidebarStructure(SidebarStateRoleAttr.Shrunk);
    McEditor.remove(editor);
  });

  it('TINY-9517: Sidebar one is set to be shown on initialization, role should be region', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...baseSettings,
      sidebar_show: 'sidebarone'
    });
    assertSidebarStructure(SidebarStateRoleAttr.Grown);
    McEditor.remove(editor);
  });

  it('TINY-9517: Non-existent sidebar is set to be shown on initialization, sidebar role should be presentation', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...baseSettings,
      sidebar_show: 'noexistsidebar'
    });
    assertSidebarStructure(SidebarStateRoleAttr.Shrunk);
    McEditor.remove(editor);
  });

  it('TINY-9571: Sidebar toggling should reflect correct role attribute', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...baseSettings
    });
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="' + 'side bar one' + '"]');
    assertSidebarStructure(SidebarStateRoleAttr.Grown);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="' + 'side bar one' + '"]');
    assertSidebarStructure(SidebarStateRoleAttr.Shrunk);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="' + 'side bar two' + '"]');
    assertSidebarStructure(SidebarStateRoleAttr.Grown);
    McEditor.remove(editor);
  });
});
