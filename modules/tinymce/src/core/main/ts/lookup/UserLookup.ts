import { Obj, Optional, Type } from '@ephox/katamari';

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
 * // Fetch user information by ID
 * tinymce.activeEditor.userLookup.fetchUserById('user-id').then((user) => {
 *  if (user) {
 *   console.log('User found:', user);
 *  };
 * }).catch((error) => {
 *  console.error('Error fetching user:', error);
 * });
 */

type UserId = string;

export interface User {
  id: UserId;
  name?: string;
  avatar?: string;
  description?: string;
  [key: string]: any;
}

interface UserLookup {
  /**
   * Retrieves the current user ID from the editor.
   *
   * @method getCurrentUserId
   * @return {string} The current user ID.
   */
  getCurrentUserId: () => UserId;

  /**
   * Fetches user information using a provided ID.
   *
   * @method fetchUserById
   * @param {string} id - The user ID to fetch.
   * @return {Promise<User>} A promise that resolves to the user information.
   */
  fetchUserById: (id: UserId) => Promise<User>;
}

const isUserObject = (val: unknown): val is User =>
  Type.isObject(val)
  && val.hasOwnProperty('id')
  && Type.isNonNullable((val as User).id) && Type.isString((val as User).id as UserId)
  && !(Type.isNonNullable((val as User).name) && !Type.isString((val as User).name))
  && !(Type.isNonNullable((val as User).avatar) && !Type.isString((val as User).avatar))
  && !(Type.isNonNullable((val as User).description) && !Type.isString((val as User).description));

const UserLookup = (editor: Editor): UserLookup => {
  const userCache: Record<UserId, User> = {};

  const lookup = (userId: UserId) =>
    Obj.get(userCache, userId);

  const store = (user: User, userId: UserId) => {
    userCache[userId] = user;
  };

  const handleExternalFetch = (userId: UserId): Promise<User> =>
    Optional.from(Options.getFetchUserById(editor))
      .filter(Type.isFunction)
      .map((fn) => fn(userId))
      .filter(Type.isPromiseLike)
      .map((pr) =>
        pr.then((user) => {
          if (isUserObject(user)) {
            store(user as User, userId);
            return user;
          } else {
            throw new Error('fetch_user_by_id must return a User object with a string id property');
          }
        }))
      .getOr(Promise.reject('fetch_user_by_id must be a function'));

  const fetchUserById = (userId: UserId): Promise<User> =>
    lookup(userId)
      .map((user) => Promise.resolve(user))
      .getOr(handleExternalFetch(userId))
      .catch((e: unknown) => {
        if (e instanceof Error) {
          // Log error message to console
          // eslint-disable-next-line no-console
          console.error(e.message);
        } else {
          // eslint-disable-next-line no-console
          console.error('Something went wrong with fetch_user_by_id option.');
        }
        // Fallback to basic User object with just id
        return {
          id: userId
        };
      });

  const getCurrentUserId = (): string => Options.getCurrentUserId(editor);

  return {
    getCurrentUserId,
    fetchUserById,
  };
};

export default UserLookup;
