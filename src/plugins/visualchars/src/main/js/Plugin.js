/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the code plugin.
 *
 * @class tinymce.visualchars.Plugin
 * @private
 */
define(
  'tinymce.plugins.visualchars.Plugin',

  [
    'global!tinymce.PluginManager',
    'global!tinymce.dom.TreeWalker',
    'global!tinymce.util.Delay',
    'ephox.katamari.api.Arr'
  ],

  function (PluginManager, TreeWalker, Delay, Arr) {
    var charMap = {
      '\u00a0': 'nbsp',
      '\u00ad': 'shy'
    };

    var charMapToRegExp = function (charMap) {
      var key, regExp = '';

      for (key in charMap) {
        regExp += key;
      }

      return new RegExp('[' + regExp + ']');
    };

    var wrapCharWithSpan = function (charMap, value) {
      return '<span data-mce-bogus="1" class="mce-' + charMap[value] + '">' + value + '</span>';
    };

    var isTextNodeMatchingRegExp = function (node, regExp) {
      return node && node.nodeType === 3 && node.nodeValue !== undefined && regExp.test(node.nodeValue);
    };

    var getNodeList = function (regExp, rootElm) {
      var walker = new TreeWalker(rootElm);
      var nodeList = [];

      do {
        if (isTextNodeMatchingRegExp(walker.current(), regExp)) {
          nodeList.push(walker.current());
        }
      } while (walker.next() !== undefined);

      return nodeList;
    };

    PluginManager.add('visualchars', function (editor) {
      var self = this, state;

      var showVisualChars = function (charMap, rootElm) {
        var node, div;
        var regExp = charMapToRegExp(charMap);
        var nodeList = getNodeList(regExp, rootElm);

        Arr.each(nodeList, function (n) {
          var nodeValue = n.nodeValue;
          var replaced = Arr.map(nodeValue.split(''), function (c) {
            return regExp.test(c) ? wrapCharWithSpan(charMap, c) : c;
          }).join('');

          div = editor.dom.create('div', null, replaced);
          while ((node = div.lastChild)) {
            editor.dom.insertAfter(node, n);
          }

          editor.dom.remove(n);
        });
      };

      var hideVisualChars = function (charMap, body) {
        var nodeList = editor.dom.select(compileCharMapToCssSelector(charMap), body);
        var i;

        for (i = nodeList.length - 1; i >= 0; i--) {
          editor.dom.remove(nodeList[i], 1);
        }
      };

      var compileCharMapToCssSelector = function (charMap) {
        var key, selector = '';

        for (key in charMap) {
          if (selector) {
            selector += ',';
          }
          selector += 'span.mce-' + charMap[key];
        }

        return selector;
      };

      var findParentElm = function (elm, rootElm) {
        while (elm.parentNode) {
          if (elm.parentNode === rootElm) {
            return elm;
          }
          elm = elm.parentNode;
        }
      };

      var toggleVisualChars = function () {
        var body = editor.getBody();
        var bookmark = editor.selection.getBookmark();
        var parentNode = findParentElm(editor.selection.getNode(), body);

        // if user does select all the parentNode will be undefined
        parentNode = parentNode !== undefined ? parentNode : body;

        hideVisualChars(charMap, parentNode);
        showVisualChars(charMap, parentNode);

        editor.selection.moveToBookmark(bookmark);
      };

      var toggleVisualCharsAndState = function (addBookmark) {
        var body = editor.getBody(), selection = editor.selection, bookmark;

        state = !state;
        self.state = state;
        editor.fire('VisualChars', { state: state });

        if (addBookmark !== false) {
          bookmark = selection.getBookmark();
        }

        state === true ? showVisualChars(charMap, body) : hideVisualChars(charMap, body);

        selection.moveToBookmark(bookmark);
      };

      var toggleActiveState = function () {
        var self = this;

        editor.on('VisualChars', function (e) {
          self.active(e.state);
        });
      };

      var debouncedToggle = Delay.debounce(toggleVisualChars, 300);

      if (editor.settings.forced_root_block !== false) {
        editor.on('keydown', function (e) {
          if (self.state === true) {
            e.keyCode === 13 ? toggleVisualChars() : debouncedToggle();
          }
        });
      }

      editor.addCommand('mceVisualChars', toggleVisualCharsAndState);

      editor.addButton('visualchars', {
        title: 'Show invisible characters',
        cmd: 'mceVisualChars',
        onPostRender: toggleActiveState
      });

      editor.addMenuItem('visualchars', {
        text: 'Show invisible characters',
        cmd: 'mceVisualChars',
        onPostRender: toggleActiveState,
        selectable: true,
        context: 'view',
        prependToContext: true
      });
    });

    return function () {};
  }
);