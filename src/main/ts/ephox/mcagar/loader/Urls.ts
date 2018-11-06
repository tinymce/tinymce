import { getTinymce } from './Globals';
import { document } from '@ephox/dom-globals';

const updateTinymceUrls = (packageName) => {
  getTinymce().each((tinymce) => {
    tinymce.baseURL = document.location.protocol + '//' + document.location.host + `/project/node_modules/${packageName}`;
    tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);
  });
};

export {
  updateTinymceUrls
}
