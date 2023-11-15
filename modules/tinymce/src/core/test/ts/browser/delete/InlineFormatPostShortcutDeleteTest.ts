import { ApproxStructure, Keys } from '@ephox/agar';
import { describe, it, context } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyApis, TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.delete.InlineFormatPostShortcutDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  const platform = PlatformDetection.detect();
  const os = platform.os;
  const browser = platform.browser;

  const ctrlBackspaceKeyup = (editor: Editor) =>
    TinyContentActions.keyup(editor, Keys.backspace(), os.isMacOS() ? { alt: true } : { ctrl: true });

  const ctrlDeleteKeyup = (editor: Editor) =>
    TinyContentActions.keyup(editor, Keys.delete(), os.isMacOS() ? { alt: true } : { ctrl: true });

  const metaBackspaceKeyup = (editor: Editor) => {
    // using Meta + Backspace workaround trigger as macOS suppresses most keyup events when meta is engaged
    // side effect of performing backspace keydown
    TinyContentActions.keydown(editor, Keys.backspace());
    // firefox detects macOS Command keycode as "Command" not "Meta"
    TinyContentActions.keyup(editor, browser.isFirefox() ? 224 : 91);
  };

  // due to backspace keydown side effect in metaBackspaceKeyup, Meta + Backspace scenario
  // needs to be excluded from some tests
  const shortcutDeleteScenariosNoMeta = [
    { name: 'Ctrl + Backspace', fn: ctrlBackspaceKeyup },
    { name: 'Ctrl + Delete', fn: ctrlDeleteKeyup },
  ];

  const shortcutDeleteScenarios = os.isMacOS() ? [
    ...shortcutDeleteScenariosNoMeta,
    { name: 'Meta + Backspace', fn: metaBackspaceKeyup }
  ] : shortcutDeleteScenariosNoMeta;

  context('TINY-9302: Caret refresh triggers after deletion by keyboard shortcuts', () => {
    context('Empty unformatted block should trigger caret refresh', () => {
      const assertStructureAndCursorEmptyUnformattedBlock = (editor: Editor): void => {
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, str, _arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('span', {
                      attrs: {
                        'id': str.is('_mce_caret'),
                        'data-mce-bogus': str.is('1'),
                        'data-mce-type': str.is('format-caret')
                      },
                      children: [
                        s.text(str.is(Zwsp.ZWSP))
                      ]
                    })
                  ]
                })
              ]
            });
          })
        );
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
      };

      Arr.each(shortcutDeleteScenarios, (shortcutDeleteScenario) => {
        it(`Collapsed selection in empty unformatted block should trigger caret refresh after ${shortcutDeleteScenario.name}`, () => {
          const editor = hook.editor();
          editor.setContent('<p></p>');
          TinySelections.setCursor(editor, [ 0 ], 0);
          shortcutDeleteScenario.fn(editor);
          assertStructureAndCursorEmptyUnformattedBlock(editor);
        });
      });
    });

    context('Non-empty unformatted block should trigger caret refresh', () => {
      const assertStructureAndCursorNonEmptyUnformattedBlock = (editor: Editor): void => {
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, str, _arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('')),
                    s.element('span', {
                      attrs: {
                        'id': str.is('_mce_caret'),
                        'data-mce-bogus': str.is('1'),
                        'data-mce-type': str.is('format-caret')
                      },
                      children: [
                        s.text(str.is(Zwsp.ZWSP))
                      ]
                    }),
                    s.text(str.is('abc'))
                  ]
                })
              ]
            });
          })
        );
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
      };

      Arr.each(shortcutDeleteScenarios, (shortcutDeleteScenario) => {
        it(`Collapsed selection in non-empty unformatted block should trigger caret refresh after ${shortcutDeleteScenario.name}`, () => {
          const editor = hook.editor();
          editor.setContent('<p>abc</p>');
          TinySelections.setCursor(editor, [ 0, 0 ], 0);
          shortcutDeleteScenario.fn(editor);
          assertStructureAndCursorNonEmptyUnformattedBlock(editor);
        });
      });
    });

    context('Formatted block should trigger caret refresh', () => {
      const assertStructureAndCursorFormattedBlock = (editor: Editor): void => {
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, str, _arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('span', {
                      attrs: {
                        style: str.is('text-decoration: underline;')
                      },
                      children: [
                        s.text(str.is('')),
                        s.element('span', {
                          attrs: {
                            'id': str.is('_mce_caret'),
                            'data-mce-bogus': str.is('1'),
                            'data-mce-type': str.is('format-caret')
                          },
                          children: [
                            s.text(str.is(Zwsp.ZWSP))
                          ]
                        }),
                        s.text(str.is('a'))
                      ]
                    })
                  ]
                })
              ]
            });
          })
        );
        TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0 ], 0);
      };

      Arr.each(shortcutDeleteScenarios, (shortcutDeleteScenario) => {
        it(`Collapsed selection in formatted block should trigger caret refresh after ${shortcutDeleteScenario.name}`, () => {
          const editor = hook.editor();
          editor.setContent('<p><span style="text-decoration: underline;">a</span></p>');
          TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
          shortcutDeleteScenario.fn(editor);
          assertStructureAndCursorFormattedBlock(editor);
        });
      });
    });

    context('Collapsed selection in block containing non-text nodes should trigger caret refresh if cursor at text node', () => {
      const assertStructureAndCursorAtTextNode = (editor: Editor): void => {
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, str, _arr) => {
            return s.element('body', {
              children: [
                s.element('div', {
                  children: [
                    s.text(str.is('a')),
                    s.element('span', {
                      attrs: {
                        'id': str.is('_mce_caret'),
                        'data-mce-bogus': str.is('1'),
                        'data-mce-type': str.is('format-caret')
                      },
                      children: [
                        s.text(str.is(Zwsp.ZWSP))
                      ]
                    }),
                    s.text(str.is('')),
                    s.element('img', {
                      attrs: {
                        src: str.is('about:blank')
                      }
                    })
                  ]
                })
              ]
            });
          })
        );
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
      };

      Arr.each(shortcutDeleteScenarios, (shortcutDeleteScenario) => {
        it(`Collapsed selection in block containing non-text nodes should trigger caret refresh after ${shortcutDeleteScenario.name}`, () => {
          const editor = hook.editor();
          editor.setContent('<div>a<img src="about:blank"></div>');
          TinySelections.setCursor(editor, [ 0, 0 ], 'a'.length);
          shortcutDeleteScenario.fn(editor);
          assertStructureAndCursorAtTextNode(editor);
        });
      });
    });

    context('Blocks containing non-text nodes should not trigger caret refresh if cursor at non-text node', () => {
      const assertStructureAndCursorAtNonTextNode = (editor: Editor): void => {
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, str, _arr) => {
            return s.element('body', {
              children: [
                s.element('div', {
                  children: [
                    s.element('img', {
                      attrs: {
                        src: str.is('about:blank')
                      }
                    }),
                    s.text(str.is('a'))
                  ]
                })
              ]
            });
          })
        );
        TinyAssertions.assertCursor(editor, [ 0 ], 0);
      };

      Arr.each(shortcutDeleteScenariosNoMeta, (shortcutDeleteScenario) => {
        it(`Collapsed selection in block containing non-text nodes should not trigger caret refresh after ${shortcutDeleteScenario.name}`, () => {
          const editor = hook.editor();
          editor.setContent('<div><img src="about:blank">a</div>');
          TinySelections.setCursor(editor, [ 0 ], 0);
          shortcutDeleteScenario.fn(editor);
          assertStructureAndCursorAtNonTextNode(editor);
        });
      });
    });

    context('Non-collapsed selections should not trigger caret refresh', () => {
      const assertStructureAndCursorNonCollapsed = (editor: Editor): void => {
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, str, _arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a'))
                  ]
                })
              ]
            });
          })
        );
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'a'.length);
      };

      Arr.each(shortcutDeleteScenariosNoMeta, (shortcutDeleteScenario) => {
        it(`Non-collapsed selection should not trigger caret refresh after ${shortcutDeleteScenario.name}`, () => {
          const editor = hook.editor();
          editor.setContent('<p>a</p>');
          TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'a'.length);
          shortcutDeleteScenario.fn(editor);
          assertStructureAndCursorNonCollapsed(editor);
        });
      });
    });

    context('Collapsed selections within an ancestor caret should not trigger caret refresh', () => {
      const assertStructureAndCursorAncestorCaret = (editor: Editor): void => {
        TinyAssertions.assertContentStructure(editor,
          ApproxStructure.build((s, str, _arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a')),
                    s.element('span', {
                      attrs: {
                        'id': str.is('_mce_caret'),
                        'data-mce-bogus': str.is('1'),
                        'data-mce-type': str.is('format-caret')
                      },
                      children: [
                        s.element('strong', {
                          children: [
                            s.text(str.is('b' + Zwsp.ZWSP)),
                          ]
                        })
                      ]
                    }),
                    s.text(str.is('c'))
                  ]
                })
              ]
            });
          })
        );
        TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 'b'.length);
      };

      Arr.each(shortcutDeleteScenariosNoMeta, (shortcutDeleteScenario) => {
        it(`Collapsed selection within an ancestor caret should not trigger caret refresh after ${shortcutDeleteScenario.name}`, () => {
          const editor = hook.editor();
          TinyApis(editor).setRawContent('<p>a<span id="_mce_caret" data-mce-bogus="1" data-mce-type="format-caret"><strong>b' + Zwsp.ZWSP + '</strong></span>c</p>');
          TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 'b'.length);
          shortcutDeleteScenario.fn(editor);
          assertStructureAndCursorAncestorCaret(editor);
        });
      });
    });
  });
});
