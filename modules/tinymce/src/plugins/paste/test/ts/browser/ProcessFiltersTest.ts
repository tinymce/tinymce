import { Assertions, Chain, Guard, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';

import ProcessFilters from 'tinymce/plugins/paste/core/ProcessFilters';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.plugins.paste.browser.ProcessFiltersTest', (success, failure) => {

  Theme();
  PastePlugin();

  const cProcessPre = function (html, internal, preProcess) {
    return Chain.control(
      Chain.mapper(function (editor: any) {
        editor.on('PastePreProcess', preProcess);

        const result = ProcessFilters.process(editor, html, internal);

        editor.off('PastePreProcess', preProcess);

        return result;
      }),
      Guard.addLogging('Paste preprocess')
    );
  };

  const cProcessPrePost = function (html, internal, preProcess, postProcess) {
    return Chain.control(
      Chain.mapper(function (editor: any) {
        editor.on('PastePreProcess', preProcess);
        editor.on('PastePostProcess', postProcess);

        const result = ProcessFilters.process(editor, html, internal);

        editor.off('PastePreProcess', preProcess);
        editor.off('PastePostProcess', postProcess);

        return result;
      }),
      Guard.addLogging('Paste preprocess and paste postprocess')
    );
  };

  const preventHandler = function (e) {
    e.preventDefault();
  };

  const preProcessHandler = function (e) {
    e.content += 'X';
  };

  const postProcessHandler = function (editor) {
    return function (e) {
      editor.dom.remove(editor.dom.select('b', e.node), true);
    };
  };

  const assertInternal = function (expectedFlag) {
    return function (e) {
      Assertions.assertEq('Should be expected internal flag', expectedFlag, e.internal);
    };
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre process only', [
        cProcessPre('a', true, preProcessHandler),
        Assertions.cAssertEq('Should be preprocessed by adding a X', { content: 'aX', cancelled: false })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process passthough as is', [
        cProcessPrePost('a', true, Fun.noop, Fun.noop),
        Assertions.cAssertEq('Should be unchanged with safe content', { content: 'a', cancelled: false })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process passthough unsafe content', [
        cProcessPrePost('<img src="non-existent.png" onerror="alert(\'!\')">', true, Fun.noop, Fun.noop),
        Assertions.cAssertEq('Should be changed if dangerous content', { content: '<img src="non-existent.png">', cancelled: false })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process assert internal false', [
        cProcessPrePost('a', false, assertInternal(false), assertInternal(false)),
        Assertions.cAssertEq('Should be unchanged', { content: 'a', cancelled: false })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process assert internal true', [
        cProcessPrePost('a', true, assertInternal(true), assertInternal(true)),
        Assertions.cAssertEq('Should be unchanged', { content: 'a', cancelled: false })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process alter on preprocess', [
        cProcessPrePost('a', true, preProcessHandler, Fun.noop),
        Assertions.cAssertEq('Should be preprocessed by adding a X', { content: 'aX', cancelled: false })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process alter on postprocess', [
        cProcessPrePost('a<b>b</b>c', true, Fun.noop, postProcessHandler(editor)),
        Assertions.cAssertEq('Should have all b elements removed', { content: 'abc', cancelled: false })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process alter on preprocess/postprocess', [
        cProcessPrePost('a<b>b</b>c', true, preProcessHandler, postProcessHandler(editor)),
        Assertions.cAssertEq('Should have all b elements removed and have a X added', { content: 'abcX', cancelled: false })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process prevent default on preProcess', [
        cProcessPrePost('a<b>b</b>c', true, preventHandler, postProcessHandler(editor)),
        Assertions.cAssertEq('Should have all b elements removed and be cancelled', { content: 'a<b>b</b>c', cancelled: true })
      ])),

      Chain.asStep(editor, Log.chains('TBA', 'Paste: Paste pre/post process prevent default on postProcess', [
        cProcessPrePost('a<b>b</b>c', true, preProcessHandler, preventHandler),
        Assertions.cAssertEq('Should have a X added and be cancelled', { content: 'a<b>b</b>cX', cancelled: true })
      ]))
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    indent: false,
    plugins: 'paste',
    base_url: '/project/tinymce/js/tinymce',
    extended_valid_elements: 'b[*]'
  }, success, failure);
});
