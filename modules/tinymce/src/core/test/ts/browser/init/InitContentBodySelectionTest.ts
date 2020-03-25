import { Assertions, Log, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { HTMLTextAreaElement } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.init.InitContentBodySelectionTest', (success, failure) => {
  const isIE = PlatformDetection.detect().browser.isIE();
  Theme();

  const sInitAndAssertContent = (label: string, html: string, path: number[], offset = 0, extraSettings = {}) => {
    return Logger.t(label, Step.async((done, die) => {
      TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
        const api = TinyApis(editor);
        Pipeline.async({}, [
          api.sAssertSelection(path, offset, path, offset),
          Step.sync(() => {
            Assertions.assertEq('Check editor doesn\'t have focus', false, editor.hasFocus());
          })
        ], onSuccess, onFailure);
      }, {
        toolbar_sticky: false,
        base_url: '/project/tinymce/js/tinymce',
        setup: (ed: Editor) => {
          ed.on('PreInit', () => {
            (ed.getElement() as HTMLTextAreaElement).value = html;
          }, true);
        },
        ...extraSettings
      }, done, die);
    }));
  };

  Pipeline.async({}, [
    Log.stepsAsStep('TINY-4139', 'Paragraph tests', [
      sInitAndAssertContent('Test p with br', '<p><br /></p>', [0]),
      sInitAndAssertContent('Test p', '<p>Initial Content</p>', [0, 0]),
      sInitAndAssertContent('Test h1', '<h1>Initial Content</h1>', [0, 0]),
      sInitAndAssertContent('Test p with inline styles', '<p><span style="font-weight: bold">Initial Content</span></p>', [0, 0, 0]),
      sInitAndAssertContent('Test p with noneditable span', '<p><span class="mceNonEditable">Initial Content</span></p>', [0, 0, 0]),
      sInitAndAssertContent('Test noneditable p', '<p class="mceNonEditable">Initial Content</p>', [0, 0]),
      // IE has single selection which means we can't set the actual selection as it'll cause the editor to be focused. So we just
      // store the bookmark, however that means SelectionOverrides logic doesn't run which is what causes the whole paragraph to be selected
      sInitAndAssertContent('Test cef p', '<p contenteditable="false">Initial Content</p>', isIE ? [] : [0]),
    ]),
    Log.stepsAsStep('TINY-4139', 'More complex content tests', [
      // IE has single selection which means we can't set the actual selection as it'll cause the editor to be focused. So we just
      // store the bookmark, however that means BoundarySelection logic doesn't run which is what causes the selection to move inside the anchor
      sInitAndAssertContent('Test a (which should be wrapped in a p on init)', '<a href="www.google.com">Initial Content</a>', [0, 0, 0], isIE ? 0 : 1),
      sInitAndAssertContent('Test a in paragraph', '<p><a href="www.google.com">Initial Content</a></p>', [0, 0, 0], isIE ? 0 : 1),
      sInitAndAssertContent('Test list', '<ul><li>Initial Content</li></ul>', [0, 0, 0]),
      sInitAndAssertContent('Test image (which should be wrapped in a p on init)', '<img src="https://www.google.com/logos/google.jpg" alt="My alt text" width="354" height="116" />', [0]),
      sInitAndAssertContent('Test image in p', '<p><img src="https://www.google.com/logos/google.jpg" alt="My alt text" width="354" height="116" /></p>', [0]),
      sInitAndAssertContent('Test table', '<table><tbody><tr><td>Initial Content</td></tr></tbody></table>', [0, 0, 0, 0, 0]),
    ]),
    Log.stepsAsStep('TINY-4139', 'div and forced_root_block tests', [
      sInitAndAssertContent('Test div with br', '<div><br /></div>', [0]),
      sInitAndAssertContent('Test div', '<div>Initial Content</div>', [0, 0]),
      sInitAndAssertContent('Test p with br with forced_root_block=div', '<p><br /></p>', [0], 0, { forced_root_block: false }),
      sInitAndAssertContent('Test p with forced_root_block=div', '<p>Initial Content</p>', [0, 0], 0, { forced_root_block: false }),
      sInitAndAssertContent('Test div with br with forced_root_block=div', '<div><br /></div>', [0], 0, { forced_root_block: false }),
      sInitAndAssertContent('Test div with forced_root_block=div', '<div>Initial Content</div>', [0, 0], 0, { forced_root_block: false }),
      sInitAndAssertContent('Test div with br with forced_root_block=div', '<div><br /></div>', [0], 0, { forced_root_block: 'div' }),
      sInitAndAssertContent('Test div with forced_root_block=div', '<div>Initial Content</div>', [0, 0], 0, { forced_root_block: 'div' }),
    ])
  ], success, failure);
});
