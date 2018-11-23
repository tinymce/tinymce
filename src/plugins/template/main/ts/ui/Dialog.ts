/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import XHR from 'tinymce/core/api/util/XHR';
import Settings from '../api/Settings';
import Templates from '../core/Templates';

const insertIframeHtml = function (editor, win, html) {
  if (html.indexOf('<html>') === -1) {
    let contentCssLinks = '';

    Tools.each(editor.contentCSS, function (url) {
      contentCssLinks += '<link type="text/css" rel="stylesheet" href="' +
              editor.documentBaseURI.toAbsolute(url) +
              '">';
    });

    let bodyClass = editor.settings.body_class || '';
    if (bodyClass.indexOf('=') !== -1) {
      bodyClass = editor.getParam('body_class', '', 'hash');
      bodyClass = bodyClass[editor.id] || '';
    }

    html = (
            '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            contentCssLinks +
            '</head>' +
            '<body class="' + bodyClass + '">' +
            html +
            '</body>' +
            '</html>'
          );
  }

  html = Templates.replaceTemplateValues(editor, html, Settings.getPreviewReplaceValues(editor));

  const doc = win.find('iframe')[0].getEl().contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
};

const open = function (editor, templateList) {
  let win;
  const values = [];
  let templateHtml;

  if (!templateList || templateList.length === 0) {
    const message = editor.translate('No templates defined.');
    editor.notificationManager.open({ text: message, type: 'info' });
    return;
  }

  Tools.each(templateList, function (template) {
    values.push({
      selected: !values.length,
      text: template.title,
      value: {
        url: template.url,
        content: template.content,
        description: template.description
      }
    });
  });

  const onSelectTemplate = function (e) {
    const value = e.control.value();

    if (value.url) {
      XHR.send({
        url: value.url,
        success (html) {
          templateHtml = html;
          insertIframeHtml(editor, win, templateHtml);
        }
      });
    } else {
      templateHtml = value.content;
      insertIframeHtml(editor, win, templateHtml);
    }

    win.find('#description')[0].text(e.control.value().description);
  };

  win = editor.windowManager.open({
    title: 'Insert template',
    layout: 'flex',
    direction: 'column',
    align: 'stretch',
    padding: 15,
    spacing: 10,
    items: [
      {
        type: 'form',
        flex: 0,
        padding: 0,
        items: [
          {
            type: 'container',
            label: 'Templates',
            items: {
              type: 'listbox',
              label: 'Templates',
              name: 'template',
              values,
              onselect: onSelectTemplate
            }
          }
        ]
      },
      {
        type: 'label',
        name: 'description',
        label: 'Description',
        text: '\u00a0'
      },
      {
        type: 'iframe',
        flex: 1,
        border: 1
      }
    ],

    onsubmit () {
      Templates.insertTemplate(editor, false, templateHtml);
    },

    minWidth: Settings.getDialogWidth(editor),
    minHeight: Settings.getDialogHeight(editor)
  });

  win.find('listbox')[0].fire('select');
};

export default {
  open
};