/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Arr, Option } from '@ephox/katamari';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';
import XHR from 'tinymce/core/api/util/XHR';
import Settings from '../api/Settings';
import Templates from '../core/Templates';

const getPreviewContent = (editor, html) => {
  if (html.indexOf('<html>') === -1) {
    let contentCssLinks = '';

    Tools.each(editor.contentCSS, (url) => {
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

  return Templates.replaceTemplateValues(html, Settings.getPreviewReplaceValues(editor));
};

const open = (editor, templateList) => {
  const createTemplates = () => {
    if (!templateList || templateList.length === 0) {
      const message = editor.translate('No templates defined.');
      editor.notificationManager.open({ text: message, type: 'info' });
      return Option.none();
    }

    return Option.from(Tools.map(templateList, (template, index) => {
      return {
        selected: index === 0,
        text: template.title,
        value: {
          url: template.url,
          content: template.content,
          description: template.description
        }
      };
    }));
  };

  const createSelectBoxItems = (templates) => {
    return Arr.map(templates, (v) => {
      return {
        text: v.text,
        value: v.text
      };
    });
  };

  const findTemplate = (templates, templateTitle) => {
    return Arr.find(templates, (t) => {
      return t.text === templateTitle;
    });
  };

  const getTemplateContent = (t) => {
    return new Promise((resolve, reject) => {
      if (t.value.url) {
        XHR.send({
          url: t.value.url,
          success (html) {
            resolve(html);
          },
          error: (e) => {
            reject(e);
          }
        });
      } else {
        resolve(t.value.content);
      }
    });
  };

  const onChange = (templates) => (api, change) => {
    if (change.name === 'template') {
      const newTemplateTitle = api.getData().template;
      findTemplate(templates, newTemplateTitle).each((t) => {
        api.block('Loading...');
        getTemplateContent(t).then((previewHtml) => {
          const previewContent = getPreviewContent(editor, previewHtml);
          api.setData({
            preview: previewContent
          });
          api.unblock();
        });
      });
    }
  };

  const onSubmit = (templates) => (api) => {
    const data = api.getData();
    findTemplate(templates, data.template).each((t) => {
      getTemplateContent(t).then((previewHtml) => {
        Templates.insertTemplate(editor, false, previewHtml);
        api.close();
      });
    });
  };

  interface TemplateValues {
    url?: string;
    content: string;
    description: string;
  }

  interface TemplateData {
    selected: boolean;
    text: string;
    value: TemplateValues;
  }

  const openDialog = (templates: TemplateData[]) => {
    const selectBoxItems = createSelectBoxItems(templates);

    const dialogSpec = (bodyItems = [], initialData = {}) => ({
      title: 'Insert Template',
      size: 'large',
      layout: 'flex',
      direction: 'column',
      align: 'stretch',
      padding: 15,
      spacing: 10,
      minWidth: Settings.getDialogWidth(editor),
      minHeight: Settings.getDialogHeight(editor),
      body: {
        type: 'panel',
        items: bodyItems
      },
      initialData,
      buttons: [
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel',
        },
        {
          type: 'submit',
          name: 'save',
          text: 'Save',
          primary: true
        }
      ],
      onSubmit: onSubmit(templates),
      onChange: onChange(templates)
    });

    const dialogApi = editor.windowManager.open(dialogSpec());
    dialogApi.block('Loading...');

    getTemplateContent(templates[0]).then((previewHtml) => {
      const content = getPreviewContent(editor, previewHtml);
      const bodyItems = [
        {
          type: 'selectbox',
          name: 'template',
          label: 'Templates',
          items: selectBoxItems
        },
        {
          label: 'Preview',
          type: 'iframe',
          name: 'preview',
          flex: true,
          border: 1,
          sandboxed: false
        }
      ];
      const initialData = {
          template: templates[0].text,
          preview: content
      };

      dialogApi.unblock();
      dialogApi.redial(dialogSpec(bodyItems, initialData));
      dialogApi.focus('template');
    });
  };

  const optTemplates: Option<TemplateData[]> = createTemplates();
  optTemplates.each(openDialog);
};

export default {
  open
};