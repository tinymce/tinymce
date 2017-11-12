/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.codesample.util.Utils',
  [
  ],
  function () {
    function isCodeSample(elm) {
      return elm && elm.nodeName === 'PRE' && (elm.className.indexOf('language-') !== -1 || elm.hasAttribute('data-src'));
    }

    function trimArg(predicateFn) {
      return function (arg1, arg2) {
        return predicateFn(arg2);
      };
    }

    function lineNumbers(code) {
      var match = code.match(/\n(?!$)/g);
      var linesNum = match ? match.length + 1 : 1;
      var lines = new Array(linesNum + 1);

      return '<div aria-hidden="true" class="line-numbers-rows">' + lines.join('<span></span>') + '</div>';
    }

    function pseudoCode(params) {
      var code = '<span class="token comment">/* ---- Codesample ---- */</span>\n';
      for (var field in params) {
        code += '<span class="token property">' + field + '</span><span class="token punctuation">:</span> ' + params[field].trim() + "\n";
      }
      return code;
    }

    return {
      isCodeSample: isCodeSample,
      trimArg: trimArg,
      lineNumbers: lineNumbers,
      pseudoCode: pseudoCode
    };
  }
);