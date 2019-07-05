import { Chain, Logger, NamedChain, Pipeline, UiFinder, UnitTest } from '@ephox/agar';
import { assert } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Element, Html } from '@ephox/sugar';
import HelpPlugin from 'tinymce/plugins/help/Plugin';
import Editor from '../../../../../core/main/ts/api/Editor';
import Theme from '../../../../../themes/silver/main/ts/Theme';

UnitTest.asynctest('Custom Help Tabs test', (success, failure) => {

  HelpPlugin();
  Theme();

  const doc = Element.fromDom(document);

  const compareTabNames = (expectedNames: string[]) => {
    return Chain.op((editor: Editor) => {
      editor.execCommand('mceHelp');
      const actualTabs = UiFinder.findAllIn(doc, 'div.tox-dialog__body-nav-item.tox-tab');
      const actualNames: string[] = Arr.map(actualTabs, (tab) => Html.get(tab));
      Arr.map(expectedNames, (x, i) => assert.eq(x, actualNames[i], `Tab names did not match. Expected: ${expectedNames}. Actual: ${actualNames}`));
    });
  };

  const makeStep = (config: Object, expectedTabNames: string[]) => {
    return Chain.asStep({}, [
      McEditor.cFromSettings(config),
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.read('editor', compareTabNames(expectedTabNames)),
        NamedChain.output('editor'),
      ]),
      McEditor.cRemove
    ]);
  };

  Pipeline.async({}, [
    Logger.t('Default help dialog', makeStep({
      plugins: 'help',
      toolbar: 'help',
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce'
    }, ['Handy Shortcuts', 'Keyboard Navigation', 'Plugins', 'Version'])),

    Logger.t('Test help_tabs with pre-registered and new tabs', makeStep({
      plugins: 'help',
      toolbar: 'help',
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
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
            html: '<p>This is an extra tab</p>',
          }]
        },
      ]
    }, ['Handy Shortcuts', 'Plugins', 'Version', 'Extra1'])),

    Logger.t('Test addTab() with a new tab', makeStep({
      plugins: 'help',
      toolbar: 'help',
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      setup: (editor) => {
        editor.on('init', () => {
          editor.plugins.help.addTab({
            name: 'extraTab1',
            title: 'Extra1',
            items: [{
              type: 'htmlpanel',
              html: '<p>This is an extra tab</p>',
            }]
          });
        });
      }
    }, ['Handy Shortcuts', 'Keyboard Navigation', 'Plugins', 'Extra1', 'Version'])),

    Logger.t('Test help_tabs and addTab()', makeStep({
      plugins: 'help',
      toolbar: 'help',
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
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
            html: '<p>This is an extra tab</p>',
          }]
        },
      ],
      setup: (editor) => {
        editor.on('init', () => {
          editor.plugins.help.addTab({
            name: 'extraTab2',
            title: 'Extra2',
            items: [{
              type: 'htmlpanel',
              html: '<p>This is another extra tab</p>',
            }]
          });
          editor.plugins.help.addTab({
            name: 'extraTab3',
            title: 'Extra3',
            items: [{
              type: 'htmlpanel',
              html: '<p>This is yet another extra tab, but this one should not render</p>',
            }]
          });
        });
      }
    }, ['Handy Shortcuts', 'Extra2', 'Plugins', 'Version', 'Extra1'])),

    Logger.t('Test things do not break if a tab name does not have a spec', makeStep({
      plugins: 'help',
      toolbar: 'help',
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      help_tabs: [
        'shortcuts',
        'plugins',
        'versions',
        'unknown'
      ]
    }, ['Handy Shortcuts', 'Plugins', 'Version'])),
  ], success, failure);
});