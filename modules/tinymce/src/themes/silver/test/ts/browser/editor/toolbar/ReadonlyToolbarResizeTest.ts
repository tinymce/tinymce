import { ApproxStructure, Assertions, Chain, Guard, Log, Mouse, NamedChain, Pipeline, StructAssert, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { ToolbarMode } from 'tinymce/themes/silver/api/Settings';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sOpenMore } from '../../../module/MenuUtils';
import { cResizeToPos } from '../../../module/UiChainUtils';

UnitTest.asynctest('Toolbar with toolbar drawer readonly mode test', (success, failure) => {
  SilverTheme();

  TinyLoader.setup(
    (editor: Editor, onSuccess, onFailure) => {
      const cChangeModes = (mode: string) => Chain.op(() => {
        editor.mode.set(mode);
      });

      const cResizeTo = (sx: number, sy: number, dx: number, dy: number) => NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.direct('body', UiFinder.cFindIn('.tox-statusbar__resize-handle'), 'resizeHandle'),
        NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
        NamedChain.direct('body', cResizeToPos(sx, sy, dx, dy), '_')
      ]);

      const cAssertToolbarButtonState = (label: string, disabled: boolean, f: ApproxStructure.Builder<StructAssert[]>) => Chain.fromChainsWith(Body.body(), [
        UiFinder.cFindIn('.tox-toolbar-overlord'),
        Chain.control(
          Assertions.cAssertStructure(label, ApproxStructure.build((s, str, arr) =>
            s.element('div', {
              classes: [
                arr.has('tox-toolbar-overlord'),
                disabled ? arr.has('tox-tbtn--disabled') : arr.not('tox-tbtn--disabled')
              ],
              attrs: { 'aria-disabled': str.is(disabled + '') },
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__primary') ],
                  children: f(s, str, arr)
                })
              ]
            })
          )),
          Guard.tryUntil('Waiting for toolbar state')
        )
      ]);

      const cAssertToolbarDrawerButtonState = (label: string, f: (s, str, arr) => StructAssert[]) => Chain.fromChainsWith(Body.body(), [
        UiFinder.cFindIn('.tox-toolbar__overflow'),
        Chain.control(
          Assertions.cAssertStructure(label, ApproxStructure.build((s, str, arr) =>
            s.element('div', {
              classes: [
                arr.has('tox-toolbar__overflow')
              ],
              children: f(s, str, arr)
            })
          )),
          Guard.tryUntil('Waiting for toolbar state')
        )
      ]);

      const disabledButtonStruct = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi, buttonName: string) => s.element('div', {
        classes: [ arr.has('tox-toolbar__group') ],
        children: [
          s.element('button', {
            classes: [ arr.has('tox-tbtn'), arr.has('tox-tbtn--disabled') ],
            attrs: {
              'title': str.is(buttonName),
              'aria-disabled': str.is('true')
            }
          })
        ]
      });

      const enabledButtonStruct = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi, buttonName: string) => s.element('div', {
        classes: [ arr.has('tox-toolbar__group') ],
        children: [
          s.element('button', {
            classes: [ arr.has('tox-tbtn'), arr.not('tox-tbtn--disabled') ],
            attrs: {
              'title': str.is(buttonName),
              'aria-disabled': str.is('false')
            }
          })
        ]
      });

      Pipeline.async({ }, [
        Chain.asStep({}, Log.chains('TBA', 'Test if the toolbar buttons are disabled in readonly mode when toolbar drawer is present', [
          cAssertToolbarButtonState('Assert the first toolbar button, Bold is disabled', true, (s, str, arr) => [
            disabledButtonStruct(s, str, arr, 'Bold'),
            s.theRest()
          ]),

          cResizeTo(300, 400, 400, 400),

          cAssertToolbarButtonState('Assert the toolbar buttons are disabled after resizing the editor', true, (s, str, arr) => [
            disabledButtonStruct(s, str, arr, 'Bold'),
            disabledButtonStruct(s, str, arr, 'Italic'),
            disabledButtonStruct(s, str, arr, 'Underline'),
            disabledButtonStruct(s, str, arr, 'Strikethrough'),
            disabledButtonStruct(s, str, arr, 'Cut'),
            disabledButtonStruct(s, str, arr, 'Copy'),
            disabledButtonStruct(s, str, arr, 'Paste'),
            disabledButtonStruct(s, str, arr, 'Increase indent'),
            s.theRest()
          ])
        ])),
        Chain.asStep({}, Log.chains('TINY-6014', 'Test buttons become enabled again when disabling readonly mode and resizing', [
          cAssertToolbarButtonState('Assert the first toolbar button, Bold is disabled', true, (s, str, arr) => [
            disabledButtonStruct(s, str, arr, 'Bold'),
            s.theRest()
          ]),
          cChangeModes('design'),
          Chain.runStepsOnValue(() => [
            sOpenMore(ToolbarMode.floating)
          ]),
          cAssertToolbarButtonState('Assert the toolbar buttons are enabled', false, (s, str, arr) => [
            enabledButtonStruct(s, str, arr, 'Bold'),
            enabledButtonStruct(s, str, arr, 'Italic'),
            enabledButtonStruct(s, str, arr, 'Underline'),
            enabledButtonStruct(s, str, arr, 'Strikethrough'),
            enabledButtonStruct(s, str, arr, 'Cut'),
            enabledButtonStruct(s, str, arr, 'Copy'),
            enabledButtonStruct(s, str, arr, 'Paste'),
            enabledButtonStruct(s, str, arr, 'Increase indent'),
            s.theRest()
          ]),
          cAssertToolbarDrawerButtonState('Assert the toolbar drawer buttons are enabled', (s, str, arr) => [
            enabledButtonStruct(s, str, arr, 'Subscript'),
            enabledButtonStruct(s, str, arr, 'Superscript'),
            enabledButtonStruct(s, str, arr, 'Clear formatting')
          ]),

          cResizeTo(400, 400, 450, 400),

          cAssertToolbarButtonState('Assert the toolbar buttons are enabled and now include subscript', false, (s, str, arr) => [
            enabledButtonStruct(s, str, arr, 'Bold'),
            enabledButtonStruct(s, str, arr, 'Italic'),
            enabledButtonStruct(s, str, arr, 'Underline'),
            enabledButtonStruct(s, str, arr, 'Strikethrough'),
            enabledButtonStruct(s, str, arr, 'Cut'),
            enabledButtonStruct(s, str, arr, 'Copy'),
            enabledButtonStruct(s, str, arr, 'Paste'),
            enabledButtonStruct(s, str, arr, 'Increase indent'),
            enabledButtonStruct(s, str, arr, 'Subscript'),
            s.theRest()
          ]),
          cAssertToolbarDrawerButtonState('Assert the toolbar drawer buttons are enabled', (s, str, arr) => [
            enabledButtonStruct(s, str, arr, 'Superscript'),
            enabledButtonStruct(s, str, arr, 'Clear formatting')
          ])
        ]))
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'bold | italic | underline | strikethrough | cut | copy | paste | indent | subscript | superscript | removeformat',
      toolbar_mode: 'floating',
      menubar: false,
      width: 300,
      height: 400,
      readonly: true,
      resize: 'both'
    },
    () => {
      success();
    },
    failure
  );
});
