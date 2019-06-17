import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Hooks from 'tinymce/core/fmt/Hooks';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.fmt.HooksTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  suite.test('pre - postProcessHook', function (editor) {
    const assertPreHook = function (setupHtml, setupSelection, expected) {
      editor.getBody().innerHTML = setupHtml;
      LegacyUnit.setSelection.apply(LegacyUnit, [editor].concat(setupSelection));
      Hooks.postProcess('pre', editor);
      LegacyUnit.equal(editor.getContent(), expected);
    };

    assertPreHook(
      '<pre>a</pre><pre>b</pre>',
      ['pre:nth-child(1)', 0, 'pre:nth-child(2)', 1],
      '<pre>a<br /><br />b</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre>',
      ['pre:nth-child(2)', 0, 'pre:nth-child(2)', 1],
      '<pre>a</pre><pre>b</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre>',
      ['pre:nth-child(2)', 1, 'pre:nth-child(2)', 1],
      '<pre>a</pre><pre>b</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre><pre>c</pre>',
      ['pre:nth-child(1)', 0, 'pre:nth-child(3)', 1],
      '<pre>a<br /><br />b<br /><br />c</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre>',
      ['pre:nth-child(1)', 0, 'pre:nth-child(1)', 1],
      '<pre>a</pre><pre>b</pre>'
    );

    assertPreHook(
      '<pre>a</pre><p>b</p><pre>c</pre>',
      ['pre:nth-child(1)', 0, 'pre:nth-child(3)', 1],
      '<pre>a</pre><p>b</p><pre>c</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre><p>c</p><pre>d</pre><pre>e</pre>',
      ['pre:nth-child(1)', 0, 'pre:nth-child(5)', 1],
      '<pre>a<br /><br />b</pre><p>c</p><pre>d<br /><br />e</pre>'
    );
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
