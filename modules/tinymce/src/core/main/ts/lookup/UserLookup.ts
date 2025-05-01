import { StructureSchema, FieldSchema } from '@ephox/boulder';
import { Arr, Optional, Fun, Results, Obj } from '@ephox/katamari';

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

type OptionalUserFields = Pick<User, 'name' | 'avatar' | 'description' | 'custom'>;

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

const userSchema = StructureSchema.objOf([
  FieldSchema.required('id'),
  FieldSchema.optionString('name'),
  FieldSchema.optionString('avatar'),
  FieldSchema.optionString('description'),
  FieldSchema.option('custom')
]);

const objectCat = <T extends Record<string, any>>(
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

const extractOptionalField = <T>(field: any): Optional<T> =>
  field?.fold(Optional.none, Optional.some) ?? Optional.none();

const transformResult = (user: any): User => {
  const optionalFields: { [K in keyof OptionalUserFields]: Optional<OptionalUserFields[K]> } = {
    name: extractOptionalField(user.name),
    avatar: extractOptionalField(user.avatar),
    description: extractOptionalField(user.description),
    custom: extractOptionalField(user.custom)
  };

  return {
    id: user.id,
    ...objectCat(optionalFields)
  };
};

const validateResponse = (items: unknown): User[] => {
  if (!Array.isArray(items)) {
    throw new Error('fetch_users must return an array');
  }

  const results = Arr.map(items, (item) =>
    StructureSchema.asRaw<User>('Invalid user object', userSchema, item)
  );

  const { errors, values } = Results.partition(results);

  if (errors.length > 0) {
    const formattedErrors = Arr.map(errors, (error, idx) =>
      `User at index ${idx}: ${StructureSchema.formatError(error)}`
    );

    // eslint-disable-next-line no-console
    console.warn('User validation errors:\n' + formattedErrors.join('\n'));
  }

  return Arr.map(values, transformResult);
};

const UserLookup = (editor: Editor): UserLookup => {
  const userCache = new Map<UserId, Promise<User>>();
  const pendingResolvers = new Map<UserId, {
    resolve: (user: User) => void;
    reject: (error: unknown) => void;
  }>();

  const lookup = (userId: UserId) =>
    Optional.from(userCache.get(userId)).map(Fun.identity);

  const store = (user: Promise<User>, userId: UserId) => {
    userCache.set(userId, user);
  };

  const finallyReject = (userId: UserId, error: Error) => {
    return Optional.from(pendingResolvers.get(userId)).each(({ reject }) => {
      reject(error);
      pendingResolvers.delete(userId);
    });
  };

  const fetchUsers = (userIds: UserId[]): Promise<User>[] => {
    if (!Array.isArray(userIds)) {
      return [];
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
      Optional.from(Options.getFetchUsers(editor)).fold(
        () => {
          Arr.each(uncachedIds, (userId) => {
            const pending = pendingResolvers.get(userId);
            if (pending) {
              pending.resolve({ id: userId });
              pendingResolvers.delete(userId);
            }
          });
        },
        (fetchUsersFn) => {
          fetchUsersFn(uncachedIds)
            .then(validateResponse)
            .then((users: User[]) => {
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
        }
      );
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
