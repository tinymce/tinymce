import { before, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/autolink/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as KeyUtils from '../module/test/KeyUtils';

describe('browser.tinymce.plugins.autolink.ConsecutiveLinkTest', () => {
  before(function () {
    if (Env.browser.isIE()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autolink',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  it('TBA: Chrome adds a nbsp between link and text', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;www.domain.com</p>');
    TinySelections.setCursor(editor, [ 0, 1 ], 15);
    KeyUtils.type(editor, ' ');
    TinyAssertions.assertContent(editor, '<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;<a href="http://www.domain.com">www.domain.com</a>&nbsp;</p>');
  });

  it('TBA: FireFox does not seem to add a nbsp between link and text', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://www.domain.com">www.domain.com</a> www.domain.com</p>');
    TinySelections.setCursor(editor, [ 0, 1 ], 15);
    KeyUtils.type(editor, ' ');
    TinyAssertions.assertContent(editor, '<p><a href="http://www.domain.com">www.domain.com</a> <a href="http://www.domain.com">www.domain.com</a>&nbsp;</p>');
  });
});
