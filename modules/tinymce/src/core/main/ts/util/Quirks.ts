import { Fun, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Options from '../api/Options';
import Delay from '../api/util/Delay';
import { EditorEvent } from '../api/util/EventDispatcher';
import Tools from '../api/util/Tools';
import VK from '../api/util/VK';
import * as CaretContainer from '../caret/CaretContainer';
import * as Empty from '../dom/Empty';
import * as Rtc from '../Rtc';

/**
 * This file includes fixes for various browser quirks it's made to make it easy to add/remove browser specific fixes.
 *
 * @private
 * @class tinymce.util.Quirks
 */

interface Quirks {
  refreshContentEditable (): void;
  isHidden (): boolean;
}

const Quirks = (editor: Editor): Quirks => {
  const each = Tools.each;
  const BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE, dom = editor.dom, selection = editor.selection, parser = editor.parser;
  const browser = Env.browser;
  const isGecko = browser.isFirefox();
  const isWebKit = browser.isChromium() || browser.isSafari();
  const isiOS = Env.deviceType.isiPhone() || Env.deviceType.isiPad();
  const isMac = Env.os.isMacOS() || Env.os.isiOS();

  /**
   * Executes a command with a specific state this can be to enable/disable browser editing features.
   */
  const setEditorCommandState = (cmd: string, state: string | boolean) => {
    try {
      editor.getDoc().execCommand(cmd, false, String(state));
    } catch (ex) {
      // Ignore
    }
  };

  /**
   * Returns true/false if the event is prevented or not.
   *
   * @private
   * @param {Event} e Event object.
   * @return {Boolean} true/false if the event is prevented or not.
   */
  const isDefaultPrevented = (e: EditorEvent<unknown>) => {
    return e.isDefaultPrevented();
  };

  /**
   * Makes sure that the editor body becomes empty when backspace or delete is pressed in empty editors.
   *
   * For example:
   * <p><b>|</b></p>
   *
   * Or:
   * <h1>|</h1>
   *
   * Or:
   * [<h1></h1>]
   */
  const emptyEditorWhenDeleting = () => {
    const serializeRng = (rng: Range) => {
      const body = dom.create('body');
      const contents = rng.cloneContents();
      body.appendChild(contents);
      return selection.serializer.serialize(body, { format: 'html' });
    };

    const allContentsSelected = (rng: Range) => {
      const selection = serializeRng(rng);

      const allRng = dom.createRng();
      allRng.selectNode(editor.getBody());

      const allSelection = serializeRng(allRng);
      return selection === allSelection;
    };

    editor.on('keydown', (e) => {
      const keyCode = e.keyCode;

      // Empty the editor if it's needed for example backspace at <p><b>|</b></p>
      if (!isDefaultPrevented(e) && (keyCode === DELETE || keyCode === BACKSPACE) && editor.selection.isEditable()) {
        const isCollapsed = editor.selection.isCollapsed();
        const body = editor.getBody();

        // Selection is collapsed but the editor isn't empty
        if (isCollapsed && !Empty.isEmpty(SugarElement.fromDom(body))) {
          return;
        }

        // Selection isn't collapsed but not all the contents is selected
        if (!isCollapsed && !allContentsSelected(editor.selection.getRng())) {
          return;
        }

        // Manually empty the editor
        e.preventDefault();
        editor.setContent('');

        if (body.firstChild && dom.isBlock(body.firstChild)) {
          editor.selection.setCursorLocation(body.firstChild, 0);
        } else {
          editor.selection.setCursorLocation(body, 0);
        }

        editor.nodeChanged();
      }
    });
  };

  /**
   * WebKit doesn't select all the nodes in the body when you press Ctrl+A.
   * IE selects more than the contents <body>[<p>a</p>]</body> instead of <body><p>[a]</p]</body> see bug #6438
   * This selects the whole body so that backspace/delete logic will delete everything
   */
  const selectAll = () => {
    editor.shortcuts.add('meta+a', null, 'SelectAll');
  };

  /**
   * It seems that Chrome doesn't place the caret if you click on the documentElement in iframe mode
   * something that is very easy to do by accident so this problem is now more generic than the original issue.
   *
   * Original IME specific issue:
   * WebKit has a weird issue where it some times fails to properly convert keypresses to input method keystrokes.
   * The IME on Mac doesn't initialize when it doesn't fire a proper focus event.
   *
   * This seems to happen when the user manages to click the documentElement element then the window doesn't get proper focus until
   * you enter a character into the editor.
   *
   * See: https://bugs.webkit.org/show_bug.cgi?id=83566
   */
  const documentElementEditingFocus = () => {
    if (!editor.inline) {
      // Needs to be both down/up due to weird rendering bug on Chrome Windows
      dom.bind(editor.getDoc(), 'mousedown mouseup', (e) => {
        let rng;

        if (e.target === editor.getDoc().documentElement) {
          rng = selection.getRng();
          editor.getBody().focus();

          if (e.type === 'mousedown') {
            if (CaretContainer.isCaretContainer(rng.startContainer)) {
              return;
            }

            // Edge case for mousedown, drag select and mousedown again within selection on Chrome Windows to render caret
            selection.placeCaretAt(e.clientX, e.clientY);
          } else {
            selection.setRng(rng);
          }
        }
      });
    }
  };

  /**
   * Backspacing in FireFox/IE from a paragraph into a horizontal rule results in a floating text node because the
   * browser just deletes the paragraph - the browser fails to merge the text node with a horizontal rule so it is
   * left there. TinyMCE sees a floating text node and wraps it in a paragraph on the key up event (ForceBlocks.js
   * addRootBlocks), meaning the action does nothing. With this code, FireFox/IE matche the behaviour of other
   * browsers.
   *
   * It also fixes a bug on Firefox where it's impossible to delete HR elements.
   */
  const removeHrOnBackspace = () => {
    editor.on('keydown', (e) => {
      if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
        // Check if there is any HR elements this is faster since getRng on IE 7 & 8 is slow
        if (!editor.getBody().getElementsByTagName('hr').length) {
          return;
        }

        if (selection.isCollapsed() && selection.getRng().startOffset === 0) {
          const node = selection.getNode();
          const previousSibling = node.previousSibling;

          if (node.nodeName === 'HR') {
            dom.remove(node);
            e.preventDefault();
            return;
          }

          if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === 'hr') {
            dom.remove(previousSibling);
            e.preventDefault();
          }
        }
      }
    });
  };

  /**
   * Firefox 3.x has an issue where the body element won't get proper focus if you click out
   * side it's rectangle.
   */
  const focusBody = () => {
    // Fix for a focus bug in FF 3.x where the body element
    // wouldn't get proper focus if the user clicked on the HTML element
    if (!Range.prototype.getClientRects) { // Detect getClientRects got introduced in FF 4
      editor.on('mousedown', (e) => {
        if (!isDefaultPrevented(e) && e.target.nodeName === 'HTML') {
          const body = editor.getBody();

          // Blur the body it's focused but not correctly focused
          body.blur();

          // Refocus the body after a little while
          Delay.setEditorTimeout(editor, () => {
            body.focus();
          });
        }
      });
    }
  };

  /**
   * WebKit has a bug where it isn't possible to select image, hr or anchor elements
   * by clicking on them so we need to fake that.
   */
  const selectControlElements = () => {
    const visualAidsAnchorClass = Options.getVisualAidsAnchorClass(editor);
    editor.on('click', (e) => {
      const target = e.target;

      // Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
      // WebKit can't even do simple things like selecting an image
      // Needs to be the setBaseAndExtend or it will fail to select floated images
      if (/^(IMG|HR)$/.test(target.nodeName) && dom.isEditable(target)) {
        e.preventDefault();
        editor.selection.select(target);
        editor.nodeChanged();
      }

      if (target.nodeName === 'A' && dom.hasClass(target, visualAidsAnchorClass) && target.childNodes.length === 0 && dom.isEditable(target.parentNode)) {
        e.preventDefault();
        selection.select(target);
      }
    });
  };

  /**
   * Fixes a Gecko bug where the style attribute gets added to the wrong element when deleting between two block elements.
   *
   * Fixes do backspace/delete on this:
   * <p>bla[ck</p><p style="color:red">r]ed</p>
   *
   * Would become:
   * <p>bla|ed</p>
   *
   * Instead of:
   * <p style="color:red">bla|ed</p>
   */
  const removeStylesWhenDeletingAcrossBlockElements = () => {
    const getAttributeApplyFunction = () => {
      const template = dom.getAttribs(selection.getStart().cloneNode(false) as Element);

      return () => {
        const target = selection.getStart();

        if (target !== editor.getBody()) {
          dom.setAttrib(target, 'style', null);

          each(template, (attr: Attr) => {
            target.setAttributeNode(attr.cloneNode(true) as Attr);
          });
        }
      };
    };

    const isSelectionAcrossElements = () => {
      return !selection.isCollapsed() &&
        dom.getParent(selection.getStart(), dom.isBlock) !== dom.getParent(selection.getEnd(), dom.isBlock);
    };

    editor.on('keypress', (e) => {
      let applyAttributes;

      if (!isDefaultPrevented(e) && (e.keyCode === 8 || e.keyCode === 46) && isSelectionAcrossElements()) {
        applyAttributes = getAttributeApplyFunction();
        editor.getDoc().execCommand('delete', false);
        applyAttributes();
        e.preventDefault();
        return false;
      } else {
        return true;
      }
    });

    dom.bind(editor.getDoc(), 'cut', (e) => {
      if (!isDefaultPrevented(e) && isSelectionAcrossElements()) {
        const applyAttributes = getAttributeApplyFunction();

        Delay.setEditorTimeout(editor, () => {
          applyAttributes();
        });
      }
    });
  };

  /**
   * Backspacing into a table behaves differently depending upon browser type.
   * Therefore, disable Backspace when cursor immediately follows a table.
   */
  const disableBackspaceIntoATable = () => {
    editor.on('keydown', (e) => {
      if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
        if (selection.isCollapsed() && selection.getRng().startOffset === 0) {
          const previousSibling = selection.getNode().previousSibling;
          if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === 'table') {
            e.preventDefault();
            return false;
          }
        }
      }
      return true;
    });
  };

  /**
   * Removes a blockquote when backspace is pressed at the beginning of it.
   *
   * For example:
   * <blockquote><p>|x</p></blockquote>
   *
   * Becomes:
   * <p>|x</p>
   */
  const removeBlockQuoteOnBackSpace = () => {
    // Add block quote deletion handler
    editor.on('keydown', (e) => {
      if (isDefaultPrevented(e) || e.keyCode !== VK.BACKSPACE) {
        return;
      }

      let rng = selection.getRng();
      const container = rng.startContainer;
      const offset = rng.startOffset;
      const root = dom.getRoot();
      let parent = container;

      if (!rng.collapsed || offset !== 0) {
        return;
      }

      while (parent.parentNode && parent.parentNode.firstChild === parent && parent.parentNode !== root) {
        parent = parent.parentNode;
      }

      // Is the cursor at the beginning of a blockquote?
      if (parent.nodeName === 'BLOCKQUOTE') {
        // Remove the blockquote
        editor.formatter.toggle('blockquote', undefined, parent);

        // Move the caret to the beginning of container
        rng = dom.createRng();
        rng.setStart(container, 0);
        rng.setEnd(container, 0);
        selection.setRng(rng);
      }
    });
  };

  /**
   * Sets various Gecko editing options on mouse down and before a execCommand to disable inline table editing that is broken etc.
   */
  const setGeckoEditingOptions = () => {
    const setOpts = () => {
      refreshContentEditable();

      setEditorCommandState('StyleWithCSS', false);
      setEditorCommandState('enableInlineTableEditing', false);

      if (!Options.getObjectResizing(editor)) {
        setEditorCommandState('enableObjectResizing', false);
      }
    };

    if (!Options.isReadOnly(editor)) {
      editor.on('BeforeExecCommand mousedown', setOpts);
    }
  };

  /**
   * Fixes a gecko link bug, when a link is placed at the end of block elements there is
   * no way to move the caret behind the link. This fix adds a bogus br element after the link.
   *
   * For example this:
   * <p><b><a href="#">x</a></b></p>
   *
   * Becomes this:
   * <p><b><a href="#">x</a></b><br></p>
   */
  const addBrAfterLastLinks = () => {
    const fixLinks = () => {
      each(dom.select('a:not([data-mce-block])'), (node) => {
        let parentNode: Node | null = node.parentNode;
        const root = dom.getRoot();

        if (parentNode?.lastChild === node) {
          while (parentNode && !dom.isBlock(parentNode)) {
            if (parentNode.parentNode?.lastChild !== parentNode || parentNode === root) {
              return;
            }

            parentNode = parentNode.parentNode;
          }

          dom.add(parentNode, 'br', { 'data-mce-bogus': 1 });
        }
      });
    };

    editor.on('SetContent ExecCommand', (e) => {
      if (e.type === 'setcontent' || e.command === 'mceInsertLink') {
        fixLinks();
      }
    });
  };

  /**
   * WebKit will produce DIV elements here and there by default. But since TinyMCE uses paragraphs by
   * default we want to change that behavior.
   */
  const setDefaultBlockType = () => {
    editor.on('init', () => {
      setEditorCommandState('DefaultParagraphSeparator', Options.getForcedRootBlock(editor));
    });
  };

  const isAllContentSelected = (editor: Editor): boolean => {
    const body = editor.getBody();
    const rng = editor.selection.getRng();
    return rng.startContainer === rng.endContainer && rng.startContainer === body && rng.startOffset === 0 && rng.endOffset === body.childNodes.length;
  };

  /**
   * Fixes selection issues where the caret can be placed between two inline elements like <b>a</b>|<b>b</b>
   * this fix will lean the caret right into the closest inline element.
   */
  const normalizeSelection = () => {
    // Normalize selection for example <b>a</b><i>|a</i> becomes <b>a|</b><i>a</i>
    editor.on('keyup focusin mouseup', (e) => {
      // no point to exclude Ctrl+A, since normalization will still run after Ctrl will be unpressed
      // better exclude any key combinations with the modifiers to avoid double normalization
      // (also addresses TINY-1130)
      // The use of isAllContentSelected addresses TINY-4550
      if (!VK.modifierPressed(e) && !isAllContentSelected(editor)) {
        selection.normalize();
      }
    }, true);
  };

  /**
   * Forces Gecko to render a broken image icon if it fails to load an image.
   */
  const showBrokenImageIcon = () => {
    editor.contentStyles.push(
      'img:-moz-broken {' +
      '-moz-force-broken-image-icon:1;' +
      'min-width:24px;' +
      'min-height:24px' +
      '}'
    );
  };

  /**
   * iOS has a bug where it's impossible to type if the document has a touchstart event
   * bound and the user touches the document while having the on screen keyboard visible.
   *
   * The touch event moves the focus to the parent document while having the caret inside the iframe
   * this fix moves the focus back into the iframe document.
   */
  const restoreFocusOnKeyDown = () => {
    if (!editor.inline) {
      editor.on('keydown', () => {
        if (document.activeElement === document.body) {
          editor.getWin().focus();
        }
      });
    }
  };

  /**
   * IE 11 has an annoying issue where you can't move focus into the editor
   * by clicking on the white area HTML element. We used to be able to fix this with
   * the fixCaretSelectionOfDocumentElementOnIe fix. But since M$ removed the selection
   * object it's not possible anymore. So we need to hack in a ungly CSS to force the
   * body to be at least 150px. If the user clicks the HTML element out side this 150px region
   * we simply move the focus into the first paragraph. Not ideal since you loose the
   * positioning of the caret but goot enough for most cases.
   */
  const bodyHeight = () => {
    if (!editor.inline) {
      editor.contentStyles.push('body {min-height: 150px}');
      editor.on('click', (e) => {
        let rng;

        if (e.target.nodeName === 'HTML') {
          // Need to store away non collapsed ranges since the focus call will mess that up see #7382
          rng = editor.selection.getRng();
          editor.getBody().focus();
          editor.selection.setRng(rng);
          editor.selection.normalize();
          editor.nodeChanged();
        }
      });
    }
  };

  /**
   * Firefox on Mac OS will move the browser back to the previous page if you press CMD+Left arrow.
   * You might then loose all your work so we need to block that behavior and replace it with our own.
   */
  const blockCmdArrowNavigation = () => {
    if (isMac) {
      editor.on('keydown', (e) => {
        if (VK.metaKeyPressed(e) && !e.shiftKey && (e.keyCode === 37 || e.keyCode === 39)) {
          e.preventDefault();
          // The modify component isn't part of the standard spec, so we need to add the type here
          const selection = editor.selection.getSel() as Selection & { modify: Function };
          selection.modify('move', e.keyCode === 37 ? 'backward' : 'forward', 'lineboundary');
        }
      });
    }
  };

  /**
   * iOS 7.1 introduced two new bugs:
   * 1) It's possible to open links within a contentEditable area by clicking on them.
   * 2) If you hold down the finger it will display the link/image touch callout menu.
   */
  const tapLinksAndImages = () => {
    editor.on('click', (e) => {
      let elm = e.target;

      do {
        if (elm.tagName === 'A') {
          e.preventDefault();
          return;
        }
      } while ((elm = elm.parentNode));
    });

    editor.contentStyles.push('.mce-content-body {-webkit-touch-callout: none}');
  };

  /**
   * iOS Safari and possible other browsers have a bug where it won't fire
   * a click event when a contentEditable is focused. This function fakes click events
   * by using touchstart/touchend and measuring the time and distance travelled.
   */
  /*
  function touchClickEvent() {
    editor.on('touchstart', function(e) {
      var elm, time, startTouch, changedTouches;

      elm = e.target;
      time = new Date().getTime();
      changedTouches = e.changedTouches;

      if (!changedTouches || changedTouches.length > 1) {
        return;
      }

      startTouch = changedTouches[0];

      editor.once('touchend', function(e) {
        var endTouch = e.changedTouches[0], args;

        if (new Date().getTime() - time > 500) {
          return;
        }

        if (Math.abs(startTouch.clientX - endTouch.clientX) > 5) {
          return;
        }

        if (Math.abs(startTouch.clientY - endTouch.clientY) > 5) {
          return;
        }

        args = {
          target: elm
        };

        each('pageX pageY clientX clientY screenX screenY'.split(' '), function(key) {
          args[key] = endTouch[key];
        });

        args = editor.dispatch('click', args);

        if (!args.isDefaultPrevented()) {
          // iOS WebKit can't place the caret properly once
          // you bind touch events so we need to do this manually
          // TODO: Expand to the closest word? Touble tap still works.
          editor.selection.placeCaretAt(endTouch.clientX, endTouch.clientY);
          editor.nodeChanged();
        }
      });
    });
  }
  */

  /**
   * WebKit has a bug where it will allow forms to be submitted if they are inside a contentEditable element.
   * For example this: <form><button></form>
   */
  const blockFormSubmitInsideEditor = () => {
    editor.on('init', () => {
      editor.dom.bind(editor.getBody(), 'submit', (e) => {
        e.preventDefault();
      });
    });
  };

  /**
   * Sometimes WebKit/Blink generates BR elements with the Apple-interchange-newline class.
   *
   * Scenario:
   *  1) Create a table 2x2.
   *  2) Select and copy cells A2-B2.
   *  3) Paste and it will add BR element to table cell.
   */
  const removeAppleInterchangeBrs = () => {
    parser.addNodeFilter('br', (nodes) => {
      let i = nodes.length;

      while (i--) {
        if (nodes[i].attr('class') === 'Apple-interchange-newline') {
          nodes[i].remove();
        }
      }
    });
  };

  // No-op since Mozilla seems to have fixed the caret repaint issues
  const refreshContentEditable = Fun.noop;

  const isHidden = (): boolean => {
    if (!isGecko || editor.removed) {
      return false;
    }

    // Weird, wheres that cursor selection?
    const sel = editor.selection.getSel();
    return (!sel || !sel.rangeCount || sel.rangeCount === 0);
  };

  const setupRtc = () => {
    if (isWebKit) {
      documentElementEditingFocus();
      selectControlElements();
      blockFormSubmitInsideEditor();
      selectAll();

      if (isiOS) {
        restoreFocusOnKeyDown();
        bodyHeight();
        tapLinksAndImages();
      }
    }

    if (isGecko) {
      focusBody();
      setGeckoEditingOptions();
      showBrokenImageIcon();
      blockCmdArrowNavigation();
    }
  };

  const dropDragEndEvent = () => {
    editor.on('drop', (event) => {
      const data = event.dataTransfer?.getData('text/html');
      if (Type.isString(data) && /^<img[^>]*>$/.test(data)) {
        editor.dispatch('dragend', new window.DragEvent('dragend', event));
      }
    });
  };

  const setup = () => {
    // All browsers
    removeBlockQuoteOnBackSpace();
    emptyEditorWhenDeleting();

    // Windows phone will return a range like [body, 0] on mousedown so
    // it will always normalize to the wrong location
    if (!Env.windowsPhone) {
      normalizeSelection();
    }

    // WebKit
    if (isWebKit) {
      documentElementEditingFocus();
      selectControlElements();
      setDefaultBlockType();
      blockFormSubmitInsideEditor();
      disableBackspaceIntoATable();
      removeAppleInterchangeBrs();

      // touchClickEvent();

      // iOS
      if (isiOS) {
        restoreFocusOnKeyDown();
        bodyHeight();
        tapLinksAndImages();
      } else {
        selectAll();
      }
    }

    // Gecko
    if (isGecko) {
      removeHrOnBackspace();
      focusBody();
      removeStylesWhenDeletingAcrossBlockElements();
      setGeckoEditingOptions();
      addBrAfterLastLinks();
      showBrokenImageIcon();
      blockCmdArrowNavigation();
      disableBackspaceIntoATable();
      dropDragEndEvent();
    }
  };

  if (Rtc.isRtc(editor)) {
    setupRtc();
  } else {
    setup();
  }

  return {
    refreshContentEditable,
    isHidden
  };
};

export default Quirks;
