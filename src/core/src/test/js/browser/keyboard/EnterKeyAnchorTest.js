asynctest(
  'browser.tinymce.core.keyboard.EnterKey',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.Env',
    'tinymce.core.text.Zwsp',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, GeneralSteps, Keys, Logger, Pipeline, Step, TinyActions, TinyApis, TinyLoader, Env, Zwsp, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sSetup = function (tinyApis, html, elementPath, offset) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(html),
        tinyApis.sSetCursor(elementPath, offset)
      ]);
    };

    var sEnterKey = function (tinyActions) {
      return tinyActions.sContentKeystroke(Keys.enter(), {});
    };

    var addGeckoBr = function (s, str, children) {
      if (Env.gecko) {
        return [].concat(children).concat(s.element('br', { attrs: { 'data-mce-bogus': str.is("1") } }));
      } else {
        return children;
      }
    };

    var sTestEnterAtStartOfAnchorZwsp = function (tinyApis, tinyActions) {
      return Logger.t(
        'sTestEnterAtStartOfAnchorZwsp',
        GeneralSteps.sequence([
          sSetup(tinyApis, '<p><a href="#">' + Zwsp.ZWSP + 'a</a></p>', [0, 0, 0], 1),
          sEnterKey(tinyActions),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build(function (s, str, arr) {
              return s.element('body', {
                children: [
                  s.element('p', {
                    children: [
                      s.element('br', {
                        attrs: {
                          'data-mce-bogus': str.is('1')
                        }
                      })
                    ]
                  }),
                  s.element('p', {
                    children: addGeckoBr(s, str, [
                      s.element('a', {
                        attrs: {
                          'data-mce-href': str.is('#'),
                          'href': str.is('#')
                        },
                        children: [
                          s.text(str.is(Zwsp.ZWSP + 'a'))
                        ]
                      })
                    ])
                  })
                ]
              });
            })
          ),
          tinyApis.sAssertSelection([1, 0, 0], 1, [1, 0, 0], 1)
        ])
      );
    };

    var sTestEnterAtEndOfAnchorZwsp = function (tinyApis, tinyActions) {
      return Logger.t(
        'sTestEnterAtEndOfAnchorZwsp',
        GeneralSteps.sequence([
          sSetup(tinyApis, '<p><a href="#">a' + Zwsp.ZWSP + '</a></p>', [0, 0, 0], 1),
          sEnterKey(tinyActions),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build(function (s, str, arr) {
              return s.element('body', {
                children: [
                  s.element('p', {
                    children: addGeckoBr(s, str, [
                      s.element('a', {
                        attrs: {
                          'data-mce-href': str.is('#'),
                          'href': str.is('#')
                        },
                        children: [
                          s.text(str.is('a' + Zwsp.ZWSP))
                        ]
                      })
                    ])
                  }),
                  s.element('p', {
                    children: [
                      s.element('br', {
                        attrs: {
                          'data-mce-bogus': str.is('1')
                        }
                      })
                    ]
                  })
                ]
              });
            })
          ),
          tinyApis.sAssertSelection([1], 0, [1], 0)
        ])
      );
    };

    var sTestEnterAtStartOfAnchorZwspWithAdjacentContent = function (tinyApis, tinyActions) {
      return Logger.t(
        'sTestEnterAtStartOfAnchorZwspWithAdjacentContent',
        GeneralSteps.sequence([
          sSetup(tinyApis, '<p>a<a href="#">' + Zwsp.ZWSP + 'b</a>c</p>', [0, 1, 0], 1),
          sEnterKey(tinyActions),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build(function (s, str, arr) {
              return s.element('body', {
                children: [
                  s.element('p', {
                    children: [
                      s.text(str.is('a')),
                      s.element('a', {
                        attrs: {
                          'data-mce-href': str.is('#'),
                          'href': str.is('#')
                        }
                      })
                    ]
                  }),
                  s.element('p', {
                    children: [
                      s.element('a', {
                        attrs: {
                          'data-mce-href': str.is('#'),
                          'href': str.is('#')
                        },
                        children: [
                          s.text(str.is(Zwsp.ZWSP + 'b'))
                        ]
                      }),
                      s.text(str.is('c'))
                    ]
                  })
                ]
              });
            })
          ),
          tinyApis.sAssertSelection([1, 0, 0], 1, [1, 0, 0], 1)
        ])
      );
    };

    var sTestEnterAtEndOfAnchorZwspWithAdjacentContent = function (tinyApis, tinyActions) {
      return Logger.t(
        'sTestEnterAtStartOfAnchorZwspWithAdjacentContent',
        GeneralSteps.sequence([
          sSetup(tinyApis, '<p>a<a href="#">b' + Zwsp.ZWSP + '</a>c</p>', [0, 1, 0], 1),
          sEnterKey(tinyActions),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build(function (s, str, arr) {
              return s.element('body', {
                children: [
                  s.element('p', {
                    children: [
                      s.text(str.is('a')),
                      s.element('a', {
                        attrs: {
                          'data-mce-href': str.is('#'),
                          'href': str.is('#')
                        },
                        children: [
                          s.text(str.is('b'))
                        ]
                      })
                    ]
                  }),
                  s.element('p', {
                    children: [
                      s.text(str.is('c'))
                    ]
                  })
                ]
              });
            })
          ),
          tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
        ])
      );
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        sTestEnterAtStartOfAnchorZwsp(tinyApis, tinyActions),
        sTestEnterAtEndOfAnchorZwsp(tinyApis, tinyActions),
        sTestEnterAtStartOfAnchorZwspWithAdjacentContent(tinyApis, tinyActions),
        sTestEnterAtEndOfAnchorZwspWithAdjacentContent(tinyApis, tinyActions)
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);