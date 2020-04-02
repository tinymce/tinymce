import {
  Pipeline,
  Chain,
  Log,
  NamedChain,
  ApproxStructure,
  Assertions,
  StructAssert,
  Mouse,
  UiFinder,
  Guard
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { cResizeToPos } from '../../../module/UiChainUtils';
import { Element, Body } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest(
  'Toolbar with toolbar drawer readonly mode test',
  (success, failure) => {
    SilverTheme();

    TinyLoader.setup(
      (editor: Editor, onSuccess, onFailure) => {
        const cGetUiContainer = Chain.mapper(() =>
          Element.fromDom(editor.getContainer())
        );

        const cAssertToolbarButtonDisabled = (
          label,
          f: (s, str, arr) => StructAssert[]
        ) =>
          NamedChain.asChain([
            NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
            NamedChain.direct('editor', cGetUiContainer, 'editorContainer'),
            NamedChain.direct(
              'editorContainer',
              Assertions.cAssertStructure(
                label,
                ApproxStructure.build((s, str, arr) =>
                  s.element('div', {
                    classes: [arr.has('tox-tinymce')],
                    children: [
                      s.element('div', {
                        classes: [arr.has('tox-editor-container')],
                        children: [
                          s.element('div', {
                            classes: [arr.has('tox-editor-header')],
                            children: [
                              s.element('div', {
                                classes: [
                                  arr.has('tox-toolbar-overlord'),
                                  arr.has('tox-tbtn--disabled')
                                ],
                                attrs: { 'aria-disabled': str.is('true') },
                                children: [
                                  s.element('div', {
                                    classes: [arr.has('tox-toolbar__primary')],
                                    children: f(s, str, arr)
                                  })
                                ]
                              }),
                              s.theRest()
                            ]
                          }),
                          s.theRest()
                        ]
                      }),
                      s.theRest()
                    ]
                  })
                )
              ),
              'assertion'
            ),
            NamedChain.output('editor')
          ]);

        const buttonStruct = (s, str, arr, buttonName: string) =>
          s.element('div', {
            classes: [arr.has('tox-toolbar__group')],
            children: [
              s.element('button', {
                classes: [arr.has('tox-tbtn'), arr.has('tox-tbtn--disabled')],
                attrs: {
                  'title': str.is(buttonName),
                  'aria-disabled': str.is('true')
                }
              })
            ]
          });

        Pipeline.async(
          {},
          [
            Chain.asStep(
              {},
              Log.chains(
                'TBA',
                'Test if the toolbar buttons are disabled in readonly mode when toolbar drawer is present',
                [
                  cAssertToolbarButtonDisabled(
                    'Assert the first toolbar button, Bold is disabled',
                    (s, str, arr) => [
                      buttonStruct(s, str, arr, 'Bold'),
                      s.theRest()
                    ]
                  ),

                  Chain.control(
                    NamedChain.asChain([
                      NamedChain.writeValue('body', Body.body()),
                      NamedChain.direct(
                        'body',
                        UiFinder.cFindIn('.tox-statusbar__resize-handle'),
                        'resizeHandle'
                      ),
                      NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
                      NamedChain.direct(
                        'body',
                        cResizeToPos(300, 400, 400, 400),
                        '_'
                      )
                    ]),
                    Guard.addLogging(
                      'Resize the editor so that the overflowing toolbar buttons are redrawn'
                    )
                  ),

                  cAssertToolbarButtonDisabled(
                    'Assert the last toolbar button, Indent is disabled after resizing the editor',
                    (s, str, arr) => [
                      buttonStruct(s, str, arr, 'Bold'),
                      buttonStruct(s, str, arr, 'Italic'),
                      buttonStruct(s, str, arr, 'Underline'),
                      buttonStruct(s, str, arr, 'Cut'),
                      buttonStruct(s, str, arr, 'Copy'),
                      buttonStruct(s, str, arr, 'Paste'),
                      buttonStruct(s, str, arr, 'Increase indent')
                    ]
                  )
                ]
              )
            )
          ],
          onSuccess,
          onFailure
        );
      },
      {
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'bold | italic | underline | cut | copy | paste | indent',
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
  }
);
