import { Assertions, Chain, Guard, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { McEditor } from '@ephox/mcagar';

import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as MockDataTransfer from '../module/test/MockDataTransfer';

UnitTest.asynctest('browser.tinymce.plugins.paste.PlainTextPaste', (success, failure) => {
  Theme();
  PastePlugin();

  const cCreateEditorFromSettings = (settings, _html?) => {
    return Chain.control(
      McEditor.cFromSettings({
        ...settings,
        base_url: '/project/tinymce/js/tinymce',
        indent: false
      }),
      Guard.addLogging(`Create editor from ${settings}`)
    );
  };

  const cRemoveEditor = () => {
    return Chain.control(
      McEditor.cRemove,
      Guard.addLogging('Remove editor')
    );
  };

  const cClearEditor = () => {
    return Chain.control(
      Chain.async((editor: any, next, _die) => {
        editor.setContent('');
        next(editor);
      }),
      Guard.addLogging('Clear editor')
    );
  };

  const cFireFakePasteEvent = (data) => {
    return Chain.control(
      Chain.async((editor: any, next, _die) => {
        editor.fire('paste', { clipboardData: MockDataTransfer.create(data) });
        next(editor);
      }),
      Guard.addLogging(`Fire fake paste event ${data}`)
    );
  };

  const cAssertEditorContent = (label, expected) => {
    return Chain.control(
      Chain.async((editor: any, next, _die) => {
        Assertions.assertHtml(label || 'Asserting editors content', expected, editor.getContent());
        next(editor);
      }),
      Guard.addLogging(`Assert editor content ${expected}`)
    );
  };

  const cAssertClipboardPaste = (expected, data) => {
    const chains = [];

    Obj.each(data, (data, label) => {
      chains.push(
        cFireFakePasteEvent(data),
        Chain.control(
          cAssertEditorContent(label, expected),
          Guard.tryUntil('Wait for paste to succeed.')
        ),
        cClearEditor()
      );
    });

    return Chain.control(
      Chain.fromChains(chains),
      Guard.addLogging(`Assert clipboard paste ${expected}`)
    );
  };

  const srcText = 'one\r\ntwo\r\n\r\nthree\r\n\r\n\r\nfour\r\n\r\n\r\n\r\n.';

  const pasteData = {
    Firefox: {
      'text/plain': srcText,
      'text/html': 'one<br>two<br><br>three<br><br><br>four<br><br><br><br>.'
    },
    Chrome: {
      'text/plain': srcText,
      'text/html': '<div>one</div><div>two</div><div><br></div><div>three</div><div><br></div><div><br></div><div>four</div><div><br></div><div><br></div><div><br></div><div>.'
    },
    Edge: {
      'text/plain': srcText,
      'text/html': '<div>one<br>two</div><div>three</div><div><br>four</div><div><br></div><div>.</div>'
    },
    IE: {
      'text/plain': srcText,
      'text/html': '<p>one<br>two</p><p>three</p><p><br>four</p><p><br></p><p>.</p>'
    }
  };

  const expectedWithRootBlock = '<p>one<br />two</p><p>three</p><p><br />four</p><p>&nbsp;</p><p>.</p>';
  const expectedWithRootBlockAndAttrs = '<p class="attr">one<br />two</p><p class="attr">three</p><p class="attr"><br />four</p><p class="attr">&nbsp;</p><p class="attr">.</p>';
  const expectedWithoutRootBlock = 'one<br />two<br /><br />three<br /><br /><br />four<br /><br /><br /><br />.';

  Pipeline.async({}, [
    Chain.asStep({}, Log.chains('TBA', 'Paste: Assert forced_root_block <p></p> is added to the pasted data', [
      cCreateEditorFromSettings({
        plugins: 'paste',
        forced_root_block: 'p' // default
      }),
      cAssertClipboardPaste(expectedWithRootBlock, pasteData),
      cRemoveEditor()
    ])),
    Chain.asStep({}, Log.chains('TBA', 'Paste: Assert forced_root_block <p class="attr"></p> is added to the pasted data', [
      cCreateEditorFromSettings({
        plugins: 'paste',
        forced_root_block: 'p',
        forced_root_block_attrs: {
          class: 'attr'
        }
      }),
      cAssertClipboardPaste(expectedWithRootBlockAndAttrs, pasteData),
      cRemoveEditor()
    ])),
    Chain.asStep({}, Log.chains('TBA', 'Paste: Assert forced_root_block is not added to the pasted data', [
      cCreateEditorFromSettings({
        plugins: 'paste',
        forced_root_block: false
      }),
      cAssertClipboardPaste(expectedWithoutRootBlock, pasteData),
      cRemoveEditor()
    ]))
  ], success, failure);
});
