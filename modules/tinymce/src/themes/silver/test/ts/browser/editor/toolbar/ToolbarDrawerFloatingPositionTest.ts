import { Chain, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor, TinyUi } from '@ephox/mcagar';
import { Css, Element, Location, Scroll } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { sOpenFloatingToolbarAndAssertPosition } from '../../../module/ToolbarUtils';

UnitTest.asynctest('Editor Floating Toolbar Drawer Position test', (success, failure) => {
  Theme();
  const sScrollTo = (x: number, y: number) => Step.sync(() => Scroll.to(x, y));

  Pipeline.async({}, [
    Logger.t('Editor Floating Toolbar Drawer Position test', Chain.asStep({}, [
      McEditor.cFromSettings({
        theme: 'silver',
        menubar: false,
        width: 400,
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'undo redo | styleselect | bold italic underline | strikethrough superscript subscript | alignleft aligncenter alignright aligncenter | outdent indent | cut copy paste | selectall remove',
        toolbar_mode: 'floating'
      }),
      Chain.async((editor: Editor, onSuccess, onFailure) => {
        const tinyUi = TinyUi(editor);
        const uiContainer = Element.fromDom(editor.getContainer());
        const initialContainerPos = Location.absolute(uiContainer);

        Pipeline.async({ }, [
          Step.sync(() => {
            Css.set(uiContainer, 'margin-left', '100px');
          }),
          sOpenFloatingToolbarAndAssertPosition(tinyUi, () => initialContainerPos.top() + 39), // top of ui container + toolbar height
          Step.sync(() => {
            Css.set(uiContainer, 'margin-top', '2000px');
            Css.set(uiContainer, 'margin-bottom', '2000px');
          }),
          sScrollTo(0, 2000),
          sOpenFloatingToolbarAndAssertPosition(tinyUi, () => initialContainerPos.top() + 39 + 2000), // top of ui container + toolbar height + scroll pos
        ], () => onSuccess(editor), onFailure);
      }),
      McEditor.cRemove
    ])),
  ], () => success(), failure);
});
