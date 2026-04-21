import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import EditorManager from 'tinymce/core/api/EditorManager';
import HelpPlugin from 'tinymce/plugins/help/Plugin';

import * as PluginAssert from '../module/PluginAssert';
import { selectors } from '../module/Selectors';
import FakePlugin from '../module/test/FakePlugin';
import HiddenFakePlugin from '../module/test/HiddenFakePlugin';
import NoMetaFakePlugin from '../module/test/NoMetaFakePlugin';
import OpenSourceFakePlugin from '../module/test/OpenSourceFakePlugin';
import PremiumFakePlugin from '../module/test/PremiumFakePlugin';

describe('browser.tinymce.plugins.help.MetadataTest', () => {
  const majorVersion = EditorManager.majorVersion;

  const hook = TinyHooks.bddSetupLight({
    plugins: 'help fake nometafake opensourcefake premiumfake hiddenfake',
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce'
  }, [ HelpPlugin, FakePlugin, NoMetaFakePlugin, OpenSourceFakePlugin, PremiumFakePlugin, HiddenFakePlugin ]);

  it('TBA: Assert Help Plugin list contains getMetadata functionality', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
    await PluginAssert.pAssert(
      'Failed to list fake plugins',
      {
        'li a:contains("Help")': 1,
        // Third-party (no type): uses the raw url from metadata.
        'li a:contains("Fake")': 1,
        'li a[href="http://www.fake.com"]': 1,
        // No metadata: renders as the plugin key with no link.
        'li:contains("nometafake")': 1,
        'li a:contains("nometafake")': 0,
        // Opensource with slug override: docs URL built from slug.
        'li a:contains("Opensource Fake")': 1,
        [`li a[href="https://www.tiny.cloud/docs/tinymce/${majorVersion}/opensource-fake-docs/"]`]: 1,
        // Premium: name is suffixed with `*` and docs URL built from key (no slug override).
        'li a:contains("Premium Fake*")': 1,
        [`li a[href="https://www.tiny.cloud/docs/tinymce/${majorVersion}/premiumfake/"]`]: 1,
        // Hidden plugin is not shown in the list.
        'li:contains("Hidden Fake")': 0,
        'li:contains("hiddenfake")': 0,
        // The premium footer appears exactly once when a premium plugin is installed.
        'p.tox-help__more-link': 1,
        'p.tox-help__more-link a:contains("Learn more...")': 1,
        'button:contains("Close")': 1
      },
      selectors.dialog,
      selectors.pluginsTab
    );
  });
});
