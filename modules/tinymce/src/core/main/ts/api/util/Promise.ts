/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Promise from '@ephox/wrap-promise-polyfill';

const promiseObj = window.Promise ? window.Promise : Promise;
export default promiseObj as PromiseConstructor;
