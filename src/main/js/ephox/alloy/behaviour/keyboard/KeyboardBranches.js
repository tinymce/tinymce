define(
  'ephox.alloy.behaviour.keyboard.KeyboardBranches',

  [
    'ephox.alloy.keying.CyclicType',
    'ephox.alloy.keying.ExecutionType',
    'ephox.alloy.keying.FlatgridType',
    'ephox.alloy.keying.FlowType',
    'ephox.alloy.keying.MatrixType',
    'ephox.alloy.keying.MenuType',
    'ephox.alloy.keying.SpecialType'
  ],

  function (CyclicType, ExecutionType, FlatgridType, FlowType, MatrixType, MenuType, SpecialType) {
    return {
      cyclic: CyclicType.schema(),
      flow: FlowType.schema(),
      flatgrid: FlatgridType.schema(),
      matrix: MatrixType.schema(),
      execution: ExecutionType.schema(),
      menu: MenuType.schema(),
      special: SpecialType.schema()
    };
  }
);