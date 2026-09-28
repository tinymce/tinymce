import { ApproxStructure, Assertions, FocusTools, Keys, type StructAssert, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, Class, Css, Html, Scroll, SugarBody, SugarShadowDom } from '@ephox/sugar';
import { TinyApis, TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { View } from 'tinymce/core/api/ui/Ui';

import { resizeEditorBy } from '../../module/UiUtils';

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

    const clickViewButton = (editor: Editor, tooltip: string) => TinyUiActions.clickOnUi(editor, `.tox-view button[aria-label='${tooltip}']`);

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

    it('TINYMCE-14768: Toolbar drawer state should survive switching directly between views', async () => {
      await pAssertToolbarDrawerVisibleState(true);
      toggleView('myview1');
      await pAssertToolbarDrawerVisibleState(false);
      toggleView('myview2');
      await pAssertToolbarDrawerVisibleState(false);
      toggleView('myview2');
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
      await FocusTools.pTryOnSelector('Button 1 should be the first selection', root, '.tox-view__header [aria-label="Button 1"]');

      TinyUiActions.keystroke(editor, Keys.right());
      await FocusTools.pTryOnSelector('With right it should pass from Button 1 to Button 2', root, '.tox-view__header [aria-label="Button 2"]');

      TinyUiActions.keystroke(editor, Keys.right());
      await FocusTools.pTryOnSelector('Pressing right again it should move to Button 1', root, '.tox-view__header [aria-label="Button 1"]');

      TinyUiActions.keystroke(editor, Keys.left());
      await FocusTools.pTryOnSelector('With left it should pass from Button 1 to Button 2', root, '.tox-view__header [aria-label="Button 2"]');

      TinyUiActions.keystroke(editor, Keys.left());
      await FocusTools.pTryOnSelector('Pressing left again it should move to Button 1', root, '.tox-view__header [aria-label="Button 1"]');
      toggleView('myview1');
    });

    it('TINY-10780: should be possible to use "tab" navigation inside the views', async () => {
      const editor = hook.editor();
      const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
      toggleView('myview1');
      FocusTools.setFocus(root, '.tox-view__pane');
      await FocusTools.pTryOnSelector('Focus should be on the pane', root, '.tox-view__pane');

      TinyUiActions.keystroke(editor, Keys.tab());
      await FocusTools.pTryOnSelector('After the first tab Button 1 should be selected', root, '.tox-view__header [aria-label="Button 1"]');

      TinyUiActions.keystroke(editor, Keys.tab());
      await FocusTools.pTryOnSelector('After the second tab Button 2 should be selected', root, '.tox-view__header [aria-label="Button 2"]');

      TinyUiActions.keystroke(editor, Keys.tab());
      await FocusTools.pTryOnSelector('After the third tab pane should be selected again', root, '.tox-view__pane');

      TinyUiActions.keystroke(editor, Keys.tab(), { shift: true, shiftKey: true });
      await FocusTools.pTryOnSelector('After shift+tab from pane Button 2 should be selected', root, '.tox-view__header [aria-label="Button 2"]');

      TinyUiActions.keystroke(editor, Keys.tab(), { shift: true, shiftKey: true });
      await FocusTools.pTryOnSelector('After the second shift+tab Button 1 should be selected', root, '.tox-view__header [aria-label="Button 1"]');

      TinyUiActions.keystroke(editor, Keys.tab(), { shift: true, shiftKey: true });
      await FocusTools.pTryOnSelector('After the third shift+tab pane should be selected', root, '.tox-view__pane');

      toggleView('myview1');
    });
  });

  context('Scroll persistence', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      setup: (editor: Editor) => {
        editor.ui.registry.addView('myview1', {
          onShow: (api) => {
            api.getContainer().innerHTML = '<button>myview1</button>';
          },
          onHide: Fun.noop
        });
      }
    }, []);

    it('TINYMCE-14905: ToggleView does not scroll the editor to the caret', () => {
      const editor = hook.editor();
      editor.setContent('<p>top</p><p style="height: 1000px">spacer</p><p>bottom</p>');
      editor.selection.select(editor.getBody().lastChild as Element);
      editor.focus();
      editor.getWin().scrollTo(0, 0);
      const scrollY = editor.getWin().scrollY;

      editor.execCommand('ToggleView', false, 'myview1');
      editor.execCommand('ToggleView', false, 'myview1');

      assert.equal(editor.getWin().scrollY, scrollY, 'ToggleView should not scroll the editor to the caret');
      assert.isTrue(editor.hasFocus(), 'Editor should be focused after closing the view');
    });
  });

  context('Initialize view with command', () => {
    const store = TestStore();
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'myview',
      setup: (editor: Editor) => {
        editor.ui.registry.addView('myview1', {
          onShow: store.adder('myview1:show'),
          onHide: store.adder('myview1:hide')
        });
        editor.on('init', () => {
          editor.execCommand('ToggleView', false, 'myview1');
        });
      }
    });

    it('TINY-13463: Toggle view command on init event test', async () => {
      const editor = hook.editor();
      await Waiter.pTryUntil('Checking view callbacks on init', () => store.assertEq('Asserting view callbacks', [
        'myview1:show',
      ]));
      editor.execCommand('ToggleView', false, 'myview1');
      await Waiter.pTryUntil('Checking view callbacks after closing view', () => store.assertEq('Asserting view callbacks', [
        'myview1:show',
        'myview1:hide',
      ]));
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
      TinyUiActions.clickOnToolbar(editor, '[data-mce-name="overflow-button"]');

      editor.execCommand('ToggleView', false, 'myview1');
      assertViewHtml(0, '<button>myview1</button>');
      editor.execCommand('ToggleView', false, 'myview1');
      assertMainViewVisible();
      const moreButton = UiFinder.findIn(TinyDom.container(editor), '[data-mce-name="overflow-button"]');
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

      await Waiter.pWaitBetweenUserActions();

      editor.execCommand('ToggleView', false, 'myview1');
      assertMainViewVisible();

      const boldButton = await TinyUiActions.pWaitForUi(editor, '.tox-toolbar__primary [data-mce-name="bold"]');
      assert.isDefined(boldButton, 'Bold button should be in `tox-toolbar__primary`');
    });
  });

  context('TINYMCE-14768: keepToolbar', () => {
    const openedSidebarSelector = '.tox-sidebar__slider.tox-sidebar--sliding-open:not(.tox-sidebar--sliding-growing)';
    const closedSidebarSelector = '.tox-sidebar__slider.tox-sidebar--sliding-closed:not(.tox-sidebar--sliding-shrinking)';
    const store = TestStore();
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_mode: 'floating',
      toolbar: 'mysidebar | ' + Arr.range(10, Fun.constant('bold | italic ')).join(''),
      width: 500,
      setup: (editor: Editor) => {
        editor.ui.registry.addSidebar('mysidebar', {
          tooltip: 'My sidebar',
          icon: 'comment',
          onShow: (api) => {
            api.element().style.width = '200px';
            store.add('mysidebar:show');
          },
          onHide: () => store.add('mysidebar:hide')
        });

        editor.on('ToggleSidebar', () => store.add('ToggleSidebar'));
        editor.on('ToggleView', () => store.add('ToggleView'));

        editor.ui.registry.addView('toolbarview', {
          keepToolbar: true,
          onShow: (api) => {
            api.getContainer().innerHTML = 'keep-toolbar';
          },
          onHide: Fun.noop
        });

        editor.ui.registry.addView('plainview', {
          onShow: (api) => {
            api.getContainer().innerHTML = 'plain';
          },
          onHide: Fun.noop
        });

        editor.ui.registry.addView('tallview', {
          keepToolbar: true,
          onShow: (api) => {
            api.getContainer().innerHTML = '<div style="height: 2000px"></div>';
          },
          onHide: Fun.noop
        });
      }
    }, []);

    const pAssertToolbarDrawerVisibleState = async (expectedState: boolean) => {
      if (expectedState) {
        await UiFinder.pWaitForVisible('Wait for toolbar drawer to be visible', SugarBody.body(), '.tox-toolbar__overflow');
      } else {
        await Waiter.pTryUntil('Wait for toolbar drawer to close', () => UiFinder.notExists(SugarBody.body(), '.tox-toolbar__overflow'));
      }
    };

    const pWaitForSidebarOpened = () =>
      Waiter.pTryUntil('Wait for the sidebar to finish opening', () => UiFinder.exists(SugarBody.body(), openedSidebarSelector));

    const pWaitForSidebarClosed = () =>
      Waiter.pTryUntil('Wait for the sidebar to finish closing', () => UiFinder.exists(SugarBody.body(), closedSidebarSelector));

    it('hides the edit area and keeps the editor header visible', () => {
      const editor = hook.editor();
      editor.execCommand('ToggleView', false, 'toolbarview');

      const editorContainer = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-container').getOrDie();
      assert.isFalse(Attribute.has(editorContainer, 'aria-hidden'), 'Editor container should not be aria-hidden');
      assert.isTrue(Css.getRaw(editorContainer, 'display').isNone(), 'Editor container should not have display none');
      assert.isTrue(Class.has(editorContainer, 'tox-editor-container--keep-toolbar'), 'Should pin the header strip');

      const sidebarWrap = UiFinder.findIn(TinyDom.container(editor), '.tox-sidebar-wrap').getOrDie();
      assert.equal('true', Attribute.get(sidebarWrap, 'aria-hidden'), 'Edit area wrap should be aria-hidden');
      assert.equal('none', Css.getRaw(sidebarWrap, 'display').getOrDie(), 'Edit area wrap should be display none');

      const header = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-header').getOrDie();
      assert.notEqual('none', Css.get(header, 'display'), 'Header should remain visible');

      const viewWrap = UiFinder.findIn(TinyDom.container(editor), '.tox-view-wrap').getOrDie();
      assert.isFalse(Attribute.has(viewWrap, 'aria-hidden'), 'View should be visible');
      assert.isTrue(Css.getRaw(viewWrap, 'display').isNone(), 'View should not have display none');

      editor.execCommand('ToggleView', false, 'toolbarview');

      assert.isFalse(Attribute.has(editorContainer, 'aria-hidden'), 'Editor container restored');
      assert.isTrue(Css.getRaw(editorContainer, 'display').isNone(), 'Editor container display restored');
      assert.isFalse(Class.has(editorContainer, 'tox-editor-container--keep-toolbar'), 'Keep-toolbar class removed');
      assert.isFalse(Attribute.has(sidebarWrap, 'aria-hidden'), 'Edit area wrap restored');
      assert.isTrue(Css.getRaw(sidebarWrap, 'display').isNone(), 'Edit area wrap display restored');
    });

    it('leaves the toolbar drawer in the user\'s state while the toolbar stays visible', async () => {
      const editor = hook.editor();

      await pAssertToolbarDrawerVisibleState(false);
      editor.execCommand('ToggleToolbarDrawer');
      await pAssertToolbarDrawerVisibleState(true);

      editor.execCommand('ToggleView', false, 'toolbarview');
      await pAssertToolbarDrawerVisibleState(true);

      editor.execCommand('ToggleToolbarDrawer');
      await pAssertToolbarDrawerVisibleState(false);

      editor.execCommand('ToggleView', false, 'toolbarview');
      await pAssertToolbarDrawerVisibleState(false);
    });

    it('restores the toolbar drawer when switching from a full view to a keep-toolbar view', async () => {
      const editor = hook.editor();

      await pAssertToolbarDrawerVisibleState(false);
      editor.execCommand('ToggleToolbarDrawer');
      await pAssertToolbarDrawerVisibleState(true);

      editor.execCommand('ToggleView', false, 'plainview');
      await pAssertToolbarDrawerVisibleState(false);

      editor.execCommand('ToggleView', false, 'toolbarview');
      await pAssertToolbarDrawerVisibleState(true);

      editor.execCommand('ToggleView', false, 'toolbarview');
      await pAssertToolbarDrawerVisibleState(true);
    });

    it('closes an open sidebar when a keep-toolbar view opens', async () => {
      const editor = hook.editor();

      editor.execCommand('ToggleSidebar', false, 'mysidebar');
      await pWaitForSidebarOpened();
      store.clear();

      editor.execCommand('ToggleView', false, 'toolbarview');

      assert.equal(editor.queryCommandValue('ToggleSidebar'), '', 'No sidebar should be active while the keep-toolbar view is open');
      UiFinder.exists(SugarBody.body(), closedSidebarSelector);
      UiFinder.exists(SugarBody.body(), 'button[data-mce-name="mysidebar"][aria-pressed="false"]');
      store.assertEq('The sidebar should be hidden and announced before the view opens', [ 'mysidebar:hide', 'ToggleSidebar', 'ToggleView' ]);

      editor.execCommand('ToggleView', false, 'toolbarview');

      assert.equal(editor.queryCommandValue('ToggleSidebar'), '', 'The sidebar should stay closed once the view has closed');
      const sidebar = UiFinder.findIn(SugarBody.body(), '.tox-sidebar').getOrDie();
      assert.isTrue(Css.getRaw(sidebar, 'width').isNone(), 'The sidebar should not be left with a pinned width');

      editor.execCommand('ToggleSidebar', false, 'mysidebar');
      await pWaitForSidebarOpened();
      editor.execCommand('ToggleSidebar', false, 'mysidebar');
      await pWaitForSidebarClosed();
    });

    it('leaves an open sidebar in place for a plain view', async () => {
      const editor = hook.editor();

      editor.execCommand('ToggleSidebar', false, 'mysidebar');
      await pWaitForSidebarOpened();
      store.clear();

      editor.execCommand('ToggleView', false, 'plainview');

      assert.equal(editor.queryCommandValue('ToggleSidebar'), 'mysidebar', 'The sidebar should stay active while a plain view is open');
      store.assertEq('A plain view should not touch the sidebar', [ 'ToggleView' ]);

      editor.execCommand('ToggleView', false, 'plainview');
      editor.execCommand('ToggleSidebar', false, 'mysidebar');
      await pWaitForSidebarClosed();
    });

    it('TINYMCE-14928: constrains the view wrap height to the space left below the kept-toolbar header', () => {
      const editor = hook.editor();
      const container = TinyDom.container(editor);

      editor.execCommand('ToggleView', false, 'tallview');

      const viewWrap = UiFinder.findIn(container, '.tox-view-wrap').getOrDie();
      const header = UiFinder.findIn(container, '.tox-editor-header').getOrDie();

      const viewWrapRect = viewWrap.dom.getBoundingClientRect();
      const containerRect = container.dom.getBoundingClientRect();
      const headerRect = header.dom.getBoundingClientRect();

      assert.isAtMost(viewWrapRect.bottom, containerRect.bottom + 1, 'View wrap should not overflow the bottom of the editor container');
      assert.isAtLeast(viewWrapRect.top, headerRect.bottom - 1, 'View wrap should start at or below the bottom of the header');
      assert.isAbove(viewWrapRect.height, 0, 'View wrap should have a positive height');

      editor.execCommand('ToggleView', false, 'tallview');

      assert.equal('none', Css.getRaw(viewWrap, 'display').getOrDie(), 'View wrap should be hidden once the view has closed');
    });

    it('TINYMCE-14920: keeps the statusbar visible for a keepToolbar view', () => {
      const editor = hook.editor();
      const container = TinyDom.container(editor);

      editor.execCommand('ToggleView', false, 'toolbarview');

      const statusbar = UiFinder.findIn(container, '.tox-statusbar').getOrDie();
      assert.isFalse(Attribute.has(statusbar, 'aria-hidden'), 'Statusbar should not be aria-hidden while the view is open');
      assert.isTrue(Css.getRaw(statusbar, 'display').isNone(), 'Statusbar should not have display none while the view is open');

      editor.execCommand('ToggleView', false, 'toolbarview');

      assert.isFalse(Attribute.has(statusbar, 'aria-hidden'), 'Statusbar should not be aria-hidden after the view closes');
      assert.isTrue(Css.getRaw(statusbar, 'display').isNone(), 'Statusbar should not have display none after the view closes');
    });

    it('TINYMCE-14920: hides the statusbar for a plain view', () => {
      const editor = hook.editor();
      const container = TinyDom.container(editor);

      editor.execCommand('ToggleView', false, 'plainview');

      const statusbar = UiFinder.findIn(container, '.tox-statusbar').getOrDie();
      assert.equal('true', Attribute.get(statusbar, 'aria-hidden'), 'Statusbar should be aria-hidden while a plain view is open');
      assert.equal('none', Css.getRaw(statusbar, 'display').getOrDie(), 'Statusbar should have display none while a plain view is open');

      editor.execCommand('ToggleView', false, 'plainview');

      assert.isFalse(Attribute.has(statusbar, 'aria-hidden'), 'Statusbar should not be aria-hidden after the view closes');
      assert.isTrue(Css.getRaw(statusbar, 'display').isNone(), 'Statusbar should not have display none after the view closes');
    });

    it('TINYMCE-14920: disables the element path while a view is open', () => {
      const editor = hook.editor();
      const container = TinyDom.container(editor);

      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);

      editor.execCommand('ToggleView', false, 'toolbarview');

      const path = UiFinder.findIn(container, '.tox-statusbar__path').getOrDie();
      assert.equal('true', Attribute.get(path, 'aria-disabled'), 'Element path should be disabled while the view is open');

      const items = UiFinder.findAllIn(container, '.tox-statusbar__path-item');
      assert.isAbove(items.length, 0, 'There should be at least one element path item');
      Arr.each(items, (item) => assert.equal('true', Attribute.get(item, 'aria-disabled'), 'Element path item should be disabled while the view is open'));

      editor.nodeChanged();
      assert.equal('true', Attribute.get(path, 'aria-disabled'), 'Element path should still be disabled after a NodeChange broadcast');

      editor.execCommand('ToggleView', false, 'toolbarview');

      assert.equal('false', Attribute.get(path, 'aria-disabled'), 'Element path should be enabled once the view closes');
      const itemsAfterClose = UiFinder.findAllIn(container, '.tox-statusbar__path-item');
      Arr.each(itemsAfterClose, (item) => assert.equal('false', Attribute.get(item, 'aria-disabled'), 'Element path item should be enabled once the view closes'));
    });

    it('TINYMCE-14920: resizes the editor from the statusbar while a keepToolbar view is open', async () => {
      const editor = hook.editor();
      const container = TinyDom.container(editor);

      editor.execCommand('ToggleView', false, 'toolbarview');

      const viewWrap = UiFinder.findIn(container, '.tox-view-wrap').getOrDie();
      const initialHeight = container.dom.offsetHeight;
      const initialViewWrapHeight = viewWrap.dom.getBoundingClientRect().height;

      await resizeEditorBy([ 0, 100 ]);

      const resizedHeight = container.dom.offsetHeight;
      assert.equal(resizedHeight, initialHeight + 100, 'Editor should grow by 100px while the view is open');

      const viewWrapRect = viewWrap.dom.getBoundingClientRect();
      const containerRect = container.dom.getBoundingClientRect();
      assert.isAtMost(viewWrapRect.bottom, containerRect.bottom + 1, 'View wrap should not overflow the bottom of the editor container');
      assert.isAbove(viewWrapRect.height, initialViewWrapHeight, 'View wrap should grow along with the editor');

      editor.execCommand('ToggleView', false, 'toolbarview');

      Css.set(container, 'height', `${initialHeight}px`);
    });
  });
});
