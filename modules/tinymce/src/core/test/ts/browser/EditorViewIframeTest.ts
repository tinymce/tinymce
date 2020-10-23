import { Assertions, Chain, Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Css, Scroll, SelectorFind, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as EditorView from 'tinymce/core/EditorView';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorViewIframeTest', function (success, failure) {

  Theme();

  const hiddenScrollbar = Scroll.scrollBarWidth() === 0;

  const isPhantomJs = function () {
    return /PhantomJS/.test(window.navigator.userAgent);
  };

  const getIframeClientRect = function (editor) {
    return SelectorFind.descendant(SugarElement.fromDom(editor.getContentAreaContainer()), 'iframe').map(function (elm) {
      return elm.dom.getBoundingClientRect();
    }).getOrDie();
  };

  const sSetBodyStyles = function (editor, css) {
    return Step.label(
      'sSetBodyStyles ' + JSON.stringify(css),
      Step.sync(function () {
        Css.setAll(SugarElement.fromDom(editor.getBody()), css);
      })
    );
  };

  const sTestIsXYInContentArea = function (editor, deltaX, deltaY) {
    const dx1 = -25 - deltaX;
    const dy1 = -25 - deltaY;
    const dx2 = -5 - deltaX;
    const dy2 = -5 - deltaY;
    return Step.label('Check points relative to deltaX=' + deltaX + ' deltaY=' + deltaY, Chain.asStep({}, [
      Chain.fromParent(
        Chain.label(
          'Calculate bounding rectangle',
          Chain.injectThunked(() => getIframeClientRect(editor))
        ), [
          Chain.label(
            'Check 〈bottom right〉 + (' + dx1 + ', ' + dy1 + ') is inside editor',
            Chain.op((rect) => Assertions.assertEq(
              'Should be inside the area since the scrollbars are excluded',
              true,
              EditorView.isXYInContentArea(editor, rect.width + dx1, rect.height + dy1)
            ))
          ),
          Chain.label(
            'Check 〈bottom right〉 + (' + dx2 + ', ' + dy2 + ') is ' + (hiddenScrollbar ? 'inside' : 'outside') + ' editor',
            Chain.op((rect) => Assertions.assertEq(
              (hiddenScrollbar ?
                'Should be inside the area since the scrollbars are hidden' :
                'Should be outside the area since the cordinate is on the scrollbars'),
              hiddenScrollbar,
              EditorView.isXYInContentArea(editor, rect.width + dx2, rect.height + dy2)
            ))
          )
        ]
      )
    ]));
  };

  const sAssertIsAttachedToDom = (editor: Editor) => Step.sync(() => {
    const attached = EditorView.isEditorAttachedToDom(editor);
    Assert.eq('Editor should be attached to the DOM', true, attached);
  });

  TinyLoader.setupInBodyAndShadowRoot(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    const sSetContentToBigDiv = Step.label(
      'Set content to big div',
      tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>')
    );

    Pipeline.async({}, isPhantomJs() ? [] : [
      Log.stepsAsStep('TBA', 'isXYInContentArea without borders, margin', [
        sSetBodyStyles(editor, { border: '0', margin: '0' }),
        sSetContentToBigDiv,
        sTestIsXYInContentArea(editor, 0, 0)
      ]),

      Log.stepsAsStep('TBA', 'isXYInContentArea with borders, margin', [
        sSetBodyStyles(editor, { border: '5px', margin: '15px' }),
        sSetContentToBigDiv,
        sTestIsXYInContentArea(editor, 0, 0)
      ]),

      Log.step('TINY-6354', 'isEditorAttachedToDom should return true', sAssertIsAttachedToDom(editor))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
