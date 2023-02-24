import { Regex, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';
import * as DateTimeHelper from './DateTimeHelper';
import { ExternalTemplate, TemplateValues } from './Types';
import { hasAnyClasses, parseAndSerialize } from './Utils';

const createTemplateList = (editor: Editor, callback: (templates: ExternalTemplate[]) => void) => {
  return (): void => {
    const templateList = Options.getTemplates(editor);

    if (Type.isFunction(templateList)) {
      templateList(callback);
    } else if (Type.isString(templateList)) {
      fetch(templateList)
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

const replaceTemplateValues = (html: string, templateValues: TemplateValues | undefined): string => {
  Tools.each(templateValues, (v, k) => {
    if (Type.isFunction(v)) {
      v = v(k);
    }

    html = html.replace(new RegExp('\\{\\$' + Regex.escape(k) + '\\}', 'g'), v);
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

const insertTemplate = (editor: Editor, _ui: boolean, html: string): void => {
  // Note: ui is unused here but is required since this can be called by execCommand
  const dom = editor.dom;
  const sel = editor.selection.getContent();

  html = replaceTemplateValues(html, Options.getTemplateReplaceValues(editor));
  let el = dom.create('div', {}, parseAndSerialize(editor, html));

  // Find template element within div
  const n = dom.select('.mceTmpl', el);
  if (n && n.length > 0) {
    el = dom.create('div');
    el.appendChild(n[0].cloneNode(true));
  }

  Tools.each(dom.select('*', el), (n) => {
    // Replace cdate
    if (hasAnyClasses(dom, n, Options.getCreationDateClasses(editor))) {
      n.innerHTML = DateTimeHelper.getDateTime(editor, Options.getCdateFormat(editor));
    }

    // Replace mdate
    if (hasAnyClasses(dom, n, Options.getModificationDateClasses(editor))) {
      n.innerHTML = DateTimeHelper.getDateTime(editor, Options.getMdateFormat(editor));
    }

    // Replace selection
    if (hasAnyClasses(dom, n, Options.getSelectedContentClasses(editor))) {
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
