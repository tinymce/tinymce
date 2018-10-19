import { Cell, Arr, Merger, Option } from '@ephox/katamari';

import { BehaviourState, nuState } from '../common/BehaviourState';
import { Objects } from '@ephox/boulder';
import { ItemDataTuple } from '../../ui/types/ItemTypes';
import { RepresentingState } from '../../behaviour/representing/RepresentingTypes';

const memory = (): RepresentingState => {
  const data = Cell(null);

  const readState = () => {
    return {
      mode: 'memory',
      value: data.get()
    };
  };

  const isNotSet = () => {
    return data.get() === null;
  };

  const clear = () => {
    data.set(null);
  };

  return nuState({
    set: data.set,
    get: data.get,
    isNotSet,
    clear,
    readState
  });
};

const manual = (): RepresentingState => {
  const readState = () => {

  };

  return nuState({
    readState
  });
};

export interface DatasetRepresentingState extends RepresentingState {
  lookup: <T extends ItemDataTuple>(itemString: string) => Option<T>;
  update: <T extends ItemDataTuple>(items: T[]) => void;
  clear: () => void;
}

const dataset = (): DatasetRepresentingState => {
  const dataByValue = Cell({ });
  const dataByText = Cell({ });

  const readState = () => {
    return {
      mode: 'dataset',
      dataByValue: dataByValue.get(),
      dataByText: dataByText.get()
    };
  };

  const clear = (): void => {
    dataByValue.set({ });
    dataByText.set({ });
  };

  // itemString can be matching value or text.
  const lookup = <T extends ItemDataTuple>(itemString: string): Option<T> => {
    return Objects.readOptFrom<T>(dataByValue.get(), itemString).orThunk(() => {
      return Objects.readOptFrom<T>(dataByText.get(), itemString);
    });
  };

  const update = <T extends ItemDataTuple>(items: T[]): void => {
    const currentDataByValue = dataByValue.get();
    const currentDataByText = dataByText.get();
    const newDataByValue = { };
    const newDataByText = { };
    Arr.each(items, (item) => {
      newDataByValue[item.value] = item;
      Objects.readOptFrom<Record<string, any>>(item, 'meta').each((meta) => {
        Objects.readOptFrom<string>(meta, 'text').each((text) => {
          newDataByText[text] = item;
        });
      });
    });

    dataByValue.set({
      ...currentDataByValue,
      ...newDataByValue
    });
    dataByText.set({
      ...currentDataByText,
      ...newDataByText
    })
  };

  return nuState({
    readState,
    lookup,
    update,
    clear
  }) as DatasetRepresentingState;
};

const init = (spec) => {
  return spec.store.manager.state(spec);
};

export {
  memory,
  dataset,
  manual,

  init
};