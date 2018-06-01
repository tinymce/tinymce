/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import Utils from './Utils'

let currentLatexElement;

const updateSelectState = function (editor, state) {
  if (state) {
    const node = editor.selection.getNode()
    if (node.tagName === 'SPAN') {
      currentLatexElement = node
    } else {
      currentLatexElement = editor.selection.getNode().parentElement
    }
    currentLatexElement.setAttribute('data-mce-selected', 'inline-boundary');
  } else if (currentLatexElement){
    currentLatexElement.removeAttribute('data-mce-selected')
    currentLatexElement = null
  }
}

const isEditableLatex = function (editor, latexSVG) {
  console.log(latexSVG)
  const selectorMatched = editor.dom.is(latexSVG, 'span.mathjax_content');
  updateSelectState(editor, selectorMatched)
  return selectorMatched;
};


const editLatexDialog = function (editor) {
  return function () {
    const host = 'https://tools.speiyou.com';

    editor.windowManager.open({
      title: '数学公式编辑器',
      url: `${host}/matheditor/`,
      width: 830,
      height: 420
    });
    // 拿到 iframe 对象，监听消息
    const receiveMessage = function (event) {
      if (event.origin !== host) {
        return
      }
      const receiveData = event.data
      if (receiveData.type === 'mathdata') {
        const mdata = receiveData.mdata;
        const latex = mdata.data;
        Utils.getSVGLatex(latex).then(function(svg){
          editor.execCommand('mceSave');
          const container = editor.selection.getNode()
          container.parentElement.title = latex
          editor.dom.replace(svg, container)
          editor.execCommand('mceSave');
          editor.windowManager.close();
          console.log(editor.getContent())
        })
      }
    }
    window.addEventListener("message", receiveMessage, false);
  }
};

export default {
  isEditableLatex,
  editLatexDialog
};