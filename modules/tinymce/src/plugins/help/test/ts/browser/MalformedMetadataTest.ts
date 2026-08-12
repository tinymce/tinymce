import { after, before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import HelpPlugin from 'tinymce/plugins/help/Plugin';

import * as PluginAssert from '../module/PluginAssert';
import { selectors } from '../module/Selectors';
import * as FakePlugins from '../module/test/FakePlugins';

describe('browser.tinymce.plugins.help.MalformedMetadataTest', () => {
  const fakePlugins = [
    FakePlugins.createUntypedFakePlugin('undefinedtypefake', {
      name: 'Undefined Type Fake',
      url: 'http://www.undefinedtype.com',
      type: undefined
    }),
    FakePlugins.createUntypedFakePlugin('noslugfake', {
      name: 'No Slug Fake',
      type: 'opensource'
    }),
    FakePlugins.createUntypedFakePlugin('nameonlyfake', {
      name: 'Name Only Fake'
    }),
    FakePlugins.createUntypedFakePlugin('slugnotypefake', {
      name: 'Slug No Type Fake',
      slug: 'slug-no-type'
    }),
    FakePlugins.createUntypedFakePlugin('invalidtypefake', {
      name: 'Invalid Type Fake',
      type: 'PREMIUM',
      slug: 'invalid-type'
    })
  ];

  const pAssertPlugins = (expected: Record<string, number>): Promise<void> =>
    PluginAssert.pAssert('Plugin list mismatch', expected, selectors.dialog, selectors.pluginsTab);

  const openHelpDialog = (editor: Editor): void => {
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
  };

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: `help ${FakePlugins.keys(fakePlugins)}`,
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce'
  }, [ HelpPlugin, ...FakePlugins.registrations(fakePlugins) ]);

  before(() => openHelpDialog(hook.editor()));

  after(() => FakePlugins.unregisterAll(fakePlugins));

  it('TINYMCE-14730: a plugin with only a name renders as plain text, not a hyperlink', () =>
    pAssertPlugins({
      'li:contains("Name Only Fake")': 1,
      'li a:contains("Name Only Fake")': 0,
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

  it('TINYMCE-14730: a plugin with a slug but no type does not get a docs link', () =>
    pAssertPlugins({
      'li:contains("Slug No Type Fake")': 1,
      'li a:contains("Slug No Type Fake")': 0,
      'li a[href*="slug-no-type"]': 0
    }));

  it('TINYMCE-14730: a plugin with an unrecognised type does not get a docs link', () =>
    pAssertPlugins({
      'li:contains("Invalid Type Fake")': 1,
      'li a:contains("Invalid Type Fake")': 0,
      'li a[href*="invalid-type"]': 0
    }));
});
