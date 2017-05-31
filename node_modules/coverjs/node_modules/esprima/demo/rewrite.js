/*
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint browser:true evil:true */

function sourceRewrite() {
    'use strict';

    var code, syntax, indent;

    function setText(id, str) {
        var el = document.getElementById(id);
        if (typeof el.innerText === 'string') {
            el.innerText = str;
        } else {
            el.textContent = str;
        }
    }

    setText('error', '');
    if (typeof window.editor !== 'undefined') {
        // Using CodeMirror.
        code = window.editor.getValue();
    } else {
        // Plain textarea, likely in a situation where CodeMirror does not work.
        code = document.getElementById('code').value;
    }

    indent = '';
    if (document.getElementById('onetab').checked) {
        indent = '\t';
    } else if (document.getElementById('twospaces').checked) {
        indent = '  ';
    } else if (document.getElementById('fourspaces').checked) {
        indent = '    ';
    }

    try {
        syntax = window.esprima.parse(code, { raw: true });
        code = window.escodegen.generate(syntax, { indent: indent });
    } catch (e) {
        setText('error', e.toString());
    } finally {
        if (typeof window.editor !== 'undefined') {
            window.editor.setValue(code);
        } else {
            document.getElementById('code').value = code;
        }
    }
}
