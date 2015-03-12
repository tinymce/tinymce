define(
  'ephox.echo.api.AriaRegister',

  [
    'ephox.classify.Type',
    'ephox.epithet.Id',
    'ephox.sugar.api.Attr'
  ],

  function (Type, Id, Attr) {
    var presentation = function (element) {
      Attr.setAll(element, {
        'role': 'presentation',
        'aria-hidden': 'true'
      });
    };

    var editor = function (element, label) {
      Attr.setAll(element, {
        'role': 'application',
        'aria-label': label,
        'title': label
      });
    };

    var toolbar = function (element, label) {
      Attr.setAll(element, {
        'role': 'toolbar',
        'aria-label': label
      });
    };

    var menu = function (element, label) {
      Attr.setAll(element, {
        'role': 'menu',
        'aria-label': label
      });
    };

    var toolbarButton = function (element, label, hasPopup, isToggle) {
      Attr.setAll(element, {
        'role': 'button',
        'aria-label': label,
        'aria-haspopup': '' + hasPopup
      });
      if (isToggle) Attr.set(element, 'aria-pressed', 'false');
      if (hasPopup) Attr.set(element, 'aria-expanded', 'false');
    };

    var toolbarGroup = function (element, label) {
      // TODO: duplicated from 'ephox.polish.alien.Query', consolidate isEmpty();
      var isEmpty = function (val) {
        // TODO: Move to compass Arr and violin Strings
        return (val === null) || (val === undefined) || (val === '') || (Type.isArray(val) && val.length === 0);
      };
      // End TODO

      Attr.set(element, 'role', 'group');

      // customer groups may have empty label, don't use it
      if (!isEmpty(label)) {
        Attr.set(element, 'aria-label', label);
      }
    };

    var menuItem = function (element, label, hasPopup) {
      Attr.setAll(element, {
        'role': 'menuitem',
        'aria-label': label,
        'aria-haspopup': hasPopup === true ? 'true' : 'false'
      });
    };

    var dialog = function (element, label) {
      Attr.setAll(element, {
        'role': 'dialog',
        'aria-label': label
      });
    };

    var widget = function (element) {
      Attr.set(element, 'role', 'widget');
    };

    var listBox = function (element) {
      Attr.set(element, 'role', 'listbox');
    };

    var tabList = function (element) {
      Attr.set(element, 'role', 'tablist');
    };

    var tabButton = function (element, label) {
      Attr.setAll(element, {
        'aria-label': label,
        'role': 'tab'
      });
    };

    var tabPanel = function (element /*, label */) {
      Attr.setAll(element, {
        'role': 'tabpanel'
        // 'aria-label': label // Doesn't seem to be read by JAWS or VoiceOver, so giving up
      });
    };

    var linkTabToPanel = function (tab, panel) {
      // I couldn't hear any difference with this, but the concept is linking buttons to the panel that will show
      var id = Id.generate('ephox-aria');
      Attr.set(panel, 'id', id);
      Attr.setAll(tab, {
        'aria-controls': id,
        'aria-owns': id
      });
    };

    // TODO: Pass in the entire grid, if we can
    var grid = function (element, label) {
      Attr.setAll(element, {
        'aria-label': label,
        'role': 'grid'
      });
    };

    // TODO: Implement form ARIA support
    // var form = function (element, label) {
    //   throw 'Form ARIA support not implemented yet.';
    // };

    var input = function (element, label) {
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
      presentation: presentation,
      editor: editor,
      toolbar: toolbar,
      toolbarGroup: toolbarGroup,
      toolbarButton: toolbarButton,
      menu: menu,
      menuItem: menuItem,
      dialog: dialog,
      input: input,
      widget: widget,
      listBox: listBox,
      tabList: tabList,
      tabButton: tabButton,
      tabPanel: tabPanel,
      linkTabToPanel: linkTabToPanel,
      grid: grid
    };
  }
);