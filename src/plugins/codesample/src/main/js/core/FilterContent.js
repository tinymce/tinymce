/**
 * FilterContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.codesample.core.FilterContent',
  [
    'tinymce.plugins.codesample.core.Prism',
    'tinymce.plugins.codesample.util.Utils'
  ],
  function (Prism, Utils) {
    var setup = function (editor, pluginUrl) {
      var $ = editor.$;

      editor.on('PreProcess', function (e) {
        $('pre[contenteditable=false]', e.node).
          filter(Utils.trimArg(Utils.isCodeSample)).
          each(function (idx, elm) {
            var $elm = $(elm);

            var className = (!elm.hasAttribute('data-src')) ? elm.className.replace(/^.*\blang(?:uage)-(\w+)\b.*$/, 'language-$1') : '';
            if (/line-numbers/.test(elm.className)) {
              className += ' line-numbers';
            }
            if (className != '') {
              $elm.attr('class', className.trim());
            } else {
              $elm.removeClass();
            }

            if (!elm.hasAttribute('data-src') && !elm.hasAttribute('data-jsonp')) {
              var node = elm.querySelector('code');
              var code = (node != null) ? node.textContent : '';
              $elm.empty().append($('<code></code>').each(function () {
                // Needs to be textContent since innerText produces BR:s
                this.textContent = code;
              }));
            } else {
              $elm.empty();
            }

            $elm.removeAttr('contentEditable');

          });
      });

      editor.on('SetContent', function () {
        var unprocessedCodeSamples = $('pre').filter(Utils.trimArg(Utils.isCodeSample)).filter(function (idx, elm) {
          return elm.contentEditable !== "false";
        });

        if (unprocessedCodeSamples.length) {
          editor.undoManager.transact(function () {
            unprocessedCodeSamples.each(function (idx, elm) {
              $(elm).find('br').each(function (idx, elm) {
                elm.parentNode.replaceChild(editor.getDoc().createTextNode('\n'), elm);
              });

              elm.contentEditable = false;
              elm.className = $.trim(elm.className);
              var code = null;
              if (elm.hasAttribute('data-src')) {
                elm.classList.add('language-text');
                code = Utils.pseudoCode({ File: elm.getAttribute('data-src') });
              } else if (elm.hasAttribute('data-jsonp')) {
                code = Utils.pseudoCode({ Url: elm.getAttribute('data-jsonp'), Language: elm.className.replace(/^.*lang(?:uage)?-(\w+).*$/, '$1') });
              } else {
                elm.innerHTML = '<code>' + editor.dom.encode(elm.textContent) + '</code>';
                code = elm.querySelector('code');
                Prism.highlightElement(code);
              }

              if (typeof code === 'string') {
                code += Utils.lineNumbers(code);
                elm.innerHTML = '<code class="language-text">' + code + '</code>';
              }

            });
          });
        }
      });

      if (typeof Prism.plugins.autoloader != 'undefined') {
        var autoloaderPath = editor.settings.codesample_autoloader_path;
        Prism.plugins.autoloader.languages_path = (typeof autoloaderPath != 'undefined') ? autoloaderPath : pluginUrl + '/components/';
      }
    };

    return {
      setup: setup
    };
  }
);