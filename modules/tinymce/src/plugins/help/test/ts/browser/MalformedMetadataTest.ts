import { before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import HelpPlugin from 'tinymce/plugins/help/Plugin';

import * as PluginAssert from '../module/PluginAssert';
import { selectors } from '../module/Selectors';
import NameOnlyFakePlugin from '../module/test/NameOnlyFakePlugin';
import NoSlugFakePlugin from '../module/test/NoSlugFakePlugin';
import UndefinedTypeFakePlugin from '../module/test/UndefinedTypeFakePlugin';

describe('browser.tinymce.plugins.help.MalformedMetadataTest', () => {
  const pAssertPlugins = (expected: Record<string, number>): Promise<void> =>
    PluginAssert.pAssert('Plugin list mismatch', expected, selectors.dialog, selectors.pluginsTab);

  const openHelpDialog = (editor: Editor): void => {
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
  };

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'help undefinedtypefake noslugfake nourlplugin',
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce'
  }, [ HelpPlugin, UndefinedTypeFakePlugin, NoSlugFakePlugin, NameOnlyFakePlugin ]);

  before(() => openHelpDialog(hook.editor()));

  it('TINYMCE-14730: a plugin with only a name renders as plain text, not a hyperlink', () =>
    pAssertPlugins({
      'li:contains("Name Only Plugin")': 1,
      'li a:contains("Name Only Plugin")': 0,
      'li a[href="undefined"]': 0
    }));

  it('TINYMCE-14730: an explicitly undefined type still uses the url branch', () =>
    pAssertPlugins({
      'li a[href="http://www.undefinedtype.com"]': 1,
      'li a[href*="undefined/"]': 0
    }));

  it('TINYMCE-14730: a typed plugin with no slug renders its name unlinked', () =>
    pAssertPlugins({
      'li:contains("No Slug Fake")': 1,
      'li a:contains("No Slug Fake")': 0
    }));
});
