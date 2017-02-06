define(
  'ephox.alloy.docs.Documentation',

  [
    'ephox.highway.Merger'
  ],

  function (Merger) {
    var toggling = {
      'toggling': {
        desc: 'The <em>toggling</em> behaviour is used to allow a component to switch ' +
          'between two states: off and on. At the moment, this <strong>must</strong> be ' +
          'associated with a change in ARIA state, but that might change in the future'
      },
      'toggling > selected': {
        desc: 'specify whether or not the component starts toggled',
      },
      'toggling > toggleClass': {
        desc: 'The class which is present when the component is toggled "on"',
      },
      'toggling > toggleOnExecute': {
        desc: 'Whether or not executing on the component should fire "toggle"'
      },
      'toggling > aria > aria-pressed-attr': {
        desc: 'The aria attribute to use for a toggled "on" state'
      },
      'toggling > aria > aria-expanded-attr': {
        desc: 'The aria attribute to use for a toggled "on" state which is expanded'
      }
    };

    var button = {
      'Button': {
        desc: 'A basic component with execution behaviour'
      },
      'Button > dom': {
        desc: 'The DOM structure of the button'
      },
      'Button > action': {
        desc: 'The action to fire on execute. If one is not supplied, it just triggers an execute on click'
      },
      'Button > role': {
        desc: 'The ARIA role for this button'
      }
    }

    return Merger.deepMerge(
      toggling,
      button
    );
  }
);