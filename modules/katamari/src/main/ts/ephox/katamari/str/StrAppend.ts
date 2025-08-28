export const addToStart = (str: string, prefix: string): string => {
  return prefix + str;
};

export const addToEnd = (str: string, suffix: string): string => {
  return str + suffix;
};

export const removeFromStart = (str: string, numChars: number): string => {
  return str.substring(numChars);
};

export const removeFromEnd = (str: string, numChars: number): string => {
  return str.substring(0, str.length - numChars);
};
