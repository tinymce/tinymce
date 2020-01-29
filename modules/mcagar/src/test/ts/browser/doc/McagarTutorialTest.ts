import { Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor } from 'ephox/mcagar/alien/EditorTypes';
import { TinyApis } from 'ephox/mcagar/api/TinyApis';
import * as TinyLoader from 'ephox/mcagar/api/TinyLoader';
import { TinyUi } from 'ephox/mcagar/api/TinyUi';

UnitTest.asynctest('McagarTutorialTest', (success, failure) => {
  const handler = (ed: Editor) => () => {
    const content = ed.getContent();
    ed.focus();
    if (content === '<p>tutorial content</p>') {
      ed.setContent('<p>alternate content</p>');
      const paragraph = ed.getBody().childNodes[0];
      ed.selection.setCursorLocation(paragraph, 1);
    } else {
      ed.setContent('<p>tutorial content</p>');
      const target = ed.getBody().childNodes[0];
      ed.selection.select(target);
    }
  };

  const silverSetup = (ed: Editor) => {
    ed.ui.registry.addButton('tutorial-button', {
      text: 'tutorial',
      onAction: handler(ed)
    });
  };

  TinyLoader.setupLight((editor, loadSuccess, loadFailure) => {

    const ui = TinyUi(editor);
    const apis = TinyApis(editor);

    Pipeline.async({}, [
      ui.sClickOnToolbar('Clicking on button', 'button:contains("tutorial")'),
      apis.sAssertContent('<p>tutorial content</p>'),
      Step.wait(400),
      apis.sAssertSelection([], 0, [], 1),
      ui.sClickOnToolbar('Clicking on button to change to alternate', 'button:contains("tutorial")'),
      apis.sAssertContent('<p>alternate content</p>'),
      Step.wait(400),
      apis.sAssertSelection([0], 1, [0], 1),
      ui.sClickOnToolbar('Clicking on button to change to tutorial again', 'button:contains("tutorial")'),
      apis.sAssertContent('<p>tutorial content</p>'),
      Step.wait(400),
      apis.sAssertSelection([], 0, [], 1)
    ], loadSuccess, loadFailure);

  }, {
      setup: silverSetup,
      menubar: false,
      toolbar: 'tutorial-button',
      base_url: '/project/tinymce/js/tinymce',
    }, success, failure);
});
