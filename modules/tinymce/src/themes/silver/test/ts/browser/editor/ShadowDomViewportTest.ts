import { Keyboard, Keys, Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Css, Height, Insert, Remove, Scroll, SelectorFind, SugarElement, SugarLocation, SugarShadowDom, Width, WindowVisualViewport } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.ShadowDomViewportTest', () => {
  const hook = TinyHooks.bddSetupInShadowRoot<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'mymenubutton',
    setup: (editor: Editor) => {
      editor.ui.registry.addMenuButton('mymenubutton', {
        text: 'Button',
        tooltip: 'Button',
        fetch: (resolve) => {
          const text = Arr.range(1000, Fun.constant('word')).join(' ');
          resolve([
            { type: 'menuitem', text, value: '1', onAction: Fun.noop }
          ]);
        }
      });
    }
  }, []);

  const pOpenButtonMenu = async () => {
    const shadowRoot = hook.shadowRoot();

    Mouse.clickOn(shadowRoot, 'button[aria-label="Button"]');

    return await UiFinder.pWaitForVisible('Waiting for menu to open', shadowRoot, '[role="menu"]');
  };

  const closeMenu = () => {
    Keyboard.activeKeydown(hook.shadowRoot(), Keys.escape());
  };

  it('TINY-6536: sink in shadow dom should be fixed and positioned top, left and be full viewport width', () => {
    const sink = SelectorFind.descendant<HTMLElement>(hook.shadowRoot(), '.tox-silver-sink').getOrDie('Failed to get sink');

    assert.equal(Width.get(sink), WindowVisualViewport.getBounds().width);
    assert.equal(Height.get(sink), 0);
    assert.equal(Css.get(sink, 'position'), 'fixed');
    assert.equal(Css.get(sink, 'top'), '0px');
    assert.equal(Css.get(sink, 'left'), '0px');
  });

  it('TINY-6536: menu should be constrained to viewport width not shadow root width', async () => {
    const shadowRoot = hook.shadowRoot();
    const shadowHost = SugarShadowDom.getShadowHost(shadowRoot);

    Css.set(shadowHost, 'width', '300px');

    const menu = await pOpenButtonMenu();
    assert.isAtMost(Width.get(menu), WindowVisualViewport.getBounds().width, 'Menu width should be within viewport width');
    assert.isAbove(Width.get(menu), 300, 'Menu width should be greater than the editor width');

    Css.remove(shadowHost, 'width');
    closeMenu();
  });

  it('TINY-6536: menu should move when window scrolls', async () => {
    const shadowRoot = hook.shadowRoot();

    const div = SugarElement.fromHtml('<div style="width: 100px; height: 200vh"></div>');
    Insert.prepend(shadowRoot, div);

    Scroll.intoView(SugarElement.fromDom(hook.editor().getContainer()), true);

    const menu = await pOpenButtonMenu();
    const menuYBeforeScroll = SugarLocation.absolute(menu).top;

    window.scrollBy(0, -20);

    const menuYAfterScroll = SugarLocation.absolute(menu).top;

    assert.equal(menuYBeforeScroll - menuYAfterScroll, 20, 'menu should have moved equal to scroll value');

    closeMenu();
    Remove.remove(div);
  });
});
