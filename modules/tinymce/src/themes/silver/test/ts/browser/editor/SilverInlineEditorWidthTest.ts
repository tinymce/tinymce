import { ApproxStructure, Assertions, Chain, GeneralSteps, Logger, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Css, Element } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Inline Editor (Silver) width test', (success, failure) => {
  Theme();

  const sStructureTest = (editor: Editor, container: Element, maxWidth: number) => Logger.t('Check basic container structure and actions', GeneralSteps.sequence([
    Assertions.sAssertStructure(
      'Container structure',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-tinymce'), arr.has('tox-tinymce-inline') ],
          styles: {
            'max-width': str.is(`${maxWidth}px`),
          },
          children: [
            s.element('div', {
              classes: [ arr.has('tox-editor-container') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-editor-header') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-toolbar') ],
                      attrs: { role: str.is('group') }
                    }),
                    s.element('div', {
                      classes: [ arr.has('tox-anchorbar') ]
                    })
                  ]
                }),
              ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-throbber') ]
            })
          ]
        });
      }),
      container
    )
  ]));

  const sAssetWidth = (uiContainer: Element, maxWidth: number) => Chain.asStep(uiContainer, [
    UiFinder.cFindIn('.tox-toolbar'),
    Chain.op((toolbar) => {
      const widthString = Css.get(toolbar, 'width') || '0px';
      const width = parseInt(widthString.replace('px', ''), 10);
      Assertions.assertEq(`Toolbar with should be less than ${maxWidth}px - ${width}<=${maxWidth}`, true, width <= maxWidth);
    })
  ]);

  const width = 400;
  TinyLoader.setup((editor, onSuccess, onFailure) => {
      const uiContainer = Element.fromDom(editor.getContainer());
      const tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        sStructureTest(editor, uiContainer, width),
        sAssetWidth(uiContainer, width)
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: false,
      inline: true,
      width,
      base_url: '/project/tinymce/js/tinymce'
    }, success, failure
  );
});
