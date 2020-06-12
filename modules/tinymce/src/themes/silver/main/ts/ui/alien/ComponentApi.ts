/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Disabling, Replacing, Representing, Toggling } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';

// Purpose to wrap internal bits we don't want to expose, like alloy component.

// TODO: we will need to move these derivatives back into their Component

const deriveToggling = (spec, component: AlloyComponent) => {
  if (spec.toggle && component.hasConfigured(Toggling)) {
    return spec.toggle().bind((toggle) => {
      if (toggle === true) {
        return {
          toggleOn: () => { Toggling.on(component); },
          toggleOff: () => { Toggling.off(component); },
          toggleIsOn: () => { Toggling.isOn(component); }
        };
      }
    });
  }
};

const deriveRepresenting = (spec, component: AlloyComponent) => {
  if (component.hasConfigured(Representing)) {
    const item = Representing.getValue(component);
    return {
      itemValue: () => item.value,
      itemText: () => item.text
    };
  }
};

const deriveReplacing = (spec, component: AlloyComponent) => {
  if (component.hasConfigured(Representing)) {
    /* TODO type this

    [{
      dom: {
        tag: 'div',
        classes: [ 'my-class' ],
        innerHtml: text
      }
    } ... ];
    */
    return {
      updateButton: Fun.curry(Replacing.set, component)
    };
  }
};

const component = (spec, component: AlloyComponent) => {
  // TODO: TS narrowing this method can return many type interfaces depending on the original config
  const togglingConf = deriveToggling(spec, component);
  const representingConf = deriveRepresenting(spec, component);
  const replaceingConf = deriveReplacing(spec, component);

  const defaults = {
    // Expose more as required
    element: component.element().dom(),
    isDisabled: () => Disabling.isDisabled(component),
    setDisabled: (state: boolean) => Disabling.set(component, state)
  };

  return {
    ...defaults,
    ...togglingConf,
    ...representingConf,
    ...replaceingConf
  };
};

export {
  component
};
