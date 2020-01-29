import { FocusTools, Keyboard, Keys, Pipeline, UiFinder, Log, Chain, Mouse, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document, ClientRect } from '@ephox/dom-globals';
import { Result } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Element, Body, SelectorExists } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Editor Dialog Popups Test', (success, failure) => {
  SilverTheme();

  TinyLoader.setupLight(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      const doc = Element.fromDom(document);

      const sWaitForDialogClosed = Waiter.sTryUntil(
        'Waiting for dialog to close',
        UiFinder.sNotExists(Body.body(), '.tox-dialog')
      );

      const sAssertVisibleFocusInside = (cGetFocused, selector: string) => Chain.asStep(doc, [
        cGetFocused,
        Chain.mapper((elem) => {
          return elem.dom().getBoundingClientRect();
        }),
        Chain.binder((rect: ClientRect) => {
          const middle = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          const range = document.caretRangeFromPoint(middle.x, middle.y);
          if (! range) {
            return Result.error('Could not find a range at coordinate: (' + middle.x + ', ' + middle.y + ')');
          } else {
            return SelectorExists.closest(Element.fromDom(range.startContainer), selector) ? Result.value(rect) : Result.error('Range was not within: "' + selector + '". Are you sure that it is on top of the dialog?');
          }
        })
      ]);

      // NOTE: This test uses the caretRangeFromPoint API which is not supported on every browser. We are
      // using this API to check if the popups appearing from things like the color input button and
      // the urlinput are on top of the dialog. Just test in Chrome.
      Pipeline.async({ }, PlatformDetection.detect().browser.isChrome() ? [
        Log.stepsAsStep('TBA', 'Trigger the colorswatch and check that the swatch appears in front of the dialog', [
          tinyApis.sFocus(),
          Mouse.sClickOn(Body.body(), 'button:contains("Show Color Dialog")'),
          FocusTools.sTryOnSelector('Focus should be on colorinput', doc, 'input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should be on colorinput button', doc, 'span[aria-haspopup="true"]'),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          FocusTools.sTryOnSelector('Focus should be inside colorpicker', doc, '.tox-swatch'),
          sAssertVisibleFocusInside(FocusTools.cGetFocused, '.tox-swatches'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          FocusTools.sTryOnSelector('Focus should return to colorinput button', doc, 'span[aria-haspopup="true"]'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          sWaitForDialogClosed
        ]),

        Log.stepsAsStep('TBA', 'Trigger the urlinput and check that the dropdown appears in front of the dialog', [
          tinyApis.sFocus(),
          tinyApis.sSetContent('<p><a href="http://foo">Foo</a> <a href="http://goo">Goo</a></p>'),
          Mouse.sClickOn(Body.body(), 'button:contains("Show Urlinput Dialog")'),
          FocusTools.sTryOnSelector('Focus should be on urlinput', doc, 'input'),
          Keyboard.sKeydown(doc, Keys.down(), { }),
          UiFinder.sWaitForVisible('Waiting for menu to appear', Body.body(), '.tox-collection__item'),
          sAssertVisibleFocusInside(Chain.fromChains([
            Chain.inject(Body.body()),
            UiFinder.cFindIn('.tox-collection__item--active')
          ]), '.tox-menu'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          sWaitForDialogClosed
        ]),
      ] : [ ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      toolbar: 'show-color show-urlinput',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('show-color', {
          text: 'Show Color Dialog',
          onAction: () => ed.windowManager.open({
            title: 'Dialog Test',
            body: {
              type: 'panel',
              items: [
                {
                  name: 'col1',
                  type: 'colorinput'
                }
              ]
            },
            initialData: {
              col1: 'green'
            },
            buttons: [ ]
          })
        });

        ed.ui.registry.addButton('show-urlinput', {
          text: 'Show Urlinput Dialog',
          onAction: () => ed.windowManager.open({
            title: 'Dialog Test',
            body: {
              type: 'panel',
              items: [
                {
                  name: 'url1',
                  type: 'urlinput',
                  filetype: 'file'
                }
              ]
            },
            initialData: {
              url1: { value: '' }
            },
            buttons: [ ]
          })
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});
