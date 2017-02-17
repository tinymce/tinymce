define(
  'ephox.alloy.demo.docs.Documentation',

  [
    'ephox.katamari.api.Merger'
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
    };

    var container = {
      'Container': {
        desc: 'The simplest component. Defaults to a <code>div</code>'
      }
    };

    var input = {
      'Input': {
        desc: 'A basic input area for the user. Can be an <code>input</code> or a <code>textarea</code>'
      },
      'Input > data': {
        desc: 'a <code>(value, text)</code> pair of information representing the value inside the input. Note, both values are required because the display value may be different from the internal value.'
      },
      'Input > type': {
        desc: 'the <code>type</code> attribute of the input'
      },
      'Input > tag': {
        desc: 'the tag to use for the input. Can be <code>input</code> or <code>textarea</code>'
      },
      'Input > placeholder': {
        desc: 'the placeholder to use for the input'
      },
      'Input > hasTabstop': {
        desc: 'Whether or not the input component should be a tabstop'
      }
    };

    return Merger.deepMerge(
      toggling,
      button,
      container,
      input
    );
  }
);