/**
 * EditorCommands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to add custom editor commands and it contains
 * overrides for native browser commands to address various bugs and issues.
 *
 * @class tinymce.EditorCommands
 */
define(
  'tinymce.core.EditorCommands',
  [
    'tinymce.core.delete.DeleteCommands',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.Env',
    'tinymce.core.InsertContent',
    'tinymce.core.util.Tools'
  ],
  function (DeleteCommands, NodeType, RangeUtils, TreeWalker, Env, InsertContent, Tools) {
    // Added for compression purposes
    var each = Tools.each, extend = Tools.extend;
    var map = Tools.map, inArray = Tools.inArray, explode = Tools.explode;
    var isOldIE = Env.ie && Env.ie < 11;
    var TRUE = true, FALSE = false;

    return function (editor) {
      var dom, selection, formatter,
        commands = { state: {}, exec: {}, value: {} },
        settings = editor.settings,
        bookmark;

      editor.on('PreInit', function () {
        dom = editor.dom;
        selection = editor.selection;
        settings = editor.settings;
        formatter = editor.formatter;
      });

      /**
       * Executes the specified command.
       *
       * @method execCommand
       * @param {String} command Command to execute.
       * @param {Boolean} ui Optional user interface state.
       * @param {Object} value Optional value for command.
       * @param {Object} args Optional extra arguments to the execCommand.
       * @return {Boolean} true/false if the command was found or not.
       */
      function execCommand(command, ui, value, args) {
        var func, customCommand, state = 0;

        if (editor.removed) {
          return;
        }

        if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint)$/.test(command) && (!args || !args.skip_focus)) {
          editor.focus();
        }

        args = editor.fire('BeforeExecCommand', { command: command, ui: ui, value: value });
        if (args.isDefaultPrevented()) {
          return false;
        }

        customCommand = command.toLowerCase();
        if ((func = commands.exec[customCommand])) {
          func(customCommand, ui, value);
          editor.fire('ExecCommand', { command: command, ui: ui, value: value });
          return true;
        }

        // Plugin commands
        each(editor.plugins, function (p) {
          if (p.execCommand && p.execCommand(command, ui, value)) {
            editor.fire('ExecCommand', { command: command, ui: ui, value: value });
            state = true;
            return false;
          }
        });

        if (state) {
          return state;
        }

        // Theme commands
        if (editor.theme && editor.theme.execCommand && editor.theme.execCommand(command, ui, value)) {
          editor.fire('ExecCommand', { command: command, ui: ui, value: value });
          return true;
        }

        // Browser commands
        try {
          state = editor.getDoc().execCommand(command, ui, value);
        } catch (ex) {
          // Ignore old IE errors
        }

        if (state) {
          editor.fire('ExecCommand', { command: command, ui: ui, value: value });
          return true;
        }

        return false;
      }

      /**
       * Queries the current state for a command for example if the current selection is "bold".
       *
       * @method queryCommandState
       * @param {String} command Command to check the state of.
       * @return {Boolean/Number} true/false if the selected contents is bold or not, -1 if it's not found.
       */
      function queryCommandState(command) {
        var func;

        if (editor.quirks.isHidden() || editor.removed) {
          return;
        }

        command = command.toLowerCase();
        if ((func = commands.state[command])) {
          return func(command);
        }

        // Browser commands
        try {
          return editor.getDoc().queryCommandState(command);
        } catch (ex) {
          // Fails sometimes see bug: 1896577
        }

        return false;
      }

      /**
       * Queries the command value for example the current fontsize.
       *
       * @method queryCommandValue
       * @param {String} command Command to check the value of.
       * @return {Object} Command value of false if it's not found.
       */
      function queryCommandValue(command) {
        var func;

        if (editor.quirks.isHidden() || editor.removed) {
          return;
        }

        command = command.toLowerCase();
        if ((func = commands.value[command])) {
          return func(command);
        }

        // Browser commands
        try {
          return editor.getDoc().queryCommandValue(command);
        } catch (ex) {
          // Fails sometimes see bug: 1896577
        }
      }

      /**
       * Adds commands to the command collection.
       *
       * @method addCommands
       * @param {Object} commandList Name/value collection with commands to add, the names can also be comma separated.
       * @param {String} type Optional type to add, defaults to exec. Can be value or state as well.
       */
      function addCommands(commandList, type) {
        type = type || 'exec';

        each(commandList, function (callback, command) {
          each(command.toLowerCase().split(','), function (command) {
            commands[type][command] = callback;
          });
        });
      }

      function addCommand(command, callback, scope) {
        command = command.toLowerCase();
        commands.exec[command] = function (command, ui, value, args) {
          return callback.call(scope || editor, ui, value, args);
        };
      }

      /**
       * Returns true/false if the command is supported or not.
       *
       * @method queryCommandSupported
       * @param {String} command Command that we check support for.
       * @return {Boolean} true/false if the command is supported or not.
       */
      function queryCommandSupported(command) {
        command = command.toLowerCase();

        if (commands.exec[command]) {
          return true;
        }

        // Browser commands
        try {
          return editor.getDoc().queryCommandSupported(command);
        } catch (ex) {
          // Fails sometimes see bug: 1896577
        }

        return false;
      }

      function addQueryStateHandler(command, callback, scope) {
        command = command.toLowerCase();
        commands.state[command] = function () {
          return callback.call(scope || editor);
        };
      }

      function addQueryValueHandler(command, callback, scope) {
        command = command.toLowerCase();
        commands.value[command] = function () {
          return callback.call(scope || editor);
        };
      }

      function hasCustomCommand(command) {
        command = command.toLowerCase();
        return !!commands.exec[command];
      }

      // Expose public methods
      extend(this, {
        execCommand: execCommand,
        queryCommandState: queryCommandState,
        queryCommandValue: queryCommandValue,
        queryCommandSupported: queryCommandSupported,
        addCommands: addCommands,
        addCommand: addCommand,
        addQueryStateHandler: addQueryStateHandler,
        addQueryValueHandler: addQueryValueHandler,
        hasCustomCommand: hasCustomCommand
      });

      // Private methods

      function execNativeCommand(command, ui, value) {
        if (ui === undefined) {
          ui = FALSE;
        }

        if (value === undefined) {
          value = null;
        }

        return editor.getDoc().execCommand(command, ui, value);
      }

      function isFormatMatch(name) {
        return formatter.match(name);
      }

      function toggleFormat(name, value) {
        formatter.toggle(name, value ? { value: value } : undefined);
        editor.nodeChanged();
      }

      function storeSelection(type) {
        bookmark = selection.getBookmark(type);
      }

      function restoreSelection() {
        selection.moveToBookmark(bookmark);
      }

      // Add execCommand overrides
      addCommands({
        // Ignore these, added for compatibility
        'mceResetDesignMode,mceBeginUndoLevel': function () { },

        // Add undo manager logic
        'mceEndUndoLevel,mceAddUndoLevel': function () {
          editor.undoManager.add();
        },

        'Cut,Copy,Paste': function (command) {
          var doc = editor.getDoc(), failed;

          // Try executing the native command
          try {
            execNativeCommand(command);
          } catch (ex) {
            // Command failed
            failed = TRUE;
          }

          // Chrome reports the paste command as supported however older IE:s will return false for cut/paste
          if (command === 'paste' && !doc.queryCommandEnabled(command)) {
            failed = true;
          }

          // Present alert message about clipboard access not being available
          if (failed || !doc.queryCommandSupported(command)) {
            var msg = editor.translate(
              "Your browser doesn't support direct access to the clipboard. " +
              "Please use the Ctrl+X/C/V keyboard shortcuts instead."
            );

            if (Env.mac) {
              msg = msg.replace(/Ctrl\+/g, '\u2318+');
            }

            editor.notificationManager.open({ text: msg, type: 'error' });
          }
        },

        // Override unlink command
        unlink: function () {
          if (selection.isCollapsed()) {
            var elm = editor.dom.getParent(editor.selection.getStart(), 'a');
            if (elm) {
              editor.dom.remove(elm, true);
            }

            return;
          }

          formatter.remove("link");
        },

        // Override justify commands to use the text formatter engine
        'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull,JustifyNone': function (command) {
          var align = command.substring(7);

          if (align == 'full') {
            align = 'justify';
          }

          // Remove all other alignments first
          each('left,center,right,justify'.split(','), function (name) {
            if (align != name) {
              formatter.remove('align' + name);
            }
          });

          if (align != 'none') {
            toggleFormat('align' + align);
          }
        },

        // Override list commands to fix WebKit bug
        'InsertUnorderedList,InsertOrderedList': function (command) {
          var listElm, listParent;

          execNativeCommand(command);

          // WebKit produces lists within block elements so we need to split them
          // we will replace the native list creation logic to custom logic later on
          // TODO: Remove this when the list creation logic is removed
          listElm = dom.getParent(selection.getNode(), 'ol,ul');
          if (listElm) {
            listParent = listElm.parentNode;

            // If list is within a text block then split that block
            if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
              storeSelection();
              dom.split(listParent, listElm);
              restoreSelection();
            }
          }
        },

        // Override commands to use the text formatter engine
        'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': function (command) {
          toggleFormat(command);
        },

        // Override commands to use the text formatter engine
        'ForeColor,HiliteColor,FontName': function (command, ui, value) {
          toggleFormat(command, value);
        },

        FontSize: function (command, ui, value) {
          var fontClasses, fontSizes;

          // Convert font size 1-7 to styles
          if (value >= 1 && value <= 7) {
            fontSizes = explode(settings.font_size_style_values);
            fontClasses = explode(settings.font_size_classes);

            if (fontClasses) {
              value = fontClasses[value - 1] || value;
            } else {
              value = fontSizes[value - 1] || value;
            }
          }

          toggleFormat(command, value);
        },

        RemoveFormat: function (command) {
          formatter.remove(command);
        },

        mceBlockQuote: function () {
          toggleFormat('blockquote');
        },

        FormatBlock: function (command, ui, value) {
          return toggleFormat(value || 'p');
        },

        mceCleanup: function () {
          var bookmark = selection.getBookmark();

          editor.setContent(editor.getContent({ cleanup: TRUE }), { cleanup: TRUE });

          selection.moveToBookmark(bookmark);
        },

        mceRemoveNode: function (command, ui, value) {
          var node = value || selection.getNode();

          // Make sure that the body node isn't removed
          if (node != editor.getBody()) {
            storeSelection();
            editor.dom.remove(node, TRUE);
            restoreSelection();
          }
        },

        mceSelectNodeDepth: function (command, ui, value) {
          var counter = 0;

          dom.getParent(selection.getNode(), function (node) {
            if (node.nodeType == 1 && counter++ == value) {
              selection.select(node);
              return FALSE;
            }
          }, editor.getBody());
        },

        mceSelectNode: function (command, ui, value) {
          selection.select(value);
        },

        mceInsertContent: function (command, ui, value) {
          InsertContent.insertAtCaret(editor, value);
        },

        mceInsertRawHTML: function (command, ui, value) {
          selection.setContent('tiny_mce_marker');
          editor.setContent(
            editor.getContent().replace(/tiny_mce_marker/g, function () {
              return value;
            })
          );
        },

        mceToggleFormat: function (command, ui, value) {
          toggleFormat(value);
        },

        mceSetContent: function (command, ui, value) {
          editor.setContent(value);
        },

        'Indent,Outdent': function (command) {
          var intentValue, indentUnit, value;

          // Setup indent level
          intentValue = settings.indentation;
          indentUnit = /[a-z%]+$/i.exec(intentValue);
          intentValue = parseInt(intentValue, 10);

          if (!queryCommandState('InsertUnorderedList') && !queryCommandState('InsertOrderedList')) {
            // If forced_root_blocks is set to false we don't have a block to indent so lets create a div
            if (!settings.forced_root_block && !dom.getParent(selection.getNode(), dom.isBlock)) {
              formatter.apply('div');
            }

            each(selection.getSelectedBlocks(), function (element) {
              if (dom.getContentEditable(element) === "false") {
                return;
              }

              if (element.nodeName !== "LI") {
                var indentStyleName = editor.getParam('indent_use_margin', false) ? 'margin' : 'padding';
                indentStyleName = element.nodeName === 'TABLE' ? 'margin' : indentStyleName;
                indentStyleName += dom.getStyle(element, 'direction', true) == 'rtl' ? 'Right' : 'Left';

                if (command == 'outdent') {
                  value = Math.max(0, parseInt(element.style[indentStyleName] || 0, 10) - intentValue);
                  dom.setStyle(element, indentStyleName, value ? value + indentUnit : '');
                } else {
                  value = (parseInt(element.style[indentStyleName] || 0, 10) + intentValue) + indentUnit;
                  dom.setStyle(element, indentStyleName, value);
                }
              }
            });
          } else {
            execNativeCommand(command);
          }
        },

        mceRepaint: function () {
        },

        InsertHorizontalRule: function () {
          editor.execCommand('mceInsertContent', false, '<hr />');
        },

        mceToggleVisualAid: function () {
          editor.hasVisual = !editor.hasVisual;
          editor.addVisual();
        },

        mceReplaceContent: function (command, ui, value) {
          editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, selection.getContent({ format: 'text' })));
        },

        mceInsertLink: function (command, ui, value) {
          var anchor;

          if (typeof value == 'string') {
            value = { href: value };
          }

          anchor = dom.getParent(selection.getNode(), 'a');

          // Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
          value.href = value.href.replace(' ', '%20');

          // Remove existing links if there could be child links or that the href isn't specified
          if (!anchor || !value.href) {
            formatter.remove('link');
          }

          // Apply new link to selection
          if (value.href) {
            formatter.apply('link', value, anchor);
          }
        },

        selectAll: function () {
          var root = dom.getRoot(), rng;

          if (selection.getRng().setStart) {
            var editingHost = dom.getParent(selection.getStart(), NodeType.isContentEditableTrue);
            if (editingHost) {
              rng = dom.createRng();
              rng.selectNodeContents(editingHost);
              selection.setRng(rng);
            }
          } else {
            // IE will render it's own root level block elements and sometimes
            // even put font elements in them when the user starts typing. So we need to
            // move the selection to a more suitable element from this:
            // <body>|<p></p></body> to this: <body><p>|</p></body>
            rng = selection.getRng();
            if (!rng.item) {
              rng.moveToElementText(root);
              rng.select();
            }
          }
        },

        "delete": function () {
          DeleteCommands.deleteCommand(editor);
        },

        "forwardDelete": function () {
          DeleteCommands.forwardDeleteCommand(editor);
        },

        mceNewDocument: function () {
          editor.setContent('');
        },

        InsertLineBreak: function (command, ui, value) {
          // We load the current event in from EnterKey.js when appropriate to heed
          // certain event-specific variations such as ctrl-enter in a list
          var evt = value;
          var brElm, extraBr, marker;
          var rng = selection.getRng(true);
          new RangeUtils(dom).normalize(rng);

          var offset = rng.startOffset;
          var container = rng.startContainer;

          // Resolve node index
          if (container.nodeType == 1 && container.hasChildNodes()) {
            var isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

            container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
            if (isAfterLastNodeInContainer && container.nodeType == 3) {
              offset = container.nodeValue.length;
            } else {
              offset = 0;
            }
          }

          var parentBlock = dom.getParent(container, dom.isBlock);
          var parentBlockName = parentBlock ? parentBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5
          var containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;
          var containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

          // Enter inside block contained within a LI then split or insert before/after LI
          var isControlKey = evt && evt.ctrlKey;
          if (containerBlockName == 'LI' && !isControlKey) {
            parentBlock = containerBlock;
            parentBlockName = containerBlockName;
          }

          // Walks the parent block to the right and look for BR elements
          function hasRightSideContent() {
            var walker = new TreeWalker(container, parentBlock), node;
            var nonEmptyElementsMap = editor.schema.getNonEmptyElements();

            while ((node = walker.next())) {
              if (nonEmptyElementsMap[node.nodeName.toLowerCase()] || node.length > 0) {
                return true;
              }
            }
          }

          if (container && container.nodeType == 3 && offset >= container.nodeValue.length) {
            // Insert extra BR element at the end block elements
            if (!isOldIE && !hasRightSideContent()) {
              brElm = dom.create('br');
              rng.insertNode(brElm);
              rng.setStartAfter(brElm);
              rng.setEndAfter(brElm);
              extraBr = true;
            }
          }

          brElm = dom.create('br');
          rng.insertNode(brElm);

          // Rendering modes below IE8 doesn't display BR elements in PRE unless we have a \n before it
          var documentMode = dom.doc.documentMode;
          if (isOldIE && parentBlockName == 'PRE' && (!documentMode || documentMode < 8)) {
            brElm.parentNode.insertBefore(dom.doc.createTextNode('\r'), brElm);
          }

          // Insert temp marker and scroll to that
          marker = dom.create('span', {}, '&nbsp;');
          brElm.parentNode.insertBefore(marker, brElm);
          selection.scrollIntoView(marker);
          dom.remove(marker);

          if (!extraBr) {
            rng.setStartAfter(brElm);
            rng.setEndAfter(brElm);
          } else {
            rng.setStartBefore(brElm);
            rng.setEndBefore(brElm);
          }

          selection.setRng(rng);
          editor.undoManager.add();

          return TRUE;
        }
      });

      // Add queryCommandState overrides
      addCommands({
        // Override justify commands
        'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull': function (command) {
          var name = 'align' + command.substring(7);
          var nodes = selection.isCollapsed() ? [dom.getParent(selection.getNode(), dom.isBlock)] : selection.getSelectedBlocks();
          var matches = map(nodes, function (node) {
            return !!formatter.matchNode(node, name);
          });
          return inArray(matches, TRUE) !== -1;
        },

        'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': function (command) {
          return isFormatMatch(command);
        },

        mceBlockQuote: function () {
          return isFormatMatch('blockquote');
        },

        Outdent: function () {
          var node;

          if (settings.inline_styles) {
            if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
              return TRUE;
            }

            if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
              return TRUE;
            }
          }

          return (
            queryCommandState('InsertUnorderedList') ||
            queryCommandState('InsertOrderedList') ||
            (!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'))
          );
        },

        'InsertUnorderedList,InsertOrderedList': function (command) {
          var list = dom.getParent(selection.getNode(), 'ul,ol');

          return list &&
            (
              command === 'insertunorderedlist' && list.tagName === 'UL' ||
              command === 'insertorderedlist' && list.tagName === 'OL'
            );
        }
      }, 'state');

      // Add queryCommandValue overrides
      addCommands({
        'FontSize,FontName': function (command) {
          var value = 0, parent;

          if ((parent = dom.getParent(selection.getNode(), 'span'))) {
            if (command == 'fontsize') {
              value = parent.style.fontSize;
            } else {
              value = parent.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();
            }
          }

          return value;
        }
      }, 'value');

      // Add undo manager logic
      addCommands({
        Undo: function () {
          editor.undoManager.undo();
        },

        Redo: function () {
          editor.undoManager.redo();
        }
      });
    };
  }
);
