import { UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Html, SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
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

  Arr.each([
    {
      label: 'TINY-3535: Default help dialog',
      expectedTabNames: [ 'Handy Shortcuts', 'Keyboard Navigation', 'Plugins', 'Version' ],
      settings: { }
    },

    {
      label: 'TINY-3535: help_tabs with pre-registered and new tabs',
      expectedTabNames: [ 'Handy Shortcuts', 'Plugins', 'Version', 'Extra1' ],
      settings: {
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
      }
    },

    {
      label: 'TINY-3535: addTab() with a new tab',
      expectedTabNames: [ 'Handy Shortcuts', 'Keyboard Navigation', 'Plugins', 'Extra1', 'Version' ],
      settings: {
        setup: (editor: Editor) => {
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
      }
    },

    {
      label: 'TINY-3535: help_tabs and addTab()',
      expectedTabNames: [ 'Handy Shortcuts', 'Extra2', 'Plugins', 'Version', 'Extra1' ],
      settings: {
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
        setup: (editor: Editor) => {
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
      }
    },

    {
      label: 'TINY-3535: things do not break if a tab name does not have a spec',
      expectedTabNames: [ 'Handy Shortcuts', 'Plugins', 'Version' ],
      settings: {
        help_tabs: [
          'shortcuts',
          'plugins',
          'versions',
          'unknown'
        ]
      }
    }
  ], (test) => {
    it(test.label, async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        plugins: 'help',
        toolbar: 'help',
        base_url: '/project/tinymce/js/tinymce',
        ...test.settings
      });
      compareTabNames(editor, test.expectedTabNames);
      McEditor.remove(editor);
    });
  });
});
