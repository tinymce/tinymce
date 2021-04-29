import { Keys } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as NodeType from 'tinymce/core/dom/NodeType';
import * as WordSelection from 'tinymce/core/selection/WordSelection';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.keyboard.ArrowKeysInlineBoundariesTest', () => {
  const detect = PlatformDetection.detect();
  const browser = detect.browser;
  const os = detect.os;
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  const assertCaretAtZwsp = (editor: Editor) => {
    const rng = editor.selection.getRng();
    const sc = rng.startContainer;
    const so = rng.startOffset;
    assert.isTrue(NodeType.isText(sc), 'Start container should be a text node');
    const chr = (sc as Text).data.substr(so, 1);
    assert.equal(chr, Zwsp.ZWSP, 'Should be zwsp at caret');
  };

  const assertCaretAfterZwsp = (editor: Editor) => {
    const rng = editor.selection.getRng();
    const sc = rng.startContainer;
    const so = rng.startOffset;
    assert.isTrue(NodeType.isText(sc), 'Start container should be a text node');
    const chr = (sc as Text).data.substr(so - 1, 1);
    assert.equal(chr, Zwsp.ZWSP, 'Should be after a zwsp at caret');
  };

  // TODO: This function was needed to make tests pass on Firefox and IE, but it is likely hiding bugs in the arrow navigation
  const legacySetRawContent = (editor: Editor, content: string) => {
    if (browser.isIE() || browser.isFirefox()) {
      editor.getBody().innerHTML = content;
    } else {
      editor.setContent(content, { format: 'raw' });
    }
  };

  context('Arrow keys anchor with text', () => {
    it('From start to end inside anchor over text', () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#">x</a></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
      assertCaretAtZwsp(editor);
    });

    it('From start to before anchor with text', () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#">x</a></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      assertCaretAtZwsp(editor);
    });

    it('From end to after anchor with text', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#">x</a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
    });

    it('From end to start inside anchor over text', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#">x</a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
      assertCaretAfterZwsp(editor);
    });
  });

  context('Arrow keys anchor with image', () => {
    it('From start to end inside anchor over img', () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#"><img src="#"></a></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 0, 1 ], 0);
      assertCaretAtZwsp(editor);
    });

    it('From start to before on anchor with img', () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#"><img src="#"></a></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      assertCaretAtZwsp(editor);
    });

    it('From end to after on anchor with img', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#"><img src="#"></a></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
    });

    it('From end to start inside anchor over img', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#"><img src="#"></a></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
      assertCaretAfterZwsp(editor);
    });
  });

  context('Arrow keys between blocks', () => {
    it('From end of anchor text to after anchor to start of anchor in next paragraph', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#">a</a></p><p><a href="#">b</a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinySelections.setCursor(editor, [ 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 1, 0, 0 ], 1);
      assertCaretAfterZwsp(editor);
    });

    it('From start of anchor text to before anchor to end of anchor in previous paragraph', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#">a</a></p><p><a href="#">b</a></p>');
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      assertCaretAtZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
      assertCaretAtZwsp(editor);
    });

    it('From end of anchor text to after anchor to but not to next paragraph', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#">a</a></p><p>b<a href="#">c</a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinySelections.setCursor(editor, [ 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
    });

    it('From start of anchor text to before anchor to end of anchor but not to previous paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#">a</a>b</p><p><a href="#">c</a></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      assertCaretAtZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
      assertCaretAtZwsp(editor);
    });
  });

  context('Arrow keys between lists', () => {
    it('From end of anchor text to after anchor to start of anchor in next list item', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<ul><li><a href="#">a</a></li><li><a href="#">b</a></li></ul>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinySelections.setCursor(editor, [ 0, 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 1);
      assertCaretAfterZwsp(editor);
    });

    it('From start of anchor text to before anchor to end of anchor in previous list item', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<ul><li><a href="#">a</a></li><li><a href="#">b</a></li></ul>');
      TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      assertCaretAtZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 1);
      assertCaretAtZwsp(editor);
    });

    it('From end of anchor text to after anchor to but not to next list item', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<ul><li><a href="#">a</a></li><li>b<a href="#">c</a></li></ul>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinySelections.setCursor(editor, [ 0, 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
    });

    it('From start of anchor text to before anchor to end of anchor but not to previous list item', () => {
      const editor = hook.editor();
      editor.setContent('<ul><li><a href="#">a</a>b</li><li><a href="#">c</a></li></ul>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      assertCaretAtZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
      assertCaretAtZwsp(editor);
    });

    it('From start of anchor to before anchor but not to previous list item anchor', () => {
      const editor = hook.editor();
      editor.setContent('<ul><li><a href="#">a</a></li><li>b<a href="#">c</a></li></ul>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1, 1, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      assertCaretAtZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 1);
      assertCaretAtZwsp(editor);
    });

    it('From end of anchor to after anchor but not to next list item anchor', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<ul><li><a href="#">a</a>b</li><li><a href="#">c</a></li></ul>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinySelections.setCursor(editor, [ 0, 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
    });
  });

  context('Arrow keys at anchor + code', () => {
    it('From start to end inside anchor + code over text', () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#"><code>x</code></a></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 1);
      assertCaretAtZwsp(editor);
    });

    it('From start to before anchor + code with text', () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="#"><code>x</code></a></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      assertCaretAtZwsp(editor);
    });

    it('From end to after anchor + code with text', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#"><code>x</code></a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
      assertCaretAfterZwsp(editor);
    });

    it('From end to start inside anchor + code over text', () => {
      const editor = hook.editor();
      legacySetRawContent(editor, '<p><a href="#"><code>x</code></a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 1);
      assertCaretAfterZwsp(editor);
    });
  });

  context('Ctrl+arrow keys at anchor', () => {
    before(function () {
      if (!WordSelection.hasSelectionModifyApi(hook.editor())) {
        this.skip();
      }
    });

    it('Ctrl+Arrow right from inline boundary to next word', () => {
      const editor = hook.editor();
      editor.setContent('<p>aa <a href="#">bb</a> cc</p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.right(), { ctrl: !os.isOSX(), alt: os.isOSX() });
      // TINY-7334: Chromium v90 caused the way the Selection.modify API works on Windows so that
      // it moves to the start of the next word instead of the end of the next word
      if (os.isWindows() && (browser.isChrome() || browser.isEdge()) && browser.version.major >= 90) {
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
      } else {
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 3);
      }
    });

    it('Ctrl+Arrow left from inline boundary to previous word', () => {
      const editor = hook.editor();
      editor.setContent('<p>aa <a href="#">bb</a> cc</p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.left(), { ctrl: !os.isOSX(), alt: os.isOSX() });
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });
  });
});
