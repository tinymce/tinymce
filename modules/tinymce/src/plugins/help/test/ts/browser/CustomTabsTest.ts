import { UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Html } from '@ephox/sugar';
import { McEditor, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import Plugin from 'tinymce/plugins/help/Plugin';

describe('browser.tinymce.plugins.help.CustomTabsTest', () => {
  before(() => {
    Plugin();
  });

  const compareTabNames = async (editor: Editor, expectedNames: string[]): Promise<void> => {
    editor.execCommand('mceHelp');
    const dialogEl = await TinyUiActions.pWaitForDialog(editor);
    const actualTabs = UiFinder.findAllIn<HTMLDivElement>(dialogEl, 'div.tox-dialog__body-nav-item.tox-tab');
    const actualNames = Arr.map(actualTabs, (tab) => Html.get(tab));
    Arr.map(expectedNames, (x, i) => {
      assert.equal(actualNames[i], x, 'Tab names did not match');
    });
  };

  const pCreateEditor = (settings: RawEditorOptions) => McEditor.pFromSettings<Editor>({
    plugins: 'help',
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce',
    ...settings
  });

  it('TINY-3535: Default help dialog', async () => {
    const editor = await pCreateEditor({});
    await compareTabNames(editor, [ 'Handy Shortcuts', 'Keyboard Navigation', 'Plugins', 'Version' ]);
    McEditor.remove(editor);
  });

  it('TINY-3535: help_tabs with pre-registered and new tabs', async () => {
    const editor = await pCreateEditor({
      help_tabs: [
        'shortcuts',
        'plugins',
        {
          name: 'versions', // this will override the default versions tab
          title: 'Version',
          items: [{
            type: 'htmlpanel',
            html: '<p>This is a custom version panel...</p>'
          }]
        },
        {
          name: 'extraTab1',
          title: 'Extra1',
          items: [{
            type: 'htmlpanel',
            html: '<p>This is an extra tab</p>'
          }]
        }
      ]
    });
    await compareTabNames(editor, [ 'Handy Shortcuts', 'Plugins', 'Version', 'Extra1' ]);
    McEditor.remove(editor);
  });

  it('TINY-3535: addTab() with a new tab', async () => {
    const editor = await pCreateEditor({
      setup: (editor) => {
        editor.on('init', () => {
          editor.plugins.help.addTab({
            name: 'extraTab1',
            title: 'Extra1',
            items: [{
              type: 'htmlpanel',
              html: '<p>This is an extra tab</p>'
            }]
          });
        });
      }
    });
    await compareTabNames(editor, [ 'Handy Shortcuts', 'Keyboard Navigation', 'Plugins', 'Extra1', 'Version' ]);
    McEditor.remove(editor);
  });

  it('TINY-3535: help_tabs and addTab()', async () => {
    const editor = await pCreateEditor({
      help_tabs: [
        'shortcuts',
        'extraTab2',
        'plugins',
        {
          name: 'versions', // this will override the default versions tab
          title: 'Version',
          items: [{
            type: 'htmlpanel',
            html: '<p>This is a custom version panel...</p>'
          }]
        },
        {
          name: 'extraTab1',
          title: 'Extra1',
          items: [{
            type: 'htmlpanel',
            html: '<p>This is an extra tab</p>'
          }]
        }
      ],
      setup: (editor) => {
        editor.on('init', () => {
          editor.plugins.help.addTab({
            name: 'extraTab2',
            title: 'Extra2',
            items: [{
              type: 'htmlpanel',
              html: '<p>This is another extra tab</p>'
            }]
          });
          editor.plugins.help.addTab({
            name: 'extraTab3',
            title: 'Extra3',
            items: [{
              type: 'htmlpanel',
              html: '<p>This is yet another extra tab, but this one should not render</p>'
            }]
          });
        });
      }
    });
    await compareTabNames(editor, [ 'Handy Shortcuts', 'Extra2', 'Plugins', 'Version', 'Extra1' ]);
    McEditor.remove(editor);
  });

  it('TINY-3535: things do not break if a tab name does not have a spec', async () => {
    const editor = await pCreateEditor({
      help_tabs: [
        'shortcuts',
        'plugins',
        'versions',
        'unknown'
      ]
    });
    await compareTabNames(editor, [ 'Handy Shortcuts', 'Plugins', 'Version' ]);
    McEditor.remove(editor);
  });
});
