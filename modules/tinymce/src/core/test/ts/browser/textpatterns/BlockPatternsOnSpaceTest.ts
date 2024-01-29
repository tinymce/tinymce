import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

import * as Utils from '../../module/test/TextPatternsUtils';

describe('browser.tinymce.core.textpatterns.BlockPatternsOnSpaceTest', () => {
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
    Utils.setContentAndPressSpace(editor, '#');
    TinyAssertions.assertContent(editor, '<h1>&nbsp;</h1>');
  });

  it('TINY-10324: should insert h2 on ##', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '##');
    TinyAssertions.assertContent(editor, '<h2>&nbsp;</h2>');
  });

  it('TINY-10324: should insert h3 on ###', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '###');
    TinyAssertions.assertContent(editor, '<h3>&nbsp;</h3>');
  });

  it('TINY-10324: should insert h4 on ####', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '####');
    TinyAssertions.assertContent(editor, '<h4>&nbsp;</h4>');
  });

  it('TINY-10324: should insert h5 on #####', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '#####');
    TinyAssertions.assertContent(editor, '<h5>&nbsp;</h5>');
  });

  it('TINY-10324: should insert h6 on ######', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '######');
    TinyAssertions.assertContent(editor, '<h6>&nbsp;</h6>');
  });

  it('TINY-10324: should insert unordered list on *', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '*');
    TinyAssertions.assertContent(editor, '<ul><li>&nbsp;</li></ul>');
  });

  it('TINY-10324: should insert unordered list on -', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '-');
    TinyAssertions.assertContent(editor, '<ul><li>&nbsp;</li></ul>');
  });

  it('TINY-10324: should insert ordered list on 1.', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '1.');
    TinyAssertions.assertContent(editor, '<ol><li>&nbsp;</li></ol>');
  });

  it('TINY-10324: should insert blockquote on >', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '>');
    TinyAssertions.assertContent(editor, '<blockquote><p>&nbsp;</p></blockquote>');
  });

  it('TINY-10324: should insert horizontal ruel on ---', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '---');
    TinyAssertions.assertContent(editor, '<hr><p>&nbsp;</p>');
  });
});
