import I18n from 'tinymce/core/api/util/I18n';

export default {
  icons: () => <Record<string, string>> {},
  menuItems: () => <Record<string, any>> {},
  translate: I18n.translate,
  isReadOnly: () => false
};
