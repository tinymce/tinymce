import { Logger, Pipeline, Chain, ApproxStructure, Keys, GeneralSteps } from '@ephox/agar';
import { TinyLoader, ApiChains, ActionChains } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock';
import Theme from 'tinymce/themes/silver/Theme';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

UnitTest.asynctest('browser.tinymce.core.keyboard.ArrowKeysTableTest', (success, failure) => {
    const browser = PlatformDetection.detect().browser;

    Theme();

    const table = (html: string) => ApproxStructure.fromHtml('<table><tbody><tr><td>' + html + '</td></tr></tbody></table>');
    const block = ApproxStructure.fromHtml('<p><br></p>');
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

    TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, [
        Logger.t('FakeCaret before/after table', GeneralSteps.sequence(browser.isEdge() || browser.isFirefox() ? [
          Logger.t('Move fake caret left before table', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
            ApiChains.cSetCursor([0, 0, 0, 0, 0], 0),
            ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
            ActionChains.cContentKeystroke(Keys.left()),
            ApiChains.cAssertContentStructure(buildBody([ caretBefore(), table('1'), visualCaretBefore() ])),
            ApiChains.cAssertSelection([0], 0, [0], 0)
          ])),
          Logger.t('Move fake caret right after table', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
            ApiChains.cSetCursor([0, 0, 0, 0, 0], 1),
            ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
            ActionChains.cContentKeystroke(Keys.right()),
            ApiChains.cAssertContentStructure(buildBody([ table('1'), caretAfter(), visualCaretAfter() ])),
            ApiChains.cAssertSelection([1], 0, [1], 0)
          ])),
          Logger.t('Move fake caret right after table then right again before other table', Chain.asStep(editor, [
            ApiChains.cFocus,
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
            ApiChains.cFocus,
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
            ApiChains.cFocus,
            ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
            ApiChains.cSetCursor([0, 0, 0, 0, 0], 0),
            ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
            ActionChains.cContentKeystroke(Keys.up()),
            ApiChains.cAssertContentStructure(buildBody([ block, table('1') ])),
            ApiChains.cAssertSelection([0], 0, [0], 0)
          ])),
          Logger.t('Move fake down for when table is last element', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
            ApiChains.cSetCursor([0, 0, 0, 0, 0], 1),
            ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
            ActionChains.cContentKeystroke(Keys.down()),
            ApiChains.cAssertContentStructure(buildBody([ table('1'), block ])),
            ApiChains.cAssertSelection([1], 0, [1], 0)
          ])),
          Logger.t('Move fake up for when table is first element but not when caret is not as start', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
            ApiChains.cSetCursor([0, 0, 0, 0, 0], 1),
            ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
            ActionChains.cContentKeystroke(Keys.up()),
            ApiChains.cAssertContentStructure(buildBody([ block, table('1') ])),
            ApiChains.cAssertSelection([0], 0, [0], 0)
          ])),
          Logger.t('Move fake down for when table is last element but not when caret is not as end', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent('<table><tbody><tr><td>1</td></tr></tbody></table>'),
            ApiChains.cSetCursor([0, 0, 0, 0, 0], 0),
            ApiChains.cAssertContentStructure(buildBody([ table('1') ])),
            ActionChains.cContentKeystroke(Keys.down()),
            ApiChains.cAssertContentStructure(buildBody([ table('1'), block ])),
            ApiChains.cAssertSelection([1], 0, [1], 0)
          ]))] : []
        )),

        Logger.t('Table cell navigation', GeneralSteps.sequence([
          Logger.t('Should move to the cell above the current cell on key up', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent(`
              <table>
                <tbody>
                  <tr><td>1</td><td>2</td></tr>
                  <tr><td>2</td><td>3</td></tr>
                </tbody>
              </table>
            `),
            ApiChains.cSetCursor([0, 0, 1, 1, 0], 0),
            ActionChains.cContentKeystroke(Keys.up()),
            ApiChains.cAssertSelection([0, 0, 0, 1, 0], 0, [0, 0, 0, 1, 0], 0)
          ])),
          Logger.t('Should move to the cell below the current cell on key down', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent(`
              <table>
                <tbody>
                  <tr><td>1</td><td>2</td></tr>
                  <tr><td>2</td><td>3</td></tr>
                </tbody>
              </table>
            `),
            ApiChains.cSetCursor([0, 0, 0, 1, 0], 0),
            ActionChains.cContentKeystroke(Keys.down()),
            ApiChains.cAssertSelection([0, 0, 1, 1, 0], 0, [0, 0, 1, 1, 0], 0)
          ])),
          Logger.t('Should move to the content above when the caret is a first table row', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent(`
              <p>a<p>
              <table>
                <tbody>
                  <tr><td>1</td><td>2</td></tr>
                  <tr><td>2</td><td>3</td></tr>
                </tbody>
              </table>
            `),
            ApiChains.cSetCursor([1, 0, 0, 1, 0], 0),
            ActionChains.cContentKeystroke(Keys.up()),
            ApiChains.cAssertSelection([0, 0], 1, [0, 0], 1)
          ])),
          Logger.t('Should move to the content below if the caret is a last table row', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent(`
              <table>
                <tbody>
                  <tr><td>1</td><td>2</td></tr>
                  <tr><td>2</td><td>3</td></tr>
                </tbody>
              </table>
              <p>a<p>
            `),
            ApiChains.cSetCursor([0, 0, 1, 1, 0], 0),
            ActionChains.cContentKeystroke(Keys.down()),
            ApiChains.cAssertSelection([1, 0], 1, [1, 0], 1)
          ])),
          Logger.t('Should not move down if the caret is on first line in table cell <br>', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent(`
              <table>
                <tbody>
                  <tr><td>1</td><td>2<br>3</td></tr>
                  <tr><td>4</td><td>5</td></tr>
                </tbody>
              </table>
            `),
            ApiChains.cSetCursor([0, 0, 0, 1, 0], 0),
            ActionChains.cContentKeystroke(Keys.down()),
            ApiChains.cAssertSelection([0, 0, 0, 1, 0], 0, [0, 0, 0, 1, 0], 0)
          ])),
          Logger.t('Should not move up if the caret is on last line in table cell <br>', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent(`
              <table>
                <tbody>
                  <tr><td>1</td><td>2</td></tr>
                  <tr><td>3</td><td>4<br>5</td></tr>
                </tbody>
              </table>
            `),
            ApiChains.cSetCursor([0, 0, 1, 1, 2], 0),
            ActionChains.cContentKeystroke(Keys.up()),
            ApiChains.cAssertSelection([0, 0, 1, 1, 2], 0, [0, 0, 1, 1, 2], 0)
          ])),
          Logger.t('Should not move down if the caret is on first line in table cell <p>', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent(`
              <table>
                <tbody>
                  <tr><td>1</td><td><p>2</p><p>3</p></td></tr>
                  <tr><td>4</td><td>5</td></tr>
                </tbody>
              </table>
            `),
            ApiChains.cSetCursor([0, 0, 0, 1, 0, 0], 0),
            ActionChains.cContentKeystroke(Keys.down()),
            ApiChains.cAssertSelection([0, 0, 0, 1, 0, 0], 0, [0, 0, 0, 1, 0, 0], 0)
          ])),
          Logger.t('Should not move up if the caret is on last line in table cell <p>', Chain.asStep(editor, [
            ApiChains.cFocus,
            ApiChains.cSetContent(`
              <table>
                <tbody>
                  <tr><td>1</td><td>2</td></tr>
                  <tr><td>3</td><td><p>4</p><p>5</p></td></tr>
                </tbody>
              </table>
            `),
            ApiChains.cSetCursor([0, 0, 1, 1, 1, 0], 0),
            ActionChains.cContentKeystroke(Keys.up()),
            ApiChains.cAssertSelection([0, 0, 1, 1, 1, 0], 0, [0, 0, 1, 1, 1, 0], 0)
          ]))
        ]))
      ], onSuccess, onFailure);
    }, {
      base_url: '/project/tinymce/js/tinymce'
    }, success, failure);
  }
);
