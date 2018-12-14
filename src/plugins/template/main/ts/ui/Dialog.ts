/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';
import XHR from 'tinymce/core/api/util/XHR';
import Settings from '../api/Settings';
import Templates from '../core/Templates';
import { Types } from '@ephox/bridge';

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

const getPreviewContent = (editor: Editor, html: string) => {
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

const open = (editor: Editor, templateList: TemplateData[]) => {
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

  const createSelectBoxItems = (templates: TemplateData[]) => {
    return Arr.map(templates, (v) => {
      return {
        text: v.text,
        value: v.text
      };
    });
  };

  const findTemplate = (templates: TemplateData[], templateTitle: string) => {
    return Arr.find(templates, (t) => {
      return t.text === templateTitle;
    });
  };

  const getTemplateContent = (t: TemplateData) => {
    return new Promise<string>((resolve, reject) => {
      if (t.value.url) {
        XHR.send({
          url: t.value.url,
          success (html: string) {
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

  const onChange = (templates) => (api: Types.Dialog.DialogInstanceApi<DialogData>, change) => {
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

  const onSubmit = (templates: TemplateData[]) => (api: Types.Dialog.DialogInstanceApi<DialogData>) => {
    const data = api.getData();
    findTemplate(templates, data.template).each((t) => {
      getTemplateContent(t).then((previewHtml) => {
        Templates.insertTemplate(editor, false, previewHtml);
        api.close();
      });
    });
  };

  type DialogData = {
    template: string;
    preview: string;
  };

  const openDialog = (templates: TemplateData[]) => {
    const selectBoxItems = createSelectBoxItems(templates);

    const dialogSpec = (bodyItems: Types.Dialog.BodyComponentApi[], initialData: DialogData): Types.Dialog.DialogApi<DialogData> => ({
      title: 'Insert Template',
      size: 'large',
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

    const dialogApi = editor.windowManager.open(dialogSpec([], { template: '', preview: '' }));
    dialogApi.block('Loading...');

    getTemplateContent(templates[0]).then((previewHtml) => {
      const content = getPreviewContent(editor, previewHtml);
      const bodyItems: Types.Dialog.BodyComponentApi[] = [
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