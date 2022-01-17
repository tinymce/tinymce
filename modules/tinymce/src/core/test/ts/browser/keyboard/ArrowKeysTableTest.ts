import { ApproxStructure, Keys, StructAssert } from '@ephox/agar';
import { before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.ArrowKeysTableTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const table = (html: string) => ApproxStructure.fromHtml('<table><tbody><tr><td>' + html + '</td></tr></tbody></table>');
  const block = ApproxStructure.fromHtml('<p><br></p>');
  const caret = (type: string) => ApproxStructure.fromHtml(`<p data-mce-caret="${type}" data-mce-bogus="all"><br data-mce-bogus="1"></p>`);
  const visualCaret = (before: boolean) => {
    const caretClass = before ? 'mce-visual-caret-before' : 'mce-visual-caret';
    return ApproxStructure.fromHtml(`<div class="mce-visual-caret ${caretClass}" data-mce-bogus="all"></div>`);
  };

  const caretBefore = Fun.curry(caret, 'before');
  const caretAfter = Fun.curry(caret, 'after');
  const visualCaretBefore = Fun.curry(visualCaret, true);
  const visualCaretAfter = Fun.curry(visualCaret, false);
  const buildBody = (children: StructAssert[]) => ApproxStructure.build((s, _str, _arr) => s.element('body', { children }));

  beforeEach(() => {
    hook.editor().focus();
  });

  context('FakeCaret before/after table', () => {
    before(function () {
      if (!browser.isFirefox()) {
        this.skip();
      }
    });

    it('Move fake caret left before table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1') ]));
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertContentStructure(editor, buildBody([ caretBefore(), table('1'), visualCaretBefore() ]));
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('Move fake caret right after table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1') ]));
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), caretAfter(), visualCaretAfter() ]));
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });

    it('Move fake caret right after table then right again before other table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td></tr></tbody></table><table><tbody><tr><td>2</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), table('2') ]));
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), caretAfter(), table('2'), visualCaretAfter() ]));
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), caretBefore(), table('2'), visualCaretBefore() ]));
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });

    it('Move fake caret left before table then left again after other table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td></tr></tbody></table><table><tbody><tr><td>2</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 1, 0, 0, 0, 0 ], 0);
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), table('2') ]));
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), caretBefore(), table('2'), visualCaretBefore() ]));
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), caretAfter(), table('2'), visualCaretAfter() ]));
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });

    it('Move fake up for when table is first element', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1') ]));
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertContentStructure(editor, buildBody([ block, table('1') ]));
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('Move fake down for when table is last element', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1') ]));
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), block ]));
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });

    it('Move fake up for when table is first element but not when caret is not as start', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1') ]));
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertContentStructure(editor, buildBody([ block, table('1') ]));
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('Move fake down for when table is last element but not when caret is not as end', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1') ]));
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertContentStructure(editor, buildBody([ table('1'), block ]));
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });
  });

  context('Table cell navigation', () => {
    it('Should move to the cell above the current cell on key up', () => {
      const editor = hook.editor();
      editor.setContent(`
          <table>
            <tbody>
              <tr><td>1</td><td>2</td></tr>
              <tr><td>2</td><td>3</td></tr>
            </tbody>
          </table>
        `);
      TinySelections.setCursor(editor, [ 0, 0, 1, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0);
    });

    it('Should move to the cell below the current cell on key down', () => {
      const editor = hook.editor();
      editor.setContent(`
        <table>
          <tbody>
            <tr><td>1</td><td>2</td></tr>
            <tr><td>2</td><td>3</td></tr>
          </tbody>
        </table>
      `);
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertSelection(editor, [ 0, 0, 1, 1, 0 ], 0, [ 0, 0, 1, 1, 0 ], 0);
    });

    it('Should move to the content above when the caret is a first table row', () => {
      const editor = hook.editor();
      editor.setContent(`
        <p>a<p>
        <table>
          <tbody>
            <tr><td>1</td><td>2</td></tr>
            <tr><td>2</td><td>3</td></tr>
          </tbody>
        </table>
      `);
      TinySelections.setCursor(editor, [ 1, 0, 0, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('Should move to the content below if the caret is a last table row', () => {
      const editor = hook.editor();
      editor.setContent(`
        <table>
          <tbody>
            <tr><td>1</td><td>2</td></tr>
            <tr><td>2</td><td>3</td></tr>
          </tbody>
        </table>
        <p>a<p>
      `);
      TinySelections.setCursor(editor, [ 0, 0, 1, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    });

    it('Should not move down if the caret is on first line in table cell <br>', () => {
      const editor = hook.editor();
      editor.setContent(`
        <table>
          <tbody>
            <tr><td>1</td><td>2<br>3</td></tr>
            <tr><td>4</td><td>5</td></tr>
          </tbody>
        </table>
      `);
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0);
    });

    it('Should not move up if the caret is on last line in table cell <br>', () => {
      const editor = hook.editor();
      editor.setContent(`
        <table>
          <tbody>
            <tr><td>1</td><td>2</td></tr>
            <tr><td>3</td><td>4<br>5</td></tr>
          </tbody>
        </table>
      `);
      TinySelections.setCursor(editor, [ 0, 0, 1, 1, 2 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertSelection(editor, [ 0, 0, 1, 1, 2 ], 0, [ 0, 0, 1, 1, 2 ], 0);
    });

    it('Should not move down if the caret is on first line in table cell <p>', () => {
      const editor = hook.editor();
      editor.setContent(`
        <table>
          <tbody>
            <tr><td>1</td><td><p>2</p><p>3</p></td></tr>
            <tr><td>4</td><td>5</td></tr>
          </tbody>
        </table>
      `);
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 1, 0, 0 ], 0, [ 0, 0, 0, 1, 0, 0 ], 0);
    });

    it('Should not move up if the caret is on last line in table cell <p>', () => {
      const editor = hook.editor();
      editor.setContent(`
        <table>
          <tbody>
            <tr><td>1</td><td>2</td></tr>
            <tr><td>3</td><td><p>4</p><p>5</p></td></tr>
          </tbody>
        </table>
      `);
      TinySelections.setCursor(editor, [ 0, 0, 1, 1, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertSelection(editor, [ 0, 0, 1, 1, 1, 0 ], 0, [ 0, 0, 1, 1, 1, 0 ], 0);
    });
  });
});
