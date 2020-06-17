import { GeneralSteps, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document, Node } from '@ephox/dom-globals';
import { Cell, Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Focus, SelectorFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Inline editor Context Toolbar Lookup test', (success, failure) => {
  SilverTheme();

  const predicateNodeNames = Cell<Record<string, string[]>>({ });

  const recordNode = (type: string, node: Node) => {
    const nodeName = node.nodeName.toLowerCase();
    const current = predicateNodeNames.get();
    predicateNodeNames.set({
      ...current,
      [type]: Obj.has(current, type) ? current[type].concat([ nodeName ]) : [ nodeName ]
    });
  };
  const sResetNames = () => Step.sync(() => predicateNodeNames.set({ }));
  const sAssertTypesNames = (type: string, names: string[]) => Step.sync(() => {
    const actualNames = Obj.get(predicateNodeNames.get(), type).getOr([]);
    Assert.eq(`Check ${type} lookup node names`, names, actualNames);
  });

  const sAssertNames = (node: string[], parent: string[], editor: string[]) => GeneralSteps.sequence([
    sAssertTypesNames('node', node),
    sAssertTypesNames('parent', parent),
    sAssertTypesNames('editor', editor)
  ]);

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);

      Pipeline.async({ }, [
        tinyApis.sFocus(),

        Log.stepsAsStep('TINY-4571', 'Context toolbar initial load lookups', [
          Step.wait(50), // Need to wait a little for the context toolbar lookup to run
          sAssertNames([ 'p', 'div' ], [ 'p', 'div' ], [ 'p' ])
        ]),

        Log.stepsAsStep('TINY-4571', 'Context toolbar node scope lookup', [
          tinyApis.sSetContent('<p><a href="http://tiny.cloud">link</a></p>'),
          sResetNames(),
          tinyApis.sSetCursor([ 0, 0, 0 ], 1),
          UiFinder.sWaitForVisible('Waiting for node toolbar to appear', Body.body(), '.tox-tbtn:contains(Node)'),
          sAssertNames([ 'a' ], [ 'a' ], [ 'a' ])
        ]),

        Log.stepsAsStep('TINY-4571', 'Context toolbar parent node scope lookup', [
          tinyApis.sSetContent('<p><strong><em>bold italic</em></strong></p>'),
          sResetNames(),
          tinyApis.sSetCursor([ 0, 0, 0, 0 ], 1),
          UiFinder.sWaitForVisible('Waiting for parent node toolbar to appear', Body.body(), '.tox-tbtn:contains(Parent)'),
          sAssertNames([ 'em', 'strong', 'p' ], [ 'em', 'strong', 'p' ], [ 'em' ])
        ]),

        Log.stepsAsStep('TINY-4571', 'Context toolbar editor scope lookup', [
          tinyApis.sSetContent('<p><span style="color: red">content</span></p>'),
          sResetNames(),
          tinyApis.sSetCursor([ 0, 0, 0 ], 1),
          UiFinder.sWaitForVisible('Waiting for editor toolbar to appear', Body.body(), '.tox-tbtn:contains(Editor)'),
          sAssertNames([ 'span' ], [ 'span' ], [ 'span' ])
        ]),

        Log.stepsAsStep('TINY-4571', 'Context toolbar no match lookup', [
          tinyApis.sSetContent('<p><code>Code</code></p>'),
          sResetNames(),
          tinyApis.sSetCursor([ 0, 0, 0 ], 1),
          Step.wait(50), // Need to wait a little for the context toolbar lookup to run
          sAssertNames([ 'code', 'p', 'div' ], [ 'code', 'p', 'div' ], [ 'code' ])
        ]),

        Log.stepsAsStep('TINY-4571', 'Context toolbar root node lookup', [
          tinyApis.sSetContent('<p>Content</p>'),
          sResetNames(),
          tinyApis.sSetCursor([], 0),
          Step.wait(50), // Need to wait a little for the context toolbar lookup to run
          // IE will fire the lookup twice
          Env.browser.isIE() ? sAssertNames([ 'div', 'div' ], [ 'div', 'div' ], [ 'div', 'div' ]) : sAssertNames([ 'div' ], [ 'div' ], [ 'div' ])
        ]),

        Log.stepsAsStep('TINY-4571', 'Context toolbar click outside to inside', [
          tinyApis.sSetContent('<p><strong><em>bold italic</em></strong></p>'),
          sResetNames(),
          tinyApis.sSetCursor([ 0, 0, 0, 0 ], 1),
          UiFinder.sWaitForVisible('Waiting for parent node toolbar to appear', Body.body(), '.tox-tbtn:contains(Parent)'),
          sAssertNames([ 'em', 'strong', 'p' ], [ 'em', 'strong', 'p' ], [ 'em' ]),
          sResetNames(),
          Step.sync(() => {
            SelectorFind.descendant(Body.body(), '#content-click-area').each(Focus.focus);
          }),
          Waiter.sTryUntil('Wait for toolbar to hide', UiFinder.sNotExists(Body.body(), '.tox-pop')),
          sAssertNames([], [], []),
          tinyApis.sFocus(),
          UiFinder.sWaitForVisible('Waiting for parent node toolbar to appear', Body.body(), '.tox-tbtn:contains(Parent)'),
          sAssertNames([ 'em', 'strong', 'p' ], [ 'em', 'strong', 'p' ], [ 'em' ])
        ])
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      inline: true,
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        // Setup some initial content to test initial load
        ed.on('PreInit', () => {
          ed.setContent('<p>Content</p>');
        });

        // Setup a container to click to outside the editor
        ed.on('init', () => {
          const parent = ed.getContentAreaContainer().parentNode;
          const textarea = document.createElement('textarea');
          textarea.id = 'content-click-area';
          parent.appendChild(textarea);

          ed.on('remove', () => {
            parent.removeChild(textarea);
          });
        });

        // Register buttons to use in the toolbars
        ed.ui.registry.addButton('node', {
          text: 'Node',
          onAction: () => {}
        });
        ed.ui.registry.addButton('parentnode', {
          text: 'Parent',
          onAction: () => {}
        });
        ed.ui.registry.addButton('editor', {
          text: 'Editor',
          onAction: () => {}
        });

        // Register toolbars to test with
        ed.ui.registry.addContextToolbar('test-node-toolbar', {
          predicate: (node) => {
            recordNode('node', node);
            return node.nodeName && node.nodeName.toLowerCase() === 'a';
          },
          items: 'node',
          scope: 'node'
        });
        ed.ui.registry.addContextToolbar('test-parent-node-toolbar', {
          predicate: (node) => {
            recordNode('parent', node);
            const childNode = node.childNodes[0];
            return childNode && childNode.nodeName && childNode.nodeName.toLowerCase() === 'strong';
          },
          items: 'parentnode',
          scope: 'node'
        });
        ed.ui.registry.addContextToolbar('test-editor-toolbar', {
          predicate: (node) => {
            recordNode('editor', node);
            return node.nodeName && node.nodeName.toLowerCase() === 'span';
          },
          items: 'editor',
          scope: 'editor'
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});
