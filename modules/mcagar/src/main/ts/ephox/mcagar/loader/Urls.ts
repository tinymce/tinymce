import { document } from '@ephox/dom-globals';

export const setTinymceBaseUrl = (tinymce, baseUrl: string) => {
  const prefix = document.location.protocol + '//' + document.location.host;
  tinymce.baseURL = baseUrl.indexOf('://') === -1 ? prefix + baseUrl : baseUrl;
  tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);
};
