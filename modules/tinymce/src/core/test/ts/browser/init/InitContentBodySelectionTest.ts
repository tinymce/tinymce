import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Node } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from '../../../../main/ts/api/Editor';

// @ts-ignore
// tslint:disable-next-line: prefer-const
let tinymce;

UnitTest.asynctest('browser.tinymce.core.init.InitContentBodySelectionTest', (success, failure) => {
  Theme();

  const sInitAndAssertContent = (label: string, html: string, inline: boolean, getStartContainer: (body: Node) => Node, startOffset = 0, extraSettings = {}) => {
    return Logger.t(label, Step.async((done, die) => {
      TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
        const step = Step.sync(() => {
          const body = editor.getBody();
          const rng = editor.selection.getRng();
          Assertions.assertDomEq('Expect editor to have correct selection', Element.fromDom(getStartContainer(body)), Element.fromDom(rng.startContainer));
          Assertions.assertEq('Expect editor to have correct selection', startOffset, rng.startOffset);
        });
        Pipeline.async({}, [step], onSuccess, onFailure);
      }, {
        toolbar_sticky: false,
        inline,
        base_url: '/project/tinymce/js/tinymce',
        setup: (ed: Editor) => {
          ed.on('LoadContent', () => {
            ed.focus();
            ed.setContent(html);
          }, true);
        },
        ...extraSettings
      }, done, die);
    }));
  };

  const getNthDescendent = (node: Node, n: number) => {
    if (n === 1) {
      return node.firstChild;
    } else {
      return getNthDescendent(node.firstChild, n - 1);
    }
  };

  const steps = (inline: boolean) => ([
    // p tests
    sInitAndAssertContent('Test p with br - inline: ' + inline, '<p><br /></p>', inline, (body) => body.firstChild),
    sInitAndAssertContent('Test p - inline: ' + inline, '<p>Initial Content</p>', inline, (body) => getNthDescendent(body, 2)),
    sInitAndAssertContent('Test h1 - inline: ' + inline, '<h1>Initial Content</h1>', inline, (body) => getNthDescendent(body, 2)),
    sInitAndAssertContent('Test p with inline styles - inline: ' + inline, '<p><span style="font-weight: bold">Initial Content</span></p>', inline, (body) => getNthDescendent(body, 3)),
    sInitAndAssertContent('Test p with noneditable span - inline: ' + inline, '<p><span class="mceNonEditable">Initial Content</span></p>', inline, (body) => getNthDescendent(body, 3)),
    sInitAndAssertContent('Test noneditable p - inline: ' + inline, '<p class="mceNonEditable">Initial Content</p>', inline, (body) => getNthDescendent(body, 2)),
    sInitAndAssertContent('Test cef p - inline: ' + inline, '<p contenteditable="false">Initial Content</p>', inline, (body) => body.firstChild),
    // More complex content tests
    sInitAndAssertContent('Test a (which should be wrapped in a p on init) - inline: ' + inline, '<a href="www.google.com">Initial Content</a>', inline, (body) => getNthDescendent(body, 3), 1),
    sInitAndAssertContent('Test a in paragraph - inline: ' + inline, '<p><a href="www.google.com">Initial Content</a></p>', inline, (body) => getNthDescendent(body, 3), 1),
    sInitAndAssertContent('Test list - inline: ' + inline, '<ul><li>Initial Content</li></ul>', inline, (body) => getNthDescendent(body, 3)),
    sInitAndAssertContent('Test image (which should be wrapped in a p on init) - inline: ' + inline, '<img src="https://www.google.com/logos/google.jpg" alt="My alt text" width="354" height="116" />', inline, (body) => body.firstChild),
    sInitAndAssertContent('Test image in p - inline: ' + inline, '<p><img src="https://www.google.com/logos/google.jpg" alt="My alt text" width="354" height="116" /></p>', inline, (body) => body.firstChild),
    sInitAndAssertContent('Test table - inline: ' + inline, '<table><tbody><tr><td>Initial Content</td></tr></tbody></table>', inline, (body) => getNthDescendent(body, 5)),
    // div and forced_root_block tests
    sInitAndAssertContent('Test div with br - inline: ' + inline, '<div><br /></div>', inline, (body) => body.firstChild),
    sInitAndAssertContent('Test div - inline: ' + inline, '<div>Initial Content</div>', inline, (body) => getNthDescendent(body, 2)),
    sInitAndAssertContent('Test p with br with forced_root_block=div - inline: ' + inline, '<p><br /></p>', inline, (body) => body.firstChild, 0, {forced_root_block: false}),
    sInitAndAssertContent('Test p with forced_root_block=div - inline: ' + inline, '<p>Initial Content</p>', inline, (body) => getNthDescendent(body, 2), 0, {forced_root_block: false}),
    sInitAndAssertContent('Test div with br with forced_root_block=div - inline: ' + inline, '<div><br /></div>', inline, (body) => body.firstChild, 0, {forced_root_block: false}),
    sInitAndAssertContent('Test div with forced_root_block=div - inline: ' + inline, '<div>Initial Content</div>', inline, (body) => getNthDescendent(body, 2), 0, {forced_root_block: false}),
    sInitAndAssertContent('Test div with br with forced_root_block=div - inline: ' + inline, '<div><br /></div>', inline, (body) => body.firstChild, 0, {forced_root_block: 'div'}),
    sInitAndAssertContent('Test div with forced_root_block=div - inline: ' + inline, '<div>Initial Content</div>', inline, (body) => getNthDescendent(body, 2), 0, {forced_root_block: 'div'}),
  ]);

  Pipeline.async({}, Arr.flatten([
    steps(false),
    steps(true)
  ]), success, failure);
});
