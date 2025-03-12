import { Arr } from '@ephox/katamari';

import { Strings} from '@ephox/katamari';

export interface BasicSelectItem {
  readonly title: string;
  readonly format: string;
  readonly icon?: string;
}

export enum Delimiter {
  SemiColon = ';',
  Space = ' '
}

const process = (rawFormats: string[]): BasicSelectItem[] => Arr.map(rawFormats, (item) => {
  let title = item, format = item;
  // Allow text=value block formats
  const values = Arr.filter(item.split('='), (value) => Strings.isNotEmpty(value));
  if (values.length > 1) {
    title = values[0];
    format = values[1];
  }

  title = Strings.trim(title);
  format = Strings.trim(format);

  return { title, format };
});

const split = (rawFormats: string, delimiter: Delimiter): string[] => {
  if (delimiter === Delimiter.SemiColon) {
    return rawFormats.replace(/;$/, '').split(';');
  } else {
    return rawFormats.split(' ');
  }
};

const makeBasicSelectItems = (rawFormats: string, delimiter: Delimiter): BasicSelectItem[] => process(split(rawFormats, delimiter));

export {
  makeBasicSelectItems
};
