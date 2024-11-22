import { Arr, Optional, Strings } from '@ephox/katamari';
import { Attribute, Compare, ContentEditable, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import VK from '../api/util/VK';
import * as ModeUtils from '../util/ModeUtils';

const isDisabled = (editor: Editor): boolean => Options.isDisabled(editor);

const internalContentEditableAttr = 'data-mce-contenteditable';

const switchOffContentEditableTrue = (elm: SugarElement<Node>) => {
  Arr.each(SelectorFilter.descendants<HTMLElement>(elm, '*[contenteditable="true"]'), (elm) => {
    Attribute.set(elm, internalContentEditableAttr, 'true');
    ContentEditable.set(elm, false);
  });
};

const switchOnContentEditableTrue = (elm: SugarElement<Node>) => {
  Arr.each(SelectorFilter.descendants<HTMLElement>(elm, `*[${internalContentEditableAttr}="true"]`), (elm) => {
    Attribute.remove(elm, internalContentEditableAttr);
    ContentEditable.set(elm, true);
  });
};

const toggleDisabled = (editor: Editor, state: boolean): void => {
  const body = SugarElement.fromDom(editor.getBody());

  if (state) {
    ModeUtils.disableEditor(editor);
    ContentEditable.set(body, false);
    switchOffContentEditableTrue(body);
  } else {
    switchOnContentEditableTrue(body);
    ModeUtils.enableEditor(editor);
  }
};

const registerDisabledContentFilters = (editor: Editor): void => {
  if (editor.serializer) {
    registerFilters(editor);
  } else {
    editor.on('PreInit', () => {
      registerFilters(editor);
    });
  }
};

const registerFilters = (editor: Editor): void => {
  editor.parser.addAttributeFilter('contenteditable', (nodes) => {
    if (isDisabled(editor)) {
      Arr.each(nodes, (node) => {
        node.attr(internalContentEditableAttr, node.attr('contenteditable'));
        node.attr('contenteditable', 'false');
      });
    }
  });

  editor.serializer.addAttributeFilter(internalContentEditableAttr, (nodes) => {
    if (isDisabled(editor)) {
      Arr.each(nodes, (node) => {
        node.attr('contenteditable', node.attr(internalContentEditableAttr));
      });
    }
  });

  editor.serializer.addTempAttr(internalContentEditableAttr);
};

const isClickEvent = (e: Event): e is MouseEvent => e.type === 'click';

const allowedEvents: ReadonlyArray<string> = [ 'copy' ];

const isAllowedEventInDisabledMode = (e: Event) => Arr.contains(allowedEvents, e.type);

const getAnchorHrefOpt = (editor: Editor, elm: SugarElement<Node>): Optional<string> => {
  const isRoot = (elm: SugarElement<Node>) => Compare.eq(elm, SugarElement.fromDom(editor.getBody()));
  return SelectorFind.closest<HTMLAnchorElement>(elm, 'a', isRoot).bind((a) => Attribute.getOpt(a, 'href'));
};

const processDisabledEvents = (editor: Editor, e: Event): void => {
  /*
    If an event is a click event on or within an anchor, and the CMD/CTRL key is
    not held, then we want to prevent default behaviour and either:
      a) scroll to the relevant bookmark
      b) open the link using default browser behaviour
  */
  if (isClickEvent(e) && !VK.metaKeyPressed(e)) {
    const elm = SugarElement.fromDom(e.target as Node);
    getAnchorHrefOpt(editor, elm).each((href) => {
      e.preventDefault();
      if (/^#/.test(href)) {
        const targetEl = editor.dom.select(`${href},[name="${Strings.removeLeading(href, '#')}"]`);
        if (targetEl.length) {
          editor.selection.scrollIntoView(targetEl[0], true);
        }
      } else {
        window.open(href, '_blank', 'rel=noopener noreferrer,menubar=yes,toolbar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes');
      }
    });
  } else if (isAllowedEventInDisabledMode(e)) {
    editor.dispatch(e.type, e);
  }
};

const registerDisabledModeEventHandlers = (editor: Editor): void => {
  editor.on('ShowCaret ObjectSelected', (e) => {
    if (isDisabled(editor)) {
      e.preventDefault();
    }
  });

  // Preprend to the handlers as this should be the first to fire
  editor.on('DisabledStateChange', (e) => {
    if (!e.isDefaultPrevented()) {
      toggleDisabled(editor, e.state);
    }
  });
};

const registerEventsAndFilters = (editor: Editor): void => {
  registerDisabledContentFilters(editor);
  registerDisabledModeEventHandlers(editor);
};

export {
  isDisabled,
  processDisabledEvents,
  getAnchorHrefOpt,
  toggleDisabled,
  registerEventsAndFilters
};
