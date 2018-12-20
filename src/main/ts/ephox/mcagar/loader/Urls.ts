import { getTinymce } from './Globals';
import { document } from '@ephox/dom-globals';

const setTinymceBaseUrl = (tinymce, baseUrl: string) => {
  const prefix = document.location.protocol + '//' + document.location.host;
  tinymce.baseURL = baseUrl.indexOf('://') === -1 ? prefix + baseUrl : baseUrl;
  tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);
};

const updateTinymceUrls = (packageName: string) => {
  getTinymce().each((tinymce) => {
    setTinymceBaseUrl(tinymce, `/project/node_modules/${packageName}`);
  });
};

export {
  setTinymceBaseUrl,
  updateTinymceUrls
}
