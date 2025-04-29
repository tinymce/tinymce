import { Obj, Type, Arr } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

/**
 * TinyMCE User Lookup API
 * Handles user information retrieval and caching.
 *
 * @class tinymce.UserLookup
 * @example
 * // Retrieve the current user ID
 * tinymce.activeEditor.userLookup.getCurrentUserId();
 *
 * // Fetch user information by IDs which returns array of promises
 * const promises = tinymce.activeEditor.userLookup.fetchUsers(['user-1', 'user-2']);
 * Promise.all(promises).then((users) => {
 *   users.forEach(user => console.log('User found:', user));
 * }).catch((error) => {
 *   console.error('Error fetching users:', error);
 * });
 */

type UserId = string;

export interface User {
  id: UserId;
  name?: string;
  avatar?: string;
  description?: string;
  custom?: Record<string, any>;
}

export interface UserLookup {
  /**
   * Retrieves the current user ID from the editor.
   *
   * @method getCurrentUserId
   * @return {string} The current user ID.
   */
  getCurrentUserId: () => UserId;

  /**
   * Fetches user information using a provided array of userIds.
   *
   * @method fetchUsers
   * @param {string[]} userIds - A list of user IDs to fetch information for.
   * @throws {Error} Throws an error if any of the user IDs are invalid or if the fetch fails.
   * @return {Promise<User>[]} A promise that resolves to an array of users and information about them.
   */
  fetchUsers: (userIds: UserId[]) => Promise<User>[];
}

const isUserObject = (val: unknown): val is User =>
  Type.isObject(val)
  && val.hasOwnProperty('id')
  && Type.isNonNullable((val as User).id) && Type.isString((val as User).id as UserId)
  && !(Type.isNonNullable((val as User).name) && !Type.isString((val as User).name))
  && !(Type.isNonNullable((val as User).avatar) && !Type.isString((val as User).avatar))
  && !(Type.isNonNullable((val as User).description) && !Type.isString((val as User).description));

const validateResponse = (items: unknown): User[] => {
  if (!Array.isArray(items)) {
    throw new Error('fetch_users must return an array');
  }

  if (items.length === 0) {
    return [];
  }

  const users = Arr.filter(items, (item) => isUserObject(item));
  return users;
};

const isValidUserId = (userId: unknown): userId is UserId =>
  Type.isString(userId)
  && userId.length > 0;

const UserLookup = (editor: Editor): UserLookup => {
  const userCache: Record<UserId, Promise<User>> = {};
  const pendingResolvers = new Map<UserId, {
    resolve: (user: User) => void;
    reject: (error: unknown) => void;
  }>();

  const lookup = (userId: UserId) =>
    Obj.get(userCache, userId);

  const store = (user: Promise<User>, userId: UserId) => {
    userCache[userId] = user;
  };

  const resolveWithFallbacks = (userIds: UserId[], error: unknown) => {
    Arr.each(userIds, (userId) => {
      const pending = pendingResolvers.get(userId);
      if (pending) {
        pending.reject(error);
        pendingResolvers.delete(userId);
      }
    });
  };

  const fetchUsers = (userIds: UserId[]): Promise<User>[] => {
    if (Arr.forall(userIds, (userId) => !isValidUserId(userId))) {
      throw new Error('Invalid userId provided. All userIds must be a non-empty string.');
    }

    const { fail: uncachedIds } = Arr.partition(userIds, (userId) =>
      lookup(userId).isSome()
    );

    Arr.each(uncachedIds, (userId) => {
      const newPromise = new Promise<User>((resolve, reject) => {
        pendingResolvers.set(userId, { resolve, reject });
      });

      store(newPromise, userId);
    });

    if (uncachedIds.length > 0) {
      const fetchUsersFn = Options.getFetchUsers(editor);

      if (!Type.isFunction(fetchUsersFn)) {
        throw new Error('fetch_users option is not defined');
      }

      fetchUsersFn(uncachedIds).then((items: unknown) => {
        try {
          const users = validateResponse(items);
          const foundUserIds = new Set(Arr.map(users, (user) => user.id));

          // Resolve found users
          Arr.each(users, (user) => {
            const pending = pendingResolvers.get(user.id);
            if (pending) {
              pending.resolve(user);
              pendingResolvers.delete(user.id);
            }
          });

          // Reject promises for users not found in the response
          uncachedIds.forEach((userId) => {
            const pending = pendingResolvers.get(userId);
            if (pending && !foundUserIds.has(userId)) {
              pending.reject(new Error(`User ${userId} not found`));
              pendingResolvers.delete(userId);
            }
          });
        } catch (error: unknown) {
          resolveWithFallbacks(uncachedIds, error);
        }
      }).catch((error: unknown) => {
        resolveWithFallbacks(uncachedIds, error);
      });
    }

    return Arr.map(userIds, (userId) => {
      const userPromise = lookup(userId);
      return userPromise.getOr(Promise.resolve({ id: userId }));
    });
  };

  const getCurrentUserId = (): string => Options.getCurrentUserId(editor);

  return {
    getCurrentUserId,
    fetchUsers,
  };
};

const createUserLookup = (editor: Editor): UserLookup =>
  UserLookup(editor);

export { createUserLookup };
