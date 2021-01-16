import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

interface Definition {
  readonly inputContent: string;
  readonly inputSelection: [ string, number ];
  readonly command: string;
  readonly listType: boolean | 'disc' | 'lower-roman';
  readonly expectedContent: string;
  readonly expectedSelection: [ string, number ];
}

describe('browser.tinymce.plugins.advlist.AdvlistPluginTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'advlist lists',
    add_unload_trigger: false,
    indent: false,
    entities: 'raw',
    valid_elements: 'li[style],ol[style],ul[style],dl,dt,dd,em,strong,span,#p,div,br',
    valid_styles: {
      '*': 'list-style-type'
    },
    disable_nodechange: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ AdvListPlugin, ListsPlugin, Theme ]);

  const listStyleTest = (title: string, definition: Definition) => {
    it(title, () => {
      const editor = hook.editor();
      editor.setContent(definition.inputContent, { format: 'raw' });
      LegacyUnit.setSelection(editor, definition.inputSelection[0], definition.inputSelection[1]);
      editor.execCommand(definition.command, false, { 'list-style-type': definition.listType });

      const rng = editor.selection.getRng();
      const expectedElm = editor.dom.select(definition.expectedSelection[0])[0];

      TinyAssertions.assertContent(editor, definition.expectedContent);
      LegacyUnit.equalDom(rng.startContainer.parentNode, expectedElm, 'Selection elements should be equal');
      assert.equal(rng.startOffset, definition.expectedSelection[1], 'Selection offset should be equal');
    });
  };

  listStyleTest('Apply unordered list style to an unordered list', {
    inputContent: '<ul><li>a</li></ul>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: 'disc',
    expectedContent: '<ul style="list-style-type: disc;"><li>a</li></ul>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply ordered list style to an ordered list', {
    inputContent: '<ol><li>a</li></ol>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyOrderedListStyle',
    listType: 'lower-roman',
    expectedContent: '<ol style="list-style-type: lower-roman;"><li>a</li></ol>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply unordered list style to an ordered list', {
    inputContent: '<ol><li>a</li></ol>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: 'disc',
    expectedContent: '<ul style="list-style-type: disc;"><li>a</li></ul>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply unordered list style to an unordered list with a child unordered list', {
    inputContent: '<ul><li>a<ul><li>b</li></ul></li></ul>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: 'disc',
    expectedContent: '<ul style="list-style-type: disc;"><li>a<ul><li>b</li></ul></li></ul>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply ordered list style to an ordered list with a child ordered list', {
    inputContent: '<ol><li>a<ol><li>b</li></ol></li></ol>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyOrderedListStyle',
    listType: 'lower-roman',
    expectedContent: '<ol style="list-style-type: lower-roman;"><li>a<ol><li>b</li></ol></li></ol>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply unordered list style to an unordered list with a child ordered list', {
    inputContent: '<ul><li>a<ol><li>b</li></ol></li></ul>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: 'disc',
    expectedContent: '<ul style="list-style-type: disc;"><li>a<ol><li>b</li></ol></li></ul>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply ordered list style to an ordered list with a child unordered list', {
    inputContent: '<ol><li>a<ul><li>b</li></ul></li></ol>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyOrderedListStyle',
    listType: 'lower-roman',
    expectedContent: '<ol style="list-style-type: lower-roman;"><li>a<ul><li>b</li></ul></li></ol>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply unordered list style to an unordered list with a parent unordered list', {
    inputContent: '<ul><li>a<ul><li>b</li></ul></li></ul>',
    inputSelection: [ 'li:nth-child(1) > ul > li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: 'disc',
    expectedContent: '<ul><li>a<ul style="list-style-type: disc;"><li>b</li></ul></li></ul>',
    expectedSelection: [ 'li:nth-child(1) > ul > li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply ordered list style to an ordered list with a parent ordered list', {
    inputContent: '<ol><li>a<ol><li>b</li></ol></li></ol>',
    inputSelection: [ 'li:nth-child(1) > ol > li:nth-child(1)', 0 ],
    command: 'ApplyOrderedListStyle',
    listType: 'lower-roman',
    expectedContent: '<ol><li>a<ol style="list-style-type: lower-roman;"><li>b</li></ol></li></ol>',
    expectedSelection: [ 'li:nth-child(1) > ol > li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply ordered list style to an ordered list with a parent unordered list', {
    inputContent: '<ul><li>a<ol><li>b</li></ol></li></ul>',
    inputSelection: [ 'li:nth-child(1) > ol > li:nth-child(1)', 0 ],
    command: 'ApplyOrderedListStyle',
    listType: 'lower-roman',
    expectedContent: '<ul><li>a<ol style="list-style-type: lower-roman;"><li>b</li></ol></li></ul>',
    expectedSelection: [ 'li:nth-child(1) > ol > li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply unordered list style to unordered list with a parent ordered list', {
    inputContent: '<ol><li>a<ul><li>b</li></ul></li></ol>',
    inputSelection: [ 'li:nth-child(1) > ul > li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: 'disc',
    expectedContent: '<ol><li>a<ul style="list-style-type: disc;"><li>b</li></ul></li></ol>',
    expectedSelection: [ 'li:nth-child(1) > ul > li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply ordered list style to an unordered list with a child ordered list', {
    inputContent: '<ul><li>a<ol><li>b</li></ol></li></ul>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyOrderedListStyle',
    listType: false,
    expectedContent: '<ol><li>a<ol><li>b</li></ol></li></ol>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply unordered list style to an ordered list with a child unordered list', {
    inputContent: '<ol><li>a<ul><li>b</li></ul></li></ol>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: false,
    expectedContent: '<ul><li>a<ul><li>b</li></ul></li></ul>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply ordered list style "false" to an ordered list with a child unordered list', {
    inputContent: '<ol><li>a<ul><li>b</li></ul></li></ol>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyOrderedListStyle',
    listType: false,
    expectedContent: '<p>a</p><ul><li style="list-style-type: none;"><ul><li>b</li></ul></li></ul>',
    expectedSelection: [ 'p:nth-child(1)', 0 ]
  });

  listStyleTest('Apply unordered list style "false" to an unordered list with a child ordered list', {
    inputContent: '<ul><li>a<ol><li>b</li></ol></li></ul>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: false,
    expectedContent: '<p>a</p><ol><li style="list-style-type: none;"><ol><li>b</li></ol></li></ol>',
    expectedSelection: [ 'p:nth-child(1)', 0 ]
  });

  listStyleTest('Apply unordered list style "false" to an ordered list with a child ordered list', {
    inputContent: '<ol><li>a<ol><li>b</li></ol></li></ol>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyUnorderedListStyle',
    listType: false,
    expectedContent: '<ul><li>a<ol><li>b</li></ol></li></ul>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });

  listStyleTest('Apply ordered list style "false" to an unordered list with a child unordered list', {
    inputContent: '<ul><li>a<ul><li>b</li></ul></li></ul>',
    inputSelection: [ 'li:nth-child(1)', 0 ],
    command: 'ApplyOrderedListStyle',
    listType: false,
    expectedContent: '<ol><li>a<ul><li>b</li></ul></li></ol>',
    expectedSelection: [ 'li:nth-child(1)', 0 ]
  });
});
