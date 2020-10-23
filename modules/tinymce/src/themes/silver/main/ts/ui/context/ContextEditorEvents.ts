/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// TODO: Find a better way of doing this. We probably don't want to just listen to
// editor events. Having an API available like WindowManager would be the best option

const showContextToolbarEvent = 'contexttoolbar-show';
const hideContextToolbarEvent = 'contexttoolbar-hide';

export {
  showContextToolbarEvent,
  hideContextToolbarEvent
};