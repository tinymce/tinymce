import { Chain, GeneralSteps, Keys, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { Editor as McEditor, TinyActions, TinyApis, TinyUi } from '@ephox/mcagar';
import { Body, Css, Element, Location } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { EditorSettings } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';
import { sAssertFloatingToolbarPosition, sOpenFloatingToolbarAndAssertPosition } from '../../../module/ToolbarUtils';

UnitTest.asynctest('Inline Editor Floating Toolbar Drawer Position test', (success, failure) => {
  Theme();
  const toolbarHeight = 39;
  const lineHeight = 30;

  const getUiContainerTop = (editor: Editor) => {
    const uiContainer = Element.fromDom(editor.getContainer());
    return Location.absolute(uiContainer).top();
  };

  const sPressEnterNTimes = (tinyApis: TinyApis, tinyActions: TinyActions, times: number) => GeneralSteps.sequence([
    tinyApis.sFocus(),
    ...GeneralSteps.repeat(times, tinyActions.sContentKeydown(Keys.enter()))
  ]);

  const sWithEditor = (settings: EditorSettings, getSteps: (editor: Editor, tinyApis: TinyApis) => Array<Step<any, any>>) => {
    return Chain.asStep({}, [
      McEditor.cFromSettings({
        theme: 'silver',
        inline: true,
        menubar: false,
        width: 400,
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'undo redo | styleselect | bold italic underline | strikethrough superscript subscript | alignleft aligncenter alignright aligncenter | outdent indent | cut copy paste | selectall remove',
        toolbar_mode: 'floating',
        ...settings
      }),
      Chain.async((editor, onSuccess, onFailure) => {
        const tinyApis = TinyApis(editor);
        const uiContainer = Element.fromDom(editor.getContainer());

        Pipeline.async({ }, [
          Step.sync(() => {
            Css.set(uiContainer, 'margin-left', '100px');
          }),
          tinyApis.sSetContent('<p>Line 1</p><p>Line 2</p><p>Line 3</p>'),
          tinyApis.sFocus(),
          tinyApis.sSetCursor([2, 0], 'Line 3'.length),
          UiFinder.sWaitForVisible('Wait for editor to be visible', Body.body(), '.tox-editor-header button[title="More..."]'),
          ...getSteps(editor, tinyApis)
        ], () => onSuccess(editor), onFailure);
      }),
      McEditor.cRemove
    ]);
  };

  const sTestToolbarTop = Step.label('Test toolbar top positioning', sWithEditor({ }, (editor, tinyApis) => {
    const tinyActions = TinyActions(editor);
    const tinyUi = TinyUi(editor);
    const initialContainerTop = Cell(getUiContainerTop(editor));

    const getExpectedToolbarPos = () => initialContainerTop.get() + toolbarHeight; // top of ui container + toolbar height

    return [
      Step.sync(() => {
        initialContainerTop.set(getUiContainerTop(editor)); // Store the original position
      }),
      sOpenFloatingToolbarAndAssertPosition(tinyUi, getExpectedToolbarPos),
      sOpenFloatingToolbarAndAssertPosition(tinyUi, getExpectedToolbarPos, [
        // Press enter a few times to change the height of the editor
        sPressEnterNTimes(tinyApis, tinyActions, 3),
        sAssertFloatingToolbarPosition(tinyUi, getExpectedToolbarPos, 105, 465),
      ])
    ];
  }));

  const sTestToolbarBottom = Step.label('Test toolbar bottom positioning', sWithEditor({ toolbar_location: 'bottom' }, (editor, tinyApis) => {
    const tinyActions = TinyActions(editor);
    const tinyUi = TinyUi(editor);
    const initialContainerTop = Cell(getUiContainerTop(editor));

    const getExpectedToolbarPos = () => initialContainerTop.get() - toolbarHeight * 2; // top of ui container - two toolbar heights

    return [
      Step.sync(() => {
        initialContainerTop.set(getUiContainerTop(editor));  // Store the original position
      }),
      sOpenFloatingToolbarAndAssertPosition(tinyUi, getExpectedToolbarPos),
      sOpenFloatingToolbarAndAssertPosition(tinyUi, getExpectedToolbarPos, [
        // Press enter a few times to change the height of the editor
        sPressEnterNTimes(tinyApis, tinyActions, 3),
        Waiter.sTryUntil('Wait for toolbar to move', Step.sync(() => {
          Assert.eq('Toolbar top position', true, getUiContainerTop(editor) >= initialContainerTop.get() + lineHeight * 3); // Wait for the toolbar to move three lines
        })),
        Step.sync(() => {
          initialContainerTop.set(getUiContainerTop(editor)); // reset the toolbar position
        }),
        sAssertFloatingToolbarPosition(tinyUi, getExpectedToolbarPos, 105, 465), // top of ui container - two toolbar heights
      ])
    ];
  }));

  Pipeline.async({}, [
    Log.stepsAsStep('TINY-4725', 'Inline Editor Floating Toolbar Drawer Position test', [
      sTestToolbarTop,
      sTestToolbarBottom
    ]),
  ], () => success(), failure);
});
