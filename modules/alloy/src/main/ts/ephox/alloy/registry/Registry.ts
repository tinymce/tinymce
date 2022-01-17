import { Obj, Optional } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import { ElementAndHandler, EventRegistry, UidAndHandler } from '../events/EventRegistry';
import * as AlloyLogger from '../log/AlloyLogger';
import * as Tagger from './Tagger';

export interface Registry {
  readonly find: (isAboveRoot: (elem: SugarElement<Node>) => boolean, type: string, target: SugarElement<Node>) => Optional<ElementAndHandler>;
  readonly filter: (type: string) => UidAndHandler[];
  readonly register: (component: AlloyComponent) => void;
  readonly unregister: (component: AlloyComponent) => void;
  readonly getById: (id: string) => Optional<AlloyComponent>;
}

export const Registry = (): Registry => {
  const events = EventRegistry();

  // An index of uid -> built components
  const components: Record<string, AlloyComponent> = { };

  const readOrTag = (component: AlloyComponent): string => {
    const elem = component.element;
    return Tagger.read(elem).getOrThunk(() =>
      // No existing tag, so add one.
      Tagger.write('uid-', component.element)
    );
  };

  const failOnDuplicate = (component: AlloyComponent, tagId: string): void => {
    const conflict = components[tagId];
    if (conflict === component) {
      unregister(component);
    } else {
      throw new Error(
        'The tagId "' + tagId + '" is already used by: ' + AlloyLogger.element(conflict.element) + '\nCannot use it for: ' + AlloyLogger.element(component.element) + '\n' +
        'The conflicting element is' + (SugarBody.inBody(conflict.element) ? ' ' : ' not ') + 'already in the DOM'
      );
    }
  };

  const register = (component: AlloyComponent): void => {
    const tagId = readOrTag(component);
    if (Obj.hasNonNullableKey(components, tagId)) {
      failOnDuplicate(component, tagId);
    }
    // Component is passed through an an extra argument to all events
    const extraArgs = [ component ];
    events.registerId(extraArgs, tagId, component.events);
    components[tagId] = component;
  };

  const unregister = (component: AlloyComponent): void => {
    Tagger.read(component.element).each((tagId) => {
      delete components[tagId];
      events.unregisterId(tagId);
    });
  };

  const filter = (type: string): UidAndHandler[] => events.filterByType(type);

  const find = (isAboveRoot: (elem: SugarElement<Node>) => boolean, type: string, target: SugarElement<Node>): Optional<ElementAndHandler> =>
    events.find(isAboveRoot, type, target);

  const getById = (id: string): Optional<AlloyComponent> => Obj.get(components, id);

  return {
    find,
    filter,
    register,
    unregister,
    getById
  };
};
