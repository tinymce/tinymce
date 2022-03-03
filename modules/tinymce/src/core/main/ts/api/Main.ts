import { tinymce, TinyMCE } from './Tinymce';

declare const module: any;
declare const window: any;

const exportToModuleLoaders = (tinymce: TinyMCE) => {
  if (typeof module === 'object') {
    try {
      module.exports = tinymce;
    } catch (_) {
      // It will thrown an error when running this module
      // within webpack where the module.exports object is sealed
    }
  }
};

const exportToWindowGlobal = (tinymce: TinyMCE) => {
  window.tinymce = tinymce;
  window.tinyMCE = tinymce;
};

exportToWindowGlobal(tinymce);
exportToModuleLoaders(tinymce);
