define(
  'ephox.alloy.registry.Registry',

  [
    'ephox.alloy.events.EventRegistry',
    'ephox.alloy.log.AlloyLogger',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.node.Body',
    'global!Error'
  ],

  function (EventRegistry, AlloyLogger, Tagger, Objects, Body, Error) {
    return function () {
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
        console.log('duplicate but eq', conflict===component);
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
  }
);