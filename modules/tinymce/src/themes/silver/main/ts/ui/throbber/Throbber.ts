import { AlloyComponent, AlloySpec, Behaviour, Blocking, Composing, DomFactory, Replacing, SketchSpec } from '@ephox/alloy';
import { Arr, Cell, Optional, Singleton, Type } from '@ephox/katamari';
import { Attribute, Class, Css, Focus, SugarElement, SugarNode } from '@ephox/sugar';

import { EventUtilsEvent } from 'tinymce/core/api/dom/EventUtils';
import Editor from 'tinymce/core/api/Editor';
import { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Events from '../../api/Events';
import { UiFactoryBackstageProviders, UiFactoryBackstageShared } from '../../backstage/Backstage';

const getBusySpec = (providerBackstage: UiFactoryBackstageProviders) => (_root: AlloyComponent, _behaviours: Behaviour.AlloyBehaviourRecord): AlloySpec => ({
  dom: {
    tag: 'div',
    attributes: {
      'aria-label': providerBackstage.translate('Loading...'),
      'tabindex': '0'
    },
    classes: [ 'tox-throbber__busy-spinner' ]
  },
  components: [
    {
      dom: DomFactory.fromHtml('<div class="tox-spinner"><div></div><div></div><div></div></div>')
    }
  ],
});

const focusBusyComponent = (throbber: AlloyComponent): void =>
  Composing.getCurrent(throbber).each((comp) => Focus.focus(comp.element, true));

// When the throbber is enabled, prevent the iframe from being part of the sequential keyboard navigation when Tabbing
// TODO: TINY-7500 Only works for iframe mode at this stage
const toggleEditorTabIndex = (editor: Editor, state: boolean) => {
  const tabIndexAttr = 'tabindex';
  const dataTabIndexAttr = `data-mce-${tabIndexAttr}`;
  Optional.from(editor.iframeElement)
    .map(SugarElement.fromDom)
    .each((iframe) => {
      if (state) {
        Attribute.getOpt(iframe, tabIndexAttr).each((tabIndex) => Attribute.set(iframe, dataTabIndexAttr, tabIndex));
        Attribute.set(iframe, tabIndexAttr, -1);
      } else {
        Attribute.remove(iframe, tabIndexAttr);
        Attribute.getOpt(iframe, dataTabIndexAttr).each((tabIndex) => {
          Attribute.set(iframe, tabIndexAttr, tabIndex);
          Attribute.remove(iframe, dataTabIndexAttr);
        });
      }
    });
};

/*
* If the throbber has been toggled on, only focus the throbber if the editor had focus as we don't to steal focus if it is on an input or dialog
* If the throbber has been toggled off, only put focus back on the editor if the throbber had focus.
* The next logical focus transition from the throbber is to put it back on the editor
*/
const toggleThrobber = (editor: Editor, comp: AlloyComponent, state: boolean, providerBackstage: UiFactoryBackstageProviders) => {
  const element = comp.element;
  toggleEditorTabIndex(editor, state);
  if (state) {
    Blocking.block(comp, getBusySpec(providerBackstage));
    Css.remove(element, 'display');
    Attribute.remove(element, 'aria-hidden');
    if (editor.hasFocus()) {
      focusBusyComponent(comp);
    }
  } else {
    // Get the focus of the busy component before it is removed from the DOM
    const throbberFocus = Composing.getCurrent(comp).exists((busyComp) => Focus.hasFocus(busyComp.element));
    Blocking.unblock(comp);
    Css.set(element, 'display', 'none');
    Attribute.set(element, 'aria-hidden', 'true');
    if (throbberFocus) {
      editor.focus();
    }
  }
};

const renderThrobber = (spec: SketchSpec): AlloySpec => ({
  uid: spec.uid,
  dom: {
    tag: 'div',
    attributes: {
      'aria-hidden': 'true'
    },
    classes: [ 'tox-throbber' ],
    styles: {
      display: 'none'
    }
  },
  behaviours: Behaviour.derive([
    Replacing.config({}),
    Blocking.config({
      focus: false
    }),
    Composing.config({
      find: (comp) => Arr.head(comp.components())
    })
  ]),
  components: [ ]
});

const isFocusEvent = (event: EditorEvent<ExecCommandEvent> | EventUtilsEvent<FocusEvent>): event is EventUtilsEvent<FocusEvent> =>
  event.type === 'focusin';

const isPasteBinTarget = (event: EditorEvent<ExecCommandEvent> | EventUtilsEvent<FocusEvent>) => {
  if (isFocusEvent(event)) {
    const node = event.composed ? Arr.head(event.composedPath()) : Optional.from(event.target);
    return node
      .map(SugarElement.fromDom)
      .filter(SugarNode.isElement)
      .exists((targetElm) => Class.has(targetElm, 'mce-pastebin'));
  } else {
    return false;
  }
};

const setup = (editor: Editor, lazyThrobber: () => AlloyComponent, sharedBackstage: UiFactoryBackstageShared): void => {
  const throbberState = Cell<boolean>(false);
  const timer = Singleton.value<number>();

  const stealFocus = (e: EditorEvent<ExecCommandEvent> | EventUtilsEvent<FocusEvent>) => {
    if (throbberState.get() && !isPasteBinTarget(e)) {
      e.preventDefault();
      focusBusyComponent(lazyThrobber());
      editor.editorManager.setActive(editor);
    }
  };

  // TODO: TINY-7500 Only worrying about iframe mode at this stage since inline mode has a number of other issues
  if (!editor.inline) {
    editor.on('PreInit', () => {
      // Cover focus when the editor is focused natively
      editor.dom.bind(editor.getWin(), 'focusin', stealFocus);
      // Cover stealing focus when editor.focus() is called
      editor.on('BeforeExecCommand', (e) => {
        // If skipFocus is specified as true in the command, don't focus the Throbber
        if (e.command.toLowerCase() === 'mcefocus' && e.value !== true) {
          stealFocus(e);
        }
      });
    });
  }

  const toggle = (state: boolean) => {
    if (state !== throbberState.get()) {
      throbberState.set(state);
      toggleThrobber(editor, lazyThrobber(), state, sharedBackstage.providers);
      Events.fireAfterProgressState(editor, state);
    }
  };

  editor.on('ProgressState', (e) => {
    timer.on(clearTimeout);
    if (Type.isNumber(e.time)) {
      const timerId = Delay.setEditorTimeout(editor, () => toggle(e.state), e.time);
      timer.set(timerId);
    } else {
      toggle(e.state);
      timer.clear();
    }
  });
};

export {
  renderThrobber,
  setup
};
