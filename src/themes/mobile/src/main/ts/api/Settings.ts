var isSkinDisabled = function (editor) {
  return editor.settings.skin === false;
};

export default <any> {
  isSkinDisabled: isSkinDisabled
};