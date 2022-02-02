import { Arr } from '@ephox/katamari';

import * as Structs from '../api/Structs';

export const uniqueColumns = (details: Structs.DetailExt[]): Structs.DetailExt[] => {
  const uniqueCheck = (rest: Structs.DetailExt[], detail: Structs.DetailExt) => {
    const columnExists = Arr.exists(rest, (currentDetail) => currentDetail.column === detail.column);

    return columnExists ? rest : rest.concat([ detail ]);
  };

  return Arr.foldl(details, uniqueCheck, []).sort((detailA, detailB) =>
    detailA.column - detailB.column
  );
};
