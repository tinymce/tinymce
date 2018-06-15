import { Objects } from '@ephox/boulder';
import { Body } from '@ephox/sugar';

import EventRegistry from '../events/EventRegistry';
import * as AlloyLogger from '../log/AlloyLogger';
import * as Tagger from './Tagger';

export default <any> () => {
  const events = EventRegistry();

  const components = { };

  const readOrTag = (component) => {
    const elem = component.element();
    return Tagger.read(elem).fold(() => {
      // No existing tag, so add one.
      return Tagger.write('uid-', component.element());
    }, (uid) => {
      return uid;
    });
  };

  const failOnDuplicate = (component, tagId) => {
    const conflict = components[tagId];
    if (conflict === component) { unregister(component); } else { throw new Error(
      'The tagId "' + tagId + '" is already used by: ' + AlloyLogger.element(conflict.element()) + '\nCannot use it for: ' + AlloyLogger.element(component.element()) + '\n' +
        'The conflicting element is' + (Body.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM'
    );
    }
  };

  const register = (component) => {
    const tagId = readOrTag(component);
    if (Objects.hasKey(components, tagId)) { failOnDuplicate(component, tagId); }
    // Component is passed through an an extra argument to all events
    const extraArgs = [ component ];
    events.registerId(extraArgs, tagId, component.events());
    components[tagId] = component;
  };

  const unregister = (component) => {
    Tagger.read(component.element()).each((tagId) => {
      components[tagId] = undefined;
      events.unregisterId(tagId);
    });
  };

  const filter = (type) => {
    return events.filterByType(type);
  };

  const find = (isAboveRoot, type, target) => {
    return events.find(isAboveRoot, type, target);
  };

  const getById = (id) => {
    return Objects.readOpt(id)(components);
  };

  return {
    find,
    filter,
    register,
    unregister,
    getById
  };
};