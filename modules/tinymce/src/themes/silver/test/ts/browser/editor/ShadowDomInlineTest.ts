import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Settings from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.ShadowDomInlineTest', () => {
  const hook = TinyHooks.bddSetupInShadowRoot<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    inline: true
  }, [ Theme ]);

  it('UI container should be inside the shadow root', () => {
    const editor = hook.editor();
    Assertions.assertDomEq('Should be shadow root', hook.shadowRoot(), Settings.getUiContainer(editor));
  });
});
