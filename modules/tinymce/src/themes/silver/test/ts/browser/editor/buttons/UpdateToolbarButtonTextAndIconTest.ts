import { Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Css, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUi, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { Menu } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.themes.silver.editor.buttons.UpdateToolbarButtonTextAndIconTest', () => {

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'normal-text-update toggle-text-update menu-text-update split-text-update group-text-update',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.ui.registry.addButton('normal-text-update', {
        text: 'Before',
        onAction: (api) => {
          api.setText('After After After After After After');
        }
      });
      editor.ui.registry.addToggleButton('toggle-text-update', {
        text: 'ToggleBefore',
        onAction: (api) => {
          api.setText('Toggle After After After After After After');
        }
      });
      editor.ui.registry.addMenuButton('menu-text-update', {
        text: 'MenuBefore',
        fetch: (callback, _, api) => {
          const items: Menu.NestedMenuItemContents[] = [{
            type: 'menuitem',
            text: 'Change MenuLabel',
            onAction: () => {
              api.setText('Menu After After After After After After');
            }
          }];
          callback(items);
        }
      });
      editor.ui.registry.addSplitButton('split-text-update', {
        text: 'SplitBefore',
        onAction: (api) => {
          api.setText('Split After After After After After After');
        },
        onItemAction: (api, _value) => api.setText('Split Item After After After After After After'),
        fetch: (callback) => {
          const items: Menu.ChoiceMenuItemSpec[] = [
            {
              type: 'choiceitem',
              text: 'Menu item 1',
              value: 'First'
            },
          ];
          callback(items);
        }
      });
      editor.ui.registry.addGroupToolbarButton('group-text-update', {
        text: 'GroupBefore',
        items: 'alignleft aligncenter alignright',
        onSetup: (api) => {
          const NodeChangeHandler = (e: EditorEvent<NodeChangeEvent>) => {
            const align = Css.get(SugarElement.fromDom(e.element), 'text-align');
            api.setText(align);
          };
          editor.on('NodeChange', NodeChangeHandler);
          return () => {
            editor.off('NodeChange', NodeChangeHandler);
          };
        }
      });
    },
  }, []);

  it('TINY-9268: Normal toolbar button can update its text', async () => {
    const selectorForToolbarButtonWithLabel = (label: string) =>
      `.tox-tbtn.tox-tbtn--select:has(.tox-tbtn__select-label:contains("${label}"))`;
    const editor = hook.editor();
    const button = await TinyUi(editor).pWaitForUi(selectorForToolbarButtonWithLabel('Before'));
    const initialWidth = Css.get(button, 'width');
    TinyUiActions.clickOnToolbar(editor, selectorForToolbarButtonWithLabel('Before'));
    await TinyUiActions.pWaitForUi(editor, selectorForToolbarButtonWithLabel('After After After After After After'));
    const currentWidth = Css.get(button, 'width');
    assert.equal(initialWidth, currentWidth);
  });

  it('TINY-9268: Toggle toolbar button can update its text', async () => {
    const selectorForToolbarButtonWithLabel = (label: string) =>
      `.tox-tbtn.tox-tbtn--select:has(.tox-tbtn__select-label:contains("${label}"))`;
    const editor = hook.editor();
    const button = await TinyUi(editor).pWaitForUi(selectorForToolbarButtonWithLabel('ToggleBefore'));
    const initialWidth = Css.get(button, 'width');
    TinyUiActions.clickOnToolbar(editor, selectorForToolbarButtonWithLabel('ToggleBefore'));
    await TinyUiActions.pWaitForUi(editor, selectorForToolbarButtonWithLabel('Toggle After After After After After After'));
    const currentWidth = Css.get(button, 'width');
    assert.equal(initialWidth, currentWidth);
  });

  it('TINY-9268: menu toolbar button can update its text when clicking on menu item', async () => {
    const selectorForToolbarButtonWithLabel = (label: string) =>
      `.tox-tbtn.tox-tbtn--select:has(.tox-tbtn__select-label:contains("${label}"))`;
    const editor = hook.editor();
    const button = await TinyUi(editor).pWaitForUi(selectorForToolbarButtonWithLabel('MenuBefore'));
    const initialWidth = Css.get(button, 'width');
    TinyUiActions.clickOnToolbar(editor, selectorForToolbarButtonWithLabel('MenuBefore'));
    const menuItem = await TinyUi(editor).pWaitForUi( '[title="Change MenuLabel"]');
    Mouse.click(menuItem);
    await TinyUiActions.pWaitForUi(editor, selectorForToolbarButtonWithLabel('Menu After After After After After After'));
    const currentWidth = Css.get(button, 'width');
    assert.equal(initialWidth, currentWidth);
  });

  it('TINY-9268: toolbar split button can update its text when clicking on it or one of its items', async () => {
    const selectorForToolbarButtonWithLabel = (label: string) =>
      `.tox-tbtn.tox-tbtn--select:has(.tox-tbtn__select-label:contains("${label}"))`;
    const editor = hook.editor();
    const button = await TinyUi(editor).pWaitForUi(selectorForToolbarButtonWithLabel('SplitBefore'));
    const initialWidth = Css.get(button, 'width');
    TinyUiActions.clickOnToolbar(editor, selectorForToolbarButtonWithLabel('SplitBefore'));
    await TinyUiActions.pWaitForUi(editor, selectorForToolbarButtonWithLabel('Split After After After After After After'));
    const currentWidth = Css.get(button, 'width');
    assert.equal(initialWidth, currentWidth);
    TinyUiActions.clickOnToolbar(editor, `${selectorForToolbarButtonWithLabel('Split After After After After After After')} + .tox-split-button__chevron`);
    const menuItem = await TinyUi(editor).pWaitForUi( '[title="Menu item 1"]');
    Mouse.click(menuItem);
    await TinyUiActions.pWaitForUi(editor, selectorForToolbarButtonWithLabel('Split Item After After After After After After'));
  });

  // TODO: Add test when the bug for the onSetup not running is fixed

});
