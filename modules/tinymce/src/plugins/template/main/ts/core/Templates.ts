/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';
import * as DateTimeHelper from './DateTimeHelper';
import { ExternalTemplate, TemplateValues } from './Types';

const createTemplateList = (editor: Editor, callback: (templates: ExternalTemplate[]) => void) => {
  return (): void => {
    const templateList = Options.getTemplates(editor);

    if (Type.isFunction(templateList)) {
      templateList(callback);
    } else if (Type.isString(templateList)) {
      window.fetch(templateList)
        .then((res) => {
          if (res.ok) {
            res.json().then(callback);
          }
        });
    } else {
      callback(templateList);
    }
  };
};

const replaceTemplateValues = (html: string, templateValues: TemplateValues): string => {
  Tools.each(templateValues, (v, k) => {
    if (Type.isFunction(v)) {
      v = v(k);
    }

    html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
  });

  return html;
};

const replaceVals = (editor: Editor, scope: HTMLElement): void => {
  const dom = editor.dom, vl = Options.getTemplateReplaceValues(editor);

  Tools.each(dom.select('*', scope), (e) => {
    Tools.each(vl, (v, k) => {
      if (dom.hasClass(e, k)) {
        if (Type.isFunction(v)) {
          // TODO: TINY-7792: Investigate as this appears to be a bug as "replaceTemplateValues" above uses
          // the same values here and it expects a string and return value so this is not compatible.
          v(e as any);
        }
      }
    });
  });
};

const hasClass = (n: Element, c: string): boolean =>
  new RegExp('\\b' + c + '\\b', 'g').test(n.className);

const insertTemplate = (editor: Editor, _ui: boolean, html: string): void => {
  // Note: ui is unused here but is required since this can be called by execCommand
  const dom = editor.dom;
  const sel = editor.selection.getContent();

  html = replaceTemplateValues(html, Options.getTemplateReplaceValues(editor));
  let el = dom.create('div', null, html);

  // Find template element within div
  const n = dom.select('.mceTmpl', el);
  if (n && n.length > 0) {
    el = dom.create('div', null);
    el.appendChild(n[0].cloneNode(true));
  }

  Tools.each(dom.select('*', el), (n) => {
    // Replace cdate
    if (hasClass(n, Options.getCreationDateClasses(editor).replace(/\s+/g, '|'))) {
      n.innerHTML = DateTimeHelper.getDateTime(editor, Options.getCdateFormat(editor));
    }

    // Replace mdate
    if (hasClass(n, Options.getModificationDateClasses(editor).replace(/\s+/g, '|'))) {
      n.innerHTML = DateTimeHelper.getDateTime(editor, Options.getMdateFormat(editor));
    }

    // Replace selection
    if (hasClass(n, Options.getSelectedContentClasses(editor).replace(/\s+/g, '|'))) {
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
