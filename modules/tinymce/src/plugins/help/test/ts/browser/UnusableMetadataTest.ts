import { after, before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import HelpPlugin from 'tinymce/plugins/help/Plugin';

import * as PluginAssert from '../module/PluginAssert';
import { selectors } from '../module/Selectors';
import * as FakePlugins from '../module/test/FakePlugins';

describe('browser.tinymce.plugins.help.UnusableMetadataTest', () => {
  const fakePlugins = [
    FakePlugins.createUntypedFakePlugin('emptymetafake', {}),
    FakePlugins.createFakePlugin('throwingfake', () => {
      throw new Error('getMetadata exploded');
    }),
    FakePlugins.createUntypedFakePlugin('randomfieldsfake', {
      foo: 1,
      bar: 'baz'
    }),
    FakePlugins.createUntypedFakePlugin('namedrandomfake', {
      name: 'Named Random Fake',
      foo: 1
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

  it('TINYMCE-14730: the dialog still opens and lists every plugin', () =>
    pAssertPlugins({ li: 5 }));

  it('TINYMCE-14730: empty metadata falls back to the plugin key', () =>
    pAssertPlugins({ 'li:contains("emptymetafake")': 1, 'li a:contains("emptymetafake")': 0 }));

  it('TINYMCE-14730: a throwing getMetadata falls back to the plugin key', () =>
    pAssertPlugins({ 'li:contains("throwingfake")': 1, 'li a:contains("throwingfake")': 0 }));

  it('TINYMCE-14730: unrecognised fields with no name fall back to the plugin key', () =>
    pAssertPlugins({ 'li:contains("randomfieldsfake")': 1, 'li a:contains("randomfieldsfake")': 0 }));

  it('TINYMCE-14730: unrecognised fields with a usable name keep the name, unlinked', () =>
    pAssertPlugins({
      'li:contains("Named Random Fake")': 1,
      'li a:contains("Named Random Fake")': 0,
      'li:contains("namedrandomfake")': 0
    }));
});
