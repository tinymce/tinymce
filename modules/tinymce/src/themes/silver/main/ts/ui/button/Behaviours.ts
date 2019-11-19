import { AddEventsBehaviour, AlloyEvents, VerticalDir, Behaviour } from '@ephox/alloy';
import { Html } from '@ephox/sugar';
import * as Icons from '../icons/Icons';

const chevronSetter = (iconProvider: Icons.IconProvider): Behaviour.NamedConfiguredBehaviour<any, any> => {
  return (
    AddEventsBehaviour.config('attach-events', [
      AlloyEvents.runOnAttached((comp) => {
        const iconName = 'chevron-' + (VerticalDir.isBottomToTopDir(comp.element()) ? 'up' : 'down');
        Html.set(comp.element(), Icons.get(iconName, iconProvider));
      }),
    ])
  );
};

export {
  chevronSetter
};