/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Class } from '@ephox/sugar';
import * as Styles from '../../style/Styles';

const scrollableStyle = Styles.resolve('scrollable');

const register = function (element) {
/*
 *  The reason this function exists is to have a
 *  central place where to set if an element can be explicitly
 *  scrolled. This is for mobile devices atm.
 */
  Class.add(element, scrollableStyle);
};

const deregister = function (element) {
  Class.remove(element, scrollableStyle);
};

const scrollable = scrollableStyle;

export {
  register,
  deregister,
  scrollable
};
