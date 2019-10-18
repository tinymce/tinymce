import Theme from 'tinymce/themes/silver/Theme';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import Editor from 'tinymce/core/api/Editor';
import { Editor as McEditor } from '@ephox/mcagar';
import { Chain, Logger, Pipeline } from '@ephox/agar';
import Env from 'tinymce/core/api/Env';

UnitTest.asynctest('browser.tinymce.core.dom.ContentCssCorsTest', (success, failure) => {
  Theme();

  const cAssertCorsLinkPresence = (expected: boolean) => Chain.op((editor: Editor) => {
    const corsLinks = editor.getDoc().querySelectorAll('link[crossorigin="anonymous"]');
    Assert.eq('should have link with crossorigin="anonymous"', expected, corsLinks.length > 0);
  });

  Pipeline.async({}, Env.ie < 12 ? [] : [
    Logger.t('assert crossorigin link presence with setting set', Chain.asStep({}, [
      McEditor.cFromSettings({ content_css_cors: true, base_url: '/project/tinymce/js/tinymce' }),
      cAssertCorsLinkPresence(true),
      McEditor.cRemove
    ])),
    Logger.t('assert crossorigin link presence with no setting set', Chain.asStep({}, [
      McEditor.cFromSettings({ base_url: '/project/tinymce/js/tinymce' }),
      cAssertCorsLinkPresence(false),
      McEditor.cRemove
    ]))
  ], () => success(), failure);
});
