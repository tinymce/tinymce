import { Logger, Pipeline, Chain, ApproxStructure, Keys } from '@ephox/agar';
import { TinyLoader, ApiChains, ActionChains } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

UnitTest.asynctest('browser.tinymce.core.keyboard.ArrowKeysTableTest', (success, failure) => {
    const browser = PlatformDetection.detect().browser;

    ModernTheme();

    const table = (html: string) => ApproxStructure.fromHtml('<table><tbody><tr><td>' + html + '</td></tr></tbody></table>');
    const caret = (type: string) => {
      return ApproxStructure.fromHtml(`<p data-mce-caret="${type}" data-mce-bogus="all"><br data-mce-bogus="1"></p>`);
    };
    const visualCaret = (before: boolean) => {
      const caretClass = before ? 'mce-visual-caret-before' : 'mce-visual-caret';
      return ApproxStructure.fromHtml(`<div class="mce-visual-caret ${caretClass}" data-mce-bogus="all"></div>`);
    };

    const caretBefore = Fun.curry(caret, 'before');
    const caretAfter = Fun.curry(caret, 'after');
    const visualCaretBefore = Fun.curry(visualCaret, true);
    const visualCaretAfter = Fun.curry(visualCaret, false);
    const buildBody = (children) => ApproxStructure.build((s, str, arr) => s.element('body', { children }));

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, browser.isIE() || browser.isFirefox() ? [
        Logger.t('Move fake caret left before table', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
          ApiChains.cSetCursor([0, 0, 0, 0, 0], 0),
          ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
          ActionChains.cContentKeystroke(Keys.left()),
          ApiChains.cAssertContentStructure(buildBody([ caretBefore(), table('1'), visualCaretBefore() ])),
          ApiChains.cAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Move fake caret right after table', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
          ApiChains.cSetCursor([0, 0, 0, 0, 0], 1),
          ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
          ActionChains.cContentKeystroke(Keys.right()),
          ApiChains.cAssertContentStructure(buildBody([ table('1'), caretAfter(), visualCaretAfter() ])),
          ApiChains.cAssertSelection([1], 0, [1], 0)
        ])),
        Logger.t('Move fake caret right after table then right again before other table', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table><table><tbody><tr><td>2</td></tr></tbody></table>'),
          ApiChains.cSetCursor([0, 0, 0, 0, 0], 1),
          ApiChains.cAssertContentStructure(buildBody([ table('1'), table('2') ])),
          ActionChains.cContentKeystroke(Keys.right()),
          ApiChains.cAssertContentStructure(buildBody([ table('1'), caretAfter(), table('2'), visualCaretAfter() ])),
          ApiChains.cAssertSelection([1], 0, [1], 0),
          ActionChains.cContentKeystroke(Keys.right()),
          ApiChains.cAssertContentStructure(buildBody([ table('1'), caretBefore(), table('2'), visualCaretBefore() ])),
          ApiChains.cAssertSelection([1], 0, [1], 0)
        ])),
        Logger.t('Move fake caret left before table then left again after other table', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table><table><tbody><tr><td>2</td></tr></tbody></table>'),
          ApiChains.cSetCursor([1, 0, 0, 0, 0], 0),
          ApiChains.cAssertContentStructure(buildBody([ table('1'), table('2') ])),
          ActionChains.cContentKeystroke(Keys.left()),
          ApiChains.cAssertContentStructure(buildBody([ table('1'), caretBefore(), table('2'), visualCaretBefore() ])),
          ApiChains.cAssertSelection([1], 0, [1], 0),
          ActionChains.cContentKeystroke(Keys.left()),
          ApiChains.cAssertContentStructure(buildBody([ table('1'), caretAfter(), table('2'), visualCaretAfter() ])),
          ApiChains.cAssertSelection([1], 0, [1], 0)
        ])),
        Logger.t('Move fake up for when table is first element', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
          ApiChains.cSetCursor([0, 0, 0, 0, 0], 0),
          ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
          ActionChains.cContentKeystroke(Keys.up()),
          ApiChains.cAssertContentStructure(buildBody([ caretBefore(), table('1'), visualCaretBefore() ])),
          ApiChains.cAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Move fake down for when table is last element', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
          ApiChains.cSetCursor([0, 0, 0, 0, 0], 1),
          ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
          ActionChains.cContentKeystroke(Keys.down()),
          ApiChains.cAssertContentStructure(buildBody([ table('1'), caretAfter(), visualCaretAfter() ])),
          ApiChains.cAssertSelection([1], 0, [1], 0)
        ])),
        Logger.t('Move fake up for when table is first element but not when caret is not as start', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
          ApiChains.cSetCursor([0, 0, 0, 0, 0], 1),
          ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
          ActionChains.cContentKeystroke(Keys.up()),
          ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
          ApiChains.cAssertSelection([0, 0, 0, 0, 0], 1, [0, 0, 0, 0, 0], 1)
        ])),
        Logger.t('Move fake down for when table is last element but not when caret is not as end', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
          ApiChains.cSetCursor([0, 0, 0, 0, 0], 0),
          ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
          ActionChains.cContentKeystroke(Keys.down()),
          ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
          ApiChains.cAssertSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 0)
        ]))
      ] : [], onSuccess, onFailure);
    }, {
      skin_url: '/project/js/tinymce/skins/lightgray'
    }, success, failure);
  }
);
