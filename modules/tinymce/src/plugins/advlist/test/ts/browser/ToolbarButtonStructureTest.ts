import { UnitTest } from "@ephox/bedrock-client";
import { Pipeline, Log, Chain, NamedChain, Waiter, Assertions, ApproxStructure } from '@ephox/agar';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { Editor } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.plugins.advlist.ToolbarButtonStructureTest', (success, failure) => {
  AdvListPlugin();
  ListsPlugin();
  Theme();

  const cGetContainer = Chain.mapper((editor: any) => Element.fromDom(editor.editorContainer));

  Pipeline.async({}, [
    Log.step('TBA', 'Test that one list type = toolbar button NOT splitbutton', Chain.asStep({}, [
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
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cGetContainer, 'editorContainer'),
        NamedChain.direct('editorContainer', Waiter.cTryUntil('', Assertions.cAssertStructure(
          'Check p>strong element path',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [ arr.has('tox-tinymce') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-editor-container') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-editor-header') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-toolbar') ],
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-toolbar__group') ],
                            children: [
                              s.element('button', {
                                classes: [ arr.has('tox-tbtn') ], 
                                attrs: {
                                  title: str.is("Numbered list")
                                }
                              })
                            ]
                          })
                        ]
                      }),
                      s.anything()
                    ]
                  }),
                  s.anything()
                ]
              }),
              s.anything()
            ]
          }))
        )), 'assertion1'),
      ])

    ]))
  ], success, failure);
});