import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { expect } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { User } from 'tinymce/core/lookup/UserLookup';

const createMockUser = (id: string): User => ({
  id,
  name: 'Test User',
  avatar: 'test-avatar.png',
  description: 'Test Description'
});

describe('browser.tinymce.core.UserLookupTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    user_id: 'test-user-1',
    fetch_users: (userIds: string[]): Promise<User[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const validIds = Arr.filter(userIds, (id): id is string =>
            typeof id === 'string' && id.length > 0
          );

          // Only create users for valid test IDs
          const users = Arr.bind(validIds, (id) =>
            id.startsWith('test-user-') ? [ createMockUser(id) ] : []
          );

          resolve(users);
        }, 0);
      });
    },
  });

  it('Should return the configured user ID', () => {
    const editor = hook.editor();
    const currentUserId = editor.userLookup.getCurrentUserId();
    expect(currentUserId).to.equal('test-user-1', 'Should return the configured user ID');
  });

  it('Should fetch users and return array of promises', () => {
    const editor = hook.editor();
    const userIds = [ 'test-user-1' ];

    const promises = editor.userLookup.fetchUsers(userIds);

    expect(promises).to.be.an('array', 'Should return an array of promises');
    expect(promises).to.have.lengthOf(1, 'Should return array with one promise');
    expect(promises[0]).to.be.instanceOf(Promise, 'Should return a Promise');
  });

  it('Should return multiple promises for multiple userIds', () => {
    const editor = hook.editor();
    const userIds = [ 'test-user-1', 'test-user-2' ];

    const promises = editor.userLookup.fetchUsers(userIds);

    expect(promises).to.have.lengthOf(2, 'Should return array with two promises');
    expect(promises[0]).to.be.instanceOf(Promise, 'First item should be a Promise');
    expect(promises[1]).to.be.instanceOf(Promise, 'Second item should be a Promise');
  });

  it('Should throw an error for empty string ids', async () => {
    const editor = hook.editor();
    const userIds = [ '' ];
    const [ userPromise ] = editor.userLookup.fetchUsers(userIds);

    try {
      await userPromise;
      expect.fail('Should throw error for empty string ID');
    } catch (err: unknown) {
      expect(err).to.be.instanceOf(Error);
      expect(err).to.have.property('message', 'User  not found');
    }
  });

  it('Should resolve with user data when fetching a single user', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);
    const user = await userPromise;

    expect(user.id).to.equal(userId, 'Should have correct ID');
    expect(user.name).to.equal('Test User', 'Should have correct name');
    expect(user.avatar).to.equal('test-avatar.png', 'Should have correct avatar');
    expect(user.description).to.equal('Test Description', 'Should have correct description');

    const userKeys = Obj.keys(user).sort();
    const expectedKeys = [ 'id', 'name', 'avatar', 'description' ].sort();
    expect(userKeys).to.deep.equal(expectedKeys, 'Should have exactly the expected properties');
  });

  it('Should cache and return same data for subsequent requests', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    const [ firstPromise ] = editor.userLookup.fetchUsers([ userId ]);
    const firstUser = await firstPromise;

    // Second request should use cached data
    const [ secondPromise ] = editor.userLookup.fetchUsers([ userId ]);
    const secondUser = await secondPromise;

    expect(firstUser).to.deep.equal(secondUser, 'Should return same data from cache');
  });

  it('Should reject promise for non-existent users', async () => {
    const editor = hook.editor();
    const nonExistentId = 'non-existent-user';

    const [ userPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);

    try {
      await userPromise;
      expect(false, 'Should reject for non-existent user');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.property('message', `User ${nonExistentId} not found`, 'Should have correct error message');
    }
  });

  it('Should handle repeated requests for non-existent users', async () => {
    const editor = hook.editor();
    const nonExistentId = 'non-existent-user';

    const [ firstPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);
    try {
      await firstPromise;
      expect(false, 'First request should reject');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.property('message', `User ${nonExistentId} not found`, 'Should have correct error message');
    }

    // Second request should use cached rejection
    const [ secondPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);
    try {
      await secondPromise;
      expect(false, 'Second request should reject');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.property('message', `User ${nonExistentId} not found`, 'Should have correct error message');
    }
  });

  it('Should handle mix of existing and non-existent users', async () => {
    const editor = hook.editor();
    const existingId = 'test-user-1';
    const nonExistentId = 'non-existent-user';

    const [ existingPromise, nonExistentPromise ] = editor.userLookup.fetchUsers([ existingId, nonExistentId ]);

    const existingUser = await existingPromise;
    expect(existingUser).to.deep.equal({
      id: existingId,
      name: 'Test User',
      avatar: 'test-avatar.png',
      description: 'Test Description'
    }, 'Should return full user object for existing user');

    try {
      await nonExistentPromise;
      expect.fail('Should reject for non-existent user');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.property('message', `User ${nonExistentId} not found`, 'Should have correct error message');
    }
  });

  it('Should handle concurrent requests for the same user', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    // Make multiple concurrent requests
    const [ promise1 ] = editor.userLookup.fetchUsers([ userId ]);
    const [ promise2 ] = editor.userLookup.fetchUsers([ userId ]);
    const [ promise3 ] = editor.userLookup.fetchUsers([ userId ]);

    const [ user1, user2, user3 ] = await Promise.all([ promise1, promise2, promise3 ]);

    expect(user1).to.deep.equal(user2, 'First and second requests should match');
    expect(user2).to.deep.equal(user3, 'Second and third requests should match');
  });

  it('Should handle invalid user IDs gracefully', async () => {
    const editor = hook.editor();
    const invalidIds = [ '', ' ', undefined, null, false, 123 ] as any[];

    // Test each invalid ID asynchronously
    await Promise.all(Arr.map(invalidIds, async (invalidId) => {
      const [ promise ] = editor.userLookup.fetchUsers([ invalidId ]);

      try {
        await promise;
        expect.fail(`Promise should reject for invalid ID: ${invalidId}`);
      } catch (error) {
        expect(error).to.be.instanceOf(Error, `Should get Error for invalid ID: ${invalidId}`);
        if (error instanceof Error) {
          expect(error.message).to.equal(`User ${invalidId} not found`, `Expected "User ${invalidId} not found" but got "${error.message}"`);
        }
      }
    }));
  });

  it('Should maintain separate caches for different user IDs', async () => {
    const editor = hook.editor();
    const userId1 = 'test-user-1';
    const userId2 = 'test-user-2';

    const [ promise1 ] = editor.userLookup.fetchUsers([ userId1 ]);
    const user1 = await promise1;

    const [ promise2 ] = editor.userLookup.fetchUsers([ userId2 ]);
    const user2 = await promise2;

    expect(user1).to.not.deep.equal(user2, 'Different users should have different data');
    expect(user1.id).to.equal(userId1, 'First user should have correct ID');
    expect(user2.id).to.equal(userId2, 'Second user should have correct ID');
  });

  it('Should handle large batches of users efficiently', async () => {
    const editor = hook.editor();
    const userIds = Arr.range(100, (i) => `test-user-${i}`);

    const promises = editor.userLookup.fetchUsers(userIds);
    const users = await Promise.all(promises);

    expect(users).to.have.lengthOf(100, 'Should resolve all users');
    Arr.each(users, (user, index) => {
      expect(user.id).to.equal(`test-user-${index}`, `User ${index} should have correct ID`);
    });
  });

  it('Should handle custom user properties', async () => {
    const editor = hook.editor();
    const userId = 'test-user-custom';
    const customUser = {
      id: userId,
      name: 'Test User',
      avatar: 'test-avatar.png',
      description: 'Test Description',
      custom: {
        role: 'admin',
        department: 'IT'
      }
    };

    // Override fetch_users for this test
    editor.options.set('fetch_users', () => Promise.resolve([ customUser ]));

    const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);
    const user = await userPromise;

    expect(user).to.deep.equal(customUser, 'Should preserve custom properties');
    expect(user.custom).to.deep.equal(customUser.custom, 'Should have custom object');
  });

  it('Should handle network failures gracefully', async () => {
    const editor = hook.editor();
    const userId = 'test-user-network-error';
    const originalFetchUsers = editor.options.get('fetch_users');

    try {
      // Override fetch_users to simulate network failure
      editor.options.set('fetch_users', () => Promise.reject(new Error('Network error')));

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

      try {
        await userPromise;
        expect.fail('Should reject on network failure');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error).to.have.property('message', 'Network error', 'Should have network error message');
      }
    } finally {
      // Restore the original fetch_users function we overrode
      editor.options.set('fetch_users', originalFetchUsers);
    }
  });

  it('Should handle malformed server responses', async () => {
    const editor = hook.editor();
    const userId = 'test-user-malformed';
    const originalFetchUsers = editor.options.get('fetch_users');

    try {
      // Override fetch_users to return invalid data
      editor.options.set('fetch_users', () => Promise.resolve([{
        invalid: 'data'
      }] as any));

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

      try {
        await userPromise;
        expect.fail('Should reject for invalid data');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error).to.have.property('message', `User ${userId} not found`, 'Should have correct error message');
      }
    } finally {
      // Restore the original fetch_users function we overrode
      editor.options.set('fetch_users', originalFetchUsers);
    }
  });

  it('Should have frozen getCurrentUserId but mutable fetchUsers', () => {
    const editor = hook.editor();
    const lookup = editor.userLookup;

    try {
      lookup.getCurrentUserId = Fun.constant('new-id');
      expect.fail('Should not allow modifying getCurrentUserId');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).to.equal(
          `Cannot assign to read only property 'getCurrentUserId' of object '#<Object>'`,
          'Should throw error when trying to modify frozen function'
        );
      }
    }

    expect(lookup.getCurrentUserId()).to.equal('test-user-1', 'Should maintain original value');
  });
});
