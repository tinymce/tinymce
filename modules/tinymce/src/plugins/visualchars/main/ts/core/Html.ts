import * as Data from './Data';

const wrapCharWithSpan = (value: string): string =>
  '<span data-mce-bogus="1" class="mce-' + Data.charMap[value] + '">' + value + '</span>';

export {
  wrapCharWithSpan
};
