import { after, before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import Editor from 'tinymce/core/api/Editor';
import PromisePolyfill from 'tinymce/core/api/util/Promise';
import Theme from 'tinymce/themes/silver/Theme';

// TODO Find a way to test the referrerpolicy with ScriptLoader, as it removes the dom reference as soon as it's finished loading so we can't check
// via dom elements. For now we're just loading a script to make sure it doesn't completely die when loading.
describe('browser.tinymce.core.dom.ReferrerPolicyTest', () => {
  const platform = PlatformDetection.detect();
  before(() => {
    Theme();
  });

  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    menubar: false,
    toolbar: false
  };

  const assertReferrerLinkPresence = (editor: Editor, referrerPolicy: ReferrerPolicy, expected: boolean) => {
    const links = editor.getDoc().querySelectorAll(`link[referrerpolicy="${referrerPolicy}"]`);
    assert.equal(links.length > 0, expected, `should have link with referrerpolicy="${referrerPolicy}"`);
  };

  const pLoadScript = (url: string): Promise<void> => new PromisePolyfill((resolve, reject) => {
    ScriptLoader.ScriptLoader.loadScript(url, resolve, () => reject('Failed to load script'));
  });

  before(function () {
    // Note: IE/Edge don't support the referrerpolicy attribute on links/scripts, so it never actually gets set
    if (platform.browser.isEdge() || platform.browser.isIE()) {
      this.skip();
    }
  });

  after(() => {
    // Clean up by resetting the globals referrer policy
    ScriptLoader.ScriptLoader._setReferrerPolicy('');
    DOMUtils.DOM.styleSheetLoader._setReferrerPolicy('');
  });

  it('assert referrerpolicy presence with no setting set', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    await pLoadScript('/project/tinymce/src/core/test/assets/js/test.js');
    assertReferrerLinkPresence(editor, 'origin', false);
    McEditor.remove(editor);
  });

  it('assert referrerpolicy presence with setting set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ ...settings, referrer_policy: 'origin' });
    await pLoadScript('/project/tinymce/src/core/test/assets/js/test.js');
    assertReferrerLinkPresence(editor, 'origin', true);
    McEditor.remove(editor);
  });
});
