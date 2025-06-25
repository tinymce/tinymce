import { StructureSchema, FieldSchema } from '@ephox/boulder';
import { Arr, Optional, Results, Obj, Num } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

/**
 * TinyMCE User Lookup API
 * Handles user information retrieval and caching.
 *
 * @class tinymce.UserLookup
 * @example
 * // Get the current user's ID from the editor options, or defaults to 'Anonymous'.
 * tinymce.activeEditor.userLookup.userId;
 *
 * // Fetch user information by IDs which returns a record of promises
 * const userPromises = tinymce.activeEditor.userLookup.fetchUsers(['user-1', 'user-2']);
 *
 * // Access individual promises by user ID
 * userPromises['user-1'].then(user => console.log('User 1:', user));
 * userPromises['user-2'].then(user => console.log('User 2:', user));
 *
 * // Or wait for all promises
 * Promise.all(Object.values(userPromises)).then((users) => {
 *   users.forEach(user => console.log('User found:', user));
 * }).catch((error) => {
 *   console.error('Error fetching users:', error);
 * });
 */

type UserId = string;

export interface User {
  id: UserId;
  name: string;
  avatar: string;
  custom?: Record<string, any>;
}

export interface ExpectedUser {
  id: UserId;
  [key: string]: any;
};

export interface ValidatedUser {
  id: UserId;
  name: Optional<string>;
  avatar: Optional<string>;
  custom: Optional<Record<string, any>>;
}

export interface UserLookup {
  /**
   * The current user's ID retrieved from the editor options, or defaults to 'Anonymous'.
   *
   * @property userId
   * @type String
   */
  userId: UserId;

  /**
   * Fetches user information using a provided array of userIds.
   *
   * @method fetchUsers
   * @param {string[]} userIds - A list of user IDs to fetch information for.
   * @return {Record<UserId, Promise<User>>} An object where each key is a user ID and its value is a Promise that resolves to the user's data or rejects if the user is not found.
   * @throws {Error} When fetch_users option is not configured.
   */
  fetchUsers: (userIds: UserId[]) => Record<UserId, Promise<User>>;
}

const AvatarColors = [
  '#E41B60', // Pink
  '#AD1457', // Dark Pink
  '#1939EC', // Indigo
  '#001CB5', // Dark Indigo
  '#648000', // Lime
  '#465B00', // Dark Lime
  '#006CE7', // Blue
  '#0054B4', // Dark Blue
  '#00838F', // Cyan
  '#006064', // Dark Cyan
  '#00866F', // Turquoise
  '#004D40', // Dark Turquoise
  '#51742F', // Green
  '#385021', // Dark Green
  '#CF4900', // Orange
  '#A84600', // Dark Orange
  '#CC0000', // Red
  '#6A1B9A', // Dark Red
  '#9C27B0', // Purple
  '#6A00AB', // Dark Purple
  '#3041BA', // Navy Blue
  '#0A1877', // Dark Navy Blue
  '#774433', // Brown
  '#452B24', // Dark Brown
  '#607D8B', // Blue Gray
  '#455A64', // Dark Blue Gray
];

const getFirstChar = (name: string): string => {
  if (Intl.Segmenter) {
    const segmenter = new Intl.Segmenter();
    const iterator = segmenter.segment(name)[Symbol.iterator]();
    return `${iterator.next().value?.segment}`;
  } else {
    return name.trim()[0];
  }
};

const getRandomColor = (): string => {
  const colorIdx = Math.floor(Num.random() * AvatarColors.length);
  return AvatarColors[colorIdx];
};

const generate = (name: string, color: string, size: number = 36): string => {
  const halfSize = size / 2;
  return `<svg height="${size}" width="${size}" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="${halfSize}" cy="${halfSize}" r="${halfSize}" fill="${color}"/>` +
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="#FFF" font-family="sans-serif" font-size="${halfSize}">` +
    getFirstChar(name) +
    `</text>` +
    '</svg>';
};

const deriveAvatar = (name: string): string => {
  const avatarSvg = generate(name, getRandomColor());
  return 'data:image/svg+xml,' + encodeURIComponent(avatarSvg);
};

const userSchema = StructureSchema.objOf([
  FieldSchema.required('id'),
  FieldSchema.optionString('name'),
  FieldSchema.optionString('avatar'),
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
    const { id, name, avatar, ...rest } = user;

    return {
      id,
      name: name.getOr(id),
      avatar: avatar.getOr(deriveAvatar(name.getOr(id))),
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

  const finallyResolve = (userId: UserId, user: User) =>
    Optional
      .from(pendingResolvers.get(userId))
      .each(({ resolve }) => {
        resolve(user);
        pendingResolvers.delete(userId);
      });

  const fetchUsers = (userIds: UserId[]): Record<UserId, Promise<User>> => {
    const fetchUsersFn = Options.getFetchUsers(editor);

    if (!Array.isArray(userIds)) {
      return {};
    } else if (!fetchUsersFn) {
      return Arr.mapToObject(userIds, (userId) =>
        Promise.resolve({
          id: userId,
          name: userId,
          avatar: deriveAvatar(userId)
        }));
    }

    const uncachedIds = Arr.unique(Arr.filter((userIds), (userId) => !lookup(userId).isSome()));

    Arr.each(uncachedIds, (userId) => {
      const newPromise = new Promise<User>((resolve, reject) => {
        pendingResolvers.set(userId, { resolve, reject });
      });
      store(newPromise, userId);
    });

    if (uncachedIds.length > 0) {
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
    };

    return Arr.foldl<UserId, Record<UserId, Promise<User>>>(userIds, (acc, userId) => {
      acc[userId] = lookup(userId).getOr(
        Promise.resolve({
          id: userId,
          name: userId,
          avatar: deriveAvatar(userId)
        })
      );
      return acc;
    }, {});
  };

  const userId = Options.getUserId(editor);

  return Object.freeze({
    userId,
    fetchUsers,
  });
};

const createUserLookup = (editor: Editor): UserLookup =>
  UserLookup(editor);

export { createUserLookup };
