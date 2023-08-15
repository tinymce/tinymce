import Tools from '../api/util/Tools';

export const split = (items: string | undefined, delim?: string): string[] => {
  items = Tools.trim(items);
  return items ? items.split(delim || ' ') : [];
};

