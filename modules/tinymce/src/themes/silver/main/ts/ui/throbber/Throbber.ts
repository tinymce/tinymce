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

const toggleThrobber = (comp: AlloyComponent, state: boolean, providerBackstage: UiFactoryBackstageProviders) => {
  const element = comp.element;
  if (state === true) {
    Blocking.block(comp, getBusySpec(providerBackstage));
    Css.remove(element, 'display');
    Attribute.remove(element, 'aria-hidden');
  } else {
    Blocking.unblock(comp);
    Css.set(element, 'display', 'none');
    Attribute.set(element, 'aria-hidden', 'true');
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

const focusBusyComponent = (throbber: AlloyComponent): void => {
  Composing.getCurrent(throbber).each((comp) => {
    Keying.focusIn(comp);
  });
};

/*
* If the throbber has been toggled on, only focus the throbber if the editor had focus as we don't to steal focus if it is on an input or dialog
* If the throbber has been toggled off, only put focus back on the editor if the throbber had focus.
* The next logical focus transition from the throbber is to put it back on the editor
*/
const handleFocus = (editor: Editor, throbber: AlloyComponent, state: boolean, throbberFocus: boolean) => {
  if (state) {
    if (editor.hasFocus()) {
      focusBusyComponent(throbber);
    }
  } else {
    if (throbberFocus) {
      editor.focus();
    }
  }
};

const setup = (editor: Editor, lazyThrobber: () => AlloyComponent, sharedBackstage: UiFactoryBackstageShared) => {
  const throbberState = Cell<boolean>(false);
  const timer = Cell<Optional<number>>(Optional.none());

  // Make sure that when the editor is focused while the throbber is enabled, the focus is moved back to the throbber
  // This covers native focus and editor.focus() invocations
  editor.on('focus', () => {
    if (throbberState.get()) {
      focusBusyComponent(lazyThrobber());
    }
  });

  const toggle = (state: boolean) => {
    if (state !== throbberState.get()) {
      const throbber = lazyThrobber();
      const throbberFocus = Composing.getCurrent(throbber).exists(Focusing.isFocused);
      throbberState.set(state);
      toggleThrobber(throbber, state, sharedBackstage.providers);
      handleFocus(editor, throbber, state, throbberFocus);
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
