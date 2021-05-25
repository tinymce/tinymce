/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, Blocking, Composing, DomFactory, Replacing } from '@ephox/alloy';
import { Arr, Cell, Obj, Optional, Type } from '@ephox/katamari';
import { Attribute, Css, Focus, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import * as Settings from '../../api/Settings';
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
  Composing.getCurrent(throbber).each((comp) => Focus.focus(comp.element));

// When the throbber is enabled, prevent the iframe from being part of the sequential keyboard navigation when Tabbing
// TODO: TINY-7500 Only works for iframe mode at this stage
const toggleEditorTabIndex = (editor: Editor, state: boolean) => {
  Optional.from(editor.iframeElement)
    .map(SugarElement.fromDom)
    .each((iframe) => {
      if (state) {
        Attribute.set(iframe, 'tabindex', -1);
      } else {
        Obj.get(Settings.getIframeAttrs(editor), 'tabindex')
          .fold(() => {
            Attribute.remove(iframe, 'tabindex');
          }, (val) => {
            Attribute.set(iframe, 'tabindex', val);
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

const renderThrobber = (spec): AlloySpec => ({
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

const setup = (editor: Editor, lazyThrobber: () => AlloyComponent, sharedBackstage: UiFactoryBackstageShared) => {
  const throbberState = Cell<boolean>(false);
  const timer = Cell<Optional<number>>(Optional.none());

  const stealFocus = (setActive: boolean) => (e) => {
    if (throbberState.get()) {
      e.preventDefault();
      focusBusyComponent(lazyThrobber());
      if (setActive) {
        editor.editorManager.setActive(editor);
      }
    }
  };

  // TODO: TINY-7500 Only worrying about iframe mode at this stage since inline mode has a number of other issues
  if (!editor.inline) {
    editor.on('PreInit', () => {
      // Cover focus when when the editor is focused natively
      editor.dom.bind(editor.getWin(), 'focusin', stealFocus(false));
      // Cover stealing focus when editor.focus() is called
      editor.on('BeforeExecCommand', (e) => {
        // If skipFocus is specified as true in the command, don't focus the Throbber
        if (e.command.toLowerCase() === 'mcefocus' && e.value !== true) {
          stealFocus(true)(e);
        }
      });
    });
  }

  const toggle = (state: boolean) => {
    if (state !== throbberState.get()) {
      throbberState.set(state);
      toggleThrobber(editor, lazyThrobber(), state, sharedBackstage.providers);
      editor.fire('AfterProgressState', { state });
    }
  };

  editor.on('ProgressState', (e) => {
    timer.get().each(Delay.clearTimeout);
    if (Type.isNumber(e.time)) {
      const timerId = Delay.setEditorTimeout(editor, () => toggle(e.state), e.time);
      timer.set(Optional.some(timerId));
    } else {
      toggle(e.state);
      timer.set(Optional.none());
    }
  });
};

export {
  renderThrobber,
  setup
};
