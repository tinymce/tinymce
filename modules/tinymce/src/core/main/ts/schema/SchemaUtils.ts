import Tools from '../api/util/Tools';

export const split = (items: string | undefined, delim?: string): string[] => {
  items = Tools.trim(items);
  return items ? items.split(delim || ' ') : [];
};

// Converts a wildcard expression string to a regexp for example *a will become /.*a/.
export const patternToRegExp = (str: string): RegExp => new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');

