/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Arr, Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';
import XHR from 'tinymce/core/api/util/XHR';
import Settings from '../api/Settings';
import Templates from '../core/Templates';
import * as Utils from '../core/Utils';

interface UrlTemplate {
  title: string;
  description: string;
  url: string;
}

interface ContentTemplate {
  title: string;
  description: string;
  content: string;
}

type ExternalTemplate = UrlTemplate | ContentTemplate;

interface InternalTemplate {
  selected: boolean;
  text: string;
  value: {
    url: Option<string>;
    content: Option<string>;
    description: string;
  };
}

type DialogData = {
  template: string;
  preview: string;
};

type UpdateDialogCallback = (dialogApi: Types.Dialog.DialogInstanceApi<DialogData>, template: InternalTemplate, previewHtml: string) => void;

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

    const encode = editor.dom.encode;

    const directionality = editor.getBody().dir;
    const dirAttr = directionality ? ' dir="' + encode(directionality) + '"' : '';

    html = (
      '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      contentCssLinks +
      '</head>' +
      '<body class="' + encode(bodyClass) + '"' + dirAttr + '>' +
      html +
      '</body>' +
      '</html>'
    );
  }

  return Templates.replaceTemplateValues(html, Settings.getPreviewReplaceValues(editor));
};

const open = (editor: Editor, templateList: ExternalTemplate[]) => {
  const createTemplates = (): Option<Array<InternalTemplate>> => {
    if (!templateList || templateList.length === 0) {
      const message = editor.translate('No templates defined.');
      editor.notificationManager.open({ text: message, type: 'info' });
      return Option.none();
    }

    return Option.from(Tools.map(templateList, (template: ExternalTemplate, index) => {
      const isUrlTemplate = (t: ExternalTemplate): t is UrlTemplate => (t as UrlTemplate).url !== undefined;
      return {
        selected: index === 0,
        text: template.title,
        value: {
          url: isUrlTemplate(template) ? Option.from(template.url) : Option.none(),
          content: !isUrlTemplate(template) ? Option.from(template.content) : Option.none(),
          description: template.description
        }
      };
    }));
  };

  const createSelectBoxItems = (templates: InternalTemplate[]) => {
    return Arr.map(templates, (t) => {
      return {
        text: t.text,
        value: t.text
      };
    });
  };

  const findTemplate = (templates: InternalTemplate[], templateTitle: string) => {
    return Arr.find(templates, (t) => {
      return t.text === templateTitle;
    });
  };

  const getTemplateContent = (t: InternalTemplate) => {
    return new Promise<string>((resolve, reject) => {
      t.value.url.fold(() => resolve(t.value.content.getOr('')), (url) => XHR.send({
        url,
        success (html: string) {
          resolve(html);
        },
        error: (e) => {
          reject(e);
        }
      }));
    });
  };

  const onChange = (templates: InternalTemplate[], updateDialog: UpdateDialogCallback) => (api: Types.Dialog.DialogInstanceApi<DialogData>, change: { name: string }) => {
    if (change.name === 'template') {
      const newTemplateTitle = api.getData().template;
      findTemplate(templates, newTemplateTitle).each((t) => {
        api.block('Loading...');
        getTemplateContent(t).then((previewHtml) => {
          updateDialog(api, t, previewHtml);
          api.unblock();
        });
      });
    }
  };

  const onSubmit = (templates: InternalTemplate[]) => (api: Types.Dialog.DialogInstanceApi<DialogData>) => {
    const data = api.getData();
    findTemplate(templates, data.template).each((t) => {
      getTemplateContent(t).then((previewHtml) => {
        Templates.insertTemplate(editor, false, previewHtml);
        api.close();
      });
    });
  };

  const openDialog = (templates: InternalTemplate[]) => {
    const selectBoxItems = createSelectBoxItems(templates);

    const buildDialogSpec = (bodyItems: Types.Dialog.BodyComponentApi[], initialData: DialogData): Types.Dialog.DialogApi<DialogData> => ({
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
      onChange: onChange(templates, updateDialog)
    });

    const updateDialog = (dialogApi: Types.Dialog.DialogInstanceApi<DialogData>, template: InternalTemplate, previewHtml: string) => {
      const content = getPreviewContent(editor, previewHtml);
      const bodyItems: Types.Dialog.BodyComponentApi[] = [
        {
          type: 'selectbox',
          name: 'template',
          label: 'Templates',
          items: selectBoxItems
        },
        {
          type: 'htmlpanel',
          html: `<p aria-live="polite">${Utils.htmlEscape(template.value.description)}</p>`
        },
        {
          label: 'Preview',
          type: 'iframe',
          name: 'preview',
          sandboxed: false
        }
      ];

      const initialData = {
        template: template.text,
        preview: content
      };

      dialogApi.unblock();
      dialogApi.redial(buildDialogSpec(bodyItems, initialData));
      dialogApi.focus('template');
    };

    const dialogApi = editor.windowManager.open(buildDialogSpec([], { template: '', preview: '' }));
    dialogApi.block('Loading...');

    getTemplateContent(templates[0]).then((previewHtml) => {
      updateDialog(dialogApi, templates[0], previewHtml);
    });
  };

  const optTemplates: Option<InternalTemplate[]> = createTemplates();
  optTemplates.each(openDialog);
};

export default {
  open
};