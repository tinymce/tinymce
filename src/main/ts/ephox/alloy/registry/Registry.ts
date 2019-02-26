import { Objects } from '@ephox/boulder';
import { Option } from '@ephox/katamari';
import { Body, Element } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import EventRegistry, { ElementAndHandler, UidAndHandler } from '../events/EventRegistry';
import * as AlloyLogger from '../log/AlloyLogger';
import * as Tagger from './Tagger';

export default () => {
  const events = EventRegistry();

  // An index of uid -> built components
  const components: Record<string, AlloyComponent> = { };

  const readOrTag = (component: AlloyComponent): string => {
    const elem = component.element();
    return Tagger.read(elem).fold(() => {
      // No existing tag, so add one.
      return Tagger.write('uid-', component.element());
    }, (uid) => {
      return uid;
    });
  };

  const failOnDuplicate = (component: AlloyComponent, tagId: string): void => {
    const conflict = components[tagId];
    if (conflict === component) { unregister(component); } else { throw new Error(
      'The tagId "' + tagId + '" is already used by: ' + AlloyLogger.element(conflict.element()) + '\nCannot use it for: ' + AlloyLogger.element(component.element()) + '\n' +
        'The conflicting element is' + (Body.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM'
    );
    }
  };

  const register = (component: AlloyComponent): void => {
    const tagId = readOrTag(component);
    if (Objects.hasKey(components, tagId)) { failOnDuplicate(component, tagId); }
    // Component is passed through an an extra argument to all events
    const extraArgs = [ component ];
    events.registerId(extraArgs, tagId, component.events());
    components[tagId] = component;
  };

  const unregister = (component: AlloyComponent): void => {
    Tagger.read(component.element()).each((tagId) => {
      delete components[tagId];
      events.unregisterId(tagId);
    });
  };

  const filter = (type: string): UidAndHandler[] => {
    return events.filterByType(type);
  };

  const find = (isAboveRoot: (elem: Element) => boolean, type: string, target: Element): Option<ElementAndHandler> => {
    return events.find(isAboveRoot, type, target);
  };

  const getById = (id: string): Option<AlloyComponent> => {
    return Objects.readOpt(id)(components) as Option<AlloyComponent>;
  };

  return {
    find,
    filter,
    register,
    unregister,
    getById
  };
};