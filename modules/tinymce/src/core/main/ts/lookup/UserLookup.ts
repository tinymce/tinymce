import { Obj } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

/**
 * TinyMCE User Lookup API
 * Handles user information retrieval and caching.
 *
 * @class tinymce.UserLookup
 * @example
 * // Retrieve the current user ID
 * tinymce.activeEditor.UserLookup.getCurrentUserId();
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

const UserLookup = (editor: Editor): UserLookup => {
  const userCache: Record<UserId, User> = {};

  const lookup = (userId: UserId) =>
    Obj.get(userCache, userId);

  const store = (user: User, userId: UserId) => {
    userCache[userId] = user;
  };

  const fetchUserById = (userId: UserId): Promise<User> =>
    new Promise((resolve, reject) =>
      lookup(userId)
        .fold(() =>
          Options.getFetchUserById(editor)(userId)
            .then((user: User) => {
              store(user, userId);
              resolve(user);
            })
            .catch(reject),
        resolve
        )
    );

  const getCurrentUserId = (): string => Options.getCurrentUserId(editor);

  editor.on('init', () => {
    Obj.each(Options.getUserCache(editor), store);
  });

  return {
    getCurrentUserId,
    fetchUserById,
  };
};

export default UserLookup;
