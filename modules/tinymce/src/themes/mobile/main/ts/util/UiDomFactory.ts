/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { DomFactory, RawDomSchema } from '@ephox/alloy';
import { Strings } from '@ephox/katamari';
import * as Styles from '../style/Styles';

const dom = (rawHtml: string): RawDomSchema => {
  const html = Strings.supplant(rawHtml, {
    prefix: Styles.prefix
  });
  return DomFactory.fromHtml(html);
};

const spec = (rawHtml) => ({
  dom: dom(rawHtml)
});

export {
  dom,
  spec
};
