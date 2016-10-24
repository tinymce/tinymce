define(
  'ephox.alloy.spec.DropdownMenuSpec',

  [
    'ephox.alloy.dropdown.Dropdown',
    'ephox.highway.Merger'
  ],

  function (Dropdown, Merger) {
    var make = function (spec) {
      return Dropdown.make(
        Merger.deepMerge({
          view: {
            style: 'layered',
            members: spec.members,
            markers: spec.markers
          }
        }, spec)
      );
    };

    return {
      make: make
    };
  }
);