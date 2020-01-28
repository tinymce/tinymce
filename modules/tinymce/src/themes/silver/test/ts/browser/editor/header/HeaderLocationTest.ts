import { ApproxStructure, Pipeline, Step, Assertions, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('Menu and toolbar location test', (success, failure) => {
  Theme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    Pipeline.async({}, [
      Logger.t(
        'Header should be located at the bottom in the editor container',
        Step.sync(() => {
          const containerApproxStructure = ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox'), arr.has('tox-tinymce') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-editor-container') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-sidebar-wrap') ]
                    }),
                    s.element('div', {
                      classes: [ arr.has('tox-editor-header') ],
                      children: [
                        s.element('div', {
                          classes: [ arr.has('tox-menubar') ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-toolbar-overlord') ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-anchorbar') ]
                        }),
                      ]
                    }),
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-statusbar') ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-throbber') ]
                })
              ]
            });
          });
          Assertions.assertStructure('Editor container should match expected structure', containerApproxStructure, Element.fromDom(editor.editorContainer));
        })
      )
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    toolbar_location: 'bottom'
  }, success, failure);
});
