require("include/include.js");

var Struct = demand("ephox.porkbun.Struct");
var Events = demand("ephox.porkbun.Events");

function testEvents() {
  var events = Events.create({ myEvent: Struct.immutable("name") });

  var called = false;
  var calledEvent = {};

  var handler = function(event) {
    calledEvent = event;
    called = true;
  };

  events.registry.myEvent.bind(handler)
  events.trigger.myEvent("something");

  jssert.assertEq(true, called);
  jssert.assertEq(true, calledEvent.hasOwnProperty("name"));
  jssert.assertEq("something", calledEvent.name());

  called = false;
  calledEvent = {};

  events.registry.myEvent.unbind(handler);
  events.trigger.myEvent("something");

  jssert.assertEq(false, called);
  jssert.assertEq(false, calledEvent.hasOwnProperty("name"));

  // This should not throw an error
  events.registry.myEvent.unbind(handler);
}

function testUndefinedHandler() {
  var events = Events.create({ emptyEvent: Struct.immutable() });

  jssert.assertThrows(function() {
    events.registry.emptyEvent.bind(undefined);
  }, 'Event bind error: undefined handler bound for event type "emptyEvent"');
}
