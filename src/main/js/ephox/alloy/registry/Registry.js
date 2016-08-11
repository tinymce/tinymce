define(
  'ephox.alloy.registry.Registry',

  [
    'ephox.alloy.events.EventRegistry',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects'
  ],

  function (EventRegistry, Tagger, Objects) {
    return function () {
      var events = EventRegistry();
      
      var components = { };

      var readOrTag = function (component) {
        var elem = component.element();
        return Tagger.read(elem).fold(function () {
          // No existing tag, so add one.
          return Tagger.write(component.label(), component.element());
        }, function (uid) {
          return uid;
        });
      };

      var register = function (component) {
        var tagId = readOrTag(component);
        events.registerId(component, tagId, component.events());
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

      var find = function (isRoot, type, target) {
        return events.find(isRoot, type, target);
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