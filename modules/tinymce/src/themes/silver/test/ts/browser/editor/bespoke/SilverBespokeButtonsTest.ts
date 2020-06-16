import {
  ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Logger, Mouse, Pipeline, Step, UiFinder
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';
import * as MenuUtils from '../../../module/MenuUtils';

UnitTest.asynctest('Editor (Silver) test', (success, failure) => {
  Theme();
  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      const doc = Element.fromDom(document);

      const sAssertFocusOnItem = (itemText: string) => FocusTools.sTryOnSelector(
        `Focus should be on ${itemText}`,
        doc,
        `.tox-collection__item:contains("${itemText}")`
      );

      const sAssertFocusOnToolbarButton = (buttonText: string) => FocusTools.sTryOnSelector(
        `Focus should be on ${buttonText}`,
        doc,
        `.tox-toolbar__group button:contains("${buttonText}")`
      );

      const sAssertFocusOnAlignToolbarButton = () => FocusTools.sTryOnSelector(
        'Focus should be on Align',
        doc,
        '.tox-toolbar__group button[aria-label="Align"]'
      );

      const sAssertItemTicks = (label: string, expectedTicks: boolean[]) => Logger.t(
        `Checking tick state of items (${label})`,
        Chain.asStep(Body.body(), [
          UiFinder.cFindIn('.tox-selected-menu .tox-collection__group'),
          Assertions.cAssertStructure('Checking structure', ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: Arr.map(expectedTicks, (expected) => s.element('div', {
              attrs: {
                'role': str.is('menuitemcheckbox'),
                'aria-checked': str.is(expected ? 'true' : 'false')
              }
            }))
          })))
        ])
      );

      const sCheckItemsAtLocationPlus = (beforeStep: Step<any, any>, afterStep: Step<any, any>, sOpen: (text: string) => Step<any, any>) => (label: string, expectedTicks: boolean[], menuText: string, path: number[], offset: number) => Logger.t(
        label,
        GeneralSteps.sequence([
          tinyApis.sSetCursor(path, offset),
          sOpen(menuText),
          beforeStep,
          sAssertItemTicks('Checking ticks at location', expectedTicks),
          afterStep,
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          UiFinder.sNotExists(Body.body(), '[role="menu"]')
        ])
      );

      const sCheckItemsAtLocation = sCheckItemsAtLocationPlus(Step.pass, Step.pass, (text) => MenuUtils.sOpenMenu('', text));
      const sCheckAlignItemsAtLocation = sCheckItemsAtLocationPlus(Step.pass, Step.pass, () => MenuUtils.sOpenAlignMenu(''));

      const sCheckSubItemsAtLocation = (expectedSubmenu: string) => sCheckItemsAtLocationPlus(
        GeneralSteps.sequence([
          Keyboard.sKeydown(doc, Keys.right(), { }),
          sAssertFocusOnItem(expectedSubmenu)
        ]),
        // Afterwards, escape the submenu
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        (text) => MenuUtils.sOpenMenu('', text)
      );

      const sTestAlignment = Log.stepsAsStep('TBA', 'Checking alignment ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        MenuUtils.sOpenAlignMenu('Align'),
        sAssertFocusOnItem('Left'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Center'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckAlignItemsAtLocation(
          'First paragraph after "centering"',
          [ false, true, false, false ],
          'Center',
          [ 0, 0 ], 'Fi'.length
        ),

        sCheckAlignItemsAtLocation(
          'Second paragraph with no set alignment',
          [ false, false, false, false ],
          'Align',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckAlignItemsAtLocation(
          'First paragraph with the alignment set to "center" previously',
          [ false, true, false, false ],
          'Center',
          [ 0, 0 ], 'Fi'.length
        )
      ]);

      const range = (num: number, f: (i: number) => any): any[] => {
        const r = [ ];
        for (let i = 0; i < num; i++) {
          r.push(f(i));
        }
        return r;
      };

      const sTestFontSelect = Log.stepsAsStep('TBA', 'Checking fontselect ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        MenuUtils.sOpenMenu('FontSelect', 'Verdana'),
        sAssertFocusOnItem('Andale Mono'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckItemsAtLocation(
          'First paragraph after "Andale Mono"',
          [ true ].concat(range(16, () => false)),
          'Andale Mono',
          [ 0, 0, 0 ], 'Fi'.length
        ),

        sCheckItemsAtLocation(
          'Second paragraph with no set font',
          range(14, () => false).concat([ true ]).concat(range(2, () => false)),
          'Verdana',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckItemsAtLocation(
          'First paragraph with the font set to "Andale Mono" previously',
          [ true ].concat(range(16, () => false)),
          'Andale Mono',
          [ 0, 0, 0 ], 'Fi'.length
        )
      ]);

      const sTestFontSizeSelect = Log.stepsAsStep('TBA', 'Checking fontsize ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        MenuUtils.sOpenMenu('FontSelect', '12pt'), // This might be fragile.
        sAssertFocusOnItem('8pt'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckItemsAtLocation(
          'First paragraph after "8pt',
          [ true ].concat(range(6, () => false)),
          '8pt',
          [ 0, 0, 0 ], 'Fi'.length
        ),

        sCheckItemsAtLocation(
          'Second paragraph with no set font size',
          range(2, () => false).concat([ true ]).concat(range(4, () => false)),
          '12pt',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckItemsAtLocation(
          'First paragraph with the font set to "8pt" previously',
          [ true ].concat(range(6, () => false)),
          '8pt',
          [ 0, 0, 0 ], 'Fi'.length
        )
      ]);

      const sTestFormatSelect = Log.stepsAsStep('TBA', 'Checking format ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        MenuUtils.sOpenMenu('Format', 'Paragraph:first'),
        sAssertFocusOnItem('Paragraph'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Heading 1'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckItemsAtLocation(
          'First block after "h1',
          [ false, true ].concat(range(6, () => false)),
          'Heading 1:first',
          [ 0, 0 ], 'Fi'.length
        ),

        sCheckItemsAtLocation(
          'Second paragraph with no set format',
          [ true ].concat(range(7, () => false)),
          'Paragraph:first',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckItemsAtLocation(
          'First block with the "h1" set previously',
          [ false, true ].concat(range(6, () => false)),
          'Heading 1:first',
          [ 0, 0 ], 'Fi'.length
        ),

        // Check that the menus are working also
        Mouse.sClickOn(Body.body(), '[role="menubar"] [role="menuitem"]:contains("Format")'),
        sAssertFocusOnItem('Bold'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Italic'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Underline'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Strikethrough'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Superscript'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Subscript'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Code'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Formats'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Blocks'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnItem('Paragraph'),
        sAssertItemTicks('Checking blocks in menu', [ false, true ].concat(
          range(6, () => false)
        )),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        Keyboard.sKeydown(doc, Keys.escape(), { })
      ]);

      const sTestStyleSelect = Log.stepsAsStep('TBA', 'Checking style ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        MenuUtils.sOpenMenu('Format', 'Paragraph:last'),
        sAssertFocusOnItem('Headings'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnItem('Heading 1'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckSubItemsAtLocation('Heading 1')(
          'First block after "h1',
          [ true ].concat(range(5, () => false)),
          'Heading 1:last',
          [ 0, 0 ], 'Fi'.length
        ),

        sCheckSubItemsAtLocation('Heading 1')(
          'Second paragraph with no set format',
          range(6, () => false),
          'Paragraph:last',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckSubItemsAtLocation('Heading 1')(
          'First block with the "h1" set previously',
          [ true ].concat(range(5, () => false)),
          'Heading 1:last',
          [ 0, 0 ], 'Fi'.length
        ),

        // Check that the menus are working also
        Mouse.sClickOn(Body.body(), '[role="menubar"] [role="menuitem"]:contains("Format")'),
        sAssertFocusOnItem('Bold'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Italic'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Underline'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Strikethrough'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Superscript'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Subscript'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Code'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Formats'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnItem('Headings'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnItem('Heading 1'),
        sAssertItemTicks('Checking headings in menu', [ true ].concat(
          range(5, () => false)
        )),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        Keyboard.sKeydown(doc, Keys.escape(), { })
      ]);

      const sTestToolbarKeyboardNav = Log.stepsAsStep('TBA', 'Checking toolbar keyboard navigation', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        MenuUtils.sOpenAlignMenu('Align'),
        sAssertFocusOnItem('Left'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Center'),

        // Check moving left and right closes the open dropdown and navigates to the next item
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnToolbarButton('Verdana'), // Font Select
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Andale Mono'),
        Keyboard.sKeydown(doc, Keys.left(), { }),
        sAssertFocusOnAlignToolbarButton(), // Alignment
        UiFinder.sNotExists(Body.body(), '[role="menu"]')
      ]);

      Pipeline.async({ }, [
        sTestAlignment,
        sTestFontSelect,
        sTestFontSizeSelect,
        sTestFormatSelect,
        sTestStyleSelect,
        sTestToolbarKeyboardNav
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      toolbar: 'align fontselect fontsizeselect formatselect styleselect',
      base_url: '/project/tinymce/js/tinymce',
      content_css: '/project/tinymce/src/themes/silver/test/css/content.css'
    },
    () => {
      success();
    },
    failure
  );
});
