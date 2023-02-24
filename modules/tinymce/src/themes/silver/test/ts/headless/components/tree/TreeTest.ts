import { ApproxStructure, Assertions, Mouse, UiFinder } from '@ephox/agar';
import { AlloyComponent, GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { StructureSchema } from '@ephox/boulder';
import { Dialog } from '@ephox/bridge';
import { Class, SelectorFind, SugarBody } from '@ephox/sugar';
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
    assert.equal(Class.has(directory.element, 'tox-trbtn--expanded'), expected, 'Checking if expanded class is present: ' + label);
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

  it('Tree', async () => {
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
    assertDirectoryExpandedState('Expanded', true, getTreeItem('.tox-tree--directory__children'));

    assertDirectoryExpandedState('Collapsed', false, getTreeItem('.tox-tree--directory .tox-tree--directory .tox-tree--directory__children'));
    Mouse.clickOn(dir.element, '.tox-tree--directory .tox-trbtn.tox-tree--directory__label');
    assertDirectoryExpandedState('Expanded', true, getTreeItem('.tox-tree--directory .tox-tree--directory .tox-tree--directory__children'));

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
  });

});
