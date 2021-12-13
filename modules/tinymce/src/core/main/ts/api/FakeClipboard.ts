
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Singleton } from '@ephox/katamari';

/**
  * TinyMCE FakeClipboard API.
  *
  * @class tinymce.FakeClipboard
  */

interface FakeClipboard {

  /**
   * Writes arbitrary data to the fake clipboard.
   *
   * @method write
   * @param {any} data data to be written to the fake clipboard
   */
  readonly write: <T>(data: T) => void;

  /**
   * Requests arbitrary data from the fake clipboard.
   *
   * @method read
   */
  readonly read: <T>() => T | undefined;

  /**
   * Clear arbitrary data on the fake clipboard.
   *
   * @method clear
   */
  readonly clear: () => void;
}

const setup = (): FakeClipboard => {
  const dataValue = Singleton.value<any>();

  const write = <T>(data: T): void => {
    dataValue.set(data);
  };

  const read = <T>(): T | undefined =>
    dataValue.get().getOrUndefined();

  const clear = dataValue.clear;

  return {
    write,
    read,
    clear
  };
};

const FakeClipboard = setup();

export default FakeClipboard;
