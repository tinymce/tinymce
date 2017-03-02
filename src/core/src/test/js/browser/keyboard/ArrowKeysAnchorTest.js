asynctest(
  'browser.tinymce.core.keyboard.ArrowKeysAnchorTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.core.text.Zwsp',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, GeneralSteps, Keys, Pipeline, Step, Arr, TinyActions, TinyApis, TinyLoader, Element, Zwsp, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var BEFORE = true, AFTER = false;
    var START = true, END = false;

    Theme();

    var singleAnchor = function (expectedText) {
      return ApproxStructure.build(function (s, str/*, arr*/) {
        return s.element('p', {
          children: [
            s.element('a', {
              attrs: {
                'data-mce-selected': str.is('1'),
                'data-mce-href': str.is('#'),
                'href': str.is('#')
              },
              children: [
                s.text(str.is(expectedText))
              ]
            })
          ]
        });
      });
    };

    var singleAnchorInside = function (start) {
      return singleAnchor(start ? Zwsp.ZWSP + 'b' : 'b' + Zwsp.ZWSP);
    };

    var singleAnchorOutside = function (before) {
      return ApproxStructure.build(function (s, str/*, arr*/) {
        return s.element('p', {
          children: Arr.flatten([
            before ? [ s.text(str.is(Zwsp.ZWSP)) ] : [ ],
            [
              s.element('a', {
                attrs: {
                  'data-mce-selected': str.is('1'),
                  'data-mce-href': str.is('#'),
                  'href': str.is('#')
                },
                children: [
                  s.text(str.is('b'))
                ]
              })
            ],
            before === false ? [ s.text(str.is(Zwsp.ZWSP)) ] : [ ]
          ])
        });
      });
    };

    var singleAnchorSurroundedWithText = function (expectedText) {
      return ApproxStructure.build(function (s, str/*, arr*/) {
        return s.element('p', {
          children: [
            s.text(str.is('a')),
            s.element('a', {
              attrs: {
                'data-mce-selected': str.is('1'),
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

    var singleAnchorSurroundedWithTextInside = function (start) {
      return singleAnchorSurroundedWithText(start ? Zwsp.ZWSP + 'b' : 'b' + Zwsp.ZWSP);
    };

    var singleAnchorSurroundedWithTextOutside = function (before) {
      return ApproxStructure.build(function (s, str/*, arr*/) {
        return s.element('p', {
          children: [
            s.text(str.is('a' + (before ? Zwsp.ZWSP : ''))),
            s.element('a', {
              attrs: {
                'data-mce-selected': str.is('1'),
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

    var sAssertContentStructure = function (editor, expected) {
      return Step.sync(function () {
        var actual = Element.fromHtml(editor.getBody().innerHTML);
        return Assertions.assertStructure('Should be the same structure', expected, actual);
      });
    };

    var sTestArrowsSingleAnchor = function (tinyApis, tinyActions, editor) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent('<p><a href="#">b</a></p>'),
        tinyApis.sSetCursor([0, 0, 0], 0),
        tinyApis.sNodeChanged,
        sAssertContentStructure(editor, singleAnchor('b')),
        tinyActions.sContentKeydown(Keys.left()),
        sAssertContentStructure(editor, singleAnchorOutside(BEFORE)),
        tinyActions.sContentKeydown(Keys.left()),
        sAssertContentStructure(editor, singleAnchorOutside(BEFORE)),
        tinyActions.sContentKeydown(Keys.right()),
        sAssertContentStructure(editor, singleAnchorInside(START)),
        tinyActions.sContentKeydown(Keys.right()),
        sAssertContentStructure(editor, singleAnchorInside(END)),
        tinyActions.sContentKeydown(Keys.right()),
        sAssertContentStructure(editor, singleAnchorOutside(AFTER)),
        tinyActions.sContentKeydown(Keys.right()),
        sAssertContentStructure(editor, singleAnchorOutside(AFTER))
      ]);
    };

    var sTestArrowAnchorSurroundedByText = function (tinyApis, tinyActions, editor) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
        tinyApis.sSetCursor([0, 1, 0], 0),
        tinyApis.sNodeChanged,
        sAssertContentStructure(editor, singleAnchorSurroundedWithText('b')),
        tinyActions.sContentKeydown(Keys.left()),
        sAssertContentStructure(editor, singleAnchorSurroundedWithTextOutside(BEFORE)),
        tinyActions.sContentKeydown(Keys.right()),
        sAssertContentStructure(editor, singleAnchorSurroundedWithTextInside(START)),
        tinyActions.sContentKeydown(Keys.right()),
        sAssertContentStructure(editor, singleAnchorSurroundedWithTextInside(END)),
        tinyActions.sContentKeydown(Keys.right()),
        sAssertContentStructure(editor, singleAnchorSurroundedWithTextOutside(AFTER))
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        sTestArrowsSingleAnchor(tinyApis, tinyActions, editor),
        sTestArrowAnchorSurroundedByText(tinyApis, tinyActions, editor)
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);