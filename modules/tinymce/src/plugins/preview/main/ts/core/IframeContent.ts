import { Arr, Obj } from '@ephox/katamari';
import { Link } from '@ephox/sugar';

import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import type Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';

import type { ContentCssResource } from './Types';

const getComponentScriptsHtml = (editor: Editor) => {
  const urls = Arr.unique(Obj.values(editor.schema.getComponentUrls()));

  return Arr.map(urls, (url) => {
    const attrs = Obj.mapToArray(ScriptLoader.ScriptLoader.getScriptAttributes(url), (v, k) => ` ${editor.dom.encode(k)}="${editor.dom.encode(v)}"`);
    return `<script src="${editor.dom.encode(url)}"${attrs.join('')}></script>`;
  }).join('');
};

const getPreviewHtml = (editor: Editor, contentCssResources: ContentCssResource[]): string => {
  let headHtml = '';
  const encode = editor.dom.encode;
  const contentStyle = Options.getContentStyle(editor) ?? '';

  headHtml += `<base href="${encode(editor.documentBaseURI.getURI())}">`;

  const cors = Options.shouldUseContentCssCors(editor) ? ' crossorigin="anonymous"' : '';

  Tools.each(contentCssResources, (resource) => {
    if (resource.type === 'bundled') {
      headHtml += '<style type="text/css">' + resource.content + '</style>';
    } else {
      headHtml += '<link type="text/css" rel="stylesheet" href="' + encode(resource.url) + '"' + cors + '>';
    }
  });

  if (contentStyle) {
    headHtml += '<style type="text/css">' + contentStyle + '</style>';
  }

  headHtml += getComponentScriptsHtml(editor);

  const bodyId = Options.getBodyId(editor);

  const bodyClass = Options.getBodyClass(editor);

  const directionality = editor.getBody().dir;
  const dirAttr = directionality ? ' dir="' + encode(directionality) + '"' : '';
  const previewHtml = (
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    headHtml +
    '</head>' +
    '<body id="' + encode(bodyId) + '" class="mce-content-body ' + encode(bodyClass) + '"' + dirAttr + '>' +
    editor.getContent() +
    Link.getPreventClicksOnLinksScript() +
    '</body>' +
    '</html>'
  );

  return previewHtml;
};

export {
  getPreviewHtml
};
