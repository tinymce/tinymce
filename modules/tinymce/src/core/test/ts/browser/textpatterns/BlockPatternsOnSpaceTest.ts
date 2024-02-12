import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

import * as Utils from '../../module/test/TextPatternsUtils';

describe('browser.tinymce.core.textpatterns.BlockPatternsOnSpaceTest', () => {
  context('default block textpatterns triggered with Space', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'lists',
      base_url: '/project/tinymce/js/tinymce',
      indent: false,
    }, [ ListsPlugin ]);

    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('');
    });

    it('TINY-10324: should insert h1 on #', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '#');
      TinyAssertions.assertContent(editor, '<h1>&nbsp;</h1>');

      Utils.setContentAndPressSpaceDown(editor, '#abc', false, 1);
      TinyAssertions.assertContent(editor, '<h1>abc</h1>');
    });

    it('TINY-10324: should insert h2 on ##', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '##');
      TinyAssertions.assertContent(editor, '<h2>&nbsp;</h2>');

      Utils.setContentAndPressSpaceDown(editor, '##abc', false, 2);
      TinyAssertions.assertContent(editor, '<h2>abc</h2>');
    });

    it('TINY-10324: should insert h3 on ###', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '###');
      TinyAssertions.assertContent(editor, '<h3>&nbsp;</h3>');

      Utils.setContentAndPressSpaceDown(editor, '###abc', false, 3);
      TinyAssertions.assertContent(editor, '<h3>abc</h3>');
    });

    it('TINY-10324: should insert h4 on ####', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '####');
      TinyAssertions.assertContent(editor, '<h4>&nbsp;</h4>');

      Utils.setContentAndPressSpaceDown(editor, '####abc', false, 4);
      TinyAssertions.assertContent(editor, '<h4>abc</h4>');
    });

    it('TINY-10324: should insert h5 on #####', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '#####');
      TinyAssertions.assertContent(editor, '<h5>&nbsp;</h5>');

      Utils.setContentAndPressSpaceDown(editor, '#####abc', false, 5);
      TinyAssertions.assertContent(editor, '<h5>abc</h5>');
    });

    it('TINY-10324: should insert h6 on ######', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '######');
      TinyAssertions.assertContent(editor, '<h6>&nbsp;</h6>');

      Utils.setContentAndPressSpaceDown(editor, '######abc', false, 6);
      TinyAssertions.assertContent(editor, '<h6>abc</h6>');
    });

    it('TINY-10324: should insert unordered list on *', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '*');
      TinyAssertions.assertContent(editor, '<ul><li>&nbsp;</li></ul>');

      Utils.setContentAndPressSpaceDown(editor, '*abc', false, 1);
      TinyAssertions.assertContent(editor, '<ul><li>abc</li></ul>');
    });

    it('TINY-10324: should insert unordered list on -', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '-');
      TinyAssertions.assertContent(editor, '<ul><li>&nbsp;</li></ul>');

      Utils.setContentAndPressSpaceDown(editor, '-abc', false, 1);
      TinyAssertions.assertContent(editor, '<ul><li>abc</li></ul>');
    });

    it('TINY-10324: should insert ordered list on 1.', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '1.');
      TinyAssertions.assertContent(editor, '<ol><li>&nbsp;</li></ol>');

      Utils.setContentAndPressSpaceDown(editor, '1.abc', false, 2);
      TinyAssertions.assertContent(editor, '<ol><li>abc</li></ol>');
    });

    it('TINY-10324: should insert blockquote on >', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '>');
      TinyAssertions.assertContent(editor, '<blockquote><p>&nbsp;</p></blockquote>');

      Utils.setContentAndPressSpaceDown(editor, '>abc', false, 1);
      TinyAssertions.assertContent(editor, '<blockquote><p>abc</p></blockquote>');
    });

    it('TINY-10324: should insert horizontal rule on ---', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '---');
      TinyAssertions.assertContent(editor, '<hr><p>&nbsp;</p>');

      Utils.setContentAndPressSpaceDown(editor, '---abc', false, 3);
      TinyAssertions.assertContent(editor, '<hr><p>abc</p>');
    });
  });

  context('block text patterns with mixed triggers (Enter or Space), ', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'lists',
      base_url: '/project/tinymce/js/tinymce',
      indent: false,
      text_patterns: [
        { start: '#', format: 'h1', trigger: 'space' },
        { start: '##', format: 'h2', trigger: 'enter' },
        { start: '###', format: 'h3', trigger: 'space' },
        { start: '####', format: 'h4', trigger: 'enter' },
        { start: '#####', format: 'h5', trigger: 'space' },
        { start: '######', format: 'h6', trigger: 'enter' },
        { start: '1. ', cmd: 'InsertOrderedList', trigger: 'enter' },
        { start: '* ', cmd: 'InsertUnorderedList', trigger: 'space' },
        { start: '- ', cmd: 'InsertUnorderedList', trigger: 'enter' },
        { start: '> ', cmd: 'mceBlockQuote', trigger: 'enter' },
        { start: '--- ', cmd: 'InsertHorizontalRule', trigger: 'enter' },
      ]
    }, [ ListsPlugin ]);

    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('');
    });

    it('TINY-10324: should insert h1 on # and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '#');
      TinyAssertions.assertContent(editor, '<h1>&nbsp;</h1>');
    });

    it('TINY-10324: should not insert h1 on `# a` and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '# ', true);
      TinyAssertions.assertContent(editor, '<p># &nbsp;</p>');

      Utils.setContentAndPressSpaceDown(editor, '# a');
      TinyAssertions.assertContent(editor, '<p># a</p>');
    });

    it('TINY-10324: should not insert h1 on # and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '#');
      TinyAssertions.assertContent(editor, '<p>#</p><p>&nbsp;</p>');

      Utils.setContentAndPressEnter(editor, '# a');
      TinyAssertions.assertContent(editor, '<p># a</p><p>&nbsp;</p>');
    });

    it('TINY-10324: should insert h2 on ## and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '##a');
      TinyAssertions.assertContent(editor, '<h2>a</h2><p>&nbsp;</p>');

      Utils.setContentAndPressEnter(editor, '## a');
      TinyAssertions.assertContent(editor, '<h2>a</h2><p>&nbsp;</p>');
    });

    it('TINY-10324: should not insert h2 if Enter is pressed just after the pattern prefix ##', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '##');
      TinyAssertions.assertContent(editor, '<p>##</p><p>&nbsp;</p>');
    });

    it('TINY-10324: should not insert h2 on ## and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '##', true);
      TinyAssertions.assertContent(editor, '<p>##&nbsp;</p>');
    });

    it('TINY-10324: should insert h3 on ### and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '###');
      TinyAssertions.assertContent(editor, '<h3>&nbsp;</h3>');
    });

    it('TINY-10324: should not insert h3 on `### a` and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '### ', true);
      TinyAssertions.assertContent(editor, '<p>### &nbsp;</p>');

      Utils.setContentAndPressSpaceDown(editor, '### a');
      TinyAssertions.assertContent(editor, '<p>### a</p>');
    });

    it('TINY-10324: should insert h4 on #### and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '#### a');
      TinyAssertions.assertContent(editor, '<h4>a</h4><p>&nbsp;</p>');
    });

    it('TINY-10324: should not insert h4 on ### and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '####', true);
      TinyAssertions.assertContent(editor, '<p>####&nbsp;</p>');
    });

    it('TINY-10324: should insert h5 on ##### and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '#####');
      TinyAssertions.assertContent(editor, '<h5>&nbsp;</h5>');
    });

    it('TINY-10324: should not insert h5 on `##### a` and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '##### ', true);
      TinyAssertions.assertContent(editor, '<p>##### &nbsp;</p>');

      Utils.setContentAndPressSpaceDown(editor, '##### a');
      TinyAssertions.assertContent(editor, '<p>##### a</p>');
    });

    it('TINY-10324: should insert h6 on ###### and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '###### a');
      TinyAssertions.assertContent(editor, '<h6>a</h6><p>&nbsp;</p>');
    });

    it('TINY-10324: should not insert h6 on ###### and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '######', true);
      TinyAssertions.assertContent(editor, '<p>######&nbsp;</p>');
    });

    it('TINY-10324: should insert unordered list on `* ` and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '* ');
      TinyAssertions.assertContent(editor, '<ul><li>&nbsp;</li></ul>');
    });

    it('TINY-10324: should not insert unordered list on `*` and Space', () => {
      const editor = hook.editor();
      Utils.setContentAndPressSpaceDown(editor, '*', true);
      TinyAssertions.assertContent(editor, '<p>*&nbsp;</p>');
    });

    it('TINY-10324: should not insert unordered list on `* a` and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '* a');
      TinyAssertions.assertContent(editor, '<p>* a</p><p>&nbsp;</p>');
    });

    it('TINY-10324: should insert unordered list on `- a` and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '- a');
      TinyAssertions.assertContent(editor, '<ul><li>a</li><li>&nbsp;</li></ul>');
    });

    it('TINY-10324: should insert ordered list on `1. a` and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '1. a');
      TinyAssertions.assertContent(editor, '<ol><li>a</li><li>&nbsp;</li></ol>');
    });

    it('TINY-10324: should insert blockquote on > and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '> a');
      TinyAssertions.assertContent(editor, '<blockquote><p>a</p><p>&nbsp;</p></blockquote>');
    });

    it('TINY-10324: should insert horizontal rule on --- and Enter', () => {
      const editor = hook.editor();
      Utils.setContentAndPressEnter(editor, '--- ');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><hr><p>&nbsp;</p><p>&nbsp;</p>');
    });
  });
});
