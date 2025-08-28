import { Fun, Optional, Optionals } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { InlineContent, Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import * as Actions from '../core/Actions';
import * as OpenLink from '../core/OpenLink';
import * as Utils from '../core/Utils';

const openDialog = (editor: Editor) => (): void => {
  editor.execCommand('mceLink', false, { dialog: true });
};

const toggleState = (editor: Editor, toggler: (e: NodeChangeEvent) => void): () => void => {
  editor.on('NodeChange', toggler);
  return () => editor.off('NodeChange', toggler);
};

const toggleLinkState = (editor: Editor) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi): () => void => {
  const updateState = () => {
    api.setActive(!editor.mode.isReadOnly() && Utils.isInAnchor(editor, editor.selection.getNode()));
    api.setEnabled(editor.selection.isEditable());
  };
  updateState();
  return toggleState(editor, updateState);
};

const toggleLinkMenuState = (editor: Editor) => (api: Menu.MenuItemInstanceApi): () => void => {
  const updateState = () => {
    api.setEnabled(editor.selection.isEditable());
  };
  updateState();
  return toggleState(editor, updateState);
};

const toggleRequiresLinkState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): () => void => {
  const hasLinks = (parents: Node[]) => Utils.hasLinks(parents) || Utils.hasLinksInSelection(editor.selection.getRng());
  const parents = editor.dom.getParents(editor.selection.getStart());
  const updateEnabled = (parents: Node[]) => {
    api.setEnabled(hasLinks(parents) && editor.selection.isEditable());
  };
  updateEnabled(parents);
  return toggleState(editor, (e) => updateEnabled(e.parents));
};

const setupButtons = (editor: Editor, openLink: OpenLink.LinkSelection): void => {
  editor.ui.registry.addToggleButton('link', {
    icon: 'link',
    tooltip: 'Insert/edit link',
    shortcut: 'Meta+K',
    onAction: openDialog(editor),
    onSetup: toggleLinkState(editor)
  });

  editor.ui.registry.addButton('openlink', {
    icon: 'new-tab',
    tooltip: 'Open link',
    onAction: openLink.gotoSelectedLink,
    onSetup: toggleRequiresLinkState(editor)
  });

  editor.ui.registry.addButton('unlink', {
    icon: 'unlink',
    tooltip: 'Remove link',
    onAction: () => Actions.unlink(editor),
    onSetup: toggleRequiresLinkState(editor)
  });
};

const setupMenuItems = (editor: Editor, openLink: OpenLink.LinkSelection): void => {
  editor.ui.registry.addMenuItem('openlink', {
    text: 'Open link',
    icon: 'new-tab',
    onAction: openLink.gotoSelectedLink,
    onSetup: toggleRequiresLinkState(editor)
  });

  editor.ui.registry.addMenuItem('link', {
    icon: 'link',
    text: 'Link...',
    shortcut: 'Meta+K',
    onAction: openDialog(editor),
    onSetup: toggleLinkMenuState(editor)
  });

  editor.ui.registry.addMenuItem('unlink', {
    icon: 'unlink',
    text: 'Remove link',
    onAction: () => Actions.unlink(editor),
    onSetup: toggleRequiresLinkState(editor)
  });
};

const setupContextMenu = (editor: Editor): void => {
  const inLink = 'link unlink openlink';
  const noLink = 'link';
  editor.ui.registry.addContextMenu('link', {
    update: (element) => {
      const isEditable = editor.dom.isEditable(element);
      if (!isEditable) {
        return '';
      }

      return Utils.hasLinks(editor.dom.getParents(element, 'a') as HTMLAnchorElement[]) ? inLink : noLink;
    }
  });
};

const setupContextToolbars = (editor: Editor, openLink: OpenLink.LinkSelection): void => {
  const collapseSelectionToEnd = (editor: Editor) => {
    editor.selection.collapse(false);
  };

  const onSetupLink = (buttonApi: InlineContent.ContextFormButtonInstanceApi) => {
    const node = editor.selection.getNode();
    buttonApi.setEnabled(Utils.isInAnchor(editor, node) && editor.selection.isEditable());
    return Fun.noop;
  };

  /**
   * if we're editing a link, don't change the text.
   * if anything other than text is selected, don't change the text.
   * TINY-9593: If there is a text selection return `Optional.none`
   * because `mceInsertLink` command will handle the selection.
   */
  const getLinkText = (value: string) => {
    const anchor = Utils.getAnchorElement(editor);
    const onlyText = Utils.isOnlyTextSelected(editor);
    if (anchor.isNone() && onlyText) {
      const text = Utils.getAnchorText(editor.selection, anchor);
      return Optionals.someIf(text.length === 0, value);
    } else {
      return Optional.none();
    }
  };

  editor.ui.registry.addContextForm('quicklink', {
    launch: {
      type: 'contextformtogglebutton',
      icon: 'link',
      tooltip: 'Link',
      onSetup: toggleLinkState(editor)
    },
    label: 'Link',
    predicate: (node) => Options.hasContextToolbar(editor) && Utils.isInAnchor(editor, node),
    initValue: () => {
      const elm = Utils.getAnchorElement(editor);
      return elm.fold(Fun.constant(''), Utils.getHref);
    },
    commands: [
      {
        type: 'contextformtogglebutton',
        icon: 'link',
        tooltip: 'Link',
        primary: true,
        onSetup: (buttonApi) => {
          const node = editor.selection.getNode();
          // TODO: Make a test for this later.
          buttonApi.setActive(Utils.isInAnchor(editor, node));
          return toggleLinkState(editor)(buttonApi);
        },
        onAction: (formApi) => {
          const value = formApi.getValue();
          const text = getLinkText(value);
          const attachState = { href: value, attach: Fun.noop };
          Actions.link(editor, attachState, {
            href: value,
            text,
            title: Optional.none(),
            rel: Optional.none(),
            target: Optional.from(Options.getDefaultLinkTarget(editor)),
            class: Optional.none()
          });
          collapseSelectionToEnd(editor);
          formApi.hide();
        }
      },
      {
        type: 'contextformbutton',
        icon: 'unlink',
        tooltip: 'Remove link',
        onSetup: onSetupLink,
        // TODO: The original inlite action was quite complex. Are we missing something with this?
        onAction: (formApi) => {
          Actions.unlink(editor);
          formApi.hide();
        }
      },
      {
        type: 'contextformbutton',
        icon: 'new-tab',
        tooltip: 'Open link',
        onSetup: onSetupLink,
        onAction: (formApi) => {
          openLink.gotoSelectedLink();
          formApi.hide();
        }
      }
    ]
  });
};

const setup = (editor: Editor): void => {
  const openLink = OpenLink.setup(editor);

  setupButtons(editor, openLink);
  setupMenuItems(editor, openLink);
  setupContextMenu(editor);
  setupContextToolbars(editor, openLink);
};

export {
  setup
};
