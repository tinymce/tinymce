import { ApproxStructure, GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.EnterKeyAnchorTest', (success, failure) => {
  Theme();

  const sSetup = function (tinyApis, html, elementPath, offset) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyApis.sSetCursor(elementPath, offset)
    ]);
  };

  const sEnterKey = function (tinyActions) {
    return tinyActions.sContentKeystroke(Keys.enter(), {});
  };

  const addGeckoBr = function (s, str, children) {
    if (Env.gecko) {
      return [].concat(children).concat(s.element('br', { attrs: { 'data-mce-bogus': str.is('1') } }));
    } else {
      return children;
    }
  };

  const sTestEnterAtStartOfAnchorZwsp = function (tinyApis, tinyActions) {
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

  const sTestEnterAtEndOfAnchorZwsp = function (tinyApis, tinyActions) {
    return Logger.t(
      'sTestEnterAtEndOfAnchorZwsp',
      GeneralSteps.sequence([
        sSetup(tinyApis, '<p><a href="#">a' + Zwsp.ZWSP + '</a></p>', [0, 0, 0], 2),
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

  const sTestEnterAtStartOfAnchorZwspWithAdjacentContent = function (tinyApis, tinyActions) {
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

  const sTestEnterAtEndOfAnchorZwspWithAdjacentContent = function (tinyApis, tinyActions) {
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
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      sTestEnterAtStartOfAnchorZwsp(tinyApis, tinyActions),
      sTestEnterAtEndOfAnchorZwsp(tinyApis, tinyActions),
      sTestEnterAtStartOfAnchorZwspWithAdjacentContent(tinyApis, tinyActions),
      sTestEnterAtEndOfAnchorZwspWithAdjacentContent(tinyApis, tinyActions)
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
