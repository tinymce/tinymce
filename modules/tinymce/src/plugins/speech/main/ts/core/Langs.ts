import I18n from 'tinymce/core/api/util/I18n';
import { Obj } from '@ephox/katamari';

const conversions = {
  en: 'en-US',
  fr_FR: 'fr-FR',
  es: 'es-ES'
};

const convert = () => {
  // TODO: remove this any when obj.get's types are not so strangling that it's useless
  const editorLang = I18n.getCode() as any;
  return Obj.get(conversions, editorLang).getOr('en-US');
};

export default {
  convert
};
