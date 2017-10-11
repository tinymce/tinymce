asynctest(
  'browser.tinymce.core.keyboard.ArrowKeysAnchorTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.core.Env',
    'tinymce.core.text.Zwsp',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, GeneralSteps, Keys, Logger, Pipeline, Step, Arr, TinyActions, TinyApis, TinyLoader, Element, Env, Zwsp, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var BEFORE = true, AFTER = false;
    var START = true, END = false;

    Theme();

    var addGeckoBr = function (s, str, children) {
      if (Env.gecko) {
        return [].concat(children).concat(s.element('br', { attrs: { 'data-mce-bogus': str.is("1") } }));
      } else {
        return children;
      }
    };

    var anchorSurroundedWithText = function (expectedText) {
      return ApproxStructure.build(function (s, str/*, arr*/) {
        return s.element('p', {
          children: [
            s.text(str.is('a')),
            s.element('a', {
              attrs: {
                'data-mce-selected': str.is('inline-boundary'),
                'data-mce-href': str.is('#'),
                'href': str.is('#')
              },
              children: [
                s.text(str.is(expectedText))
              ]
            }),
            s.text(str.is('c'))
          ]
        });
      });
    };

    var anchorSurroundedWithZwspInside = function (start) {
      return anchorSurroundedWithText(start ? Zwsp.ZWSP + 'b' : 'b' + Zwsp.ZWSP);
    };

    var anchorSurroundedWithZwspOutside = function (before) {
      return ApproxStructure.build(function (s, str/*, arr*/) {
        return s.element('p', {
          children: [
            s.text(str.is('a' + (before ? Zwsp.ZWSP : ''))),
            s.element('a', {
              attrs: {
                'data-mce-selected': str.none('inline-boundary'),
                'data-mce-href': str.is('#'),
                'href': str.is('#')
              },
              children: [
                s.text(str.is('b'))
              ]
            }),
            s.text(str.is((before === false ? Zwsp.ZWSP : '') + 'c'))
          ]
        });
      });
    };

    var anchorsZwspOutside = function (texts, before, index) {
      return ApproxStructure.build(function (s, str/*, arr*/) {
        var children = Arr.map(texts, function (text, i) {
          return Arr.flatten([
            index === i && before ? [ s.text(str.is(Zwsp.ZWSP)) ] : [ ],
            [
              s.element(
                'a',
                {
                  attrs: {
                    'data-mce-selected': str.none('inline-boundary'),
                    'data-mce-href': str.is('#'),
                    'href': str.is('#')
                  },
                  children: [
                    s.text(str.is(text))
                  ]
                }
              )
            ],
            index === i && before === false ? [ s.text(str.is(Zwsp.ZWSP)) ] : [ ]
          ]);
        });

        return s.element('p', {
          children: addGeckoBr(s, str, Arr.flatten(children))
        });
      });
    };

    var anchorsZwspInside = function (texts, start, index) {
      return ApproxStructure.build(function (s, str/*, arr*/) {
        var children = Arr.map(texts, function (text, i) {
          var zwspText = start ? Zwsp.ZWSP + text : text + Zwsp.ZWSP;

          return s.element(
            'a',
            {
              attrs: {
                'data-mce-selected': i === index ? str.is('inline-boundary') : str.none('1'),
                'data-mce-href': str.is('#'),
                'href': str.is('#')
              },
              children: [
                s.text(str.is(i === index ? zwspText : text))
              ]
            }
          );
        });

        return s.element('p', {
          children: addGeckoBr(s, str, children)
        });
      });
    };

    var sAssertContentStructure = function (editor, expected) {
      return Step.sync(function () {
        var actual = Element.fromHtml(editor.getBody().innerHTML);
        return Assertions.assertStructure('Should be the same structure', expected, actual);
      });
    };

    var sAssertCursor = function (tinyApis, elementPath, offset) {
      return tinyApis.sAssertSelection(elementPath, offset, elementPath, offset);
    };

    var sTestArrowsSingleAnchor = function (tinyApis, tinyActions, editor) {
      return Logger.t('sTestArrowsSingleAnchor', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><a href="#">b</a></p>'),

        tinyApis.sSetCursor([0, 0, 0], 0),
        tinyApis.sNodeChanged,
        sAssertCursor(tinyApis, [0, 0, 0], 1),
        sAssertContentStructure(editor, anchorsZwspInside(['b'], START, 0)),

        tinyActions.sContentKeystroke(Keys.left(), { }),
        sAssertCursor(tinyApis, [0, 0], 0),
        sAssertContentStructure(editor, anchorsZwspOutside(['b'], BEFORE, 0)),

        tinyActions.sContentKeystroke(Keys.left(), { }),
        sAssertCursor(tinyApis, [0, 0], 0),
        sAssertContentStructure(editor, anchorsZwspOutside(['b'], BEFORE, 0)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 0, 0], 1),
        sAssertContentStructure(editor, anchorsZwspInside(['b'], START, 0)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 0, 0], 1),
        sAssertContentStructure(editor, anchorsZwspInside(['b'], END, 0)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 1], 1),
        sAssertContentStructure(editor, anchorsZwspOutside(['b'], AFTER, 0)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 1], 1),
        sAssertContentStructure(editor, anchorsZwspOutside(['b'], AFTER, 0))
      ]));
    };

    var sTestArrowsAnchorSurroundedByText = function (tinyApis, tinyActions, editor) {
      return Logger.t('sTestArrowsAnchorSurroundedByText', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),

        tinyApis.sSetCursor([0, 1, 0], 0),
        tinyApis.sNodeChanged,
        sAssertCursor(tinyApis, [0, 1, 0], 1),
        sAssertContentStructure(editor, anchorSurroundedWithZwspInside(START)),

        tinyActions.sContentKeystroke(Keys.left(), { }),
        sAssertCursor(tinyApis, [0, 0], 1),
        sAssertContentStructure(editor, anchorSurroundedWithZwspOutside(BEFORE)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 1, 0], 1),
        sAssertContentStructure(editor, anchorSurroundedWithZwspInside(START)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 1, 0], 1),
        sAssertContentStructure(editor, anchorSurroundedWithZwspInside(END)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 2], 1),
        sAssertContentStructure(editor, anchorSurroundedWithZwspOutside(AFTER))
      ]));
    };

    var sTestArrowsMultipleAnchors = function (tinyApis, tinyActions, editor) {
      return Logger.t('sTestArrowsMultipleAnchors', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><a href="#">a</a><a href="#">b</a></p>'),

        tinyApis.sSetCursor([0, 0, 0], 0),
        tinyApis.sNodeChanged,
        sAssertCursor(tinyApis, [0, 0, 0], 1),
        sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], START, 0)),

        tinyActions.sContentKeystroke(Keys.left(), { }),
        sAssertCursor(tinyApis, [0, 0], 0),
        sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], BEFORE, 0)),

        tinyActions.sContentKeystroke(Keys.left(), { }),
        sAssertCursor(tinyApis, [0, 0], 0),
        sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], BEFORE, 0)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 0, 0], 1),
        sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], START, 0)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 0, 0], 1),
        sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], END, 0)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 1], 1),
        sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], BEFORE, 1)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 1, 0], 1),
        sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], START, 1)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 1, 0], 1),
        sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], END, 1)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 2], 1),
        sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], AFTER, 1)),

        tinyActions.sContentKeystroke(Keys.right(), { }),
        sAssertCursor(tinyApis, [0, 2], 1),
        sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], AFTER, 1))
      ]));
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        sTestArrowsSingleAnchor(tinyApis, tinyActions, editor),
        sTestArrowsAnchorSurroundedByText(tinyApis, tinyActions, editor),
        sTestArrowsMultipleAnchors(tinyApis, tinyActions, editor)
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);