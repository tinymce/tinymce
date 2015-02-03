define(
  'ephox.echo.api.AriaRegister',

  [
    'ephox.classify.Type',
    'ephox.epithet.Id',
    'ephox.sugar.api.Attr'
  ],

  function (Type, Id, Attr) {

    // THis could be a core aria think

    var editor = function (element) {
      Attr.set(element, 'role', 'application');
      var id = Id.generate('');
      Attr.set(element, 'aria-label', 'Textbox.io Rich Text Editor - ' + id);
    };

    var toolbar = function (element) {
      Attr.set(element, 'role', 'toolbar');
      Attr.set(element, 'aria-label', 'Rich Text Editor Toolbar');
    };

    var menu = function (element, label) {
      Attr.set(element, 'role', 'menu');
      Attr.set(element, 'aria-label', label);
    };

    var toolbarButton = function (element, label, hasPopup, isToggle) {
      Attr.set(element, 'role', 'button');
      Attr.set(element, 'aria-label', label);
      if (isToggle) Attr.set(element, 'aria-pressed', 'false');
      Attr.set(element, 'aria-haspopup', '' + hasPopup);
      if (hasPopup) {
        Attr.set(element, 'aria-expanded', 'false');
      }
    };

    var toolbarGroup = function (element, label) {
      // TODO: duplicated from 'ephox.polish.alien.Query', consolidate this
      var isEmpty = function (val) {
        // TODO: Move to compass Arr and violin Strings
        return (val === null) || (val === undefined) || (val === '') || (Type.isArray(val) && val.length === 0);
      };
      // End TODO

      if (!isEmpty(label))
        Attr.set(element, 'aria-label', label);
    };

    var menuItem = function (element, label, hasPopup) {
      Attr.set(element, 'role', 'menuitem');
      Attr.set(element, 'aria-label', label);
      Attr.set(element, 'aria-haspopup', hasPopup === true ? 'true' : 'false');
    };

    var dialog = function (element, label) {
      Attr.set(element, 'role', 'dialog');
      Attr.set(element, 'aria-label', label);
    };

    // TODO: Implement form ARIA support
    // var form = function (element, label) {
    //   throw 'Form ARIA support not implemented yet.';
    // };

    var input = function (element, label, required) {
      Attr.set(element, 'aria-label', label);
    };

    // TODO: Implement textarea ARIA support
    // var textarea = function (element, label, required) {
    //   throw 'Textarea ARIA support not implemented yet.';
    // };

    // TODO: Implement link ARIA support
    // var link = function (element) {
    //   throw 'Link ARIA support not implemented yet.';
    // };

    // TODO: Implement other ARIA support
    // var other = function () {
    //   throw 'Other ARIA support not implemented yet.';
    // };

    return {
      editor: editor,
      toolbar: toolbar,
      toolbarGroup: toolbarGroup,
      toolbarButton: toolbarButton,
      menu: menu,
      menuItem: menuItem,
      dialog: dialog,
      input: input
    };
  }
);