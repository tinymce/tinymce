import { Obj } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

type UserId = string;

export interface User {
  id: UserId;
  name?: string;
  avatar?: string;
  description?: string;
  [key: string]: any;
}

interface UserLookup {
  getCurrentUserId: () => UserId;
  fetchUserById: (id: UserId) => Promise<User>;
}

/**
 * TinyMCE UserLookup API
 * Handles user information retrieval and caching.
 *
 * @class tinymce.UserLookup
 */
const UserLookup = (editor: Editor): UserLookup => {
  const userCache: Record<UserId, User> = {};

  const lookup = (userId: UserId) =>
    Obj.get(userCache, userId);

  const store = (user: User, userId: UserId) => {
    userCache[userId] = user;
  };

  /**
   * Fetches user information by ID.
   *
   * @example
   * // Fetch user information by ID
   * tinymce.activeEditor.userLookup.fetchUserById('user-id').then((user) => {
   *  if (user) {
   *   console.log('User found:', user);
   *  };
   * }).catch((error) => {
   *  console.error('Error fetching user:', error);
   * });
   *
   * @param userId - The ID of the user to fetch.
   *
   * @description
   * Fetches user information by ID.
   * This function first checks the local cache for the user information.
   * If not found, it calls the `getFetchUserById` function assigned to the `fetch_user_by_id` option to fetch the user information.
   * The fetched user information is then stored in the local cache for future use.
   *
   * @returns A promise that resolves to the user information.
   */
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

  /**
   * Returns the value assigned to the `current_user_id` option in the editor.
   *
   * @example
   * // Get the current user ID
   * tinymce.activeEditor.userLookup.getCurrentUserId(); // 'user-id'
   *
   * @description
   * Returns the current user ID.
   * This is typically used to identify the user currently interacting with the editor.
   */
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
