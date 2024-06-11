import { ApproxStructure, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Focus, SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.NoneditableRootTest', () => {
  context('iframe mode', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      plugins: 'media',
      toolbar: 'media',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ], true);

    it('TINY-9669: Disable media button on noneditable content', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Insert/edit media"][aria-disabled="true"]');
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Insert/edit media"][aria-disabled="false"]');
      });
    });

    it('TINY-9669: Disable media menuitem on noneditable content', async () => {
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
        await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Media..."][aria-disabled="true"]');
        TinyUiActions.keystroke(editor, Keys.escape());
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
        await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Media..."][aria-disabled="false"]');
        TinyUiActions.keystroke(editor, Keys.escape());
      });
    });
  });

  const findAndFocusEditableElement = (editor: Editor, selector: string) => {
    const element = UiFinder.findIn<HTMLElement>(TinyDom.body(editor), selector).getOrDie();
    Focus.focus(element);
    // Clicking twice to focus on the the editable block
    Mouse.trueClick(element);
    Mouse.trueClick(element);
  };

  context('Inline mode editable_root: false', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      plugins: 'media',
      inline: true,
      toolbar: 'media',
      editable_root: false,
      contextmenu: 'media',
      editor_class: 'mceEditable',
      base_url: '/project/tinymce/js/tinymce',
    }, [ Plugin ], true);

    it('TINY-10820: Replacing on ceF=false should not cause duplicate', async () => {
      const editor = hook.editor();
      editor.focus();
      editor.setContent('<div class="mceEditable"><div class="random"><h1 style="text-align: center;">Test</h1><div id="test" contenteditable="false"><a href="www.google.com">test</a></div></div></div>');
      findAndFocusEditableElement(editor, '#test');
      await TinyUiActions.pTriggerContextMenu(editor, '#test', '[role="menuitem"]:contains("Media...")');
      TinyUiActions.clickOnUi(editor, '[role="menuitem"]:contains("Media...")');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
      await TinyUiActions.pWaitForDialog(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
      await Utils.pSetSourceInput(editor, 'https://www.youtube.com/embed/b3XFjWInBog');
      TinyUiActions.submitDialog(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

      await Waiter.pTryUntil('Wait for structure check', () => {
        TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', {
                classes: [ arr.has('mceEditable') ],
                attrs: {
                  contenteditable: str.is('true')
                },
                children: [
                  s.element('div', {
                    children: [
                      s.element('h1', {
                        children: [
                          s.text(str.is('Test'))
                        ]
                      }),
                      s.element('span', {
                        classes: [ arr.has('mce-preview-object'), arr.has('mce-object-iframe') ],
                        attrs: {
                          'contenteditable': str.is('false'),
                          'data-mce-object': str.is('iframe'),
                          'data-mce-selected': str.is('1')
                        },
                        children: [
                          s.element('iframe', {
                            attrs: {
                              src: str.is('https://www.youtube.com/embed/b3XFjWInBog')
                            }
                          }),
                          s.element('span', {})
                        ]
                      })
                    ],
                  })
                ]
              }),
              s.theRest()
            ]
          });
        }));
      });

      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    });

    it('TINY-10820: Saving media dialog should not cause duplicate media when using editable_root: false', async () => {
      const editor = hook.editor();
      editor.focus();
      const media = `<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`;
      editor.setContent('<div class="mceEditable" contenteditable="true"><div class="random"><h1 style="text-align: center;">Test</h1><div id="test">' + media + '</div></div></div>');
      findAndFocusEditableElement(editor, '.mce-preview-object');
      await TinyUiActions.pTriggerContextMenu(editor, '#test', '[role="menuitem"]:contains("Media...")');
      TinyUiActions.clickOnUi(editor, '[role="menuitem"]:contains("Media...")');
      await TinyUiActions.pWaitForDialog(editor);
      await Utils.pSetSourceInput(editor, 'https://www.youtube.com/embed/b3XFjWInBog');
      TinyUiActions.submitDialog(editor);

      await Waiter.pTryUntil('Wait for structure check', () => {
        TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', {
                classes: [ arr.has('mceEditable') ],
                attrs: {
                  contenteditable: str.is('true')
                },
                children: [
                  s.element('div', {
                    children: [
                      s.element('h1', {
                        children: [
                          s.text(str.is('Test'))
                        ]
                      }),
                      s.element('div', {
                        children: [
                          s.element('span', {
                            classes: [ arr.has('mce-preview-object'), arr.has('mce-object-iframe') ],
                            attrs: {
                              'contenteditable': str.is('false'),
                              'data-mce-object': str.is('iframe'),
                              'data-mce-selected': str.is('1')
                            },
                            children: [
                              s.element('iframe', {
                                attrs: {
                                  src: str.is('https://www.youtube.com/embed/b3XFjWInBog')
                                }
                              }),
                              s.element('span', {})
                            ]
                          })
                        ]
                      }),
                    ],
                  })
                ]
              }),
              s.theRest()
            ]
          });
        }));
      });
      TinyAssertions.assertSelection(editor, [ 0, 0, 1 ], 0, [ 0, 0, 1 ], 1);
    });
  });

  context('Inline mode editable_root', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      plugins: 'media',
      inline: true,
      toolbar: 'media',
      contextmenu: 'media',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ], true);

    it('TINY-10820: Saving media dialog should not cause duplicate media when using editable_root: true', async () => {
      const editor = hook.editor();
      editor.focus();
      const media = `<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`;
      editor.setContent('<div class="mceEditable" contenteditable="true"><div class="random"><h1 style="text-align: center;">Test</h1><div id="test">' + media + '</div></div></div>');
      findAndFocusEditableElement(editor, '.mce-preview-object');
      await TinyUiActions.pTriggerContextMenu(editor, '#test', '[role="menuitem"]:contains("Media...")');
      TinyUiActions.clickOnUi(editor, '[role="menuitem"]:contains("Media...")');
      await TinyUiActions.pWaitForDialog(editor);
      await Utils.pSetSourceInput(editor, 'https://www.youtube.com/embed/b3XFjWInBog');
      TinyUiActions.submitDialog(editor);

      await Waiter.pTryUntil('Wait for structure check', () => {
        TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', {
                classes: [ arr.has('mceEditable') ],
                attrs: {
                  contenteditable: str.is('true')
                },
                children: [
                  s.element('div', {
                    children: [
                      s.element('h1', {
                        children: [
                          s.text(str.is('Test'))
                        ]
                      }),
                      s.element('div', {
                        children: [
                          s.element('span', {
                            classes: [ arr.has('mce-preview-object'), arr.has('mce-object-iframe') ],
                            attrs: {
                              'contenteditable': str.is('false'),
                              'data-mce-object': str.is('iframe'),
                              'data-mce-selected': str.is('1')
                            },
                            children: [
                              s.element('iframe', {
                                attrs: {
                                  src: str.is('https://www.youtube.com/embed/b3XFjWInBog')
                                }
                              }),
                              s.element('span', {})
                            ]
                          })
                        ]
                      }),
                    ],
                  })
                ]
              }),
              s.theRest()
            ]
          });
        }));
      });
      TinyAssertions.assertSelection(editor, [ 0, 0, 1 ], 0, [ 0, 0, 1 ], 1);
    });
  });
});

