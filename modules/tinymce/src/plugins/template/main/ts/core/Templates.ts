/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import XHR from 'tinymce/core/api/util/XHR';
import * as Settings from '../api/Settings';
import * as DateTimeHelper from './DateTimeHelper';

const createTemplateList = (editor: Editor, callback) => {
  return () => {
    const templateList = Settings.getTemplates(editor);

    if (typeof templateList === 'function') {
      templateList(callback);
      return;
    }

    if (typeof templateList === 'string') {
      XHR.send({
        url: templateList,
        success: (text) => {
          callback(JSON.parse(text));
        }
      });
    } else {
      callback(templateList);
    }
  };
};

const replaceTemplateValues = (html, templateValues) => {
  Tools.each(templateValues, (v, k) => {
    if (typeof v === 'function') {
      v = v(k);
    }

    html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
  });

  return html;
};

const replaceVals = (editor, e) => {
  const dom = editor.dom, vl = Settings.getTemplateReplaceValues(editor);

  Tools.each(dom.select('*', e), (e) => {
    Tools.each(vl, (v, k) => {
      if (dom.hasClass(e, k)) {
        if (typeof vl[k] === 'function') {
          vl[k](e);
        }
      }
    });
  });
};

const hasClass = (n, c) => {
  return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
};

const insertTemplate = (editor: Editor, _ui: boolean, html: string) => {
  // Note: ui is unused here but is required since this can be called by execCommand
  let el;
  const dom = editor.dom;
  const sel = editor.selection.getContent();

  html = replaceTemplateValues(html, Settings.getTemplateReplaceValues(editor));
  el = dom.create('div', null, html);

  // Find template element within div
  const n = dom.select('.mceTmpl', el);
  if (n && n.length > 0) {
    el = dom.create('div', null);
    el.appendChild(n[0].cloneNode(true));
  }

  Tools.each(dom.select('*', el), (n) => {
    // Replace cdate
    if (hasClass(n, Settings.getCreationDateClasses(editor).replace(/\s+/g, '|'))) {
      n.innerHTML = DateTimeHelper.getDateTime(editor, Settings.getCdateFormat(editor));
    }

    // Replace mdate
    if (hasClass(n, Settings.getModificationDateClasses(editor).replace(/\s+/g, '|'))) {
      n.innerHTML = DateTimeHelper.getDateTime(editor, Settings.getMdateFormat(editor));
    }

    // Replace selection
    if (hasClass(n, Settings.getSelectedContentClasses(editor).replace(/\s+/g, '|'))) {
      n.innerHTML = sel;
    }
  });

  replaceVals(editor, el);

  editor.execCommand('mceInsertContent', false, el.innerHTML);
  editor.addVisual();
};

export {
  createTemplateList,
  replaceTemplateValues,
  replaceVals,
  insertTemplate
};
