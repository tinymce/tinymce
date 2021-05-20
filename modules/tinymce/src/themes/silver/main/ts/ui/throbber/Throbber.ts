/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, Blocking, Composing, DomFactory, Focusing, Keying, Replacing } from '@ephox/alloy';
import { Arr, Cell, Optional, Type } from '@ephox/katamari';
import { Attribute, Css } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { UiFactoryBackstageProviders, UiFactoryBackstageShared } from '../../backstage/Backstage';

const getBusySpec = (providerBackstage: UiFactoryBackstageProviders) => (_root: AlloyComponent, behaviours: Behaviour.AlloyBehaviourRecord): AlloySpec => ({
  dom: {
    tag: 'div',
    attributes: {
      'aria-label': providerBackstage.translate('Loading...')
    },
    classes: [ 'tox-throbber__busy-spinner' ]
  },
  components: [
    {
      dom: DomFactory.fromHtml('<div class="tox-spinner"><div></div><div></div><div></div></div>')
    }
  ],
  behaviours
});

const focusBusyComponent = (throbber: AlloyComponent): void =>
  Composing.getCurrent(throbber).each(Keying.focusIn);

/*
* If the throbber has been toggled on, only focus the throbber if the editor had focus as we don't to steal focus if it is on an input or dialog
* If the throbber has been toggled off, only put focus back on the editor if the throbber had focus.
* The next logical focus transition from the throbber is to put it back on the editor
*/
const toggleThrobber = (editor: Editor, comp: AlloyComponent, state: boolean, providerBackstage: UiFactoryBackstageProviders) => {
  const element = comp.element;
  if (state) {
    Blocking.block(comp, getBusySpec(providerBackstage));
    Css.remove(element, 'display');
    Attribute.remove(element, 'aria-hidden');
    if (editor.hasFocus()) {
      focusBusyComponent(comp);
    }
  } else {
    // Get the focus of the busy component before it is removed from the DOM
    const throbberFocus = Composing.getCurrent(comp).exists(Focusing.isFocused);
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

  // Make sure that when the editor is focused while the throbber is enabled, the focus is moved back to the throbber
  // This covers native focusin and editor.focus() invocations
  editor.on('PreInit', () => {
    const target = editor.inline ? editor.getBody() : editor.getWin();
    editor.dom.bind(target, 'focusin', () => {
      // console.log('here');
      if (throbberState.get()) {
        // Issues:
        // Ran into an issue where the cursor is still set in iframe. As result, ned this to run after on focus events
        // For inline, need to try and focus throbber after the UI has been fully rendered and shown
        focusBusyComponent(lazyThrobber());
      }
    });
  });

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
