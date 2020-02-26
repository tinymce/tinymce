import { Chain, Keys, Logger, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { Editor as McEditor, TinyActions, TinyApis, TinyUi } from '@ephox/mcagar';
import { Body, Css, Element, Location } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { sAssertFloatingToolbarPosition, sOpenFloatingToolbarAndAssertPosition } from '../../../module/ToolbarUtils';

UnitTest.asynctest('Inline Editor Floating Toolbar Drawer Position test', (success, failure) => {
  Theme();

  Pipeline.async({}, [
    Logger.t('Inline Editor Floating Toolbar Drawer Position test', Chain.asStep({}, [
      McEditor.cFromSettings({
        theme: 'silver',
        inline: true,
        menubar: false,
        width: 400,
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'undo redo | styleselect | bold italic underline | strikethrough superscript subscript | alignleft aligncenter alignright aligncenter | outdent indent | cut copy paste | selectall remove',
        toolbar_mode: 'floating'
      }),
      Chain.async((editor: Editor, onSuccess, onFailure) => {
        const tinyActions = TinyActions(editor);
        const tinyApis = TinyApis(editor);
        const tinyUi = TinyUi(editor);
        const uiContainer = Element.fromDom(editor.getContainer());
        const initialContainerTop = Cell(Location.absolute(uiContainer).top() + 39);

        Pipeline.async({ }, [
          Step.sync(() => {
            Css.set(uiContainer, 'margin-left', '100px');
          }),
          tinyApis.sSetContent('<p>Line 1</p><p>Line 2</p><p>Line 3</p>'),
          tinyApis.sFocus(),
          UiFinder.sWaitForVisible('Wait for editor to be visible', Body.body(), '.tox-editor-header button[title="More..."]'),
          Step.sync(() => {
            initialContainerTop.set(Location.absolute(uiContainer).top() + 39); // top of ui container + toolbar height
          }),
          sOpenFloatingToolbarAndAssertPosition(tinyUi, initialContainerTop.get), // top of ui container + toolbar height
          sOpenFloatingToolbarAndAssertPosition(tinyUi, initialContainerTop.get, [
            // Press enter a few times to change the height of the editor
            tinyActions.sContentKeydown(Keys.enter()),
            tinyActions.sContentKeydown(Keys.enter()),
            tinyActions.sContentKeydown(Keys.enter()),
            sAssertFloatingToolbarPosition(tinyUi, initialContainerTop.get, 105, 465),
          ])
        ], () => onSuccess(editor), onFailure);
      }),
      McEditor.cRemove
    ])),
  ], () => success(), failure);
});
