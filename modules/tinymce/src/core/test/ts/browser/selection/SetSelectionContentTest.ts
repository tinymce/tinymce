import { ApproxStructure, Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import * as SetSelectionContent from 'tinymce/core/selection/SetSelectionContent';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.selection.SetSelectionContentTest', function (success, failure) {

  Theme();

  const sSetContent = function (editor, content, args) {
    return Step.sync(function () {
      SetSelectionContent.setContent(editor, content, args);
    });
  };

  const sSetContentOverride = function (editor, content, overrideContent, args) {
    return Step.sync(function () {
      const handler = function (e) {
        if (e.selection === true) {
          e.preventDefault();
          editor.getBody().innerHTML = overrideContent;
        }
      };

      editor.on('BeforeSetContent', handler);
      SetSelectionContent.setContent(editor, content, args);
      editor.off('BeforeSetContent', handler);
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const root = SugarElement.fromDom(editor.getBody());

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Should insert a before b', [
        tinyApis.sSetContent('<p>b</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sSetContent(editor, 'a', {}),
        tinyApis.sAssertContent('<p>ab</p>')
      ]),
      Log.stepsAsStep('TBA', 'Should fill the body with x h1 instead of a before b in a paragraph', [
        tinyApis.sSetContent('<p>b</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sSetContentOverride(editor, 'a', '<h1>x</h1>', {}),
        tinyApis.sAssertContent('<h1>x</h1>')
      ]),

      Log.stepsAsStep('TBA', 'Insert content in middle of word, expanded selection', [
        tinyApis.sSetContent('<p>abc</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 1, [ 0, 0 ], 2),
        sSetContent(editor, 'X', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('aXc'))
                ]
              })
            ]
          })),
          root
        ),
        tinyApis.sAssertSelection([ 0, 0 ], 2, [ 0, 0 ], 2)
      ]),

      Log.stepsAsStep('TBA', 'Insert content in middle of word, collapsed selection', [
        tinyApis.sSetContent('<p>ab</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sSetContent(editor, 'X', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('aXb'))
                ]
              })
            ]
          })),
          root
        ),
        tinyApis.sAssertSelection([ 0, 0 ], 2, [ 0, 0 ], 2)
      ]),

      Log.stepsAsStep('TBA', 'Insert content at start of word, collapsed selection', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sSetContent(editor, 'X', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('Xa'))
                ]
              })
            ]
          })),
          root
        ),
        tinyApis.sAssertSelection([ 0, 0 ], 1, [ 0, 0 ], 1)
      ]),

      Log.stepsAsStep('TBA', 'Insert content at end of word, collapsed selection', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sSetContent(editor, 'X', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('aX'))
                ]
              })
            ]
          })),
          root
        )
      ]),

      Log.stepsAsStep('TBA', 'Insert content at end of word with partial text', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sSetContent(editor, 'b<em>c</em>', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('ab')),
                  s.element('em', {
                    children: [
                      s.text(str.is('c'))
                    ]
                  })
                ]
              })
            ]
          })),
          root
        )
      ]),

      Log.stepsAsStep('TBA', 'Insert content at end of word with partial text', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sSetContent(editor, '<em>b</em>c', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('a')),
                  s.element('em', {
                    children: [
                      s.text(str.is('b'))
                    ]
                  }),
                  s.text(str.is('c'))
                ]
              })
            ]
          })),
          root
        )
      ]),

      Log.stepsAsStep('TINY-5966', 'Set text content at end of word with a space', [
        tinyApis.sSetContent('<p>a&nbsp;</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 2),
        sSetContent(editor, 'b', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('a b'))
                ]
              })
            ]
          })),
          root
        )
      ]),

      Log.stepsAsStep('TINY-5966', 'Set text content with leading/trailing spaces', [
        tinyApis.sSetContent('<p>a b c</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 3),
        sSetContent(editor, ' b ', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('a\u00a0 b \u00a0c'))
                ]
              })
            ]
          })),
          root
        )
      ]),

      Log.stepsAsStep('TINY-5966', 'Set text content in between 2 nbsps', [
        tinyApis.sSetContent('<p>&nbsp;&nbsp;</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sSetContent(editor, ' a b ', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('\u00a0 a b \u00a0')),
                  s.zeroOrMore(s.element('br', {}))
                ]
              })
            ]
          })),
          root
        )
      ]),

      Log.stepsAsStep('TINY-5966', 'Set text content into empty block with leading/trailing spaces', [
        tinyApis.sSetContent('<p></p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sSetContent(editor, ' a b ', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('\u00a0a b\u00a0')),
                  s.zeroOrMore(s.element('br', {}))
                ]
              })
            ]
          })),
          root
        )
      ]),

      Log.stepsAsStep('TINY-5966', 'Set text content into empty pre block with leading/trailing spaces', [
        tinyApis.sSetContent('<pre></pre>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sSetContent(editor, '   a <br>  b  ', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('pre', {
                children: [
                  s.text(str.is('   a ')),
                  s.element('br', {}),
                  s.text(str.is('  b  ')),
                  s.zeroOrMore(s.element('br', {}))
                ]
              })
            ]
          })),
          root
        )
      ]),

      Log.stepsAsStep('TINY-5966', 'Set text content into pre block using a range selection', [
        tinyApis.sSetContent('<pre>a b c</pre>'),
        tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 5),
        sSetContent(editor, ' b <br> c ', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('pre', {
                children: [
                  s.text(str.is('a  b '), true),
                  s.element('br', {}),
                  s.text(str.is(' c '), true),
                  s.zeroOrMore(s.element('br', {}))
                ]
              })
            ]
          })),
          root
        )
      ])
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
