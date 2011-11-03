require("include/include.js");

var Struct = demand("ephox.scullion.Struct");
var Events = demand("ephox.porkbun.Events");
var Binder = demand("ephox.porkbun.Binder");

function testBinder() {
  var events = Events.create({
    myEvent: Struct.immutable('one', 'two')
  });

  var binder = Binder.create();

  var called = false;

  binder.bind(events.registry.myEvent, function(event) {
    called = true;
  });

  jssert.assertThrows(function () {
    binder.bind(events.registry.myEvent, function(event) {
      called = true;
    });
  }, 'Bind error: event type has already been bound');

  events.trigger.myEvent('a', 'b');
  jssert.assertEq(true, called);

  called = false;

  binder.unbind(events.registry.myEvent);

  events.trigger.myEvent('a', 'b');
  jssert.assertEq(false, called);

  jssert.assertThrows(function () {
    binder.unbind(events.registry.myEvent);
  }, 'Unbind error: unknown event type');
}