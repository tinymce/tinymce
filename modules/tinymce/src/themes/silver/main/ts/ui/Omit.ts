/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// TODO: Once we upgrade to TypeScript 3.5, this will throw an error and can be deleted
 export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;