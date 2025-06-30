export const encodeData = (data: string): string =>
  data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const decodeData = (data: string): string =>
  data.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

