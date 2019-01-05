import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { Selection } from 'tinymce/core/api/dom/Selection';
import Theme from 'tinymce/themes/modern/Theme';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import ViewBlock from '../../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.api.dom.SelectionTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const DOM = DOMUtils.DOM;
  const viewBlock = ViewBlock();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {

    const sTestEmptyDocumentSelection = Logger.t('Returns empty document selection', Step.sync(function () {
      document.getSelection().removeAllRanges();
      const selection = Selection(DOM, DOM.win, null, editor);
      Assertions.assertEq('empty selection', null, selection.getSel().anchorNode);
    }));

    const sTestSimpleDocumentSelection = Logger.t('Returns document selection', Step.sync(function () {
      viewBlock.attach();
      document.getSelection().selectAllChildren(viewBlock.get());

      const selection = Selection(DOM, DOM.win, null, editor);
      Assertions.assertEq('document selection', 'DIV', selection.getSel().anchorNode.nodeName);
    }));

    const sTestSimpleShadowSelection = Logger.t('Returns shadow root selection', Step.sync(function () {
      const div = viewBlock.get();
      if (div.attachShadow) {
        const shadow = div.attachShadow({mode: 'open'});
        shadow.appendChild(editor.targetElm);
        const para = document.createElement('p');
        para.textContent = 'how now brown cow';
        editor.targetElm.appendChild(para);
        viewBlock.attach();
        const selectionRoot = shadow.getSelection ? shadow : document;
        selectionRoot.getSelection().selectAllChildren(editor.targetElm);

        const selection = Selection(DOM, DOM.win, null, editor);
        Assertions.assertEq('shadow selection', true, selection.getSel().containsNode(para.firstChild, false));
    }

    }));

    Pipeline.async({}, [
      sTestEmptyDocumentSelection,
      sTestSimpleDocumentSelection,
      sTestSimpleShadowSelection
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
    inline: true
  }, function () {
    viewBlock.detach();
    success();
  }, failure);
});
