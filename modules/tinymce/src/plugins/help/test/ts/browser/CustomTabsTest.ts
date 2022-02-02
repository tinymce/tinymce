import { UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Html, SugarDocument } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import Plugin from 'tinymce/plugins/help/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.help.CustomTabsTest', () => {
  before(() => {
    Plugin();
    Theme();
  });

  const compareTabNames = (editor: Editor, expectedNames: string[]) => {
    editor.execCommand('mceHelp');
    const actualTabs = UiFinder.findAllIn(SugarDocument.getDocument(), 'div.tox-dialog__body-nav-item.tox-tab');
    const actualNames = Arr.map(actualTabs, (tab) => Html.get(tab));
    Arr.map(expectedNames, (x, i) => {
      assert.equal(actualNames[i], x, 'Tab names did not match');
    });
  };

  const pCreateEditor = (settings: RawEditorSettings) => McEditor.pFromSettings<Editor>({
    plugins: 'help',
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce',
    ...settings
  });

  it('TINY-3535: Default help dialog', async () => {
    const editor = await pCreateEditor({});
    compareTabNames(editor, [ 'Handy Shortcuts', 'Keyboard Navigation', 'Plugins', 'Version' ]);
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
    compareTabNames(editor, [ 'Handy Shortcuts', 'Plugins', 'Version', 'Extra1' ]);
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
    compareTabNames(editor, [ 'Handy Shortcuts', 'Keyboard Navigation', 'Plugins', 'Extra1', 'Version' ]);
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
    compareTabNames(editor, [ 'Handy Shortcuts', 'Extra2', 'Plugins', 'Version', 'Extra1' ]);
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
    compareTabNames(editor, [ 'Handy Shortcuts', 'Plugins', 'Version' ]);
    McEditor.remove(editor);
  });
});
