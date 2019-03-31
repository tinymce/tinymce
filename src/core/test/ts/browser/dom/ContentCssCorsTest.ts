import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';
import { Editor as McEditor } from '@ephox/mcagar';
import { Pipeline, RawAssertions, Logger, Chain } from '@ephox/agar';
import Env from 'tinymce/core/api/Env';

UnitTest.asynctest('browser.tinymce.core.dom.ContentCssCorsTest', (success, failure) => {
  Theme();

  const cAssertCorsLinkPresence = (expected: boolean) => Chain.op((editor: Editor) => {
    const corsLinks = editor.getDoc().querySelectorAll('link[crossorigin="anonymous"]');
    RawAssertions.assertEq('should have link with crossorigin="anonymous"', expected, corsLinks.length > 0);
  });

  Pipeline.async({}, Env.ie < 12 ? [] : [
    Logger.t('assert crossorigin link presence with setting set', Chain.asStep({}, [
      McEditor.cFromSettings({ content_css_cors: true, skin_url: '/project/tinymce/js/tinymce/skins/lightgray' }),
      cAssertCorsLinkPresence(true),
      McEditor.cRemove
    ])),
    Logger.t('assert crossorigin link presence with no setting set', Chain.asStep({}, [
      McEditor.cFromSettings({ skin_url: '/project/tinymce/js/tinymce/skins/lightgray' }),
      cAssertCorsLinkPresence(false),
      McEditor.cRemove
    ]))
  ], () => success(), failure);
});
