import { createTable } from '../../../main/ts/ephox/bridge/components/dialog/Table';

export const createWordcountDialog = (): void => {
  createTable({
    type: 'table',
    header: [ 'hello', 'world' ],
    cells: [
      [ 'hej', 'vaerld' ],
      [ 'yahoo', 'sekai' ]
    ]
  });
};
