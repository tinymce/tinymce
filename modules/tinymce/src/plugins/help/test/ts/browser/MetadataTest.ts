import { before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
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

  const pAssertPlugins = (expected: Record<string, number>): Promise<void> =>
    PluginAssert.pAssert('Plugin list mismatch', expected, selectors.dialog, selectors.pluginsTab);

  const openHelpDialog = (editor: Editor): void => {
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
  };

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'help fake nometafake opensourcefake premiumfake hiddenfake',
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce'
  }, [ HelpPlugin, FakePlugin, NoMetaFakePlugin, OpenSourceFakePlugin, PremiumFakePlugin, HiddenFakePlugin ]);

  before(() => openHelpDialog(hook.editor()));

  it('TINYMCE-14650: lists a plugin with metadata as a docs link', () =>
    pAssertPlugins({ 'li a:contains("Help")': 1 }));

  it('TINYMCE-14650: lists a third-party plugin using the raw url from its metadata', () =>
    pAssertPlugins({ 'li a[href="http://www.fake.com"]': 1 }));

  it('TINYMCE-14650: renders a plugin without metadata as its key, with no link', () =>
    pAssertPlugins({ 'li:contains("nometafake")': 1, 'li a:contains("nometafake")': 0 }));

  it('TINYMCE-14650: builds the docs url from the slug for an opensource plugin', () =>
    pAssertPlugins({
      'li a:contains("Opensource Fake")': 1,
      [`li a[href="https://www.tiny.cloud/docs/tinymce/${majorVersion}/opensource-fake-docs/"]`]: 1
    }));

  it('TINYMCE-14650: suffixes premium plugin names with * and builds the docs url from the key', () =>
    pAssertPlugins({
      'li a:contains("Premium Fake*")': 1,
      [`li a[href="https://www.tiny.cloud/docs/tinymce/${majorVersion}/premiumfake/"]`]: 1
    }));

  it('TINYMCE-14650: omits hidden plugins from the list', () =>
    pAssertPlugins({ 'li:contains("Hidden Fake")': 0, 'li:contains("hiddenfake")': 0 }));

  it('TINYMCE-14650: shows the footer with a pricing link', () =>
    pAssertPlugins({
      'p.tox-help__more-link': 1,
      'p.tox-help__more-link a[href*="/pricing"]': 1
    }));
});
