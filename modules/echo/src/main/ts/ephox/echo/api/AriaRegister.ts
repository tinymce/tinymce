import { Arr, Fun, Id, Merger, Type } from '@ephox/katamari';
import { Attr, Class, Element, Insert, InsertAll } from '@ephox/sugar';
import Styles from './Styles';

const helpStyle = Styles.resolve('aria-help');
const helpVisibleStyle = Styles.resolve('aria-help-visible');

const roleDocument = function (element) {
  Attr.set(element, 'role', 'document');
};

const presentation = function (element: Element) {
// https://www.w3.org/TR/wai-aria/roles#presentation
  Attr.set(element, 'role', 'presentation');
};

const region = function (element) {
  Attr.set(element, 'role', 'region');
};

const editorCommon = function (container, ariaLabel) {
  // The editor needs to be role application otherwise ainspector will complain about event listeners
  Attr.setAll(container, {
    'role': 'application',
    'aria-label': ariaLabel
  });
};

const editor = function (container, editor, arialabel, ariaHelp, showHelpHint = false) {
  editorCommon(container, arialabel);

  ariaHelp.each(function (helpText) {
    const aria = Element.fromTag('span');
    presentation(aria);
    Insert.append(aria, Element.fromText(helpText));
    const labelId = Id.generate('ephox-aria');
    Attr.set(aria, 'id', labelId);
    describedBy(editor, labelId);
    Class.add(aria, helpStyle);
    if (showHelpHint === true) {
      Class.add(aria, helpVisibleStyle);
    }
    Insert.append(container, aria);
  });

  const destroy = function () {
    Attr.remove(editor, 'aria-describedby');
  };

  return {
    destroy
  };
};

const inline = function (container, editor, arialabel, ariaHelp, _showHelpHint = false) {
  editorCommon(container, arialabel);

  const destroyers = [];

  if (Attr.has(editor, 'id')) {
    owns(container, Attr.get(editor, 'id'));
  } else {
    const tmpId = Id.generate('ephox-aria-content');
    Attr.set(editor, 'id', tmpId);
    owns(container, tmpId);

    destroyers.push(function () {
      Attr.remove(editor, 'id');
    });
  }

  ariaHelp.each(function (helpText) {
    if (Attr.has(editor, 'aria-label')) {
      const backup = Attr.get(editor, 'aria-label');
      label(editor, helpText);

      destroyers.push(function () {
        label(editor, backup);
      });
    } else {
      label(editor, helpText);

      destroyers.push(function () {
        Attr.remove(editor, 'aria-label');
      });
    }
  });

  const destroy = function () {
    Arr.each(destroyers, Fun.apply);
  };

  return {
    destroy
  };
};

// Set the role 'group'
const group = function (element) {
  Attr.set(element, 'role', 'group');
};

// Sets the role 'group', with a label
const toolbar = function (element, label) {
  Attr.setAll(element, {
    'role': 'group',
    'aria-label': label
  });
};

const menu = function (element, label) {
  Attr.setAll(element, {
    'aria-label': label,
    'role': 'menu'
  });
};

const buttonRole = function (element) {
  Attr.set(element, 'role', 'button');
};

const textButton = function (element, contentElement) {
  // Add 'button' roleto a pastry button, and 'presentation' role
  // to the contentElement that contains the button text.
  buttonRole(element);
  presentation(contentElement);
};

// Set the role 'button'
const toolbarButton = function (element, label, hasPopup, isToggle) {
  Attr.setAll(element, {
    'role': 'button',
    'aria-label': label,
    'aria-haspopup': '' + hasPopup
  });
  if (isToggle) {
    Attr.set(element, 'aria-pressed', 'false');
  }
  if (hasPopup) {
    Attr.set(element, 'aria-expanded', 'false');
  }
};

// Set the role 'toolbar' and aria-label if provided
const toolbarGroup = function (element, label?) {
  // TODO: duplicated from 'ephox.polish.alien.Query', consolidate isEmpty();
  const isEmpty = function (val) {
    // TODO: Move to compass Arr and violin Strings
    return (val === null) || (val === undefined) || (val === '') || (Type.isArray(val) && val.length === 0);
  };
  // End TODO

  Attr.set(element, 'role', 'toolbar');

  // customer groups may have empty label, don't use it
  if (!isEmpty(label)) {
    Attr.set(element, 'aria-label', label);
  }
};

const menuItem = function (element, label, hasPopup) {
  const labelTxt = label.map(function (txt) {
    return { 'aria-label': txt };
  }).getOr({});

  Attr.setAll(element, Merger.merge(labelTxt, {
    'role': 'menuitem',
    'aria-haspopup': hasPopup.getOr(false)
  }));
};

const menuItemCheckbox = function (element) {
  Attr.setAll(element, {
    'role': 'menuitemcheckbox',
    'aria-checked': false
  });
};

