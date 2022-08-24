import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Hooks from 'tinymce/core/fmt/Hooks';

describe('browser.tinymce.core.fmt.HooksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('pre - postProcessHook', () => {
    const editor = hook.editor();
    const assertPreHook = (setupHtml: string, setupSelection: [ string, number, string, number ], expected: string) => {
      editor.getBody().innerHTML = setupHtml;
      LegacyUnit.setSelection(editor, ...setupSelection);
      Hooks.postProcess('pre', editor);
      TinyAssertions.assertContent(editor, expected);
    };

    assertPreHook(
      '<pre>a</pre><pre>b</pre>',
      [ 'pre:nth-child(1)', 0, 'pre:nth-child(2)', 1 ],
      '<pre>a<br><br>b</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre>',
      [ 'pre:nth-child(2)', 0, 'pre:nth-child(2)', 1 ],
      '<pre>a</pre><pre>b</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre>',
      [ 'pre:nth-child(2)', 1, 'pre:nth-child(2)', 1 ],
      '<pre>a</pre><pre>b</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre><pre>c</pre>',
      [ 'pre:nth-child(1)', 0, 'pre:nth-child(3)', 1 ],
      '<pre>a<br><br>b<br><br>c</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre>',
      [ 'pre:nth-child(1)', 0, 'pre:nth-child(1)', 1 ],
      '<pre>a</pre><pre>b</pre>'
    );

    assertPreHook(
      '<pre>a</pre><p>b</p><pre>c</pre>',
      [ 'pre:nth-child(1)', 0, 'pre:nth-child(3)', 1 ],
      '<pre>a</pre><p>b</p><pre>c</pre>'
    );

    assertPreHook(
      '<pre>a</pre><pre>b</pre><p>c</p><pre>d</pre><pre>e</pre>',
      [ 'pre:nth-child(1)', 0, 'pre:nth-child(5)', 1 ],
      '<pre>a<br><br>b</pre><p>c</p><pre>d<br><br>e</pre>'
    );
  });
});
