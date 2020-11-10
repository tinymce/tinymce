import { Optional, Optionals } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Keying } from '../../api/behaviour/Keying';
import { Focusing } from '../../api/behaviour/Focusing';
import { Replacing } from '../../api/behaviour/Replacing';
import { AlloySpec } from '../../api/component/SpecTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as GuiFactory from '../../api/component/GuiFactory';
import { BlockingConfig } from './BlockingSchema';
import { BlockingState } from './BlockingState';

export type BlockFn = (component: AlloyComponent, config: BlockingConfig, state: BlockingState, getBusySpec?: (behaviour: Behaviour.AlloyBehaviourRecord) => AlloySpec) => void;
export type UnblockFn = (component: AlloyComponent, config: BlockingConfig, state: BlockingState) => void;

const createBlocker = (getBusySpec: (behaviour: Behaviour.AlloyBehaviourRecord) => AlloySpec, root: AlloyComponent): () => void => {
  const spec = getBusySpec(Behaviour.derive([
    // Trap the "Tab" key and don't let it escape.
    Keying.config({
      mode: 'special',
      onTab: () => Optional.some<boolean>(true),
      onShiftTab: () => Optional.some<boolean>(true)
    }),
    Focusing.config({ })
  ]));
  const blocker = root.getSystem().build(spec);
  Replacing.append(root, GuiFactory.premade(blocker));

  if (blocker.hasConfigured(Keying)) {
    Keying.focusIn(blocker);
  }

  return () => Replacing.remove(root, blocker);
};

// Mark this component as busy, or blocked.
export const block: BlockFn = (
  component,
  config,
  state,
  // This works in conjunction with the 'getRoot' function in the config. To
  // attach a blocker component to the dom, ensure that 'getRoot' returns a
  // component, and this function returns the specification of the component to
  // attach.
  getBusySpec
) => {
  Attribute.set(component.element, 'aria-busy', true);

  const newBlocker = Optionals.lift2(Optional.from(getBusySpec), config.getRoot(component), createBlocker);
  newBlocker.fold(state.clearBlocker, state.setBlocker);

  if (!state.getBlocked()) {
    config.onBlock(component);
  }
  state.setBlocked(true);
};

// Mark this component as unblocked, or not busy. This is a noop on a component
// that isn't blocked.
export const unblock: UnblockFn = (component, config, state) => {
  Attribute.remove(component.element, 'aria-busy');
  state.clearBlocker();

  if (state.getBlocked()) {
    config.onUnblock(component);
  }
  state.setBlocked(false);
};
