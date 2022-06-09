import { Arr, Obj, Type } from '@ephox/katamari';

import Tools from '../api/util/Tools';

const explode = Tools.explode;

export interface Filter<C extends Function> {
  name: string;
  callbacks: C[];
}

export interface FilterRegistry<C extends Function> {
  readonly addFilter: (name: string, callback: C) => void;
  readonly getFilters: () => Filter<C>[];
  readonly removeFilter: (name: string, callback?: C) => void;
}

export const create = <C extends Function>(): FilterRegistry<C> => {
  const filters: Record<string, Filter<C>> = {};

  const addFilter = (name: string, callback: C): void => {
    Arr.each(explode(name), (name) => {
      if (!Obj.has(filters, name)) {
        filters[name] = { name, callbacks: [] };
      }

      filters[name].callbacks.push(callback);
    });
  };

  const getFilters = (): Filter<C>[] =>
    Obj.values(filters);

  const removeFilter = (name: string, callback?: C): void => {
    Arr.each(explode(name), (name) => {
      if (Obj.has(filters, name)) {
        if (Type.isNonNullable(callback)) {
          const filter = filters[name];
          const newCallbacks = Arr.filter(filter.callbacks, (c) => c !== callback);
          // If all callbacks have been removed then remove the filter reference
          if (newCallbacks.length > 0) {
            filter.callbacks = newCallbacks;
          } else {
            delete filters[name];
          }
        } else {
          delete filters[name];
        }
      }
    });
  };

  return {
    addFilter,
    getFilters,
    removeFilter
  };
};
