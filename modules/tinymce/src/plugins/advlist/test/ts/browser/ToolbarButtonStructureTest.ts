import { UnitTest } from '@ephox/bedrock-client';
import { Pipeline, Log, NamedChain, Waiter, Assertions, ApproxStructure, UiFinder } from '@ephox/agar';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { Editor } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.plugins.advlist.ToolbarButtonStructureTest', (success, failure) => {
  AdvListPlugin();
  ListsPlugin();
  Theme();

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Test that one list type = toolbar button NOT splitbutton', [
      Editor.cFromSettings({
        theme: 'silver',
        plugins: 'lists advlist',
        toolbar: 'numlist',
        advlist_number_styles: 'default',
        menubar: false,
        statusbar: false,
        base_url: '/project/tinymce/js/tinymce'
      }),
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.direct('body', UiFinder.cFindIn('.tox-editor-header .tox-toolbar .tox-toolbar__group'), 'toolbarGroup'),
        NamedChain.read('toolbarGroup', Waiter.cTryUntil('', Assertions.cAssertStructure(
          'Check lists toolbar button structure',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            children: [
              s.element('button', {
                classes: [ arr.has('tox-tbtn'), arr.not('tox-split-button') ],
                attrs: {
                  title: str.is('Numbered list')
                }
              })
            ]
          }))
        ))),
        NamedChain.outputInput
      ]),
      Editor.cRemove
    ]),
    Log.chainsAsStep('TBA', 'Test that one list type = toolbar button IS splitbutton', [
      Editor.cFromSettings({
        theme: 'silver',
        plugins: 'lists advlist',
        toolbar: 'numlist',
        menubar: false,
        statusbar: false,
        base_url: '/project/tinymce/js/tinymce'
      }),
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.direct('body', UiFinder.cFindIn('.tox-editor-header .tox-toolbar .tox-toolbar__group'), 'toolbarGroup'),
        NamedChain.read('toolbarGroup', Waiter.cTryUntil('', Assertions.cAssertStructure(
          'Check lists toolbar button structure',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            children: [
              s.element('div', {
                classes: [ arr.not('tox-tbtn'), arr.has('tox-split-button') ],
                attrs: {
                  title: str.is('Numbered list')
                }
              })
            ]
          }))
        ))),
        NamedChain.outputInput
      ]),
      Editor.cRemove
    ])
  ], success, failure);
});