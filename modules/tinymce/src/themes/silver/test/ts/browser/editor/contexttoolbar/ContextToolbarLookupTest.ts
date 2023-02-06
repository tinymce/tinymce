import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Cell, Fun, Obj } from '@ephox/katamari';
import { Focus, SelectorFind, SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarLookupTest', () => {
  const predicateNodeNames = Cell<Record<string, string[]>>({ });
  const hook = TinyHooks.bddSetup<Editor>({
    inline: true,
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      // Setup some initial content to test initial load
      ed.on('PreInit', () => {
        ed.setContent('<p>Content</p>');
      });

      // Setup a container to click to outside the editor
      ed.on('init', () => {
        const parent = ed.getContentAreaContainer().parentNode as Node;
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
        onAction: Fun.noop
      });
      ed.ui.registry.addButton('parentnode', {
        text: 'Parent',
        onAction: Fun.noop
      });
      ed.ui.registry.addButton('editor', {
        text: 'Editor',
        onAction: Fun.noop
      });

      // Register toolbars to test with
      ed.ui.registry.addContextToolbar('test-node-toolbar', {
        predicate: (node) => {
          recordNode('node', node);
          return node.nodeName.toLowerCase() === 'a';
        },
        items: 'node',
        scope: 'node'
      });
      ed.ui.registry.addContextToolbar('test-parent-node-toolbar', {
        predicate: (node) => {
          recordNode('parent', node);
          const childNode = node.childNodes[0];
          return childNode && childNode.nodeName.toLowerCase() === 'strong';
        },
        items: 'parentnode',
        scope: 'node'
      });
      ed.ui.registry.addContextToolbar('test-editor-toolbar', {
        predicate: (node) => {
          recordNode('editor', node);
          return node.nodeName.toLowerCase() === 'span';
        },
        items: 'editor',
        scope: 'editor'
      });
    }
  }, [], true);

  const recordNode = (type: string, node: Node) => {
    const nodeName = node.nodeName.toLowerCase();
    const current = predicateNodeNames.get();
    predicateNodeNames.set({
      ...current,
      [type]: Obj.has(current, type) ? current[type].concat([ nodeName ]) : [ nodeName ]
    });
  };
  const resetNames = () => predicateNodeNames.set({ });
  const assertTypesNames = (type: string, names: string[]) => {
    const actualNames = Obj.get(predicateNodeNames.get(), type).getOr([]);
    assert.deepEqual(actualNames, names, `Check ${type} lookup node names`);
  };

  const assertNames = (node: string[], parent: string[], editor: string[]) => {
    assertTypesNames('node', node);
    assertTypesNames('parent', parent);
    assertTypesNames('editor', editor);
  };

  it('TINY-4571: Context toolbar initial load lookups', async () => {
    await Waiter.pTryUntil('Waited for names to match', () => assertNames([ 'p', 'div' ], [ 'p', 'div' ], [ 'p' ]));
  });

  it('TINY-4571: Context toolbar node scope lookup', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud">link</a></p>');
    resetNames();
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    await UiFinder.pWaitForVisible('Waiting for node toolbar to appear', SugarBody.body(), '.tox-tbtn:contains(Node)');
    assertNames([ 'a' ], [ 'a' ], [ 'a' ]);
  });

  it('TINY-4571: Context toolbar parent node scope lookup', async () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em>bold italic</em></strong></p>');
    resetNames();
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
    await UiFinder.pWaitForVisible('Waiting for parent node toolbar to appear', SugarBody.body(), '.tox-tbtn:contains(Parent)');
    assertNames([ 'em', 'strong', 'p' ], [ 'em', 'strong', 'p' ], [ 'em' ]);
  });

  it('TINY-4571: Context toolbar editor scope lookup', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="color: red">content</span></p>');
    resetNames();
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    await UiFinder.pWaitForVisible('Waiting for editor toolbar to appear', SugarBody.body(), '.tox-tbtn:contains(Editor)');
    assertNames([ 'span' ], [ 'span' ], [ 'span' ]);
  });

  it('TINY-4571: Context toolbar no match lookup', async () => {
    const editor = hook.editor();
    editor.setContent('<p><code>Code</code></p>');
    resetNames();
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    await Waiter.pTryUntil('Waited for names to match', () => assertNames([ 'code', 'p', 'div' ], [ 'code', 'p', 'div' ], [ 'code' ]));
  });

  it('TINY-4571: Context toolbar root node lookup', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Content</p>');
    resetNames();
    // TODO: TINY-7167
    TinySelections.setCursor(editor, [], 0, false);
    await Waiter.pTryUntil('Waited for names to match', () => assertNames([ 'div' ], [ 'div' ], [ 'div' ]));
  });

  it('TINY-4571: Context toolbar click outside to inside', async () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em>bold italic</em></strong></p>');
    resetNames();
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
    await UiFinder.pWaitForVisible('Waiting for parent node toolbar to appear', SugarBody.body(), '.tox-tbtn:contains(Parent)');
    assertNames([ 'em', 'strong', 'p' ], [ 'em', 'strong', 'p' ], [ 'em' ]);
    resetNames();
    SelectorFind.descendant<HTMLTextAreaElement>(SugarBody.body(), '#content-click-area').each(Focus.focus);
    await Waiter.pTryUntil('Wait for toolbar to hide', () => UiFinder.notExists(SugarBody.body(), '.tox-pop'));
    assertNames([], [], []);
    editor.focus();
    await UiFinder.pWaitForVisible('Waiting for parent node toolbar to appear', SugarBody.body(), '.tox-tbtn:contains(Parent)');
    assertNames([ 'em', 'strong', 'p' ], [ 'em', 'strong', 'p' ], [ 'em' ]);
  });
});
