import { Strings, Type } from '@ephox/katamari';

export const setTinymceBaseUrl = (tinymce: any, baseUrl: string): void => {
  const prefix = document.location.protocol + '//' + document.location.host;
  tinymce.baseURL = baseUrl.indexOf('://') === -1 ? prefix + baseUrl : baseUrl;
  tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);
};

export const detectTinymceBaseUrl = (settings: Record<string, any>): string =>
  Type.isString(settings.base_url) ? settings.base_url : '/project/node_modules/tinymce';

export const setupTinymceBaseUrl = (tinymce: any, settings: Record<string, any>): void => {
  if (Type.isString(settings.base_url)) {
    setTinymceBaseUrl(tinymce, settings.base_url);
  } else if (!Type.isString(tinymce.baseURL) || !Strings.contains(tinymce.baseURL, '/project/')) {
    setTinymceBaseUrl(tinymce, '/project/node_modules/tinymce');
  }
};
