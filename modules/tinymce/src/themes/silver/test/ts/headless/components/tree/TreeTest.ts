import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, UiFinder } from '@ephox/agar';
import { AlloyComponent, AlloyTriggers, GuiFactory, NativeEvents, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { StructureSchema } from '@ephox/boulder';
import { Dialog } from '@ephox/bridge';
import { Class, SelectorFind, SugarBody, SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import { renderTree } from 'tinymce/themes/silver/ui/dialog/Tree';

import * as TestExtras from '../../../module/TestExtras';

describe('headless.tinymce.themes.silver.tree.TreeTest', () => {
  const extrasHook = TestExtras.bddSetup();
  const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => {
    const fullTree: Dialog.TreeItemSpec [] = [
      {
        type: 'directory',
        id: 'dir',
        title: 'Dir',
        children: [
          {
            type: 'directory',
            id: 'subdir',
            title: 'Sub dir',
            children: [
              {
                type: 'leaf',
                title: 'File 1',
                id: '1',
              },
              {
                type: 'leaf',
                title: 'File 2',
                id: '2',
              },
            ]
          },
          {
            type: 'leaf',
            title: 'File 3',
            id: '3',
          },
          {
            type: 'leaf',
            title: 'File 4',
            id: '4',
            menu: {
              icon: 'image-options',
              type: 'menubutton',
              fetch: (success) => success([
                {
                  type: 'menuitem',
                  text: 'menuitem',
                  onAction: () => {
                    store.add('menuitem');
                  }
                }
              ])
            }
          },
        ]
      },
      {
        type: 'leaf',
        title: 'File 5',
        id: '5',
      },
      {
        type: 'leaf',
        title: 'File 6',
        id: '6',
      },
    ];

    const treeSpec = StructureSchema.getOrDie(Dialog.createTree({
      type: 'tree',
      onLeafAction: store.add,
      items: fullTree
    }));

    const tree = renderTree(treeSpec, extrasHook.access().extras.backstages.dialog );
    return GuiFactory.build({
      dom: {
        tag: 'div'
      },
      components: [ tree ]
    });
  });

  const assertDirectoryExpandedState = (label: string, expected: boolean, directory: AlloyComponent) => {
    assert.equal(Class.has(directory.element, 'tox-tree--directory--expanded'), expected, 'Checking if expanded class is present: ' + label);
  };

  const getTreeItem = (selector: string) => {
    const component = hook.component();
    return component.getSystem().getByDom(
      SelectorFind.descendant(component.element, selector).getOrDie(
        `Could not find tree item defined by: ${selector}`
      )
    ).getOrDie();
  };

  it('Check initial event state', () => {
    const store = hook.store();
    store.assertEq('Store should empty', []);
  });

  it('TINY-9614: Basic tree interactions', async () => {
    const dir = getTreeItem('.tox-tree--directory');
    const store = hook.store();
    store.clear();
    Assertions.assertStructure(
      'Checking directory structure',
      ApproxStructure.build((s, _str, arr) => s.element('div', {
        classes: [ arr.has('tox-tree--directory') ],
      })),
      dir.element
    );

    assertDirectoryExpandedState('Collapsed', false, dir);
    Mouse.clickOn(dir.element, '.tox-trbtn.tox-tree--directory__label');
    assertDirectoryExpandedState('Expanded', true, dir);

    assertDirectoryExpandedState('Collapsed', false, getTreeItem('.tox-tree--directory .tox-tree--directory'));
    Mouse.clickOn(dir.element, '.tox-tree--directory .tox-trbtn.tox-tree--directory__label');
    assertDirectoryExpandedState('Expanded', true, getTreeItem('.tox-tree--directory .tox-tree--directory'));

    Mouse.clickOn(getTreeItem('.tox-tree').element, '>.tox-tree--leaf__label');
    store.assertEq('File 5', [ '5' ]);

    store.clear();
    Mouse.clickOn(getTreeItem('.tox-tree').element, '.tox-tree--leaf__label');
    store.assertEq('File 1', [ '1' ]);

    store.clear();
    Mouse.clickOn(dir.element, '.tox-mbtn');
    await UiFinder.pWaitFor('Wait for menu item to show up', SugarBody.body(), '[title="menuitem"]');
    Mouse.clickOn(SugarBody.body(), '[title="menuitem"]');
    store.assertEq('menuitem', [ 'menuitem' ]);

    Mouse.clickOn(dir.element, '.tox-tree--directory .tox-trbtn.tox-tree--directory__label');
    assertDirectoryExpandedState('Collapsed', false, getTreeItem('.tox-tree--directory .tox-tree--directory'));

  });

  it('TINY-9640: Tree is navigable with keyboard according to a11y recommendations from w3c', () => {
    const dir = getTreeItem('.tox-tree--directory');

    // Start with clean state
    const isDirectoryExpanded = Class.has(dir.element, '.tox-tree--directory--expanded');
    if (isDirectoryExpanded) {
      Mouse.clickOn(dir.element, '.tox-tree--directory .tox-trbtn.tox-tree--directory__label');
    }
    assertDirectoryExpandedState('Collapsed', false, dir);

    // Right arrow keydown when directory is collapsed expands the directory and keeps focus in the directory label
    const dirLabel = FocusTools.setFocus(dir.element, '.tox-tree--directory__label');
    AlloyTriggers.emitWith(dir.getSystem().getByDom(dirLabel).getOrDie(), NativeEvents.keydown(), {
      raw: {
        code: 'ArrowRight',
        which: Keys.right()
      }
    });
    assertDirectoryExpandedState('Expanded', true, dir);
    FocusTools.isOn('directory label', dirLabel);

    // Right arrow keydown when focus is on an open node, moves focus to the first child node.
    AlloyTriggers.emitWith(dir.getSystem().getByDom(dirLabel).getOrDie(), NativeEvents.keydown(), {
      raw: {
        code: 'ArrowRight',
        which: Keys.right()
      }
    });
    const subdirLabel = getTreeItem('.tox-tree--directory .tox-tree--directory .tox-tree--directory__label');
    FocusTools.isOn('subdir label', subdirLabel.element);

    // Down arrow keydown moves focus to the next focusable node witout opening or closing a node.
    AlloyTriggers.emitWith(dir.getSystem().getByDom(dirLabel).getOrDie(), NativeEvents.keydown(), {
      raw: {
        code: 'ArrowDown',
        which: Keys.down()
      }
    });
    const file3 = FocusTools.getFocused(SugarDocument.getDocument()).getOrDie();
    assert.deepEqual(file3.dom.textContent, 'File 3');

    // Right arrow keydown when focus is on a closed node does nothing.
    AlloyTriggers.emitWith(dir.getSystem().getByDom(file3).getOrDie(), NativeEvents.keydown(), {
      raw: {
        code: 'ArrowRight',
        which: Keys.right()
      }
    });
    FocusTools.isOn('File 3', file3);

    // Up arrow keydown moves focus to the previous focusable tree node.
    AlloyTriggers.emitWith(dir.getSystem().getByDom(file3).getOrDie(), NativeEvents.keydown(), {
      raw: {
        code: 'ArrowUp',
        which: Keys.up()
      }
    });
    FocusTools.isOn('subdir label', subdirLabel.element);

    // Left arrow keydown when focus is on a child node moves focus to the parent node.
    AlloyTriggers.emitWith(subdirLabel, NativeEvents.keydown(), {
      raw: {
        code: 'ArrowLeft',
        which: Keys.left()
      }
    });
    FocusTools.isOn('dir label', dirLabel);

    // Left arrow keydown when focus is on a open node closes the node without moving focus.
    AlloyTriggers.emitWith(dir.getSystem().getByDom(dirLabel).getOrDie(), NativeEvents.keydown(), {
      raw: {
        code: 'ArrowLeft',
        which: Keys.left()
      }
    });
    FocusTools.isOn('dir label', dirLabel);
    assertDirectoryExpandedState('Collapsed', false, dir);

    // Left arrow keydown when focus is on a closed node does nothing.
    AlloyTriggers.emitWith(dir.getSystem().getByDom(dirLabel).getOrDie(), NativeEvents.keydown(), {
      raw: {
        code: 'ArrowLeft',
        which: Keys.left()
      }
    });
    FocusTools.isOn('dir label', dirLabel);
    assertDirectoryExpandedState('Collapsed', false, dir);

  });
});