const checkbox = function (element, label) {
  Attr.setAll(element, {
    'role': 'checkbox',
    'aria-label': label,
    'aria-checked': false
  });
};

const dialog = function (element, label) {
  Attr.setAll(element, {
    'role': 'dialog',
    'aria-label': label
  });
};

const button = function (element, label) {
  Attr.setAll(element, {
    'aria-label': label,
    'role': 'button'
  });
};

// return a container object with methods {element, field} containing an html field and label
const labelledField = function (field, name, labelText) {
  const container = Element.fromTag('div');
  presentation(container);
  const id = name + Id.generate('');
  const lId = Id.generate('label');
  const label = Element.fromHtml('<label>' + labelText + '</label>');
  Attr.set(label, 'for', id);
  Attr.set(label, 'id', lId);
  Attr.set(field, 'id', id);
  labelledBy(field, lId); // required for JAWS17 if the label above is aria-hidden - the aria-labelledby will still work
  InsertAll.append(container, [ label, field ]);

  return {
    element: Fun.constant(container),
    field:   Fun.constant(field)
  };
};

const multiline = function (element) {
  Attr.set(element, 'aria-multiline', 'true');
};

const textarea = function (element) {
  Attr.setAll(element, {
    'aria-multiline': 'true',
    'role': 'textbox'
  });
};

const widget = function (element) {
  Attr.set(element, 'role', 'widget');
};

const listBox = function (element) {
  Attr.set(element, 'role', 'listbox');
};

const tabList = function (element) {
  Attr.set(element, 'role', 'tablist');
};

const tabButton = function (element, label) {
  Attr.setAll(element, {
    'aria-label': label,
    'role': 'tab'
  });
};

const tabPanel = function (element) {
  Attr.setAll(element, {
    role: 'tabpanel'
  });
};

const owns = function (element, id) {
  // https://www.w3.org/TR/wai-aria/states_and_properties#aria-owns
  // Identifies a functional parent/child relationship between dom elements
  // where the DOM hierarchy cannot be used.
  // An element can have only one explicit owner.
  Attr.set(element, 'aria-owns', id);
};

const disown = function (element) {
  // An element can have only one explicit owner, so this removes the attribute.
  Attr.remove(element, 'aria-owns');
};

const controls = function (element, id) {
  Attr.set(element, 'aria-controls', id);
};

const linkElements = function (master, slave) {
  const id = Id.generate('ephox-aria');
  Attr.set(slave, 'id', id);
  controls(master, id);
};

const linkTabToPanel = function (tab, panel) {
  linkElements(tab, panel);
};

const describedBy = function (element, id) {
  Attr.set(element, 'aria-describedby', id);
};

const labelledBy = function (element, id) {
  Attr.set(element, 'aria-labelledby', id);
};

const live = function (element, id, _priority) {
  const priority = _priority ? _priority : 'polite';
  Attr.setAll(element, {
    'aria-live': priority,
    'id': id
  });
};

const required = function (element) {
  Attr.set(element, 'aria-required', 'true');
};

// TODO: Implement form ARIA support
// const form = function (element, label) {
//   throw 'Form ARIA support not implemented yet.';
// };

const label = function (element, label) {
  Attr.set(element, 'aria-label', label);
};

const option = function (element) {
  Attr.set(element, 'role', 'option');
};

// TODO: Implement link ARIA support
// const link = function (element) {
//   throw 'Link ARIA support not implemented yet.';
// };

// TODO: Implement other ARIA support
// const other = function () {
//   throw 'Other ARIA support not implemented yet.';
// };

const hidden = function (element: Element, status: boolean) {
  // Note: aria-hidden=true says this element and all of its descendents are not percievable
  // https://www.w3.org/TR/wai-aria/states_and_properties#aria-hidden
  if (status) {
    Attr.set(element, 'aria-hidden', status);
  } else {
    Attr.remove(element, 'aria-hidden'); // same as setting aria-hidden:false
  }
};

const invalid = function (element, status) {
  if (status === true) {
    Attr.set(element, 'aria-invalid', 'true');
  } else {
    Attr.remove(element, 'aria-invalid');
  }
};

export default {
  document: roleDocument,
  presentation,
  region,
  controls,
  owns,
  disown,
  editor,
  inline,
  group,
  toolbar,
  toolbarGroup,
  toolbarButton,
  textButton,
  menu,
  menuItem,
  menuItemCheckbox,
  checkbox,
  dialog,
  buttonRole,
  button,
  labelledField,
  multiline,
  textarea,
  label,
  widget,
  option,
  listBox,
  live,
  tabList,
  tabButton,
  tabPanel,
  linkElements,
  linkTabToPanel,
  describedBy,
  labelledBy,
  required,
  hidden,
  invalid
};