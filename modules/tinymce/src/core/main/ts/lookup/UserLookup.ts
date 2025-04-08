type UserId = string;

interface User {
  id: UserId;
  name: string;
  avatar?: URL;
  description?: string;
  [key: string]: any;
}

interface UserSettings {
  currentUserId: UserId;
  getUserById: (id: UserId) => Promise<User>;
  userCache?: Promise<Record<UserId, User>>;
}

interface UserLookup {
  currentUserId: UserId;
  getUserById: (id: UserId) => Promise<User>;
}

export {
  UserId,
  UserSettings,
  UserLookup
};
