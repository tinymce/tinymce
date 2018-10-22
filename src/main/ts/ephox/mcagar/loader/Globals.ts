import { Global, Option } from '@ephox/katamari';

const getTinymce = () => Option.from(Global.tinymce);

const deleteTinymceGlobals = () => {
  delete Global.tinymce;
  delete Global.tinyMCE;
};

export {
  getTinymce,
  deleteTinymceGlobals
}
