import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as RangeWalk from 'tinymce/core/selection/RangeWalk';

describe('browser.tinymce.core.selection.RangeWalkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const complexList = '<ul>' +
    '<li>Test 1</li>' +
    '<li>Test 2' +
      '<ul>' +
        '<li>Test 2.1</li>' +
        '<li><strong>Test 2.2</strong>' +
          '<ul>' +
            '<li>Test 2.2.1</li>' +
          '</ul>' +
        '</li>' +
      '</ul>' +
    '</li>' +
    '<li>Test 3</li>' +
  '</ul>';

  const testWalking = (editor: Editor, expected: string[][]) => {
    const nodeNames: string[][] = [];

    const rng = editor.selection.getRng();
    RangeWalk.walk(editor.dom, rng, (nodes) => {
      nodeNames.push(Arr.map(nodes, (node) => node.nodeName.toLowerCase()));
    });

    assert.deepEqual(nodeNames, expected);
  };

  it('should only include itself if the full node is selected', () => {
    const editor = hook.editor();
    editor.setContent(
      '<div>' +
      '<p>Paragraph 1</p>' +
      '<p>Paragraph 2, with <strong>bold</strong> content</p>' +
      '</div>'
    );
    TinySelections.setSelection(editor, [], 0, [], 1);

    testWalking(editor, [
      [ 'div' ]
    ]);
  });

  it('should only traverse the boundaries once if the end node is inside the start node', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>Some <em>text <span style="color: red">with</span> formatting</em></strong></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0, 1, 1, 0 ], 2);

    testWalking(editor, [
      [ '#text' ],
      [ '#text' ],
      [ '#text' ]
    ]);
  });

  it('should only traverse the boundaries once if the start node is inside the end node', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>Some <em>text <span style="color: red">with</span> formatting</em></strong></p>');
    TinySelections.setSelection(editor, [ 0, 0, 1, 1, 0 ], 2, [ 0 ], 1);

    testWalking(editor, [
      [ '#text' ],
      [ '#text' ]
    ]);
  });

  it('should only walk over siblings and not traverse down', () => {
    const editor = hook.editor();
    editor.setContent(
      '<div>' +
      '<p>Paragraph 1</p>' +
      '<ul>' +
        '<li>List item</li>' +
      '</ul>' +
      '<p>Paragraph 2, with <strong>bold</strong> content</p>' +
      '</div>'
    );
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);

    testWalking(editor, [
      [ 'p', 'ul', 'p' ]
    ]);
  });

  it('should exclude edge nodes when walking boundaries', () => {
    const editor = hook.editor();
    editor.setContent(complexList);
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 1, 1, 1, 1, 0, 0 ], 4);

    testWalking(editor, [
      // Left boundary
      [ '#text' ],
      // Right boundary
      [ '#text' ],
      [ 'strong' ],
      [ 'li' ],
      [ '#text' ]
    ]);
  });
});
