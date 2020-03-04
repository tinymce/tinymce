/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyTriggers, Behaviour, Focusing, NativeEvents, Tabstopping } from '@ephox/alloy';
import { Fun, Id } from '@ephox/katamari';
import { Class, SelectorExists } from '@ephox/sugar';

import { ComposingConfigs } from '../alien/ComposingConfigs';

const beforeObject = Id.generate('alloy-fake-before-tabstop');
const afterObject = Id.generate('alloy-fake-after-tabstop');

const craftWithClasses = function (classes) {
  return {
    dom: {
      tag: 'div',
      styles: {
        width: '1px',
        height: '1px',
        outline: 'none'
      },
      attributes: {
        tabindex: '0' // Capture native tabbing in the appropriate order
      },
      classes
    },
    behaviours: Behaviour.derive([
      Focusing.config( { ignore: true }),
      Tabstopping.config({ })
    ])
  };
};

const craft = function (spec) {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-navobj' ]
    },
    components: [
      craftWithClasses([ beforeObject ]),
      spec,
      craftWithClasses([ afterObject ])
    ],
    behaviours: Behaviour.derive([
      ComposingConfigs.childAt(1)
    ])
  };
};

// TODO: Create an API in alloy to do this.
const triggerTab = function (placeholder, shiftKey) {
  AlloyTriggers.emitWith(placeholder, NativeEvents.keydown(), {
    raw: {
      which: 9,
      shiftKey
    }
  });
};

const onFocus = function (container, targetComp) {
  const target = targetComp.element();
  // If focus has shifted naturally to a before object, the tab direction is backwards.
  if (Class.has(target, beforeObject)) { triggerTab(container, true); } else if (Class.has(target, afterObject)) { triggerTab(container, false); }
};

const isPseudoStop = function (element) {
  return SelectorExists.closest(element, [ '.' + beforeObject, '.' + afterObject ].join(','), Fun.constant(false));
};

export {
  isPseudoStop,
  onFocus,
  craft
};
