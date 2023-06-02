import Editor from 'tinymce/core/api/Editor';
import Resource from 'tinymce/core/api/Resource';
import I18n from 'tinymce/core/api/util/I18n';

const pLoadHtmlByLangCode = (baseUrl: string, langCode: string): Promise<string> =>
  Resource.load(`tinymce.html-i18n.help-keynav.${langCode}`, `${baseUrl}/js/i18n/keynav/${langCode}.js`);

const pLoadI18nHtml = (baseUrl: string): Promise<string> =>
  // TINY-9928: Load language file for the current language, or English if the file is not available
  pLoadHtmlByLangCode(baseUrl, I18n.getCode()).catch(() => pLoadHtmlByLangCode(baseUrl, 'en'));

const initI18nLoad = (editor: Editor, baseUrl: string): void => {
  editor.on('init', () => {
    pLoadI18nHtml(baseUrl);
  });
};

export {
  initI18nLoad,
  pLoadI18nHtml
};
