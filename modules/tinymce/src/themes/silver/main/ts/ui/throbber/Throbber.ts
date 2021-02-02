/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, DomFactory, Focusing, Keying, Replacing } from '@ephox/alloy';
import { Cell, Optional, Type } from '@ephox/katamari';
import { Attribute, Css } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { UiFactoryBackstageProviders, UiFactoryBackstageShared } from '../../backstage/Backstage';

const renderSpinner = (providerBackstage: UiFactoryBackstageProviders): AlloySpec => ({
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
  behaviours: Behaviour.derive([
    // Trap the "Tab" key and don't let it escape.
    Keying.config({
      mode: 'special',
      onTab: () => Optional.some(true),
      onShiftTab: () => Optional.some(true)
    }),
    Focusing.config({ })
  ])
});

const toggleThrobber = (comp: AlloyComponent, state: boolean, providerBackstage: UiFactoryBackstageProviders) => {
  const element = comp.element;
  if (state === true) {
    Replacing.set(comp, [ renderSpinner(providerBackstage) ]);
    Css.remove(element, 'display');
    Attribute.remove(element, 'aria-hidden');
  } else {
    Replacing.set(comp, [ ]);
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
    Replacing.config({})
  ]),
  components: [ ]
});

const setup = (editor: Editor, lazyThrobber: () => AlloyComponent, sharedBackstage: UiFactoryBackstageShared) => {
  const throbberState = Cell<boolean>(false);
  const timer = Cell<Optional<number>>(Optional.none());

  const toggle = (state: boolean) => {
    if (state !== throbberState.get()) {
      toggleThrobber(lazyThrobber(), state, sharedBackstage.providers);
      throbberState.set(state);
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
