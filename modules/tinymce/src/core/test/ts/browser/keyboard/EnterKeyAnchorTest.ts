import { ApproxStructure, Keys, StructAssert } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.keyboard.EnterKeyAnchorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const zwspPlaceholder = '{ZWSP}';

  const setup = (editor: Editor, html: string, elementPath: number[], offset: number) => {
    editor.setContent(html);
    const body = editor.getBody();
    body.innerHTML = body.innerHTML.replace(zwspPlaceholder, Zwsp.ZWSP);
    TinySelections.setCursor(editor, elementPath, offset);
  };

  const enterKey = (editor: Editor) => TinyContentActions.keystroke(editor, Keys.enter());

  const addGeckoBr = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, children: StructAssert[]) => {
    if (PlatformDetection.detect().browser.isFirefox()) {
      return [ ...children, s.element('br', { attrs: { 'data-mce-bogus': str.is('1') }}) ];
    } else {
      return children;
    }
  };

  it('Enter at start of anchor zwsp', () => {
    const editor = hook.editor();
    setup(editor, '<p><a href="#">' + zwspPlaceholder + 'a</a></p>', [ 0, 0, 0 ], 1);
    enterKey(editor);
    TinyAssertions.assertContentStructure(editor,
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
    );
    TinyAssertions.assertSelection(editor, [ 1, 0, 0 ], 1, [ 1, 0, 0 ], 1);
  });

  it('Enter at end of anchor zwsp', () => {
    const editor = hook.editor();
    setup(editor, '<p><a href="#">a' + zwspPlaceholder + '</a></p>', [ 0, 0, 0 ], 2);
    enterKey(editor);
    TinyAssertions.assertContentStructure(editor,
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
    );
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
  });

  it('Enter at start of anchor zwsp with adjacent content', () => {
    const editor = hook.editor();
    setup(editor, '<p>a<a href="#">' + zwspPlaceholder + 'b</a>c</p>', [ 0, 1, 0 ], 1);
    enterKey(editor);
    TinyAssertions.assertContentStructure(editor,
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
    );
    TinyAssertions.assertSelection(editor, [ 1, 0, 0 ], 1, [ 1, 0, 0 ], 1);
  });

  it('Enter at end of anchor zwsp with adjacent content', () => {
    const editor = hook.editor();
    setup(editor, '<p>a<a href="#">b' + zwspPlaceholder + '</a>c</p>', [ 0, 1, 0 ], 1);
    enterKey(editor);
    TinyAssertions.assertContentStructure(editor,
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
    );
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });
});
