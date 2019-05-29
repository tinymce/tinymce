import { ApproxStructure, Assertions, Chain, Log, Logger, Mouse, Pipeline, UiFinder, UnitTest } from '@ephox/agar';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Menu group heading test', (success, failure) => {
  Theme();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const container = Element.fromDom(editor.getContainer());

      Pipeline.async({ }, Logger.ts(
        'Check basic structure and actions',
        [
          Log.stepsAsStep('TINY-2226', 'Menu should contain a group heading with the correct classes and text', [
            Mouse.sClickOn(container, '.tox-toolbar button'),
            tinyUi.sWaitForUi('Wait for styleselect menu', '.tox-menu.tox-collection'),
            Chain.asStep(Body.body(), [
              UiFinder.cFindIn('.tox-menu.tox-collection'),
              Assertions.cAssertStructure(
                'Container structure',
                ApproxStructure.build((s, str, arr) => {
                  return s.element('div', {
                    classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--list'), arr.has('tox-selected-menu') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__group')],
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-menu-nav__js'), arr.has('tox-collection__item') ]
                          })
                        ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__group')],
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-collection__item'), arr.has('tox-collection__group-heading') ],
                            children: [ s.text(str.is('Table styles')) ]
                          }),
                          s.element('div', {
                            classes: [ arr.has('tox-menu-nav__js'), arr.has('tox-collection__item') ]
                          })
                        ]
                      })
                    ]
                  });
                }),
              ),
            ])
          ])
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'styleselect',
      menubar: false,
      style_formats: [
        {title: 'Bold text', inline: 'b'},
        {title: 'Table styles'},
        {title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
      ],
    },
    () => {
      success();
    },
    failure
  );
});