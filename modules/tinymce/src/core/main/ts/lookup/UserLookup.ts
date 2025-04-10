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

  const getCurrentUserId = () => Options.getCurrentUserId(editor);

  editor.on('init', () => {
    Obj.each(Options.getUserCache(editor), store);
  });

  return {
    getCurrentUserId,
    fetchUserById,
  };
};

export default UserLookup;
