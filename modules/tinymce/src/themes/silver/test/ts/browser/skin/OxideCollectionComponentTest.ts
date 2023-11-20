import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, StructAssert, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, Optionals } from '@ephox/katamari';
import { Attribute, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

describe('browser.tinymce.themes.silver.skin.OxideCollectionComponentTest', () => {
  context('Check structure of collection in a dialog', () => {
    const structureItem = (optText: Optional<string>, optIcon: Optional<string>): ApproxStructure.Builder<StructAssert> =>
      (s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-collection__item') ],
        children: Optionals.cat([
          optIcon.map((icon) => s.element('div', {
            classes: [ arr.has('tox-collection__item-icon') ],
            html: str.is(icon)
          })),

          optText.map((text) => s.element('div', {
            classes: [ arr.has('tox-collection__item-label') ],
            html: str.is(text)
          }))
        ])
      });

    const findNthIn = (selector: string, n: number, elem: SugarElement<Node>) => {
      const matches = UiFinder.findAllIn(elem, selector);
      return Arr.get(matches, n).getOrDie(`Could not find match ${n} of selector: ${selector}`);
    };

    const hook = TinyHooks.bddSetup<Editor>({
      toolbar: 'dialog-button',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('dialog-button', {
          type: 'button',
          text: 'Go',
          onAction: () => {
            ed.windowManager.open({
              title: 'Testing list component',
              initialData: {
                'stuff-1': [
                  { value: 'a', text: 'text-A', icon: 'icon-A' },
                  { value: 'b', text: 'text-B', icon: 'icon-B' },
                  { value: 'b', text: 'text-C', icon: 'icon-C' }
                ],

                'stuff-auto': [
                  { value: 'd', text: 'text-D', icon: 'icon-D' },
                  { value: 'e', text: 'text-E', icon: 'icon-E' },
                  { value: 'f', text: 'text-F', icon: 'icon-F' }
                ],

                'stuff-2': [
                  { value: 'g', text: 'text-G', icon: 'icon-G' },
                  { value: 'h', text: 'text-H', icon: 'icon-H' },
                  { value: 'i', text: 'text-I', icon: 'icon-I' }
                ],
                'input1': ''
              },
              body: {
                type: 'panel',
                items: [
                  {
                    name: 'input1',
                    type: 'input'
                  },
                  {
                    name: 'stuff-1',
                    type: 'collection',
                    columns: 1
                  },
                  {
                    name: 'stuff-auto',
                    type: 'collection',
                    columns: 'auto'
                  },
                  {
                    name: 'stuff-2',
                    type: 'collection',
                    columns: 2
                  }
                // TODO: TINY-3229 implement collection columns properly
                ] as any[]
              },
              buttons: []
            });
          }
        });
      }
    }, []);

    TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
      ':focus { outline: 2px solid green; }'
    ]);

    before(function () {
      // const editor = hook.editor();
      // TinyUiActions.clickOnToolbar(editor, 'button');
      // await TinyUiActions.pWaitForDialog(editor);

      // TODO: TINY-3229 implement collection columns properly
      this.skip();
    });

    it('Checking the first collection: columns = 1, list', async () => {
      const editor = hook.editor();
      const doc = SugarDocument.getDocument();
      await FocusTools.pTryOnSelector('Focus should start on input', doc, 'input');
      TinyUiActions.keydown(editor, Keys.tab());

      const collection = findNthIn('[role="dialog"] .tox-form__group .tox-collection', 0, SugarBody.body());
      Assertions.assertStructure(
        'Checking structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-collection'), arr.has('tox-collection--list'), arr.not('tox-menu') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-collection__group') ],
              children: Arr.map([ 'A', 'B', 'C' ], (letter) =>
                structureItem(Optional.some('text-' + letter), Optional.some('icon-' + letter))(s, str, arr)
              )
            })
          ]
        })),
        collection
      );
      await FocusTools.pTryOnSelector('Focus should be on A', doc, '.tox-collection__item:contains(A).tox-collection__item--active');
      TinyUiActions.keydown(editor, Keys.down());
      await FocusTools.pTryOnSelector('Focus should be on B', doc, '.tox-collection__item:contains(B)');
      TinyUiActions.keydown(editor, Keys.down());
      await FocusTools.pTryOnSelector('Focus should be on C', doc, '.tox-collection__item:contains(C)');
    });

    it('Checking the second collection: columns = auto', async () => {
      const editor = hook.editor();
      const doc = SugarDocument.getDocument();
      FocusTools.setFocus(SugarBody.body(), '.tox-collection__item:contains("C")');

      const collection = findNthIn('[role="dialog"] .tox-form__group .tox-collection', 1, SugarBody.body());
      Assertions.assertStructure(
        'Checking structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-collection'), arr.has('tox-collection--grid'), arr.not('tox-menu') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-collection__group') ],
              children: Arr.map([ 'D', 'E', 'F' ], (letter) => structureItem(Optional.none(), Optional.some('icon-' + letter))(s, str, arr)
              )
            })
          ]
        })),
        collection
      );
      await FocusTools.pTryOnSelector('Focus should be on C', doc, '.tox-collection__item:contains(C)');
      TinyUiActions.keydown(editor, Keys.tab());
      await FocusTools.pTryOnSelector('Focus should be on D', doc, '.tox-collection__item:contains(D)');
      TinyUiActions.keydown(editor, Keys.right());
      await FocusTools.pTryOnSelector('Focus should be on E', doc, '.tox-collection__item:contains(E)');
      TinyUiActions.keydown(editor, Keys.right());
      await FocusTools.pTryOnSelector('Focus should be on F', doc, '.tox-collection__item:contains(F)');
    });

    it('Checking the third collection: columns = 2', async () => {
      const editor = hook.editor();
      const doc = SugarDocument.getDocument();
      FocusTools.setFocus(SugarBody.body(), '.tox-collection__item:contains("F")');

      const collection = findNthIn('[role="dialog"] .tox-form__group .tox-collection', 2, SugarBody.body());
      Assertions.assertStructure(
        'Checking structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-collection'), arr.has('tox-collection--grid'), arr.not('tox-menu') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-collection__group') ],
              children: Arr.map([ 'G', 'H' ], (letter) =>
                structureItem(Optional.none(), Optional.some('icon-' + letter))(s, str, arr)
              )
            }),
            s.element('div', {
              classes: [ arr.has('tox-collection__group') ],
              children: Arr.map([ 'I' ], (letter) =>
                structureItem(Optional.none(), Optional.some('icon-' + letter))(s, str, arr)
              )
            })
          ]
        })),
        collection
      );
      await FocusTools.pTryOnSelector('Focus should be on F', doc, '.tox-collection__item:contains(F)');
      TinyUiActions.keydown(editor, Keys.tab());
      await FocusTools.pTryOnSelector('Focus should be on G', doc, '.tox-collection__item:contains(G)');
      TinyUiActions.keydown(editor, Keys.right());
      await FocusTools.pTryOnSelector('Focus should be on H', doc, '.tox-collection__item:contains(H)');
      TinyUiActions.keydown(editor, Keys.down());
      await FocusTools.pTryOnSelector('Focus should be on I', doc, '.tox-collection__item:contains(I)');
    });

    it('TBA: Check focus follows mouse also', () => {
      Mouse.hoverOn(SugarBody.body(), '.tox-collection__item:contains(G)');
      const activeElem = UiFinder.findIn(SugarBody.body(), '.tox-collection__item--active').getOrDie();
      const value = Attribute.get(activeElem, 'data-collection-item-value');
      Assertions.assertEq('Checking selected value', 'g', value);
    });
  });

  context('Collection items display both icons and characters', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      toolbar: 'collectiondialog',
      base_url: '/project/tinymce/js/tinymce',
      setup: (editor: Editor) => {
        const collectionSpec: Dialog.DialogSpec<{ collect: Dialog.CollectionItem[] }> = {
          title: 'Collection',
          size: 'normal',
          body: {
            type: 'panel',
            items: [
              {
                type: 'collection',
                name: 'collect'
              }
            ]
          },
          initialData: {
            collect: [
              {
                text: 'delete',
                value: 'delete',
                icon: 'remove'
              },
              {
                text: 'A',
                value: 'A',
                icon: 'A'
              },
              {
                text: 'dollar',
                value: '$',
                icon: '$'
              },
              {
                text: 'star',
                value: '&#9733;',
                icon: '&#9733;'
              },
              {
                text: 'star',
                value: '★',
                icon: '★'
              }
            ]
          },
        };
        editor.ui.registry.addButton('collectiondialog', {
          text: 'Collection Dialog',
          onAction: () => editor.windowManager.open(collectionSpec)
        });
      }
    });

    const openDialog = async (editor: Editor) => {
      TinyUiActions.clickOnToolbar(editor, '.tox-tbtn.tox-tbtn--select:has(.tox-tbtn__select-label:contains("Collection Dialog"))');
      return await TinyUiActions.pWaitForDialog(editor);
    };

    const chars = [ 'A', '$', '★', '★' ];
    const icons = [ 'delete', ...chars ];

    const buttonSelectors = Arr.map(icons, (label) => `.tox-collection__item[aria-label="${label}"]`);

    it('TINY-10174: Buttons are rendered', async () => {
      const editor = hook.editor();
      editor.selection.expand();
      const dialog = await openDialog(editor);
      Arr.each(buttonSelectors, (selector) => UiFinder.findIn(dialog, selector));
      TinyUiActions.closeDialog(editor);
    });

    it('TINY-10174: Icons are rendered', async () => {
      const editor = hook.editor();
      editor.selection.expand();
      const dialog = await openDialog(editor);
      const collection = UiFinder.findIn(dialog, '.tox-form__group .tox-collection').getOrDie();
      Assertions.assertStructure(
        'Checking structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-collection'), arr.has('tox-collection--grid'), arr.not('tox-menu') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-collection__group') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-collection__item') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-collection__item-icon') ],
                      children: [
                        s.element('svg', {})
                      ]
                    })
                  ]
                }),
                ...Arr.map(chars, (char) => s.element('div', {
                  classes: [ arr.has('tox-collection__item') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-collection__item-icon') ],
                      html: str.is(char)
                    })
                  ]
                }))
              ]
            }),
          ]
        })),
        collection
      );
      TinyUiActions.closeDialog(editor);
    });
  });
});
