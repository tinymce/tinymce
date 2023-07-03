import { ApproxStructure, Assertions, FocusTools, Keys, StructAssert, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, Css, Html, Scroll, SugarBody, SugarShadowDom } from '@ephox/sugar';
import { TinyApis, TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { View } from 'tinymce/core/api/ui/Ui';

describe('browser.tinymce.themes.silver.view.ViewTest', () => {
  context('Iframe mode', () => {
    const store = TestStore();
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_mode: 'floating',
      toolbar: Arr.range(10, Fun.constant('bold | italic ')).join(''),
      width: 500,
      setup: (editor: Editor) => {
        const injectAndLog = (name: string, html: string = '') => (api: View.ViewInstanceApi) => {
          api.getContainer().innerHTML = html;
          store.add(name);
        };

        editor.ui.registry.addView('myview1', {
          buttons: [
            {
              type: 'button',
              text: 'Button 1',
              onAction: store.adder('myview1:button1')
            },
            {
              type: 'button',
              text: 'Button 2',
              onAction: store.adder('myview1:button2'),
              buttonType: 'primary'
            }
          ],
          onShow: (api) => {
            api.getContainer().innerHTML = '<button>myview1</button>';
            api.getContainer().querySelector('button')?.focus();
            store.add('myview1:show');
          },
          onHide: injectAndLog('myview1:hide')
        });

        editor.ui.registry.addView('myview2', {
          buttons: [
            {
              type: 'button',
              text: 'Button 1',
              onAction: store.adder('myview2:button1'),
              buttonType: 'secondary'
            },
            {
              type: 'button',
              text: 'Button 2',
              onAction: store.adder('myview2:button2'),
              buttonType: 'primary'
            }
          ],
          onShow: injectAndLog('myview2:show', 'myview2'),
          onHide: injectAndLog('myview2:hide')
        });

        editor.ui.registry.addView('myview3', {
          onShow: injectAndLog('myview3:show', 'myview3'),
          onHide: injectAndLog('myview3:hide')
        });

        editor.ui.registry.addContextToolbar('test-context', {
          predicate: (node) => node.nodeName.toLowerCase() === 'img',
          items: 'bold'
        });
      }
    }, []);

    const clickViewButton = (editor: Editor, tooltip: string) => TinyUiActions.clickOnUi(editor, `.tox-view button[title='${tooltip}']`);

    const toggleView = (name: string) => {
      const editor = hook.editor();
      editor.execCommand('ToggleView', false, name);
    };

    const queryToggleView = () => {
      const editor = hook.editor();
      return editor.queryCommandValue('ToggleView');
    };

    const assertMainViewHidden = () => {
      const editor = hook.editor();
      const editorContainer = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-container').getOrDie();

      assert.equal('true', Attribute.get(editorContainer, 'aria-hidden'), 'Should be aria-hidden');
      assert.equal('none', Css.getRaw(editorContainer, 'display').getOrDie(), 'Should have display none');
    };

    const assertMainViewVisible = () => {
      const editor = hook.editor();
      const editorContainer = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-container').getOrDie();

      assert.isFalse(Attribute.has(editorContainer, 'aria-hidden'), 'Should not have aria-hidden');
      assert.isTrue(Css.getRaw(editorContainer, 'display').isNone(), 'Should not have display none');
    };

    const assertViewHtml = (viewIndex: number, expectedHtml: string) => {
      const editor = hook.editor();
      const editorContainer = UiFinder.findIn<HTMLElement>(TinyDom.container(editor), `.tox-view:nth-child(${viewIndex + 1}) .tox-view__pane`).getOrDie();

      assert.equal(Html.get(editorContainer), expectedHtml);
    };

    const pWaitUntilRemoved = (label: string, selector: string) =>
      Waiter.pTryUntil(label, () => UiFinder.notExists(SugarBody.body(), selector));

    const pAssertToolbarDrawerVisibleState = async (expectedState: boolean) => {
      if (expectedState) {
        await UiFinder.pWaitForVisible('Wait for toolbar drawer to be visible', SugarBody.body(), '.tox-toolbar__overflow');
      } else {
        await pWaitUntilRemoved('Wait for toolbar drawer to close', '.tox-toolbar__overflow');
      }
    };

    it('TINY-9210: Structure', () => {
      const editor = hook.editor();
      const viewWrap = UiFinder.findIn(TinyDom.container(editor), '.tox-view-wrap').getOrDie();

      Assertions.assertStructure('Checking structure', ApproxStructure.build((s, str, arr) => {
        const button = (title: string, classes: string[]) =>
          s.element('button', {
            classes: Arr.map(classes, (cls) => arr.has(cls)),
            attrs: {
              'title': str.is(title),
              'type': str.is('button'),
              'tabindex': str.is('-1'),
              'data-alloy-tabstop': str.is('true')
            },
            children: [ s.text(str.is(title)) ]
          });

        const view = (startButtons: StructAssert[], endButtons: StructAssert[]) =>
          s.element('div', {
            classes: [ arr.has('tox-view') ],
            attrs: { 'aria-hidden': str.is('true') },
            styles: { display: str.is('none') },
            children: [
              s.element('div', {
                classes: [ arr.has('tox-view__header') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-view__header-start') ],
                    attrs: { role: str.is('presentation') },
                    children: startButtons
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-view__header-end') ],
                    attrs: { role: str.is('presentation') },
                    children: endButtons
                  })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-view__pane') ]
              })
            ]
          });

        const buttonlessView = () =>
          s.element('div', {
            classes: [ arr.has('tox-view') ],
            attrs: { 'aria-hidden': str.is('true') },
            styles: { display: str.is('none') },
            children: [
              s.element('div', {
                classes: [ arr.has('tox-view__pane') ]
              })
            ]
          });

        return s.element('div', {
          classes: [ arr.has('tox-view-wrap') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-view-wrap__slot-container') ],
              children: [
                view(
                  [],
                  [
                    button('Button 1', [ 'tox-button', 'tox-button--secondary' ]),
                    button('Button 2', [ 'tox-button' ])
                  ]
                ),
                view(
                  [],
                  [
                    button('Button 1', [ 'tox-button', 'tox-button--secondary' ]),
                    button('Button 2', [ 'tox-button' ])
                  ]
                ),
                buttonlessView()
              ]
            })
          ]
        });
      }), viewWrap);
    });

    it('TINY-9210: ToggleView command', () => {
      store.clear();

      assertMainViewVisible();
      assert.equal(queryToggleView(), '', 'Should be empty string if no view is toggled on');

      toggleView('myview1');
      assert.equal(queryToggleView(), 'myview1');
      assertViewHtml(0, '<button>myview1</button>');
      assertViewHtml(1, '');
      assertMainViewHidden();

      toggleView('myview2');
      assert.equal(queryToggleView(), 'myview2');
      assertViewHtml(0, '');
      assertViewHtml(1, 'myview2');
      assertMainViewHidden();

      toggleView('myview2');
      assert.equal(queryToggleView(), '', 'Should be empty string since all views are toggled off');
      assertViewHtml(0, '');
      assertViewHtml(1, '');
      assertMainViewVisible();

      store.assertEq('Should show/hide myview1 and myview2', [
        'myview1:show',
        'myview2:show',
        'myview1:hide',
        'myview2:hide'
      ]);
    });

    it('TINY-9210: Click on view buttons', () => {
      const editor = hook.editor();

      store.clear();

      toggleView('myview1');
      clickViewButton(editor, 'Button 1');
      clickViewButton(editor, 'Button 2');
      toggleView('myview1');

      store.assertEq('Should get showView then onAction calls for button1 and button2', [
        'myview1:show',
        'myview1:button1',
        'myview1:button2',
        'myview1:hide'
      ]);
    });

    it('TINY-9210: Show/hide view when toolbar drawer is not visible', async () => {
      await pAssertToolbarDrawerVisibleState(false);
      toggleView('myview1');
      toggleView('myview1');
      await pAssertToolbarDrawerVisibleState(false);
    });

    it('TINY-9210: Show/hide view when toolbar drawer is visible should hide it while the view is visible', async () => {
      const editor = hook.editor();

      await pAssertToolbarDrawerVisibleState(false);
      editor.execCommand('ToggleToolbarDrawer');
      await pAssertToolbarDrawerVisibleState(true);
      toggleView('myview1');
      await pAssertToolbarDrawerVisibleState(false);
      toggleView('myview1');
      await pAssertToolbarDrawerVisibleState(true);
    });

    it('TINY-9210: Should hide menus if view is toggled on', async () => {
      const editor = hook.editor();

      TinyUiActions.clickOnUi(editor, 'button[role="menuitem"]:nth-child(1)');
      await UiFinder.pWaitFor('Wait for menu to open', SugarBody.body(), '.tox-menu');
      toggleView('myview1');
      await pWaitUntilRemoved('Wait for menu to close', '.tox-menu');
      toggleView('myview1');
    });

    it('TINY-9210: Should hide context toolbar if view is toggled on', async () => {
      const editor = hook.editor();

      editor.focus();
      editor.setContent('<p><img src="about:blank"></p>');
      TinySelections.select(editor, 'img', []);
      await UiFinder.pWaitFor('Wait for toolbar to open', SugarBody.body(), '.tox-pop');
      toggleView('myview1');
      await pWaitUntilRemoved('Wait for toolbar to close', '.tox-pop');
      toggleView('myview1');
    });

    it('TINY-9210: Should move focus back to the editor on ToggleView', () => {
      const editor = hook.editor();
      const apis = TinyApis(editor);

      editor.focus();
      apis.hasFocus(true);
      toggleView('myview1');
      apis.hasFocus(false);
      toggleView('myview1');
      apis.hasFocus(true);
    });

    it('TINY-9259: Should retain range selection when main view is hidden', () => {
      const editor = hook.editor();

      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      toggleView('myview1');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
      toggleView('myview1');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('TINY-9671: should be possible to navigate the header via keyboard', async () => {
      const editor = hook.editor();
      const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
      toggleView('myview1');
      FocusTools.setFocus(root, '.tox-view__header');
      await FocusTools.pTryOnSelector('Focus should be on the view header', root, '.tox-view__header');

      TinyUiActions.keystroke(editor, Keys.enter());
      await FocusTools.pTryOnSelector('Button 1 should be the first selection', root, '.tox-view__header [title="Button 1"]');

      TinyUiActions.keystroke(editor, Keys.right());
      await FocusTools.pTryOnSelector('With right it should pass from Button 1 to Button 2', root, '.tox-view__header [title="Button 2"]');

      TinyUiActions.keystroke(editor, Keys.right());
      await FocusTools.pTryOnSelector('Pressing right again it should move to Button 1', root, '.tox-view__header [title="Button 1"]');

      TinyUiActions.keystroke(editor, Keys.left());
      await FocusTools.pTryOnSelector('With left it should pass from Button 1 to Button 2', root, '.tox-view__header [title="Button 2"]');

      TinyUiActions.keystroke(editor, Keys.left());
      await FocusTools.pTryOnSelector('Pressing left again it should move to Button 1', root, '.tox-view__header [title="Button 1"]');
      toggleView('myview1');
    });
  });

  context('Inline mode', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      inline: true,
      base_url: '/project/tinymce/js/tinymce',
      setup: (editor: Editor) => {
        editor.ui.registry.addView('myview1', {
          buttons: [
            {
              type: 'button',
              text: 'Button 1',
              onAction: Fun.noop
            }
          ],
          onShow: Fun.noop,
          onHide: Fun.noop
        });
      }
    }, []);

    it('TINY-9210: ToggleView command', () => {
      const editor = hook.editor();

      assert.equal(editor.queryCommandValue('ToggleView'), '', 'Should be empty string if no view is toggled on');
      editor.execCommand('ToggleView', false, 'myview1');
      assert.equal(editor.queryCommandValue('ToggleView'), '', 'Should still be empty since inline mode does not support views');
    });
  });

  context('Sliding toolbar', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_mode: 'sliding',
      toolbar: Arr.range(10, Fun.constant('bold | italic ')).join(''),
      width: 500,
      setup: (editor: Editor) => {
        editor.ui.registry.addView('myview1', {
          buttons: [
            {
              type: 'button',
              text: 'Button 1',
              onAction: Fun.noop
            },
            {
              type: 'button',
              text: 'Button 2',
              onAction: Fun.noop,
              buttonType: 'primary'
            }
          ],
          onShow: (api) => {
            api.getContainer().innerHTML = '<button>myview1</button>';
          },
          onHide: Fun.noop
        });
      }
    }, []);

    const assertMainViewVisible = () => {
      const editor = hook.editor();
      const editorContainer = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-container').getOrDie();

      assert.isFalse(Attribute.has(editorContainer, 'aria-hidden'), 'Should not have aria-hidden');
      assert.isTrue(Css.getRaw(editorContainer, 'display').isNone(), 'Should not have display none');
    };

    const assertViewHtml = (viewIndex: number, expectedHtml: string) => {
      const editor = hook.editor();
      const editorContainer = UiFinder.findIn<HTMLElement>(TinyDom.container(editor), `.tox-view:nth-child(${viewIndex + 1}) .tox-view__pane`).getOrDie();

      assert.equal(Html.get(editorContainer), expectedHtml);
    };

    it('TINY-9419: "Reveal or hide additional toolbar items" button should not be removed if the toolbar is opened and view is opened and close', () => {
      const editor = hook.editor();

      editor.setContent('<p>ab</p>');
      TinyUiActions.clickOnToolbar(editor, '[title="Reveal or hide additional toolbar items"]');

      editor.execCommand('ToggleView', false, 'myview1');
      assertViewHtml(0, '<button>myview1</button>');
      editor.execCommand('ToggleView', false, 'myview1');
      assertMainViewVisible();
      const moreButton = UiFinder.findIn(TinyDom.container(editor), '[title="Reveal or hide additional toolbar items"]');
      assert.isTrue(moreButton.isValue(), 'Reveal or hide additional toolbar items button should be there');
    });
  });

  context('Sticky toolbar', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: Arr.range(10, Fun.constant('bold | italic ')).join(''),
      width: 500,
      toolbar_mode: 'sliding',
      plugins: 'autoresize',
      toolbar_sticky: true,
      toolbar_sticky_offset: 1,
      setup: (editor: Editor) => {
        editor.ui.registry.addView('myview1', {
          buttons: [
            {
              type: 'button',
              text: 'Button 1',
              onAction: () => {
                editor.execCommand('ToggleView', false, 'myview1');
              }
            }
          ],
          onShow: (api) => {
            api.getContainer().innerHTML = '<button>myview1</button>';
          },
          onHide: Fun.noop
        });
      }
    }, []);

    const assertMainViewVisible = () => {
      const editor = hook.editor();
      const editorContainer = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-container').getOrDie();

      assert.isFalse(Attribute.has(editorContainer, 'aria-hidden'), 'Should not have aria-hidden');
      assert.isTrue(Css.getRaw(editorContainer, 'display').isNone(), 'Should not have display none');
    };

    const assertViewHtml = (viewIndex: number, expectedHtml: string) => {
      const editor = hook.editor();
      const editorContainer = UiFinder.findIn<HTMLElement>(TinyDom.container(editor), `.tox-view:nth-child(${viewIndex + 1}) .tox-view__pane`).getOrDie();

      assert.equal(Html.get(editorContainer), expectedHtml);
    };

    it('TINY-9814: coming back from a view when the toolbar is scrolled, should preserve the buttons in `tox-toolbar__primary`', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>
        ${Arr.range(50, Fun.constant('some text')).join('<br>')}
        <div class="element_to_scroll_to">element to scroll to</div>
        ${Arr.range(50, Fun.constant('some text')).join('<br>')}
      </p>`);

      const elementToScrollTo = UiFinder.findIn(TinyDom.body(editor), '.element_to_scroll_to').getOrDie();
      const toolbar = await TinyUiActions.pWaitForUi(editor, '.tox-toolbar__overflow');

      await Waiter.pTryUntil('Wait for scroll top to be before the toolbar', () => Scroll.get().top < toolbar.dom.getBoundingClientRect().top);
      elementToScrollTo.dom.scrollIntoView();
      await Waiter.pTryUntil('Wait for scroll top to be after the toolbar', () => Scroll.get().top > toolbar.dom.getBoundingClientRect().top);

      editor.execCommand('ToggleView', true, 'myview1');
      assertViewHtml(0, '<button>myview1</button>');

      // this is needed because otherwise the bug is not reproduced
      await Waiter.pWait(0);

      editor.execCommand('ToggleView', false, 'myview1');
      assertMainViewVisible();

      const boldButton = await TinyUiActions.pWaitForUi(editor, '.tox-toolbar__primary [title="Bold"]');
      assert.isDefined(boldButton, 'Bold button should be in `tox-toolbar__primary`');
    });
  });
});
