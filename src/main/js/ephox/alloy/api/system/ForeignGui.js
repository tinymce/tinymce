define(
  'ephox.alloy.api.system.ForeignGui',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.events.DescribedHandler',
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

  function (GuiFactory, Gui, DescribedHandler, ForeignCache, Tagger, FieldSchema, Objects, ValueSchema, Arr, Cell, Fun, Options, Insert, DomEvent) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('root'),
      FieldSchema.strictArrayOfObj('dispatchers', [
        FieldSchema.strict('getTarget'),
        FieldSchema.strict('alloyConfig')
      ]),
      FieldSchema.defaulted('insertion', function (root, system) {
        Insert.append(root, system.element());
      })
    ]);

    var supportedEvents = [
      'click', 'mousedown', 'mousemove', 'touchstart', 'touchend', 'gesturestart'
    ];

    // Find the dispatcher information for the target if available. Note, the 
    // dispatcher may also change the target.
    var findDispatcher = function (dispatchers, target) {
      return Options.findMap(dispatchers, function (dispatcher) {
        return dispatcher.getTarget()(target).map(function (newTarget) {
          return {
            target: Fun.constant(newTarget),
            dispatcher: Fun.constant(dispatcher)
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
      var component = GuiFactory.build(
        GuiFactory.external({ element: target })
      );

      // Create a simulated event
      var simulatedEvent = createEvent(event, target);
      
      return {
        component: Fun.constant(component),
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

      var proxyFor = function (event, target, descHandler) {
        // create a simple alloy wrapping around the element, and add it to the world
        var proxy = getProxy(event, target);
        var component = proxy.component();
        gui.addToWorld(component);
        // fire the event
        var handler = DescribedHandler.getHandler(descHandler);
        handler(component, proxy.simulatedEvent());

        // now remove from the world and revoke any alloy ids
        unproxy(component);
      };

      var dispatchTo = function (type, event) {
        // Do not delegate anything that happened within the internal system. It is
        // already being handled.
        if (gui.element().dom().contains(event.target().dom())) return;

        // Find if the target has an assigned dispatcher
        findDispatcher(detail.dispatchers(), event.target()).each(function (dispatchData) {
          var target = dispatchData.target();
          var dispatcher = dispatchData.dispatcher();

          // get any info for this current element, creating it if necessary
          var data = cache.getEvents(target, dispatcher.alloyConfig());
          var events = data.evts();

          // if this dispatcher defines this event, proxy it and fire the handler\
          if (Objects.hasKey(events, type)) proxyFor(event, target, events[type]);
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
