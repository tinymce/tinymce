import { AlloyComponent, AlloySpec, AlloyTriggers, Behaviour, Focusing, NativeEvents, SimpleSpec, Tabstopping } from '@ephox/alloy';
import { Fun, Id, Optional } from '@ephox/katamari';
import { Class, SelectorExists, SugarElement } from '@ephox/sugar';

import { ComposingConfigs } from '../alien/ComposingConfigs';

const beforeObject = Id.generate('alloy-fake-before-tabstop');
const afterObject = Id.generate('alloy-fake-after-tabstop');

const craftWithClasses = (classes: string[]): SimpleSpec => {
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

const craft = (containerClasses: Optional<string[]>, spec: AlloySpec): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-navobj', ...containerClasses.getOr([]) ]
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
const triggerTab = (placeholder: AlloyComponent, shiftKey: boolean): void => {
  AlloyTriggers.emitWith(placeholder, NativeEvents.keydown(), {
    raw: {
      which: 9,
      shiftKey
    }
  });
};

const onFocus = (container: AlloyComponent, targetComp: AlloyComponent): void => {
  const target = targetComp.element;
  // If focus has shifted naturally to a before object, the tab direction is backwards.
  if (Class.has(target, beforeObject)) {
    triggerTab(container, true);
  } else if (Class.has(target, afterObject)) {
    triggerTab(container, false);
  }
};

const isPseudoStop = (element: SugarElement<Element>): boolean => {
  return SelectorExists.closest(element, [ '.' + beforeObject, '.' + afterObject ].join(','), Fun.never);
};

export {
  isPseudoStop,
  onFocus,
  craft
};
