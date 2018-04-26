import { Chain, Logger, Pipeline, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor as McEditor } from '@ephox/mcagar';

import { Editor } from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/modern/Theme';
import Node from 'tinymce/core/api/html/Node';

UnitTest.asynctest('browser.tinymce.core.EditorContentNotInitializedTest', (success, failure) => {
  Theme();

  const settings = {
    skin_url: '/project/js/tinymce/skins/lightgray'
  };

  const cCreateEditor = Chain.on((_, next, die) => next(Chain.wrap(new Editor('editor', {}, EditorManager))));

  const cSetContentAndAssertReturn = (content) => Chain.op((editor) => {
    const actual = editor.setContent(content);

    RawAssertions.assertEq('should return what you tried to set', content, actual);
  });
  const cGetAndAssertContent = (expected, tree?) => Chain.op((editor) => {
    const actual = tree ? editor.getContent({format: 'tree'}) : editor.getContent();

    RawAssertions.assertEq('content should be equal', expected, actual);
  });

  const cRemoveBodyElement = Chain.op((editor) => {
    const body = editor.getBody();
    body.parentNode.removeChild(body);
  });

  Pipeline.async({}, [
    Logger.t('set content on editor without initializing it', Chain.asStep({}, [
      cCreateEditor,
      cSetContentAndAssertReturn('hello'),
      McEditor.cRemove
    ])),

    Logger.t('set content on editor where the body has been removed', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea></textarea>', settings),
      cRemoveBodyElement,
      cSetContentAndAssertReturn('hello'),
      McEditor.cRemove
    ])),

    Logger.t('get content on editor without initializing it', Chain.asStep({}, [
      cCreateEditor,
      cGetAndAssertContent(''),
      McEditor.cRemove
    ])),

    Logger.t('get content on editor where the body has been removed', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea></textarea>', settings),
      cRemoveBodyElement,
      cGetAndAssertContent(''),
      McEditor.cRemove
    ])),

    Logger.t('set tree content on editor without initializing it', Chain.asStep({}, [
      cCreateEditor,
      cSetContentAndAssertReturn(new Node('p', 1)),
      McEditor.cRemove,
    ])),

    Logger.t('set tree content on editor where the body has been removed', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea></textarea>', settings),
      cRemoveBodyElement,
      cSetContentAndAssertReturn(new Node('p', 1)),
      McEditor.cRemove
    ])),

    Logger.t('get tree content on editor without initializing it', Chain.asStep({}, [
      cCreateEditor,
      cGetAndAssertContent(new Node('body', 11), true),
      McEditor.cRemove
    ])),

    Logger.t('get tree content on editor where the body has been removed', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea></textarea>', settings),
      cRemoveBodyElement,
      cGetAndAssertContent(new Node('body', 11), true),
      McEditor.cRemove
    ]))
  ], () => {
    success();
  }, failure);
});
