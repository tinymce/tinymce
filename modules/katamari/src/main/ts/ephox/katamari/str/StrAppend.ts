export const addToStart = function (str: string, prefix: string): string {
  return prefix + str;
};

export const addToEnd = function (str: string, suffix: string): string {
  return str + suffix;
};

export const removeFromStart = function (str: string, numChars: number): string {
  return str.substring(numChars);
};

export const removeFromEnd = function (str: string, numChars: number): string {
  return str.substring(0, str.length - numChars);
};
