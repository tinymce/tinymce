import { Optional } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Replacing } from '../../api/behaviour/Replacing';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as GuiFactory from '../../api/component/GuiFactory';
import { BlockFn, BlockingConfig, BlockingState, UnblockFn } from './BlockingTypes';

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

  const root = config.getRoot(component).getOr(component);
  const blockerBehaviours = Behaviour.derive([
    // Trap the "Tab" key and don't let it escape.
    Keying.config({
      mode: 'special',
      onTab: () => Optional.some<boolean>(true),
      onShiftTab: () => Optional.some<boolean>(true)
    }),
    Focusing.config({ })
  ]);
  const blockSpec = getBusySpec(root, blockerBehaviours);
  const blocker = root.getSystem().build(blockSpec);
  Replacing.append(root, GuiFactory.premade(blocker));
  if (blocker.hasConfigured(Keying) && config.focus) {
    Keying.focusIn(blocker);
  }

  if (!state.isBlocked()) {
    config.onBlock(component);
  }
  state.blockWith(() => Replacing.remove(root, blocker));
};

// Mark this component as unblocked, or not busy. This is a noop on a component
// that isn't blocked.
export const unblock: UnblockFn = (component, config, state) => {
  Attribute.remove(component.element, 'aria-busy');

  if (state.isBlocked()) {
    config.onUnblock(component);
  }
  state.clear();
};

export const isBlocked = (component: AlloyComponent, blockingConfig: BlockingConfig, blockingState: BlockingState): boolean =>
  blockingState.isBlocked();
