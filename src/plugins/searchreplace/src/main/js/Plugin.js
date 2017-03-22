/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint smarttabs:true, undef:true, unused:true, latedef:true, curly:true, bitwise:true */
/*eslint no-labels:0, no-constant-condition: 0 */

/**
 * This class contains all core logic for the searchreplace plugin.
 *
 * @class tinymce.searchreplace.Plugin
 * @private
 */
define(
  'tinymce.plugins.searchreplace.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.util.Tools',
    'tinymce.plugins.searchreplace.core.FindReplaceText'
  ],
  function (PluginManager, Tools, FindReplaceText) {
    function Plugin(editor) {
      var self = this, currentIndex = -1;

      function showDialog() {
        var last = {}, selectedText;

        selectedText = Tools.trim(editor.selection.getContent({ format: 'text' }));

        function updateButtonStates() {
          win.statusbar.find('#next').disabled(!findSpansByIndex(currentIndex + 1).length);
          win.statusbar.find('#prev').disabled(!findSpansByIndex(currentIndex - 1).length);
        }

        function notFoundAlert() {
          editor.windowManager.alert('Could not find the specified string.', function () {
            win.find('#find')[0].focus();
          });
        }

        var win = editor.windowManager.open({
          layout: "flex",
          pack: "center",
          align: "center",
          onClose: function () {
            editor.focus();
            self.done();
          },
          onSubmit: function (e) {
            var count, caseState, text, wholeWord;

            e.preventDefault();

            caseState = win.find('#case').checked();
            wholeWord = win.find('#words').checked();

            text = win.find('#find').value();
            if (!text.length) {
              self.done(false);
              win.statusbar.items().slice(1).disabled(true);
              return;
            }

            if (last.text == text && last.caseState == caseState && last.wholeWord == wholeWord) {
              if (findSpansByIndex(currentIndex + 1).length === 0) {
                notFoundAlert();
                return;
              }

              self.next();
              updateButtonStates();
              return;
            }

            count = self.find(text, caseState, wholeWord);
            if (!count) {
              notFoundAlert();
            }

            win.statusbar.items().slice(1).disabled(count === 0);
            updateButtonStates();

            last = {
              text: text,
              caseState: caseState,
              wholeWord: wholeWord
            };
          },
          buttons: [
            {
              text: "Find", subtype: 'primary', onclick: function () {
                win.submit();
              }
            },
            {
              text: "Replace", disabled: true, onclick: function () {
                if (!self.replace(win.find('#replace').value())) {
                  win.statusbar.items().slice(1).disabled(true);
                  currentIndex = -1;
                  last = {};
                }
              }
            },
            {
              text: "Replace all", disabled: true, onclick: function () {
                self.replace(win.find('#replace').value(), true, true);
                win.statusbar.items().slice(1).disabled(true);
                last = {};
              }
            },
            { type: "spacer", flex: 1 },
            {
              text: "Prev", name: 'prev', disabled: true, onclick: function () {
                self.prev();
                updateButtonStates();
              }
            },
            {
              text: "Next", name: 'next', disabled: true, onclick: function () {
                self.next();
                updateButtonStates();
              }
            }
          ],
          title: "Find and replace",
          items: {
            type: "form",
            padding: 20,
            labelGap: 30,
            spacing: 10,
            items: [
              { type: 'textbox', name: 'find', size: 40, label: 'Find', value: selectedText },
              { type: 'textbox', name: 'replace', size: 40, label: 'Replace with' },
              { type: 'checkbox', name: 'case', text: 'Match case', label: ' ' },
              { type: 'checkbox', name: 'words', text: 'Whole words', label: ' ' }
            ]
          }
        });
      }

      self.init = function (ed) {
        ed.addMenuItem('searchreplace', {
          text: 'Find and replace',
          shortcut: 'Meta+F',
          onclick: showDialog,
          separator: 'before',
          context: 'edit'
        });

        ed.addButton('searchreplace', {
          tooltip: 'Find and replace',
          shortcut: 'Meta+F',
          onclick: showDialog
        });

        ed.addCommand("SearchReplace", showDialog);
        ed.shortcuts.add('Meta+F', '', showDialog);
      };

      function getElmIndex(elm) {
        var value = elm.getAttribute('data-mce-index');

        if (typeof value == "number") {
          return "" + value;
        }

        return value;
      }

      function markAllMatches(regex) {
        var node, marker;

        marker = editor.dom.create('span', {
          "data-mce-bogus": 1
        });

        marker.className = 'mce-match-marker'; // IE 7 adds class="mce-match-marker" and class=mce-match-marker
        node = editor.getBody();

        self.done(false);

        return FindReplaceText.findAndReplaceDOMText(regex, node, marker, false, editor.schema);
      }

      function unwrap(node) {
        var parentNode = node.parentNode;

        if (node.firstChild) {
          parentNode.insertBefore(node.firstChild, node);
        }

        node.parentNode.removeChild(node);
      }

      function findSpansByIndex(index) {
        var nodes, spans = [];

        nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
        if (nodes.length) {
          for (var i = 0; i < nodes.length; i++) {
            var nodeIndex = getElmIndex(nodes[i]);

            if (nodeIndex === null || !nodeIndex.length) {
              continue;
            }

            if (nodeIndex === index.toString()) {
              spans.push(nodes[i]);
            }
          }
        }

        return spans;
      }

      function moveSelection(forward) {
        var testIndex = currentIndex, dom = editor.dom;

        forward = forward !== false;

        if (forward) {
          testIndex++;
        } else {
          testIndex--;
        }

        dom.removeClass(findSpansByIndex(currentIndex), 'mce-match-marker-selected');

        var spans = findSpansByIndex(testIndex);
        if (spans.length) {
          dom.addClass(findSpansByIndex(testIndex), 'mce-match-marker-selected');
          editor.selection.scrollIntoView(spans[0]);
          return testIndex;
        }

        return -1;
      }

      function removeNode(node) {
        var dom = editor.dom, parent = node.parentNode;

        dom.remove(node);

        if (dom.isEmpty(parent)) {
          dom.remove(parent);
        }
      }

      self.find = function (text, matchCase, wholeWord) {
        text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        text = wholeWord ? '\\b' + text + '\\b' : text;

        var count = markAllMatches(new RegExp(text, matchCase ? 'g' : 'gi'));

        if (count) {
          currentIndex = -1;
          currentIndex = moveSelection(true);
        }

        return count;
      };

      self.next = function () {
        var index = moveSelection(true);

        if (index !== -1) {
          currentIndex = index;
        }
      };

      self.prev = function () {
        var index = moveSelection(false);

        if (index !== -1) {
          currentIndex = index;
        }
      };

      function isMatchSpan(node) {
        var matchIndex = getElmIndex(node);

        return matchIndex !== null && matchIndex.length > 0;
      }

      self.replace = function (text, forward, all) {
        var i, nodes, node, matchIndex, currentMatchIndex, nextIndex = currentIndex, hasMore;

        forward = forward !== false;

        node = editor.getBody();
        nodes = Tools.grep(Tools.toArray(node.getElementsByTagName('span')), isMatchSpan);
        for (i = 0; i < nodes.length; i++) {
          var nodeIndex = getElmIndex(nodes[i]);

          matchIndex = currentMatchIndex = parseInt(nodeIndex, 10);
          if (all || matchIndex === currentIndex) {
            if (text.length) {
              nodes[i].firstChild.nodeValue = text;
              unwrap(nodes[i]);
            } else {
              removeNode(nodes[i]);
            }

            while (nodes[++i]) {
              matchIndex = parseInt(getElmIndex(nodes[i]), 10);

              if (matchIndex === currentMatchIndex) {
                removeNode(nodes[i]);
              } else {
                i--;
                break;
              }
            }

            if (forward) {
              nextIndex--;
            }
          } else if (currentMatchIndex > currentIndex) {
            nodes[i].setAttribute('data-mce-index', currentMatchIndex - 1);
          }
        }

        editor.undoManager.add();
        currentIndex = nextIndex;

        if (forward) {
          hasMore = findSpansByIndex(nextIndex + 1).length > 0;
          self.next();
        } else {
          hasMore = findSpansByIndex(nextIndex - 1).length > 0;
          self.prev();
        }

        return !all && hasMore;
      };

      self.done = function (keepEditorSelection) {
        var i, nodes, startContainer, endContainer;

        nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
        for (i = 0; i < nodes.length; i++) {
          var nodeIndex = getElmIndex(nodes[i]);

          if (nodeIndex !== null && nodeIndex.length) {
            if (nodeIndex === currentIndex.toString()) {
              if (!startContainer) {
                startContainer = nodes[i].firstChild;
              }

              endContainer = nodes[i].firstChild;
            }

            unwrap(nodes[i]);
          }
        }

        if (startContainer && endContainer) {
          var rng = editor.dom.createRng();
          rng.setStart(startContainer, 0);
          rng.setEnd(endContainer, endContainer.data.length);

          if (keepEditorSelection !== false) {
            editor.selection.setRng(rng);
          }

          return rng;
        }
      };
    }

    PluginManager.add('searchreplace', Plugin);

    return function () { };
  }
);