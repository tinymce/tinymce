/* eslint-disable no-console */
import { Optional, Result, Type } from '@ephox/katamari';

import Env from '../api/Env';

// Types and interfaces
export interface ClipboardContents {
  [key: string]: string;
}

export type BaseClipboardErrorStatus = 'insecure' | 'inactive' | 'unknown' | 'no-permission' | 'api-unavailable';
type ClipboardReadStatus = BaseClipboardErrorStatus | 'valid';
export type ClipboardErrorTypes = 'read' | 'write' | 'permission';

// Common content types for clipboard operations
export const CLIPBOARD_CONTENT_TYPES = {
  TEXT: 'text/plain',
  HTML: 'text/html'
};

const BrowserConfig = {
  requiresUserActivation: (): boolean => {
    return Env.browser.isSafari() || Env.browser.isFirefox();
  },

  supportsPermissionsAPI: (): boolean => {
    return Env.browser.isChromium() && navigator.permissions && typeof navigator.permissions.query === 'function';
  }
};

const Availability = {

  isClipboardAvailable: (): boolean => {
    return typeof navigator !== 'undefined' &&
           typeof navigator.clipboard !== 'undefined' &&
           typeof window !== 'undefined' &&
           typeof window.ClipboardItem !== 'undefined';
  },

  isSecure: (): boolean => window.isSecureContext,

  isActive: (): boolean => navigator.userActivation.isActive,

  hasTransientActivation: (): boolean => {
    return navigator.userActivation.hasBeenActive;
  },

  isReadPermitted: async (): Promise<boolean> => {
    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      return permission.state === 'granted';
    } catch (error) {
      console.error('Error checking clipboard-read permission:', error);
      return false;
    }
  },

  isWritePermitted: async (): Promise<boolean> => {
    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      return permission.state === 'granted';
    } catch (error) {
      console.error('Error checking clipboard-write permission:', error);
      return false;
    }
  }
};

const canRead = async (): Promise<ClipboardReadStatus> => {
  if (!Availability.isClipboardAvailable()) {
    return 'api-unavailable';
  }

  if (!Availability.isSecure()) {
    return 'insecure';
  }

  if (BrowserConfig.requiresUserActivation()) {
    if (!Availability.isActive()) {
      return 'inactive';
    }
    return 'valid';
  }

  if (!Availability.isActive() && !Availability.hasTransientActivation()) {
    return 'inactive';
  }

  if (BrowserConfig.supportsPermissionsAPI()) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });

      if (permissionStatus.state === 'prompt') {
        try {
          await navigator.clipboard.read();
          return 'valid';
        } catch (_e) {
          return 'no-permission';
        }
      } else if (permissionStatus.state === 'denied') {
        return 'no-permission';
      }
    } catch (error) {
      console.error('Error checking clipboard permission:', error);
      return 'unknown';
    }
  }

  return 'valid';
};

const canWrite = async (): Promise<ClipboardReadStatus> => {
  if (!Availability.isClipboardAvailable()) {
    return 'api-unavailable';
  }

  if (!Availability.isSecure()) {
    return 'insecure';
  }

  if (BrowserConfig.requiresUserActivation()) {
    if (!Availability.isActive()) {
      return 'inactive';
    }
    return 'valid';
  }

  if (!Availability.isActive() && !Availability.hasTransientActivation()) {
    return 'inactive';
  }

  if (BrowserConfig.supportsPermissionsAPI()) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });

      if (permissionStatus.state === 'prompt') {
        return 'valid';
      } else if (permissionStatus.state === 'denied') {
        return 'no-permission';
      }
    } catch (error) {
      console.error('Error checking clipboard write permission:', error);
      return 'unknown';
    }
  }

  return 'valid';
};

const ClipboardOperations = {
  rawRead: (): Promise<ClipboardItems> => {
    return navigator.clipboard.read();
  },

  safeRead: async (): Promise<Optional<ClipboardItems>> => {
    try {
      const items = await navigator.clipboard.read();
      return Optional.some(items);
    } catch (error) {
      console.error('Error reading from clipboard:', error);
      return Optional.none();
    }
  },

  rawWrite: (clipboardItems: ClipboardItems): Promise<void> => {
    return navigator.clipboard.write(clipboardItems);
  },

  safeWrite: async (clipboardItems: ClipboardItems): Promise<boolean> => {
    try {
      await navigator.clipboard.write(clipboardItems);
      return true;
    } catch (error) {
      console.error('Error writing to clipboard:', error);
      return false;
    }
  },

  rawReadText: (): Promise<string> => {
    return navigator.clipboard.readText();
  },

  safeReadText: async (): Promise<Optional<string>> => {
    try {
      const text = await navigator.clipboard.readText();
      return Optional.some(text);
    } catch (error) {
      console.error('Error reading text from clipboard:', error);
      return Optional.none();
    }
  },

  rawWriteText: (text: string): Promise<void> => {
    return navigator.clipboard.writeText(text);
  },

  safeWriteText: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error writing text to clipboard:', error);
      return false;
    }
  }
};

const clipboardItemsToTypes = async (clipboardItems: ClipboardItems, types?: Set<string>): Promise<ClipboardContents> => {
  const data: ClipboardContents = {};

  for (const clipboardItem of clipboardItems) {
    for (const type of clipboardItem.types) {
      if (Type.isNullable(types) || types.has(type)) {
        try {
          const blob = await clipboardItem.getType(type);
          const text = await blob.text();
          data[type] = text;
        } catch (error) {
          console.error(`Error extracting ${type} from clipboard:`, error);
        }
      }
    }
  }

  return data;
};

const create = (data: Record<string, string | Blob>): ClipboardItem => {
  if (!Availability.isClipboardAvailable()) {
    throw new Error('Clipboard API is not available');
  }
  return new window.ClipboardItem(data);
};

const read = async (): Promise<Result<ClipboardItems, BaseClipboardErrorStatus>> => {
  const readStatus = await canRead();
  if (readStatus !== 'valid') {
    return Result.error(readStatus);
  }

  const items = await ClipboardOperations.safeRead();
  return Result.fromOption(items, 'unknown');
};

const readText = async (): Promise<Result<string, BaseClipboardErrorStatus>> => {
  const readStatus = await canRead();
  if (readStatus !== 'valid') {
    return Result.error(readStatus);
  }

  const text = await ClipboardOperations.safeReadText();
  return Result.fromOption(text, 'unknown');
};

const write = async (data: Record<string, string | Blob>): Promise<Result<ClipboardItems, BaseClipboardErrorStatus>> => {
  const writeStatus = await canWrite();
  if (writeStatus !== 'valid') {
    return Result.error(writeStatus);
  }

  try {
    const clipboardItem = create(data);
    const clipboardItems = [ clipboardItem ];
    const success = await ClipboardOperations.safeWrite(clipboardItems);

    if (success) {
      return Result.value(clipboardItems);
    } else {
      return Result.error('unknown');
    }
  } catch (error) {
    console.error('Error creating clipboard item:', error);
    return Result.error('unknown');
  }
};

const writeText = async (text: string): Promise<Result<void, BaseClipboardErrorStatus>> => {
  const writeStatus = await canWrite();
  if (writeStatus !== 'valid') {
    return Result.error(writeStatus);
  }

  const success = await ClipboardOperations.safeWriteText(text);
  return success ? Result.value(undefined) : Result.error('unknown');
};

export {
  Availability,
  BrowserConfig,
  clipboardItemsToTypes,
  create,

  canRead,
  canWrite,

  ClipboardOperations,

  read,
  readText,
  write,
  writeText
};
