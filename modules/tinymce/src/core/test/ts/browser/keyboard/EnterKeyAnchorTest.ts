import { ApproxStructure, GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.keyboard.EnterKeyAnchorTest', (success, failure) => {
  Theme();

  const sSetup = (tinyApis: TinyApis, html: string, elementPath: number[], offset: number) => {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyApis.sSetCursor(elementPath, offset)
    ]);
  };

  const sEnterKey = (tinyActions: TinyActions) => {
    return tinyActions.sContentKeystroke(Keys.enter(), {});
  };

  const addGeckoBr = (s, str, children) => {
    if (Env.gecko) {
      return [].concat(children).concat(s.element('br', { attrs: { 'data-mce-bogus': str.is('1') }}));
    } else {
      return children;
    }
  };

  const sTestEnterAtStartOfAnchorZwsp = (tinyApis: TinyApis, tinyActions: TinyActions) => {
    return Logger.t(
      'sTestEnterAtStartOfAnchorZwsp',
      GeneralSteps.sequence([
        sSetup(tinyApis, '<p><a href="#">' + Zwsp.ZWSP + 'a</a></p>', [ 0, 0, 0 ], 1),
        sEnterKey(tinyActions),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => {
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
        tinyApis.sAssertSelection([ 1, 0, 0 ], 1, [ 1, 0, 0 ], 1)
      ])
    );
  };

  const sTestEnterAtEndOfAnchorZwsp = (tinyApis: TinyApis, tinyActions: TinyActions) => {
    return Logger.t(
      'sTestEnterAtEndOfAnchorZwsp',
      GeneralSteps.sequence([
        sSetup(tinyApis, '<p><a href="#">a' + Zwsp.ZWSP + '</a></p>', [ 0, 0, 0 ], 2),
        sEnterKey(tinyActions),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => {
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
        tinyApis.sAssertSelection([ 1 ], 0, [ 1 ], 0)
      ])
    );
  };

  const sTestEnterAtStartOfAnchorZwspWithAdjacentContent = (tinyApis: TinyApis, tinyActions: TinyActions) => {
    return Logger.t(
      'sTestEnterAtStartOfAnchorZwspWithAdjacentContent',
      GeneralSteps.sequence([
        sSetup(tinyApis, '<p>a<a href="#">' + Zwsp.ZWSP + 'b</a>c</p>', [ 0, 1, 0 ], 1),
        sEnterKey(tinyActions),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => {
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
        tinyApis.sAssertSelection([ 1, 0, 0 ], 1, [ 1, 0, 0 ], 1)
      ])
    );
  };

  const sTestEnterAtEndOfAnchorZwspWithAdjacentContent = (tinyApis: TinyApis, tinyActions: TinyActions) => {
    return Logger.t(
      'sTestEnterAtStartOfAnchorZwspWithAdjacentContent',
      GeneralSteps.sequence([
        sSetup(tinyApis, '<p>a<a href="#">b' + Zwsp.ZWSP + '</a>c</p>', [ 0, 1, 0 ], 1),
        sEnterKey(tinyActions),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => {
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
        tinyApis.sAssertSelection([ 1, 0 ], 0, [ 1, 0 ], 0)
      ])
    );
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sTestEnterAtStartOfAnchorZwsp(tinyApis, tinyActions),
      sTestEnterAtEndOfAnchorZwsp(tinyApis, tinyActions),
      sTestEnterAtStartOfAnchorZwspWithAdjacentContent(tinyApis, tinyActions),
      sTestEnterAtEndOfAnchorZwspWithAdjacentContent(tinyApis, tinyActions)
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
