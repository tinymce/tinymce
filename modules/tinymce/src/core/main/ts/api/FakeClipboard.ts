
// The FakeClipboard has been designed to match the native Clipboard API as closely as possible
// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

import { Obj, Singleton } from '@ephox/katamari';

export interface FakeClipboardItem {
  readonly items: Record<string, any>;
  readonly types: ReadonlyArray<string>;
  readonly getType: <D = any>(type: string) => D | undefined;
}

/**
  * TinyMCE FakeClipboard API.
  *
  * @class tinymce.FakeClipboard
  */

interface FakeClipboard {

  /**
   * Create a FakeClipboardItem instance that is used when reading or writing data via the FakeClipboard API.
   *
   * @method FakeClipboardItem
   * @param {Object} items An object with the type as the key and any data as the value.
   * @returns {FakeClipboard.FakeClipboardItem} A new fake clipboard item to represent the specified items.
   */
  readonly FakeClipboardItem: (items: Record<string, any>) => FakeClipboardItem;

  /**
   * Writes arbitrary data to the fake clipboard.
   *
   * @method write
   * @param {Array} data An array of FakeClipboardItems to be written to the fake clipboard.
   */
  readonly write: (data: FakeClipboardItem[]) => void;

  /**
   * Requests arbitrary data from the fake clipboard.
   *
   * @method read
   * @returns {Array} An array of FakeClipboardItems if items exist on the fake clipboard, otherwise undefined.
   */
  readonly read: () => FakeClipboardItem[] | undefined;

  /**
   * Clear arbitrary data on the fake clipboard.
   *
   * @method clear
   */
  readonly clear: () => void;
}

const setup = (): FakeClipboard => {
  const dataValue = Singleton.value<FakeClipboardItem[]>();

  const FakeClipboardItem = (items: Record<string, any>): FakeClipboardItem => ({
    items,
    types: Obj.keys(items),
    getType: (type: string) => Obj.get(items, type).getOrUndefined()
  });

  const write = (data: FakeClipboardItem[]): void => {
    dataValue.set(data);
  };

  const read = (): FakeClipboardItem[] | undefined =>
    dataValue.get().getOrUndefined();

  const clear = dataValue.clear;

  return {
    FakeClipboardItem,
    write,
    read,
    clear
  };
};

const FakeClipboard = setup();

export default FakeClipboard;
