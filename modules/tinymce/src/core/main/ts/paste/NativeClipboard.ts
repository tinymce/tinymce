import { Arr, Optional, Result, Type } from '@ephox/katamari';

import Env from '../api/Env';

// // TODO: read - handles permissions
// // TODO: write
// // TODO: Create

// // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard`
// // https://developer.mozilla.org/en-US/docs/Web/Security/User_activation
// // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#security_considerations
// // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText
// // This method must be called within user gesture event handlers.
// // TODO: Consider transient activation: https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation

// // readText
// // All browsers require secure context
// // Safari: No other conditions
// // Firefox: Requires method to be called within user gesture event handlers.
// // Chromium Based Browsers: The user must grant the clipboard-read permission.

// // writeText
// // All browsers require secure context
// // Safari: This method must be called within user gesture event handlers.
// // Firefox: This method must be called within user gesture event handlers.
// // Chrome: From version 107, this method must be called within user gesture event handlers, or the user must grant the clipboard-write permission.

export interface ClipboardContents {
  [key: string]: string;
}

export type BaseClipboardErrorStatus = 'insecure' | 'inactive' | 'unknown' | 'no-permission';
type ClipboardReadStatus = BaseClipboardErrorStatus | 'valid';
// type ClipboardErrorTypes = 'read' | 'write' | 'permission';

const isSecure = () => window.isSecureContext;
const isActive = () => navigator.userActivation.isActive;
const isReadPermitted = async () => {
  const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
  return permission.state === 'granted';
};

const contentTypes = [ 'text/plain', 'text/html' ];

// NOTE: If there are multiple clipboard items,
// the last clipboard item will overwrite any existing type
const clipboardItemsToTypes = async (clipboardItems: ClipboardItems, types?: Set<string>): Promise<ClipboardContents> => {
  const data: ClipboardContents = {};

  for (const clipboardItem of clipboardItems) {
    for (const type of clipboardItem.types) {
      if (Type.isNullable(types) || types.has(type)) {
        const blob = await clipboardItem.getType(type);
        const text = await blob.text();
        data[type] = text;
      }
    }
  }

  return data;
};

const canRead = async (): Promise<ClipboardReadStatus> => {
  if (!isSecure()) {
    return 'insecure';
  } else if (!isActive()) {
    return 'inactive';
  }

  // For chromium browsers
  if (Env.browser.isChromium()) {
    try {
      const isPermitted = await isReadPermitted();
      if (!isPermitted) {
        return 'no-permission';
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return 'unknown';
    }
  }

  return 'valid';
};

const canWrite = async (): Promise<ClipboardReadStatus> => {
  if (!isSecure()) {
    return 'insecure';
  } else if (!isActive()) {
    return 'inactive';
  }
  return 'valid';
};
const rawRead = (): Promise<ClipboardItems> => {
  return navigator.clipboard.read();
};

const safeRead = async (): Promise<Optional<ClipboardItems>> => {
  try {
    const items = await navigator.clipboard.read();
    return Optional.some(items);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return Optional.none();
  }
};

const rawWrite = (clipboardItems: ClipboardItems): Promise<void> => {
  return navigator.clipboard.write(clipboardItems);
};

const safeWrite = async (clipboardItems: ClipboardItems): Promise<void> => {
  try {
    await navigator.clipboard.write(clipboardItems);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  return;
};

// const write = async (): Promise<Optional<ClipboardItems>> => {
//   try {
//     const items = await navigator.clipboard.read();
//     return Optional.some(items);
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.error(error);
//     return Optional.none();
//   }
// };

// TODO: Check clipboard API exists
const read = async (): Promise<Result<ClipboardItems, BaseClipboardErrorStatus>> => {
  const readStatus = await canRead();
  if (readStatus !== 'valid') {
    return Result.error(readStatus);
  }

  const items = await safeRead();
  return Result.fromOption(items, 'unknown');
};

const write = async (data: Record<string, string | Blob>): Promise<Result<ClipboardItems, BaseClipboardErrorStatus>> => {
  const writeStatus = await canWrite();
  if (writeStatus !== 'valid') {
    return Result.error(writeStatus);
  }

  const clipboardItem = new window.ClipboardItem(data);
  const clipboardItems = [ clipboardItem ];
  try {
    await rawWrite(clipboardItems);
    return Result.value(clipboardItems);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return Result.error('unknown');
  }
};

export {
  clipboardItemsToTypes,
  canRead,
  rawRead,
  read,
  canWrite,
  rawWrite,
  write
};
