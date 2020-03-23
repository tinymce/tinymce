import { Assertions, GeneralSteps, Logger, Pipeline, Step, Chain } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, Css, Scroll } from '@ephox/sugar';
import * as EditorView from 'tinymce/core/EditorView';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.EditorViewInlineTest', function (success, failure) {

  Theme();

  const hiddenScrollbar = Scroll.scrollBarWidth() === 0;

  const sSetBodyStyles = function (editor, css) {
    return Step.label(
      'sSetBodyStyles ' + JSON.stringify(css),
      Step.sync(function () {
        Css.setAll(Element.fromDom(editor.getBody()), css);
      })
    );
  };

  const sTestIsXYInContentArea = function (editor, deltaX, deltaY) {
    const dx1 = - 25 - deltaX;
    const dy1 = -25 - deltaY;
    const dx2 = - 5 - deltaX;
    const dy2 = - 5 - deltaY;
    return Step.label('Check points relative to deltaX=' + deltaX + ' deltaY=' + deltaY, Chain.asStep({}, [
      Chain.fromParent(
        Chain.label(
          'Calculate bounding rectangle',
          Chain.injectThunked(() => editor.getBody().getBoundingClientRect())
        ), [
          Chain.label(
            'Check 〈bottom right〉 + (' + dx1 + ', ' + dy1 + ') is inside editor',
            Chain.op((rect) => Assertions.assertEq(
              'Should be inside the area since the scrollbars are excluded',
              true,
              EditorView.isXYInContentArea(editor, rect.right + dx1, rect.bottom + dy1)
            ))
          ),
          Chain.label(
            'Check 〈bottom right〉 + (' + dx2 + ', ' + dy2 + ') is ' + (hiddenScrollbar ? 'inside' : 'outside') + ' editor',
            Chain.op((rect) => Assertions.assertEq(
              (hiddenScrollbar ?
                'Should be inside the area since the scrollbars are hidden' :
                'Should be outside the area since the cordinate is on the scrollbars'),
              hiddenScrollbar,
              EditorView.isXYInContentArea(editor, rect.right + dx2, rect.bottom + dy2)
            ))
          )
        ]
      )
    ]));
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    const sSetContentToBigDiv = Step.label(
      'Set content to big div',
      tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>')
    );

    Pipeline.async({}, [
      Logger.t('isXYInContentArea without borders, margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { border: '0', margin: '0', width: '100px', height: '100px', overflow: 'scroll' }),
        sSetContentToBigDiv,
        sTestIsXYInContentArea(editor, 0, 0)
      ])),

      Logger.t('isXYInContentArea with margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { margin: '15px' }),
        sSetContentToBigDiv,
        sTestIsXYInContentArea(editor, -15, -15)
      ])),

      Logger.t('isXYInContentArea with borders, margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { border: '5px', margin: '15px' }),
        sSetContentToBigDiv,
        sTestIsXYInContentArea(editor, -20, -20)
      ]))
    ], onSuccess, onFailure);
  }, {
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
