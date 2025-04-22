import { StructureSchema } from '@ephox/boulder';
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
 * tinymce.activeEditor.userLookup.fetchUsersById('user-id').then((users) => {
 *  if (users.length > 0) {
 *   console.log('Users found:', users);
 *  };
 * }).catch((error) => {
 *  console.error('Error fetching users:', error);
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

interface UserError {
  input: any;
  errors: string[];
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
   * @method fetchUsersById
   * @param {string} id - The user ID to fetch.
   * @return {Promise<User[]>} A promise that resolves to an array of users and information about them.
   */
  fetchUsersById: (id: UserId) => Promise<User[]>;
}

const isUserObject = (val: unknown): val is User =>
  Type.isObject(val)
  && val.hasOwnProperty('id')
  && Type.isNonNullable((val as User).id) && Type.isString((val as User).id as UserId)
  && !(Type.isNonNullable((val as User).name) && !Type.isString((val as User).name))
  && !(Type.isNonNullable((val as User).avatar) && !Type.isString((val as User).avatar))
  && !(Type.isNonNullable((val as User).description) && !Type.isString((val as User).description));

const formatUserError = (error: UserError): string =>
  StructureSchema.formatError({
    input: error.input,
    errors: error.errors,
  });

const handleError = (e: unknown, userId: UserId): User[] => {
  const message = e instanceof Error
    ? e.message
    : formatUserError({
      input: e,
      errors: [ 'Something went wrong with fetch_users_by_id option' ]
    });

  // eslint-disable-next-line no-console
  console.error(message);
  return [{ id: userId }];
};

const validateResponse = (items: unknown): User[] => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(formatUserError({
      input: items,
      errors: [ 'fetch_users_by_id must return an array with at least one User object' ]
    }));
  }

  const users = Arr.filter(items, (item) => isUserObject(item));

  if (users.length === 0) {
    throw new Error(formatUserError({
      input: items,
      errors: [ 'fetch_users_by_id must return an array with at least one User object with a string id property' ]
    }));
  }

  return users as User[];
};

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

  const fetchUsersById = (userId: UserId): Promise<User[]> => {
    if (!isValidUserId(userId)) {
      return Promise.reject(new Error(formatUserError({
        input: userId,
        errors: [ 'Provided userId must be a non-empty string' ]
      })));
    };

    return lookup(userId).fold(
      async () => {
        try {
          const fetchFn = Options.getFetchUsersById(editor);
          const result = fetchFn(userId);

          if (!Type.isPromiseLike(result)) {
            throw new Error(formatUserError({
              input: result,
              errors: [ 'fetch_users_by_id must return a Promise' ]
            }));
          }

          const response = await result;
          const users = validateResponse(response);
          Arr.each(users, (user) => store(user, user.id));
          return users;
        } catch (e) {
          return handleError(e, userId);
        }
      },
      (user) => {
        return Promise.resolve([ user ]);
      }
    );
  };

  const getCurrentUserId = (): string => Options.getCurrentUserId(editor);

  return {
    getCurrentUserId,
    fetchUsersById,
  };
};

const createUserLookup = (editor: Editor): UserLookup =>
  UserLookup(editor);

export { createUserLookup };
