import { ApproxStructure, Keys, StructAssert } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.keyboard.EnterKeyAnchorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  const setup = (editor: Editor, html: string, elementPath: number[], offset: number) => {
    editor.setContent(html);
    TinySelections.setCursor(editor, elementPath, offset);
  };

  const enterKey = (editor: Editor) => TinyContentActions.keystroke(editor, Keys.enter());

  const addGeckoBr = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, children: StructAssert[]) => {
    if (Env.gecko) {
      return [].concat(children).concat(s.element('br', { attrs: { 'data-mce-bogus': str.is('1') }}));
    } else {
      return children;
    }
  };

  it('Enter at start of anchor zwsp', () => {
    const editor = hook.editor();
    setup(editor, '<p><a href="#">' + Zwsp.ZWSP + 'a</a></p>', [ 0, 0, 0 ], 1);
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
    setup(editor, '<p><a href="#">a' + Zwsp.ZWSP + '</a></p>', [ 0, 0, 0 ], 2);
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
    setup(editor, '<p>a<a href="#">' + Zwsp.ZWSP + 'b</a>c</p>', [ 0, 1, 0 ], 1);
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
    setup(editor, '<p>a<a href="#">b' + Zwsp.ZWSP + '</a>c</p>', [ 0, 1, 0 ], 1);
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
