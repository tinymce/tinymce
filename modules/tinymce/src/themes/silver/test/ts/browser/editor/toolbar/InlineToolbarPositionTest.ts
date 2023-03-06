import { ApproxStructure, Assertions, FocusTools, UiFinder, Waiter } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { after, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';
import { Class, Css, Insert, Remove, SelectorFind, SugarBody, SugarDocument, SugarElement, Traverse } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as PageScroll from '../../../module/PageScroll';

describe('browser.tinymce.themes.silver.editor.toolbar.InlineToolbarPositionTest', () => {
  const options = {
    inline: true,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  };

  const pAssertStaticPos = (container: SugarElement<HTMLElement>) => Waiter.pTryUntil('Wait for toolbar to be absolute', () => {
    assert.equal(Css.get(container, 'position'), 'static', 'Container should be statically positioned');
  });

  const pAssertAbsolutePos = (editor: Editor, position: 'above' | 'below', offsetParentBody = true) => {
    const container = TinyDom.container(editor);
    const contentArea = TinyDom.contentAreaContainer(editor);
    return Waiter.pTryUntil('Wait for toolbar to be absolute', () => {
      const left = Css.get(container, 'left');
      const top = parseInt(Strings.removeTrailing(Css.get(container, 'top'), 'px'), 10);

      const containerAreaBounds = Boxes.box(contentArea);
      const topPosition = (offsetParentBody ? containerAreaBounds.y : contentArea.dom.offsetTop) - container.dom.clientHeight;
      const assertTop = position === 'above' ?
        topPosition :
        containerAreaBounds.bottom;

      assert.equal(Css.get(container, 'position'), 'absolute', 'Container should be absolutely positioned');
      assert.equal(left, '0px', `Container left position (${left}) should be 0px`);
      assert.approximately(top, assertTop, 3, `Container should be positioned ${position} contentarea, ${top}px should be ~${assertTop}px`);
    });
  };

  const pAssertDockedPos = (header: SugarElement<HTMLElement>, position: 'top' | 'bottom') =>
    Waiter.pTryUntil('Wait for toolbar to be docked', () => {
      const left = Css.get(header, 'left');
      const top = parseInt(Strings.removeTrailing(Css.get(header, position), 'px'), 10);

      const assertTop = 0;

      assert.equal(Css.get(header, 'position'), 'fixed', 'Header container should be docked (fixed position)');
      assert.equal(left, '0px', `Header container left position (${left}) should be 0px`);
      assert.approximately(top, assertTop, 3, `Header container should be docked to ${position}, ${top}px should be ~${assertTop}px`);
    });

  const scrollToElement = (container: SugarElement<HTMLElement>, selector: string, alignWindowBottom = false) => {
    const elm = UiFinder.findIn(container, selector).getOrDie();
    elm.dom.scrollIntoView(alignWindowBottom);
  };

  const pScrollToElementAndActivate = async (editor: Editor, container: SugarElement<HTMLElement>, selector: string, alignWindowBottom = false) => {
    scrollToElement(container, selector, alignWindowBottom);
    TinySelections.select(editor, selector, []);
    await pActiveEditor(editor);
  };

  const pActiveEditor = async (editor: Editor) => {
    editor.focus();
    editor.nodeChanged();
    await UiFinder.pWaitForVisible('Wait for editor to be visible', SugarBody.body(), '.tox-editor-header');
  };

  const pDeactivateEditor = async (editor: Editor) => {
    FocusTools.setFocus(Traverse.documentElement(SugarDocument.getDocument()), 'div.scroll-div');
    editor.dispatch('focusout');
    await UiFinder.pWaitForHidden('Wait for editor to hide', SugarBody.body(), '.tox.tox-tinymce-inline');
  };

  const getHeader = (editor: Editor) => {
    const container = TinyDom.container(editor);
    return SelectorFind.descendant<HTMLElement>(container, '.tox-editor-header').getOr(container);
  };

  const setUpRelativeContainer = (margin = 0, padding = 0) => {
    const grandparent = SugarElement.fromTag('div');
    Class.add(grandparent, 'test-editor-grandparent');
    Css.set(grandparent, 'position', 'relative');
    Css.set(grandparent, 'padding-top', `${padding}px`);
    Css.set(grandparent, 'margin-top', `${margin}px`);
    const parent = SugarElement.fromTag('div');
    Class.add(parent, 'test-editor-parent');
    const target = SugarElement.fromTag('div');

    Insert.append(parent, target);
    Insert.append(grandparent, parent);

    // The Loader is going to try to insert `target` into the body if it isn't already in the body,
    // so we insert grandparent here.
    Insert.append(SugarBody.body(), grandparent);

    // We remove the outer most div, not just the target element
    const teardown = () => {
      Remove.remove(grandparent);
    };

    return {
      element: target,
      teardown
    };
  };

  const getTopPositionTests = (hook: TinyHooks.Hook<Editor>) => {
    it('TINY-3621: Select item at the start of the content (absolute position)', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      await pScrollToElementAndActivate(editor, contentArea, ':first-child');
      await pAssertAbsolutePos(editor, 'above');
      await pAssertStaticPos(getHeader(editor));
      await pDeactivateEditor(editor);
    });

    it('TINY-3621: Select item in the middle of the content (docked position) and scroll back to top', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      const header = getHeader(editor);
      await pScrollToElementAndActivate(editor, contentArea, 'p:contains("STOP AND CLICK HERE")');
      await pAssertDockedPos(header, 'top');
      scrollToElement(contentArea, ':first-child');
      await pAssertStaticPos(header);
      await pDeactivateEditor(editor);
    });

    it('TINY-3621: Select item at the bottom of the content (docked position) and scroll back to top', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      const header = getHeader(editor);
      await pScrollToElementAndActivate(editor, contentArea, ':last-child');
      await pAssertDockedPos(header, 'top');
      scrollToElement(contentArea, ':first-child');
      await pAssertStaticPos(header);
      await pDeactivateEditor(editor);
    });

    it('TINY-3621: Select item at the top of the content and scroll to middle and back', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      const header = getHeader(editor);
      await pScrollToElementAndActivate(editor, contentArea, ':first-child');
      await pAssertStaticPos(header);
      scrollToElement(contentArea, 'p:contains("STOP AND CLICK HERE")');
      await pAssertDockedPos(header, 'top');
      scrollToElement(contentArea, ':first-child');
      await pAssertStaticPos(header);
      await pDeactivateEditor(editor);
    });

    it('TINY-4530: Select item at the start of the content and change format (absolute position)', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      await pScrollToElementAndActivate(editor, contentArea, ':first-child');
      await pAssertAbsolutePos(editor, 'above');
      await pAssertStaticPos(getHeader(editor));
      editor.execCommand('mceToggleFormat', false, 'div');
      await pAssertAbsolutePos(editor, 'above');
      await pDeactivateEditor(editor);
    });
  };

  const getBottomPositionTests = (hook: TinyHooks.Hook<Editor>) => {
    it('TINY-3621: Select item at the start of the content (docked position) and scroll to bottom', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      const header = getHeader(editor);
      await pScrollToElementAndActivate(editor, contentArea, ':first-child');
      await pAssertDockedPos(header, 'bottom');
      scrollToElement(contentArea, ':last-child', true);
      await pAssertStaticPos(header);
      await pDeactivateEditor(editor);
    });

    it('TINY-3621: Select item in the middle of the content (docked position) and scroll to bottom', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      const header = getHeader(editor);
      await pScrollToElementAndActivate(editor, contentArea, 'p:contains("STOP AND CLICK HERE")');
      await pAssertDockedPos(header, 'bottom');
      scrollToElement(contentArea, ':last-child', true);
      await pAssertStaticPos(header);
      await pDeactivateEditor(editor);
    });

    it('TINY-3621: Select item at the bottom of the content (absolute position)', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      await pScrollToElementAndActivate(editor, contentArea, ':last-child', true);
      await pAssertAbsolutePos(editor, 'below');
      await pAssertStaticPos(getHeader(editor));
      await pDeactivateEditor(editor);
    });

    it('TINY-3621: Select item at the bottom of the content and scroll to middle and back', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      const header = getHeader(editor);
      await pScrollToElementAndActivate(editor, contentArea, ':last-child', true);
      await pAssertStaticPos(header);
      scrollToElement(contentArea, 'p:contains("STOP AND CLICK HERE")');
      await pAssertDockedPos(header, 'bottom');
      await pScrollToElementAndActivate(editor, contentArea, ':last-child', true);
      await pAssertStaticPos(header);
      await pDeactivateEditor(editor);
    });

    it('TINY-4530: Select item at the bottom of the content and change format (absolute position)', async () => {
      const editor = hook.editor();
      const contentArea = TinyDom.contentAreaContainer(editor);
      await pScrollToElementAndActivate(editor, contentArea, ':last-child', true);
      await pAssertAbsolutePos(editor, 'below');
      await pAssertStaticPos(getHeader(editor));
      editor.execCommand('mceToggleFormat', false, 'div');
      await pAssertAbsolutePos(editor, 'below');
      await pDeactivateEditor(editor);
    });
  };

  const setupInitialContent = (hook: TinyHooks.Hook<Editor>) => {
    PageScroll.bddSetup(hook.editor, 500);

    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('<p>START CONTENT</p>' + Arr.range(98, (i) => i === 49 ? '<p>STOP AND CLICK HERE</p>' : '<p>Some content...</p>').join('\n') + '<p>END CONTENT</p>');
    });
  };

  Arr.map([ 'split', 'combined' ], (uiMode: 'split' | 'combined') => {
    context(`ui_mode: ${uiMode}`, () => {
      context('Toolbar position with toolbar_location: "top"', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          ...options,
          ui_mode: uiMode,
          toolbar_location: 'top'
        }, []);

        setupInitialContent(hook);
        getTopPositionTests(hook);
      });

      context('Toolbar position with toolbar_location: "bottom"', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          ...options,
          ui_mode: uiMode,
          toolbar_location: 'bottom'
        }, []);

        setupInitialContent(hook);
        getBottomPositionTests(hook);
      });

      // Should be the same as top in most cases, it should only switch to the bottom when there's no room
      // in the document to show above the contentAreaContainer which we model here by using a fixed position container
      context('Toolbar position with toolbar_location: "auto"', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          ...options,
          ui_mode: uiMode,
          toolbar_location: 'auto'
        }, []);

        setupInitialContent(hook);
        getTopPositionTests(hook);

        it('TINY-3161: Select item at the top of content, when there\'s no room to render above (docked position)', async () => {
          const editor = hook.editor();
          const contentArea = TinyDom.contentAreaContainer(editor);
          const editorBody = TinyDom.body(editor);
          const header = getHeader(editor);

          Css.set(editorBody, 'position', 'absolute');
          Css.set(editorBody, 'top', '0');
          Css.set(editorBody, 'left', '0');

          await pScrollToElementAndActivate(editor, contentArea, ':first-child');
          await pAssertAbsolutePos(editor, 'below');
          await pAssertDockedPos(header, 'bottom');
          scrollToElement(contentArea, 'p:contains("STOP AND CLICK HERE")');
          await pAssertDockedPos(header, 'bottom');
          scrollToElement(contentArea, ':last-child', true);
          await pAssertAbsolutePos(editor, 'above');
          await pAssertDockedPos(header, 'top');
          await pDeactivateEditor(editor);

          Css.remove(editorBody, 'position');
          Css.remove(editorBody, 'top');
        });
      });

      context('Fixed toolbar position', () => {
        let toolbar: SugarElement<HTMLDivElement>;
        before(() => {
          toolbar = SugarElement.fromHtml('<div id="toolbar"></div>');
          Insert.append(SugarBody.body(), toolbar);
        });

        const hook = TinyHooks.bddSetup<Editor>({
          ...options,
          ui_mode: uiMode,
          fixed_toolbar_container: '#toolbar'
        }, []);

        setupInitialContent(hook);

        before(() => {
          // Add a margin to offset the regular max-width of the toolbar
          const contentArea = TinyDom.contentAreaContainer(hook.editor());
          Css.set(contentArea, 'margin-left', '100px');
        });

        after(() => {
          Remove.remove(toolbar);
        });

        it('TINY-5955: Activate and check toolbar styles', async () => {
          const editor = hook.editor();
          const header = getHeader(editor);
          await pActiveEditor(editor);
          await pAssertStaticPos(header);
          Assertions.assertStructure('Assert container isn\'t position absolute', ApproxStructure.build((s, str) =>
            s.element('div', {
              styles: {
                position: str.none(),
                top: str.none(),
                left: str.none()
              }
            })
          ), TinyDom.container(editor));
          Assertions.assertStructure('Assert no header width or max-width set', ApproxStructure.build((s, str) =>
            s.element('div', {
              styles: {
                'width': str.none(),
                'max-width': str.none()
              }
            })
          ), header);
          await pDeactivateEditor(editor);
        });
      });

      const contextOrSkipIfDefaultUiMode = uiMode === 'combined' ? context.skip : context;

      contextOrSkipIfDefaultUiMode('Toolbar in a relative div (offsetParent is not body)', () => {
        const hook = TinyHooks.bddSetupFromElement<Editor>({
          ...options,
          ui_mode: uiMode,
        },
        () => setUpRelativeContainer(),
        []);

        setupInitialContent(hook);

        it('TINY-9414: Toolbar shows at the correct initial position in a relative div', async () => {
          const editor = hook.editor();
          const contentArea = TinyDom.contentAreaContainer(editor);
          await pScrollToElementAndActivate(editor, contentArea, ':first-child');
          await pAssertAbsolutePos(editor, 'above', false);
          await pAssertStaticPos(getHeader(editor));
          await pDeactivateEditor(editor);
        });
      });

      contextOrSkipIfDefaultUiMode('Toolbar in a relative div with margin and padding (offsetParent is not body)', () => {
        const hook = TinyHooks.bddSetupFromElement<Editor>({
          ...options,
          ui_mode: uiMode,
        },
        () => setUpRelativeContainer(100, 100),
        []);

        setupInitialContent(hook);

        it('TINY-9414: Toolbar shows at the correct initial position in a relative div with margin and padding', async () => {
          const editor = hook.editor();
          const contentArea = TinyDom.contentAreaContainer(editor);
          await pScrollToElementAndActivate(editor, contentArea, ':first-child');
          await pAssertAbsolutePos(editor, 'above', false);
          await pAssertStaticPos(getHeader(editor));
          await pDeactivateEditor(editor);
        });
      });
    });
  });
});
