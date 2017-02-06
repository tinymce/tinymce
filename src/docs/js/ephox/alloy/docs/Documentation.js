define(
  'ephox.alloy.docs.Documentation',

  [
    'ephox.highway.Merger'
  ],

  function (Merger) {
    var toggling = {
      'toggling > selected': 'specify whether or not the component starts toggled',
      'toggling > toggleClass': 
        'The class which is present when the component is toggled "on"',
      'toggling > toggleOnExecute': 
        'Whether or not executing on the component should fire "toggle"',
      'toggling > aria > aria-pressed-attr': 
        'The aria attribute to use for a toggled "on" state',
      'toggling > aria > aria-expanded-attr': 
        'The aria attribute to use for a toggled "on" state which is expanded'
    };

    return Merger.deepMerge(
      toggling
    );
  }
);