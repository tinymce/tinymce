import { ApproxStructure, Assertions, Pipeline   } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Element, Insert, Remove } from '@ephox/sugar';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('Silver fixed_toolbar_container test', (success, failure) => {
  SilverTheme();

  const toolbarContainer = Element.fromHtml('<div id="toolbar" style="margin: 50px 0;"></div>');
  Insert.append(Body.body(), toolbarContainer);

  const sToolbarTest = () => Assertions.sAssertStructure(
    'Container structure',
    ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox'), arr.has('tox-tinymce'), arr.has('tox-tinymce-inline') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-editor-container') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-editor-header') ],
                    children: [
                      s.element('div', {
                        classes: [arr.has('tox-menubar')],
                        attrs: { role: str.is('menubar') },
                        children: [
                          s.element('button', {
                            classes: [arr.has('tox-mbtn'), arr.has('tox-mbtn--select')],
                            children: [
                              s.element('span', {
                                classes: [arr.has('tox-mbtn__select-label')],
                                html: str.is('File')
                              }),
                              s.element('div', {
                                classes: [arr.has('tox-mbtn__select-chevron')],
                                children: [
                                  s.element('svg', {})
                                ]
                              }),
                            ]
                          })
                        ]
                      }),

                      s.element('div', {
                        classes: [ arr.has('tox-toolbar-overlord') ],
                        attrs: { role: str.is('group') },
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-toolbar__primary') ],
                            attrs: { role: str.is('group') },
                            children: [
                              s.element('div', {
                                classes: [ arr.has('tox-toolbar__group') ],
                                children: [
                                  s.element('button', {
                                    classes: [ arr.has('tox-tbtn'), arr.not('tox-btn--enabled') ],
                                    attrs: {
                                      'aria-label': str.is('Undo')
                                    }
                                  }),
                                  s.element('button', {
                                    classes: [ arr.has('tox-tbtn'), arr.not('tox-btn--enabled') ],
                                    attrs: {
                                      'aria-label': str.is('Bold')
                                    }
                                  }),
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-throbber') ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox'), arr.has('tox-silver-sink'), arr.has('tox-tinymce-aux')]
          })
        ]
      });
    }),
    toolbarContainer
  );

  TinyLoader.setup((editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);

      Pipeline.async({ }, [
        tinyApis.sSetContent('fixed_toolbar_container test'),
        tinyApis.sFocus(),
        sToolbarTest(),
      ], onSuccess, onFailure);
    }, {
      theme: 'silver',
      inline: true,
      fixed_toolbar_container: '#toolbar',
      menubar: 'file',
      toolbar: 'undo bold',
      base_url: '/project/tinymce/js/tinymce',
    }, () => {
      Remove.remove(toolbarContainer);
      success();
    },
    failure
  );
});
