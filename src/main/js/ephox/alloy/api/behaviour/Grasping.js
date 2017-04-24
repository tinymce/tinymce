define(
  'ephox.alloy.api.behaviour.Grasping',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.BehaviourConfig',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (Behaviour, BehaviourConfig, DomModification, FieldSchema, ValueSchema) {
    var schema = [
      FieldSchema.strict('graspClass'),
      FieldSchema.strict('color')
    ];

    var state = function (component, config) {
      var data = { };
      var reach = function () {

      };

      var withdraw = function () {

      };

      return {
        reach: reach,
        withdraw: withdraw
      };
    };

    /* This is a fake behaviour for testing out a concept */
    return Behaviour.create(
      schema,
      'grasping',
      {
        exhibit: function (base, graspConfig) {
          console.log('graspConfig', graspConfig);
          return DomModification.nu({
            styles: {
              'background': 'blue',
              color: graspConfig.color()
            }
          });
        }
      },
      {
        
      },
      {
        prepare: function (config) {
          var prepared = ValueSchema.asRawOrDie('grasping-prepare', ValueSchema.objOf(schema), config);
          
          return {
            key: 'grasping',
            value: {
              config: prepared,
              state: state
            }
          };
        }
      }
    );
  }
);
