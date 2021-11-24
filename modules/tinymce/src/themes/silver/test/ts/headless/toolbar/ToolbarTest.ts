import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys } from '@ephox/agar';
import { Behaviour, Focusing, GuiFactory, Keying, TestHelpers, Toolbar } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { SugarDocument } from '@ephox/sugar';

import { ToolbarMode } from 'tinymce/themes/silver/api/Options';
import { renderToolbar, renderToolbarGroup } from 'tinymce/themes/silver/ui/toolbar/CommonToolbar';

import TestProviders from '../../module/TestProviders';

describe('headless.tinymce.themes.silver.toolbar.ToolbarTest', () => {
  const providers = TestProviders;

  const makeButton = (t: string) => ({
    dom: {
      tag: 'span',
      innerHtml: t,
      // The '.tox-tbtn' class is here temporarily while we sort of the flow keying selector
      classes: [ 'test-toolbar-item', 'tox-tbtn' ]
    },
    behaviours: Behaviour.derive([
      Focusing.config({ })
    ])
  });

  const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build(
    renderToolbar({
      type: ToolbarMode.default,
      uid: 'test-toolbar-uid',
      onEscape: store.adderH('onEscape'),
      cyclicKeying: true,
      providers,
      initGroups: [
        {
          title: Optional.none(), items: Arr.map([ 'one', 'two', 'three' ], makeButton)
        },
        {
          title: Optional.some('group title'), items: Arr.map([ 'four', 'five' ], makeButton)
        },
        {
          title: Optional.some('another group title'), items: Arr.map([ 'six' ], makeButton)
        }
      ]
    })
  ));

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '.tox-toolbar { padding: 0.3em; background: blue; display: flex; flex-direction: row;}',
    '.tox-toolbar__group { background: black; color: white; display: flex; margin: 0.2em; }',
    '.test-toolbar-item { margin: 0.2em; padding: 0.2em; display: flex; }'
  ]);

  it('Check structure of toolbars', () => {
    const toolbar = hook.component();
    Assertions.assertStructure(
      'Initial structure of toolbar',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            attrs: {
              title: str.none()
            },
            children: [
              s.element('span', {
                html: str.is('one')
              }),
              s.element('span', {
                html: str.is('two')
              }),
              s.element('span', {
                html: str.is('three')
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            attrs: {
              title: str.is('group title')
            },
            children: [
              s.element('span', {
                html: str.is('four')
              }),
              s.element('span', {
                html: str.is('five')
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            attrs: {
              title: str.is('another group title')
            },
            children: [
              s.element('span', {
                html: str.is('six')
              })
            ]
          })
        ]
      })),
      toolbar.element
    );

    it('Check general keyboard navigation of the toolbar', async () => {
      const doc = SugarDocument.getDocument();
      Keying.focusIn(toolbar);

      await FocusTools.pTryOnSelector('Checking focus is on "one"', doc, 'span:contains("one")');
      Keyboard.activeKeydown(doc, Keys.right());
      await FocusTools.pTryOnSelector('Checking focus is on "two"', doc, 'span:contains("two")');

      Keyboard.activeKeydown(doc, Keys.tab());
      await FocusTools.pTryOnSelector('Checking focus is on "four"', doc, 'span:contains("four")');
    });

    it('Changing the toolbar contents and checking the keyboard navigation', async () => {
      const doc = SugarDocument.getDocument();
      const groups = Arr.map([
        {
          title: Optional.none<string>(), items: Arr.map([ 'A', 'B' ], makeButton)
        },
        {
          title: Optional.none<string>(), items: Arr.map([ 'C' ], makeButton)
        }
      ], renderToolbarGroup);

      Toolbar.setGroups(toolbar, groups);
      Keying.focusIn(toolbar);

      await FocusTools.pTryOnSelector('Checking focus is on "A"', doc, 'span:contains("A")');
      Keyboard.activeKeydown(doc, Keys.right());
      await FocusTools.pTryOnSelector('Checking focus is on "B"', doc, 'span:contains("B")');

      Keyboard.activeKeydown(doc, Keys.tab());
      await FocusTools.pTryOnSelector('Checking focus is on "C"', doc, 'span:contains("C")');
    });
  });
});
