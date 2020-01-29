import { Chain, Logger, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import Editor from 'tinymce/core/api/Editor';
import { ReferrerPolicy } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';
import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

// TODO Find a way to test the referrerpolicy with ScriptLoader, as it removes the dom reference as soon as it's finished loading so we can't check
// via dom elements. For now we're just loading a script to make sure it doesn't completely die when loading.
UnitTest.asynctest('browser.tinymce.core.dom.ReferrerPolicyTest', (success, failure) => {
  const platform = PlatformDetection.detect();
  Theme();

  const cAssertReferrerLinkPresence = (referrerPolicy: ReferrerPolicy, expected: boolean) => Chain.op((editor: Editor) => {
    const links = editor.getDoc().querySelectorAll(`link[referrerpolicy="${referrerPolicy}"]`);
    Assert.eq(`should have link with referrerpolicy="${referrerPolicy}"`, expected, links.length > 0);
  });

  const cLoadScript = (url) => Chain.async((input, next, die) => {
    ScriptLoader.ScriptLoader.loadScript(url, () => next(input), () => die('Failed to load script'));
  });

  // Note: IE/Edge don't support the referrerpolicy attribute on links/scripts, so it never actually gets set
  Pipeline.async({}, platform.browser.isEdge() || platform.browser.isIE() ? [ ] : [
    Logger.t('assert referrerpolicy presence with no setting set', Chain.asStep({}, [
      McEditor.cFromSettings({ base_url: '/project/tinymce/js/tinymce' }),
      cLoadScript('/project/tinymce/src/core/test/assets/js/test.js'),
      cAssertReferrerLinkPresence('origin', false),
      McEditor.cRemove
    ])),
    Logger.t('assert referrerpolicy presence with setting set', Chain.asStep({}, [
      McEditor.cFromSettings({ referrer_policy: 'origin', base_url: '/project/tinymce/js/tinymce' }),
      cLoadScript('/project/tinymce/src/core/test/assets/js/test.js'),
      cAssertReferrerLinkPresence('origin', true),
      McEditor.cRemove
    ])),
    Step.sync(() => {
      // Clean up by resetting the globals referrer policy
      ScriptLoader.ScriptLoader._setReferrerPolicy('');
      DOMUtils.DOM.styleSheetLoader._setReferrerPolicy('');
    })
  ], () => success(), failure);
});
