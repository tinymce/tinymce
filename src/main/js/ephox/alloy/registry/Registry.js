import EventRegistry from '../events/EventRegistry';
import AlloyLogger from '../log/AlloyLogger';
import Tagger from './Tagger';
import { Objects } from '@ephox/boulder';
import { Body } from '@ephox/sugar';



export default <any> function () {
  var events = EventRegistry();

  var components = { };

  var readOrTag = function (component) {
    var elem = component.element();
    return Tagger.read(elem).fold(function () {
      // No existing tag, so add one.
      return Tagger.write('uid-', component.element());
    }, function (uid) {
      return uid;
    });
  };

  var failOnDuplicate = function (component, tagId) {
    var conflict = components[tagId];
    if (conflict === component) unregister(component);
    else throw new Error(
      'The tagId "' + tagId + '" is already used by: ' + AlloyLogger.element(conflict.element()) + '\nCannot use it for: ' + AlloyLogger.element(component.element()) + '\n' +
        'The conflicting element is' + (Body.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM'
    );
  };

  var register = function (component) {
    var tagId = readOrTag(component);
    if (Objects.hasKey(components, tagId)) failOnDuplicate(component, tagId);
    // Component is passed through an an extra argument to all events
    var extraArgs = [ component ];
    events.registerId(extraArgs, tagId, component.events());
    components[tagId] = component;
  };

  var unregister = function (component) {
    Tagger.read(component.element()).each(function (tagId) {
      components[tagId] = undefined;
      events.unregisterId(tagId);
    });
  };

  var filter = function (type) {
    return events.filterByType(type);
  };

  var find = function (isAboveRoot, type, target) {
    return events.find(isAboveRoot, type, target);
  };

  var getById = function (id) {
    return Objects.readOpt(id)(components);
  };

  return {
    find: find,
    filter: filter,
    register: register,
    unregister: unregister,
    getById: getById
  };
};