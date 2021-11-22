import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, StructAssert, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, Optionals } from '@ephox/katamari';
import { Attribute, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.skin.OxideCollectionComponentTest', () => {
  before(function () {
    // TODO: TINY-3229 implement collection columns properly
    this.skip();
  });

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

  context('Check structure of collection in a dialog', () => {
    TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
      ':focus { outline: 2px solid green; }'
    ]);

    before(async () => {
      const editor = hook.editor();
      TinyUiActions.clickOnToolbar(editor, 'button');
      await TinyUiActions.pWaitForDialog(editor);
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
});
