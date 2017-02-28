define(
  'ephox.alloy.api.system.ForeignGui',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.foreign.ForeignCache',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Options',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.events.DomEvent'
  ],

  function (GuiFactory, SystemEvents, Gui, ForeignCache, Tagger, FieldSchema, Objects, ValueSchema, Arr, Cell, Fun, Options, Insert, DomEvent) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('root'),
      FieldSchema.strictArrayOfObj('dynamics', [
        FieldSchema.strict('getTarget'),
        FieldSchema.strict('config')
      ]),
      FieldSchema.defaulted('insertion', function (root, system) {
        Insert.append(root, system.element());
      })
    ]);

    var supportedEvents = [
      'click', 'mousedown', 'mousemove', 'touchstart', 'touchend', 'gesturestart'
    ];

    // Find the dynamic information for the target if available. Note, the 
    // dynamic may also change the target.
    var findDynamic = function (dynamics, target) {
      return Options.findMap(dynamics, function (dyn) {
        return dyn.getTarget()(target).map(function (newTarget) {
          return {
            target: Fun.constant(newTarget),
            dynamic: Fun.constant(dyn)
          };
        });
      });
    };

    var createEvent = function (event, target) {
      var source = Cell(target);

      var stopper = Cell(false);

      var cutter = Cell(false);

      var stop = function () {
        stopper.set(true);
      };

      var cut = function () {
        cutter.set(true);
      };

      return {
        stop: stop,
        cut: cut,
        event: Fun.constant(event),
        setSource: source.set,
        getSource: source.get
      };
    };

    var getProxy = function (event, target) {
      // Setup the component wrapping for the target element
      var proxy = GuiFactory.build(
        GuiFactory.external({ element: target })
      );

      // Create a simulated event
      var simulatedEvent = createEvent(event, target);
      
      return {
        proxy: Fun.constant(proxy),
        simulatedEvent: Fun.constant(simulatedEvent)
      };
    };

    var engage = function (spec) {
      var detail = ValueSchema.asStructOrDie('ForeignGui', schema, spec);

      // Creates an inner GUI and inserts it appropriately. This will be used
      // as the system for all behaviours
      var gui = Gui.create();
      detail.insertion()(detail.root(), gui);

      var cache = ForeignCache();
      

      var domEvents = Arr.map(supportedEvents, function (type) {
        return DomEvent.bind(detail.root(), type, function (event) {
          dispatchTo(type, event);
        });
      });

      var dispatchTo = function (type, event) {
        // Do not delegate anything that happened within the internal system. It is
        // already being handled.
        if (gui.element().dom().contains(event.target().dom())) return;

        findDynamic(detail.dynamics(), event.target()).each(function (dynTuple) {
          var data = cache.getEvents(dynTuple.target(), dynTuple.dynamic().config());
          var events = data.evts();
          if (Objects.hasKey(events, type)) {
            var proxy = getProxy(event, dynTuple.target());
            gui.addToWorld(proxy.proxy());
            events[type](proxy.proxy(), proxy.simulatedEvent());
            gui.removeFromWorld(proxy.proxy());
            Tagger.revoke(proxy.proxy().element());
          }
        });
      };

      // Remove any traces of the foreign component from the internal alloy system.
      var unproxy = function (component) {
        gui.removeFromWorld(component);
        Tagger.revoke(component.element());
      };

      var disengage = function () {
        Arr.each(domEvents, function (e) {
          e.unbind();
        });
      };

      return {
        dispatchTo: dispatchTo,
        unproxy: unproxy,
        disengage: disengage
      };
    };

    return {
      engage: engage
    };
  }
);
