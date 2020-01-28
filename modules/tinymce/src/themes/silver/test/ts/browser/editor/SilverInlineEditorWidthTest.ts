import { ApproxStructure, Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Css, Element, Scroll } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { ToolbarMode } from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';
import { sOpenMore } from '../../module/MenuUtils';

UnitTest.asynctest('Inline Editor (Silver) width test', (success, failure) => {
  Theme();

  const sStructureTest = (editor: Editor, container: Element, maxWidth: number) => Logger.t('Check basic container structure and actions', GeneralSteps.sequence([
    Assertions.sAssertStructure(
      'Container structure',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-tinymce'), arr.has('tox-tinymce-inline') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-editor-container') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-editor-header') ],
                  styles: {
                    'max-width': str.is(`${maxWidth}px`),
                  },
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-toolbar-overlord') ],
                      attrs: { role: str.is('group') }
                    }),
                    s.element('div', {
                      classes: [ arr.has('tox-anchorbar') ]
                    })
                  ]
                })
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

  const sAssetWidth = (uiContainer: Element, maxWidth: number, minWidth: number = 0) => Chain.asStep(uiContainer, [
    UiFinder.cFindIn('.tox-toolbar-overlord'),
    Chain.op((toolbar) => {
      const widthString = Css.get(toolbar, 'width') || '0px';
      const width = parseInt(widthString.replace('px', ''), 10);
      Assertions.assertEq(`Toolbar with should be less than ${maxWidth}px - ${width}<=${maxWidth}`, true, width <= maxWidth);
      Assertions.assertEq(`Toolbar with should be greater than ${minWidth}px - ${width}>=${minWidth}`, true, width >= minWidth);
    })
  ]);

  const sTestRender = (label: string, settings: Record<string, any>, expectedWidth: number, additionalSteps: (editor: Editor, apis) => Step<any, any>[] = Fun.constant([])) => {
    return Step.label(label, Step.raw((_, done, die, logs) => {
      TinyLoader.setup((editor, onSuccess, onFailure) => {
          const uiContainer = Element.fromDom(editor.getContainer());
          const tinyApis = TinyApis(editor);

          Pipeline.async({}, [
            Step.sync(() => Scroll.to(0, 0)),
            tinyApis.sFocus(),
            sStructureTest(editor, uiContainer, expectedWidth),
            sAssetWidth(uiContainer, expectedWidth, expectedWidth - 100),
            tinyApis.sSetContent(Arr.range(100, () => '<p></p>').join('')),
            Step.sync(() => Scroll.to(0, 500)),
            UiFinder.sWaitForVisible('Wait to be docked', Body.body(), '.tox-tinymce--toolbar-sticky-on .tox-editor-header'),
            sAssetWidth(uiContainer, expectedWidth, expectedWidth - 100),
            ...additionalSteps(editor, tinyApis)
          ], onSuccess, onFailure, logs);
        },
        {
          theme: 'silver',
          menubar: false,
          inline: true,
          base_url: '/project/tinymce/js/tinymce',
          toolbar_mode: 'floating',
          ...settings
        }, done, die
      );
    }));
  };

  Pipeline.async({}, [
    sTestRender('Check max-width is 400px when set via init', { width: 400 }, 400),
    sTestRender('Check max-width is 400px when set via element', {
      setup: (ed: Editor) => {
        Css.set(Element.fromDom(ed.getElement()), 'width', '400px');
      }
    }, 400),
    sTestRender('Check max-width is constrained to the body width when no width set', {
      setup: (ed: Editor) => {
        ed.on('PreInit', () => {
          Css.set(Body.body(), 'width', '400px');
        });
        ed.on('Remove', () => {
          Css.remove(Body.body(), 'width');
        });
      }
    }, 400),
    sTestRender('Check width when expanding sliding toolbar while docked', {
      toolbar_mode: 'sliding',
      width: 400
    }, 400, (editor) => [
      sOpenMore(ToolbarMode.sliding),
      sAssetWidth(Element.fromDom(editor.getContainer()), 400, 300)
    ]),
  ], success, failure);
});
