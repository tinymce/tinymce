import { Cell, Fun } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { SetContentEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Events from '../api/Events';
import * as Options from '../api/Options';

/**
 * This class contains all core logic for the autoresize plugin.
 *
 * @class tinymce.autoresize.Plugin
 * @private
 */

const isFullscreen = (editor: Editor): boolean =>
  editor.plugins.fullscreen && editor.plugins.fullscreen.isFullscreen();

const toggleScrolling = (editor: Editor, state: boolean): void => {
  const body = editor.getBody();
  if (body) {
    body.style.overflowY = state ? '' : 'hidden';
    if (!state) {
      body.scrollTop = 0;
    }
  }
};

const parseCssValueToInt = (dom: DOMUtils, elm: Element, name: string, computed: boolean): number => {
  const value = parseInt(dom.getStyle(elm, name, computed) ?? '', 10);
  // The value maybe be an empty string, so in that case treat it as being 0
  return isNaN(value) ? 0 : value;
};

const shouldScrollIntoView = (trigger: EditorEvent<unknown> | undefined) => {
  // Only scroll the selection into view when we're inserting content. Any other
  // triggers the selection should already be in view and resizing would only
  // extend the content area.
  if (trigger?.type.toLowerCase() === 'setcontent') {
    const setContentEvent = (trigger as EditorEvent<SetContentEvent>);
    return setContentEvent.selection === true || setContentEvent.paste === true;
  } else {
    return false;
  }
};

/**
 * This method gets executed each time the editor needs to resize.
 */
const resize = (editor: Editor, oldSize: Cell<number>, trigger?: EditorEvent<unknown>, getExtraMarginBottom?: () => number): void => {
  const dom = editor.dom;

  const doc = editor.getDoc();
  if (!doc) {
    return;
  }

  if (isFullscreen(editor)) {
    toggleScrolling(editor, true);
    return;
  }

  const docEle = doc.documentElement;
  const resizeBottomMargin = getExtraMarginBottom ? getExtraMarginBottom() : Options.getAutoResizeOverflowPadding(editor);

  const minHeight = Options.getMinHeight(editor) ?? editor.getElement().offsetHeight;
  let resizeHeight = minHeight;

  // Calculate outer height of the doc element using CSS styles
  const marginTop = parseCssValueToInt(dom, docEle, 'margin-top', true);
  const marginBottom = parseCssValueToInt(dom, docEle, 'margin-bottom', true);
  let contentHeight = docEle.offsetHeight + marginTop + marginBottom + resizeBottomMargin;

  // Make sure we have a valid height
  if (contentHeight < 0) {
    contentHeight = 0;
  }

  // Determine the size of the chroming (menubar, toolbar, etc...)
  const containerHeight = editor.getContainer().offsetHeight;
  const contentAreaHeight = editor.getContentAreaContainer().offsetHeight;
  const chromeHeight = containerHeight - contentAreaHeight;

  // Don't make it smaller than the minimum height
  if (contentHeight + chromeHeight > minHeight) {
    resizeHeight = contentHeight + chromeHeight;
  }

  // If a maximum height has been defined don't exceed this height
  const maxHeight = Options.getMaxHeight(editor);
  if (maxHeight && resizeHeight > maxHeight) {
    resizeHeight = maxHeight;
    toggleScrolling(editor, true);
  } else {
    toggleScrolling(editor, false);
  }

  // Resize content element
  if (resizeHeight !== oldSize.get()) {
    const deltaSize = resizeHeight - oldSize.get();
    dom.setStyle(editor.getContainer(), 'height', resizeHeight + 'px');
    oldSize.set(resizeHeight);
    Events.fireResizeEditor(editor);

    // iPadOS has an issue where it won't rerender the body when the iframe is resized
    // however if we reset the scroll position then it re-renders correctly
    if (Env.browser.isSafari() && (Env.os.isMacOS() || Env.os.isiOS())) {
      const win = editor.getWin();
      win.scrollTo(win.pageXOffset, win.pageYOffset);
    }

    // Ensure the selection is in view, as it's potentially out of view after inserting content into the editor
    if (editor.hasFocus() && shouldScrollIntoView(trigger)) {
      editor.selection.scrollIntoView();
    }

    // WebKit doesn't decrease the size of the body element until the iframe gets resized
    // So we need to continue to resize the iframe down until the size gets fixed
    if ((Env.browser.isSafari() || Env.browser.isChromium()) && deltaSize < 0) {
      resize(editor, oldSize, trigger, getExtraMarginBottom);
    }
  }
};

const setup = (editor: Editor, oldSize: Cell<number>): void => {
  let getExtraMarginBottom = () => Options.getAutoResizeBottomMargin(editor);
  let resizeCounter: number;
  let sizeAfterFirstResize: number;

  editor.on('init', (e) => {
    resizeCounter = 0;
    const overflowPadding = Options.getAutoResizeOverflowPadding(editor);
    const dom = editor.dom;

    // Disable height 100% on the root document element otherwise we'll end up resizing indefinitely
    dom.setStyles(editor.getDoc().documentElement, {
      height: 'auto'
    });

    if (Env.browser.isEdge() || Env.browser.isIE()) {
      dom.setStyles(editor.getBody(), {
        'paddingLeft': overflowPadding,
        'paddingRight': overflowPadding,
        // IE & Edge have a min height of 150px by default on the body, so override that
        'min-height': 0
      });
    } else {
      dom.setStyles(editor.getBody(), {
        paddingLeft: overflowPadding,
        paddingRight: overflowPadding
      });
    }

    resize(editor, oldSize, e, getExtraMarginBottom);
    resizeCounter += 1;
  });

  editor.on('NodeChange SetContent keyup FullscreenStateChanged ResizeContent', (e) => {
    if (resizeCounter === 1) {
      sizeAfterFirstResize = editor.getContainer().offsetHeight;
      resize(editor, oldSize, e, getExtraMarginBottom);
      resizeCounter += 1;
    } else if (resizeCounter === 2) {
      // After the first check, this code checks if the editor's container is resized again, if so it means that the resize is in a loop
      // in this case, the CSS is changed to let the document and body adapt to the height of the content
      const isLooping = sizeAfterFirstResize < editor.getContainer().offsetHeight;
      if (isLooping) {
        const dom = editor.dom;
        const doc = editor.getDoc();
        dom.setStyles(doc.documentElement, { 'min-height': 0 });
        dom.setStyles(editor.getBody(), { 'min-height': 'inherit' });
      }
      getExtraMarginBottom = isLooping ? Fun.constant(0) : getExtraMarginBottom;
      resizeCounter += 1;
    } else {
      resize(editor, oldSize, e, getExtraMarginBottom);
    }
  });
};

export {
  setup,
  resize
};
