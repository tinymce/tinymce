import { Arr, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';
import * as Templates from '../core/Templates';
import { DialogData, ExternalTemplate, InternalTemplate, UrlTemplate } from '../core/Types';
import * as Utils from '../core/Utils';

type UpdateDialogCallback = (dialogApi: Dialog.DialogInstanceApi<DialogData>, template: InternalTemplate, previewHtml: string) => void;

const getPreviewContent = (editor: Editor, html: string): string => {
  let previewHtml = Utils.parseAndSerialize(editor, html);
  if (html.indexOf('<html>') === -1) {
    let contentCssEntries = '';
    const contentStyle = Options.getContentStyle(editor) ?? '';

    const cors = Options.shouldUseContentCssCors(editor) ? ' crossorigin="anonymous"' : '';

    Tools.each(editor.contentCSS, (url) => {
      contentCssEntries += '<link type="text/css" rel="stylesheet" href="' +
        editor.documentBaseURI.toAbsolute(url) +
        '"' + cors + '>';
    });

    if (contentStyle) {
      contentCssEntries += '<style type="text/css">' + contentStyle + '</style>';
    }

    const bodyClass = Options.getBodyClass(editor);

    const encode = editor.dom.encode;

    const isMetaKeyPressed = Env.os.isMacOS() || Env.os.isiOS() ? 'e.metaKey' : 'e.ctrlKey && !e.altKey';

    const preventClicksOnLinksScript = (
      '<script>' +
      'document.addEventListener && document.addEventListener("click", function(e) {' +
      'for (var elm = e.target; elm; elm = elm.parentNode) {' +
      'if (elm.nodeName === "A" && !(' + isMetaKeyPressed + ')) {' +
      'e.preventDefault();' +
      '}' +
      '}' +
      '}, false);' +
      '</script> '
    );

    const directionality = editor.getBody().dir;
    const dirAttr = directionality ? ' dir="' + encode(directionality) + '"' : '';

    previewHtml = (
      '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      '<base href="' + encode(editor.documentBaseURI.getURI()) + '">' +
      contentCssEntries +
      preventClicksOnLinksScript +
      '</head>' +
      '<body class="' + encode(bodyClass) + '"' + dirAttr + '>' +
      previewHtml +
      '</body>' +
      '</html>'
    );
  }

  return Templates.replaceTemplateValues(previewHtml, Options.getPreviewReplaceValues(editor));
};

const open = (editor: Editor, templateList: ExternalTemplate[]): void => {
  const createTemplates = (): Optional<Array<InternalTemplate>> => {
    if (!templateList || templateList.length === 0) {
      const message = editor.translate('No templates defined.');
      editor.notificationManager.open({ text: message, type: 'info' });
      return Optional.none();
    }

    return Optional.from(Tools.map(templateList, (template: ExternalTemplate, index) => {
      const isUrlTemplate = (t: ExternalTemplate): t is UrlTemplate => (t as UrlTemplate).url !== undefined;
      return {
        selected: index === 0,
        text: template.title,
        value: {
          url: isUrlTemplate(template) ? Optional.from(template.url) : Optional.none(),
          content: !isUrlTemplate(template) ? Optional.from(template.content) : Optional.none(),
          description: template.description
        }
      };
    }));
  };

  const createSelectBoxItems = (templates: InternalTemplate[]) => Arr.map(templates, (t) => ({
    text: t.text,
    value: t.text
  }));

  const findTemplate = (templates: InternalTemplate[], templateTitle: string) => Arr.find(templates, (t) => t.text === templateTitle);

  const loadFailedAlert = (api: Dialog.DialogInstanceApi<DialogData>) => {
    editor.windowManager.alert('Could not load the specified template.', () => api.focus('template'));
  };

  const getTemplateContent = (t: InternalTemplate): Promise<string> =>
    t.value.url.fold(
      () => Promise.resolve(t.value.content.getOr('')),
      (url) => fetch(url).then((res) => res.ok ? res.text() : Promise.reject())
    );

  const onChange = (templates: InternalTemplate[], updateDialog: UpdateDialogCallback) =>
    (api: Dialog.DialogInstanceApi<DialogData>, change: { name: string }) => {
      if (change.name === 'template') {
        const newTemplateTitle = api.getData().template;
        findTemplate(templates, newTemplateTitle).each((t) => {
          api.block('Loading...');
          getTemplateContent(t).then((previewHtml) => {
            updateDialog(api, t, previewHtml);
          }).catch(() => {
            updateDialog(api, t, '');
            api.setEnabled('save', false);
            loadFailedAlert(api);
          });
        });
      }
    };

  const onSubmit = (templates: InternalTemplate[]) => (api: Dialog.DialogInstanceApi<DialogData>) => {
    const data = api.getData();
    findTemplate(templates, data.template).each((t) => {
      getTemplateContent(t).then((previewHtml) => {
        editor.execCommand('mceInsertTemplate', false, previewHtml);
        api.close();
      }).catch(() => {
        api.setEnabled('save', false);
        loadFailedAlert(api);
      });
    });
  };

  const openDialog = (templates: InternalTemplate[]) => {
    const selectBoxItems = createSelectBoxItems(templates);

    const buildDialogSpec = (bodyItems: Dialog.BodyComponentSpec[], initialData: DialogData): Dialog.DialogSpec<DialogData> => ({
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
          text: 'Cancel'
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

    const updateDialog = (dialogApi: Dialog.DialogInstanceApi<DialogData>, template: InternalTemplate, previewHtml: string) => {
      const content = getPreviewContent(editor, previewHtml);
      const bodyItems: Dialog.BodyComponentSpec[] = [
        {
          type: 'listbox',
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
          sandboxed: false,
          transparent: false
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
    }).catch(() => {
      updateDialog(dialogApi, templates[0], '');
      dialogApi.setEnabled('save', false);
      loadFailedAlert(dialogApi);
    });
  };

  const optTemplates: Optional<InternalTemplate[]> = createTemplates();
  optTemplates.each(openDialog);
};

export {
  open,
  getPreviewContent
};
