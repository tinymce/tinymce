import { StructureSchema, FieldSchema } from '@ephox/boulder';
import { Arr, Optional, Results, Obj, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

/**
 * TinyMCE User Lookup API
 * Handles user information retrieval and caching.
 *
 * @class tinymce.UserLookup
 * @example
 * // Get the current user's ID
 * tinymce.activeEditor.userLookup.userId;
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

export interface ValidatedUser {
  id: UserId;
  name: Optional<string>;
  avatar: Optional<string>;
  description: Optional<string>;
  custom: Optional<Record<string, any>>;
}

export interface UserLookup {
  /**
   * The current user's ID.
   *
   * @type {string}
   */
  userId: UserId;

  /**
   * Fetches user information using a provided array of userIds.
   *
   * @method fetchUsers
   * @param {string[]} userIds - A list of user IDs to fetch information for.
   * @return {Promise<User>[]} A promise that resolves to an array of users and information about them. Promises will reject if users are not found or if the fetch fails.
   * @throws {Error} When fetch_users option is not configured.
   */
  fetchUsers: (userIds: UserId[]) => Promise<User>[];
}

const userSchema = StructureSchema.objOf([
  FieldSchema.required('id'),
  FieldSchema.optionString('name'),
  FieldSchema.optionString('avatar'),
  FieldSchema.optionString('description'),
  FieldSchema.option('custom')
]);

const objectCat = <T extends object>(
  obj: { [K in keyof T]: Optional<T[K]> }
): Partial<T> => {
  const result = {} as Partial<T>;

  Obj.each(obj, (value, key) => {
    value.each((v) => {
      result[key as keyof T] = v;
    });
  });

  return result;
};

const validateResponse = (items: unknown): User[] => {
  if (!Array.isArray(items)) {
    throw new Error('fetch_users must return an array');
  }

  const results = Arr.map(items, (item) =>
    StructureSchema.asRaw<ValidatedUser>('Invalid user object', userSchema, item)
  );

  const { errors, values } = Results.partition(results);

  if (errors.length > 0) {
    const formattedErrors = Arr.map(errors, (error, idx) =>
      `User at index ${idx}: ${StructureSchema.formatError(error)}`
    );

    // eslint-disable-next-line no-console
    console.warn('User validation errors:\n' + formattedErrors.join('\n'));
  }

  return Arr.map(values, (user) => {
    const { id, ...rest } = user;

    return {
      id,
      ...objectCat(rest),
    };
  });
};

const UserLookup = (editor: Editor): UserLookup => {
  const userCache = new Map<UserId, Promise<User>>();
  const pendingResolvers = new Map<UserId, {
    resolve: (user: User) => void;
    reject: (error: unknown) => void;
  }>();

  const lookup = (userId: UserId) =>
    Optional.from(userCache.get(userId));

  const store = (user: Promise<User>, userId: UserId) => {
    userCache.set(userId, user);
  };

  const finallyReject = (userId: UserId, error: Error) =>
    Optional
      .from(pendingResolvers.get(userId))
      .each(({ reject }) => {
        reject(error);
        pendingResolvers.delete(userId);
      });

  const finallyResolve = (userId: UserId, user?: User) =>
    Optional
      .from(pendingResolvers.get(userId))
      .each(({ resolve }) => {
        resolve(Type.isObject(user) ? user : { id: userId });
        pendingResolvers.delete(userId);
      });

  const fetchUsers = (userIds: UserId[]): Promise<User>[] => {
    if (!Array.isArray(userIds)) {
      return [];
    }

    const uncachedIds = Arr.filter(userIds, (userId) => !lookup(userId).isSome());

    if (uncachedIds.length === 0) {
      return Arr.map(userIds, (userId) => lookup(userId).getOr(Promise.resolve({ id: userId })));
    }

    const fetchUsersFn = Options.getFetchUsers(editor);
    if (!fetchUsersFn) {
      throw new Error('fetch_users option must be configured');
    }

    Arr.each(uncachedIds, (userId) => {
      const newPromise = new Promise<User>((resolve, reject) => {
        pendingResolvers.set(userId, { resolve, reject });
      });
      store(newPromise, userId);
    });

    fetchUsersFn(uncachedIds)
      .then(validateResponse)
      .then((users: User[]) => {
        const foundUserIds = new Set(Arr.map(users, (user) => user.id));

        // Resolve found users
        Arr.each(users, (user) => finallyResolve(user.id, user));

        // Reject promises for users not found in the response
        Arr.each(uncachedIds, (userId) => {
          if (!foundUserIds.has(userId)) {
            finallyReject(userId, new Error(`User ${userId} not found`));
          }
        });
      })
      .catch((error: unknown) => {
        Arr.each(uncachedIds, (userId) =>
          finallyReject(
            userId,
            error instanceof Error ? error : new Error('Network error')
          )
        );
      });

    return Arr.map(userIds, (userId) => lookup(userId).getOr(Promise.resolve({ id: userId })));
  };

  const userId = Options.getUserId(editor);

  return {
    userId,
    fetchUsers,
  };
};

const createUserLookup = (editor: Editor): UserLookup =>
  UserLookup(editor);

export { createUserLookup };
