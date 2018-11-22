/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from '../api/Env';
import * as CaretContainer from '../caret/CaretContainer';
import CaretRangeFromPoint from '../selection/CaretRangeFromPoint';
import Delay from '../api/util/Delay';
import Tools from '../api/util/Tools';
import VK from '../api/util/VK';
import { Selection } from '../api/dom/Selection';
import { Range, document } from '@ephox/dom-globals';

declare const escape: any;
declare const unescape: any;

/**
 * This file includes fixes for various browser quirks it's made to make it easy to add/remove browser specific fixes.
 *
 * @private
 * @class tinymce.util.Quirks
 */

export default function (editor) {
  const each = Tools.each;
  const BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE, dom = editor.dom, selection: Selection = editor.selection,
    settings = editor.settings, parser = editor.parser;
  const isGecko = Env.gecko, isIE = Env.ie, isWebKit = Env.webkit;
  const mceInternalUrlPrefix = 'data:text/mce-internal,';
  const mceInternalDataType = isIE ? 'Text' : 'URL';

  /**
   * Executes a command with a specific state this can be to enable/disable browser editing features.
   */
  const setEditorCommandState = function (cmd, state) {
    try {
      editor.getDoc().execCommand(cmd, false, state);
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
  const isDefaultPrevented = function (e) {
    return e.isDefaultPrevented();
  };

  /**
   * Sets Text/URL data on the event's dataTransfer object to a special data:text/mce-internal url.
   * This is to workaround the inability to set custom contentType on IE and Safari.
   * The editor's selected content is encoded into this url so drag and drop between editors will work.
   *
   * @private
   * @param {DragEvent} e Event object
   */
  const setMceInternalContent = function (e) {
    let selectionHtml, internalContent;

    if (e.dataTransfer) {
      if (editor.selection.isCollapsed() && e.target.tagName === 'IMG') {
        selection.select(e.target);
      }

      selectionHtml = editor.selection.getContent();

      // Safari/IE doesn't support custom dataTransfer items so we can only use URL and Text
      if (selectionHtml.length > 0) {
        internalContent = mceInternalUrlPrefix + escape(editor.id) + ',' + escape(selectionHtml);
        e.dataTransfer.setData(mceInternalDataType, internalContent);
      }
    }
  };

  /**
   * Gets content of special data:text/mce-internal url on the event's dataTransfer object.
   * This is to workaround the inability to set custom contentType on IE and Safari.
   * The editor's selected content is encoded into this url so drag and drop between editors will work.
   *
   * @private
   * @param {DragEvent} e Event object
   * @returns {String} mce-internal content
   */
  const getMceInternalContent = function (e) {
    let internalContent;

    if (e.dataTransfer) {
      internalContent = e.dataTransfer.getData(mceInternalDataType);

      if (internalContent && internalContent.indexOf(mceInternalUrlPrefix) >= 0) {
        internalContent = internalContent.substr(mceInternalUrlPrefix.length).split(',');

        return {
          id: unescape(internalContent[0]),
          html: unescape(internalContent[1])
        };
      }
    }

    return null;
  };

  /**
   * Inserts contents using the paste clipboard command if it's available if it isn't it will fallback
   * to the core command.
   *
   * @private
   * @param {String} content Content to insert at selection.
   * @param {Boolean} internal State if the paste is to be considered internal or external.
   */
  const insertClipboardContents = function (content, internal) {
    if (editor.queryCommandSupported('mceInsertClipboardContent')) {
      editor.execCommand('mceInsertClipboardContent', false, { content, internal });
    } else {
      editor.execCommand('mceInsertContent', false, content);
    }
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
  const emptyEditorWhenDeleting = function () {
    const serializeRng = function (rng) {
      const body = dom.create('body');
      const contents = rng.cloneContents();
      body.appendChild(contents);
      return selection.serializer.serialize(body, { format: 'html' });
    };

    const allContentsSelected = function (rng) {
      const selection = serializeRng(rng);

      const allRng = dom.createRng();
      allRng.selectNode(editor.getBody());

      const allSelection = serializeRng(allRng);
      return selection === allSelection;
    };

    editor.on('keydown', function (e) {
      const keyCode = e.keyCode;
      let isCollapsed, body;

      // Empty the editor if it's needed for example backspace at <p><b>|</b></p>
      if (!isDefaultPrevented(e) && (keyCode === DELETE || keyCode === BACKSPACE)) {
        isCollapsed = editor.selection.isCollapsed();
        body = editor.getBody();

        // Selection is collapsed but the editor isn't empty
        if (isCollapsed && !dom.isEmpty(body)) {
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
  const selectAll = function () {
    editor.shortcuts.add('meta+a', null, 'SelectAll');
  };

  /**
   * WebKit has a weird issue where it some times fails to properly convert keypresses to input method keystrokes.
   * The IME on Mac doesn't initialize when it doesn't fire a proper focus event.
   *
   * This seems to happen when the user manages to click the documentElement element then the window doesn't get proper focus until
   * you enter a character into the editor.
   *
   * It also happens when the first focus in made to the body.
   *
   * See: https://bugs.webkit.org/show_bug.cgi?id=83566
   */
  const inputMethodFocus = function () {
    if (!editor.settings.content_editable) {
      // Case 1 IME doesn't initialize if you focus the document
      // Disabled since it was interferring with the cE=false logic
      // Also coultn't reproduce the issue on Safari 9
      /*dom.bind(editor.getDoc(), 'focusin', function() {
        selection.setRng(selection.getRng());
      });*/

      // Case 2 IME doesn't initialize if you click the documentElement it also doesn't properly fire the focusin event
      // Needs to be both down/up due to weird rendering bug on Chrome Windows
      dom.bind(editor.getDoc(), 'mousedown mouseup', function (e) {
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
  const removeHrOnBackspace = function () {
    editor.on('keydown', function (e) {
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
  const focusBody = function () {
    // Fix for a focus bug in FF 3.x where the body element
    // wouldn't get proper focus if the user clicked on the HTML element
    if (!Range.prototype.getClientRects) { // Detect getClientRects got introduced in FF 4
      editor.on('mousedown', function (e) {
        if (!isDefaultPrevented(e) && e.target.nodeName === 'HTML') {
          const body = editor.getBody();

          // Blur the body it's focused but not correctly focused
          body.blur();

          // Refocus the body after a little while
          Delay.setEditorTimeout(editor, function () {
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
  const selectControlElements = function () {
    editor.on('click', function (e) {
      const target = e.target;

      // Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
      // WebKit can't even do simple things like selecting an image
      // Needs to be the setBaseAndExtend or it will fail to select floated images
      if (/^(IMG|HR)$/.test(target.nodeName) && dom.getContentEditableParent(target) !== 'false') {
        e.preventDefault();
        editor.selection.select(target);
        editor.nodeChanged();
      }

      if (target.nodeName === 'A' && dom.hasClass(target, 'mce-item-anchor')) {
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
  const removeStylesWhenDeletingAcrossBlockElements = function () {
    const getAttributeApplyFunction = function () {
      const template = dom.getAttribs(selection.getStart().cloneNode(false));

      return function () {
        const target = selection.getStart();

        if (target !== editor.getBody()) {
          dom.setAttrib(target, 'style', null);

          each(template, function (attr) {
            target.setAttributeNode(attr.cloneNode(true));
          });
        }
      };
    };

    const isSelectionAcrossElements = function () {
      return !selection.isCollapsed() &&
        dom.getParent(selection.getStart(), dom.isBlock) !== dom.getParent(selection.getEnd(), dom.isBlock);
    };

    editor.on('keypress', function (e) {
      let applyAttributes;

      if (!isDefaultPrevented(e) && (e.keyCode === 8 || e.keyCode === 46) && isSelectionAcrossElements()) {
        applyAttributes = getAttributeApplyFunction();
        editor.getDoc().execCommand('delete', false, null);
        applyAttributes();
        e.preventDefault();
        return false;
      }
    });

    dom.bind(editor.getDoc(), 'cut', function (e) {
      let applyAttributes;

      if (!isDefaultPrevented(e) && isSelectionAcrossElements()) {
        applyAttributes = getAttributeApplyFunction();

        Delay.setEditorTimeout(editor, function () {
          applyAttributes();
        });
      }
    });
  };

  /**
   * Backspacing into a table behaves differently depending upon browser type.
   * Therefore, disable Backspace when cursor immediately follows a table.
   */
  const disableBackspaceIntoATable = function () {
    editor.on('keydown', function (e) {
      if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
        if (selection.isCollapsed() && selection.getRng().startOffset === 0) {
          const previousSibling = selection.getNode().previousSibling;
          if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === 'table') {
            e.preventDefault();
            return false;
          }
        }
      }
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
  const removeBlockQuoteOnBackSpace = function () {
    // Add block quote deletion handler
    editor.on('keydown', function (e) {
      let rng, container, offset, root, parent;

      if (isDefaultPrevented(e) || e.keyCode !== VK.BACKSPACE) {
        return;
      }

      rng = selection.getRng();
      container = rng.startContainer;
      offset = rng.startOffset;
      root = dom.getRoot();
      parent = container;

      if (!rng.collapsed || offset !== 0) {
        return;
      }

      while (parent && parent.parentNode && parent.parentNode.firstChild === parent && parent.parentNode !== root) {
        parent = parent.parentNode;
      }

      // Is the cursor at the beginning of a blockquote?
      if (parent.tagName === 'BLOCKQUOTE') {
        // Remove the blockquote
        editor.formatter.toggle('blockquote', null, parent);

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
  const setGeckoEditingOptions = function () {
    const setOpts = function () {
      refreshContentEditable();

      setEditorCommandState('StyleWithCSS', false);
      setEditorCommandState('enableInlineTableEditing', false);

      if (!settings.object_resizing) {
        setEditorCommandState('enableObjectResizing', false);
      }
    };

    if (!settings.readonly) {
      editor.on('BeforeExecCommand MouseDown', setOpts);
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
  const addBrAfterLastLinks = function () {
    const fixLinks = function () {
      each(dom.select('a'), function (node) {
        let parentNode = node.parentNode;
        const root = dom.getRoot();

        if (parentNode.lastChild === node) {
          while (parentNode && !dom.isBlock(parentNode)) {
            if (parentNode.parentNode.lastChild !== parentNode || parentNode === root) {
              return;
            }

            parentNode = parentNode.parentNode;
          }

          dom.add(parentNode, 'br', { 'data-mce-bogus': 1 });
        }
      });
    };

    editor.on('SetContent ExecCommand', function (e) {
      if (e.type === 'setcontent' || e.command === 'mceInsertLink') {
        fixLinks();
      }
    });
  };

  /**
   * WebKit will produce DIV elements here and there by default. But since TinyMCE uses paragraphs by
   * default we want to change that behavior.
   */
  const setDefaultBlockType = function () {
    if (settings.forced_root_block) {
      editor.on('init', function () {
        setEditorCommandState('DefaultParagraphSeparator', settings.forced_root_block);
      });
    }
  };

  /**
   * Fixes selection issues where the caret can be placed between two inline elements like <b>a</b>|<b>b</b>
   * this fix will lean the caret right into the closest inline element.
   */
  const normalizeSelection = function () {
    // Normalize selection for example <b>a</b><i>|a</i> becomes <b>a|</b><i>a</i>
    editor.on('keyup focusin mouseup', function (e) {
      // no point to exclude Ctrl+A, since normalization will still run after Ctrl will be unpressed
      // better exclude any key combinations with the modifiers to avoid double normalization
      // (also addresses TINY-1130)
      if (!VK.modifierPressed(e)) {
        selection.normalize();
      }
    }, true);
  };

  /**
   * Forces Gecko to render a broken image icon if it fails to load an image.
   */
  const showBrokenImageIcon = function () {
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
  const restoreFocusOnKeyDown = function () {
    if (!editor.inline) {
      editor.on('keydown', function () {
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
  const bodyHeight = function () {
    if (!editor.inline) {
      editor.contentStyles.push('body {min-height: 150px}');
      editor.on('click', function (e) {
        let rng;

        if (e.target.nodeName === 'HTML') {
          // Edge seems to only need focus if we set the range
          // the caret will become invisible and moved out of the iframe!!
          if (Env.ie > 11) {
            editor.getBody().focus();
            return;
          }

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
  const blockCmdArrowNavigation = function () {
    if (Env.mac) {
      editor.on('keydown', function (e) {
        if (VK.metaKeyPressed(e) && !e.shiftKey && (e.keyCode === 37 || e.keyCode === 39)) {
          e.preventDefault();
          editor.selection.getSel().modify('move', e.keyCode === 37 ? 'backward' : 'forward', 'lineboundary');
        }
      });
    }
  };

  /**
   * Disables the autolinking in IE 9+ this is then re-enabled by the autolink plugin.
   */
  const disableAutoUrlDetect = function () {
    setEditorCommandState('AutoUrlDetect', false);
  };

  /**
   * iOS 7.1 introduced two new bugs:
   * 1) It's possible to open links within a contentEditable area by clicking on them.
   * 2) If you hold down the finger it will display the link/image touch callout menu.
   */
  const tapLinksAndImages = function () {
    editor.on('click', function (e) {
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

        args = editor.fire('click', args);

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
  const blockFormSubmitInsideEditor = function () {
    editor.on('init', function () {
      editor.dom.bind(editor.getBody(), 'submit', function (e) {
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
  const removeAppleInterchangeBrs = function () {
    parser.addNodeFilter('br', function (nodes) {
      let i = nodes.length;

      while (i--) {
        if (nodes[i].attr('class') === 'Apple-interchange-newline') {
          nodes[i].remove();
        }
      }
    });
  };

  /**
   * IE cannot set custom contentType's on drag events, and also does not properly drag/drop between
   * editors. This uses a special data:text/mce-internal URL to pass data when drag/drop between editors.
   */
  const ieInternalDragAndDrop = function () {
    editor.on('dragstart', function (e) {
      setMceInternalContent(e);
    });

    editor.on('drop', function (e) {
      if (!isDefaultPrevented(e)) {
        const internalContent = getMceInternalContent(e);

        if (internalContent && internalContent.id !== editor.id) {
          e.preventDefault();

          const rng = CaretRangeFromPoint.fromPoint(e.x, e.y, editor.getDoc());
          selection.setRng(rng);
          insertClipboardContents(internalContent.html, true);
        }
      }
    });
  };

  const refreshContentEditable = function () {
    // No-op since Mozilla seems to have fixed the caret repaint issues
  };

  const isHidden = function () {
    let sel;

    if (!isGecko || editor.removed) {
      return 0;
    }

    // Weird, wheres that cursor selection?
    sel = editor.selection.getSel();
    return (!sel || !sel.rangeCount || sel.rangeCount === 0);
  };

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
    inputMethodFocus();
    selectControlElements();
    setDefaultBlockType();
    blockFormSubmitInsideEditor();
    disableBackspaceIntoATable();
    removeAppleInterchangeBrs();

    // touchClickEvent();

    // iOS
    if (Env.iOS) {
      restoreFocusOnKeyDown();
      bodyHeight();
      tapLinksAndImages();
    } else {
      selectAll();
    }
  }

  if (Env.ie >= 11) {
    bodyHeight();
    disableBackspaceIntoATable();
  }

  if (Env.ie) {
    selectAll();
    disableAutoUrlDetect();
    ieInternalDragAndDrop();
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
  }

  return {
    refreshContentEditable,
    isHidden
  };
}