define(
  'ephox.alloy.api.behaviour.Swapping',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.swapping.SwapApis',
    'ephox.alloy.behaviour.swapping.SwapSchema'
  ],

  function (Behaviour, SwapApis, SwapSchema) {
    return Behaviour.create({
      fields: SwapSchema,
      name: 'swapping',
      apis: SwapApis
    });
  }
);
