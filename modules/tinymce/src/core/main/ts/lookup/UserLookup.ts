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

export interface UserLookup {
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
  fetchUserById: (id: UserId) => Promise<User[]>;
}

const isUserObject = (val: unknown): val is User =>
  Type.isObject(val)
  && val.hasOwnProperty('id')
  && Type.isNonNullable((val as User).id) && Type.isString((val as User).id as UserId)
  && !(Type.isNonNullable((val as User).name) && !Type.isString((val as User).name))
  && !(Type.isNonNullable((val as User).avatar) && !Type.isString((val as User).avatar))
  && !(Type.isNonNullable((val as User).description) && !Type.isString((val as User).description));

const isValidUserId = (userId: unknown): userId is UserId =>
  Type.isString(userId)
  && userId.length > 0;

const UserLookup = (editor: Editor): UserLookup => {
  const userCache: Record<UserId, User> = {};

  const lookup = (userId: UserId) =>
    Obj.get(userCache, userId);

  const store = (user: User, userId: UserId) => {
    userCache[userId] = user;
  };

  const fetchUserById = (userId: UserId): Promise<User[]> => {
    const fetchUserByIdFn = Options.getFetchUserById(editor);
    const result = fetchUserByIdFn(userId);

    if (!isValidUserId(userId)) {
      return Promise.reject(new Error('fetch_user_by_id must be a string'));
    };

    return lookup(userId).fold(
      () => {
        if (!Type.isPromiseLike(result)) {
          throw new Error('fetch_user_by_id must return a promise');
        }

        return result.then((items) => {
          if (Array.isArray(items) && items.length > 0) {
            // Filter out the invalid ones and console log them as an error
            const users: User[] = Arr.filter(items, (item) => {
              if (isUserObject(item)) {
                store(item, item.id);
                return item.id === userId;
              } else {
                // eslint-disable-next-line no-console
                console.error('Invalid user object:', item);
                return false;
              }
            });

            if (users.length === 0) {
              throw new Error('fetch_user_by_id must return an array with at least one User object with a string id property');
            }

            return users;
          } else {
            throw new Error('fetch_user_by_id must return an array with at least one User object with a string id property');
          }
        }).catch((e) => {
          if (e instanceof Error) {
            // Log error the message to console
            // eslint-disable-next-line no-console
            console.error(e.message);
          } else {
            // eslint-disable-next-line no-console
            console.error('Something went wrong with fetch_user_by_id option.');
          }

          return [ { id: userId } as User ];
        });
      },
      (user) => {
        return Promise.resolve([ user ]);
      }
    );
  };

  const getCurrentUserId = (): string => Options.getCurrentUserId(editor);

  return {
    getCurrentUserId,
    fetchUserById,
  };
};

const createUserLookup = (editor: Editor): UserLookup =>
  UserLookup(editor);

export { createUserLookup };
