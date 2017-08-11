asynctest(
  'browser.tinymce.core.dom.ScrollIntoViewTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.katamari.api.Cell',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.core.dom.ScrollIntoView',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, Waiter, Cell, TinyApis, TinyLoader, Element, ScrollIntoView, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sScrollReset = function (editor) {
      return Step.sync(function () {
        editor.getWin().scrollTo(0, 0);
      });
    };

    var sSetContent = function (editor, tinyApis, html) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(html),
        Waiter.sTryUntil('Wait for scrollHeight to be updated', Step.sync(function () {
          Assertions.assertEq('Scroll body should be more than 100', true, editor.getBody().scrollHeight > 100);
        }), 100, 1000)
      ]);
    };

    var sScrollIntoView = function (editor, selector, alignToTop) {
      return Step.sync(function () {
        editor.selection.scrollIntoView(editor.dom.select(selector)[0], alignToTop);
      });
    };

    var sScrollIntoViewPrivateApi = function (editor, selector, alignToTop) {
      return Step.sync(function () {
        ScrollIntoView.scrollIntoView(editor, editor.dom.select(selector)[0], alignToTop);
      });
    };

    var sAssertScrollPosition = function (editor, x, y) {
      return Step.sync(function () {
        Assertions.assertEq('Scroll position X should be expected value', x, editor.dom.getViewPort(editor.getWin()).x);
        Assertions.assertEq('Scroll position Y should be expected value', y, editor.dom.getViewPort(editor.getWin()).y);
      });
    };

    var mBindScrollIntoViewEvent = function (editor) {
      return Step.stateful(function (value, next, die) {
        var state = Cell({});

        var handler = function (e) {
          e.preventDefault();
          state.set({
            elm: e.elm,
            alignToTop: e.alignToTop
          });
        };

        editor.on('ScrollIntoView', handler);

        next({
          handler: handler,
          state: state
        });
      });
    };

    var mAssertScrollIntoViewEventInfo = function (editor, expectedElementSelector, expectedAlignToTop) {
      return Step.stateful(function (value, next, die) {
        var expectedTarget = Element.fromDom(editor.dom.select(expectedElementSelector)[0]);
        var actualTarget = Element.fromDom(value.state.get().elm);
        Assertions.assertDomEq('Target should be expected element', expectedTarget, actualTarget);
        Assertions.assertEq('Align to top should be expected value', expectedAlignToTop, value.state.get().alignToTop);
        editor.off('ScrollIntoView', value.handler);
        next({});
      });
    };

    var steps = function (editor, tinyApis) {
      return [
        tinyApis.sFocus,
        Logger.t('Public Selection API', GeneralSteps.sequence([
          Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
            sScrollReset(editor),
            sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
            sScrollIntoView(editor, 'div:nth-child(2)', false),
            sAssertScrollPosition(editor, 0, 975)
          ])),
          Logger.t('Scroll to element align to top', GeneralSteps.sequence([
            sScrollReset(editor),
            sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
            sScrollIntoView(editor, 'div:nth-child(2)', true),
            sAssertScrollPosition(editor, 0, 925)
          ]))
        ])),
        Logger.t('Private ScrollIntoView API', GeneralSteps.sequence([
          Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
            sScrollReset(editor),
            sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
            sScrollIntoViewPrivateApi(editor, 'div:nth-child(2)', false),
            sAssertScrollPosition(editor, 0, 975)
          ])),
          Logger.t('Scroll to element align to top', GeneralSteps.sequence([
            sScrollReset(editor),
            sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
            sScrollIntoViewPrivateApi(editor, 'div:nth-child(2)', true),
            sAssertScrollPosition(editor, 0, 925)
          ]))
        ])),
        Logger.t('Override scrollIntoView event', GeneralSteps.sequence([
          Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
            sScrollReset(editor),
            sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
            mBindScrollIntoViewEvent(editor),
            sScrollIntoView(editor, 'div:nth-child(2)', false),
            mAssertScrollIntoViewEventInfo(editor, 'div:nth-child(2)', false),
            sAssertScrollPosition(editor, 0, 0)
          ])),
          Logger.t('Scroll to element align to top', GeneralSteps.sequence([
            sScrollReset(editor),
            sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
            mBindScrollIntoViewEvent(editor),
            sScrollIntoView(editor, 'div:nth-child(2)', true),
            mAssertScrollIntoViewEventInfo(editor, 'div:nth-child(2)', true),
            sAssertScrollPosition(editor, 0, 0)
          ])),
          Logger.t('Scroll to element align to bottom (private api)', GeneralSteps.sequence([
            sScrollReset(editor),
            sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
            mBindScrollIntoViewEvent(editor),
            sScrollIntoViewPrivateApi(editor, 'div:nth-child(2)', false),
            mAssertScrollIntoViewEventInfo(editor, 'div:nth-child(2)', false),
            sAssertScrollPosition(editor, 0, 0)
          ])),
          Logger.t('Scroll to element align to top (private api)', GeneralSteps.sequence([
            sScrollReset(editor),
            sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
            mBindScrollIntoViewEvent(editor),
            sScrollIntoViewPrivateApi(editor, 'div:nth-child(2)', true),
            mAssertScrollIntoViewEventInfo(editor, 'div:nth-child(2)', true),
            sAssertScrollPosition(editor, 0, 0)
          ]))
        ]))
      ];
    };

    var isPhantomJs = function () {
      return /PhantomJS/.test(window.navigator.userAgent);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      // Only run scrolling tests on real browsers doesn't seem to work on phantomjs for some reason
      Pipeline.async({}, isPhantomJs() ? [ ] : steps(editor, tinyApis), onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      content_style: 'body.mce-content-body  { margin: 0 }'
    }, success, failure);
  }
);