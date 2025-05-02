import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import * as Chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import type Editor from 'tinymce/core/api/Editor';
import type { User } from 'tinymce/core/lookup/UserLookup';

Chai.use(chaiAsPromised);

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

  context('TINY-11974: UserLookup API - getCurrentUserID', () => {
    it('Should return the configured user ID', () => {
      const editor = hook.editor();
      const currentUserId = editor.userLookup.getCurrentUserId();
      expect(currentUserId).to.equal('test-user-1', 'Should return the configured user ID');
    });

    it('Should have frozen getCurrentUserId but mutable fetchUsers', () => {
      const editor = hook.editor();
      const lookup = editor.userLookup;

      try {
        lookup.getCurrentUserId = Fun.constant('new-id');
        expect.fail('Should not allow modifying getCurrentUserId');
      } catch (error) {
        expect(error).to.be.instanceOf(Error, 'Should throw error when trying to modify read-only function');
      }

      expect(lookup.getCurrentUserId()).to.equal('test-user-1', 'Should maintain original value');
    });
  });

  context('TINY-11974: UserLookup API - fetchUsers', () => {
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

      await expect(userPromise).to.eventually.be.rejectedWith(
        Error,
        'User  not found',
        'Should throw error for empty string ID'
      );
    });

    it('Should resolve with user data when fetching a single user', async () => {
      const editor = hook.editor();
      const userId = 'test-user-1';

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

      const expectedUser = {
        id: userId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        description: 'Test Description'
      };

      await expect(userPromise).to.eventually.deep.equal(
        expectedUser,
        'Should resolve with expected user object'
      );
    });

    it('Should cache and return same data for subsequent requests', async () => {
      const editor = hook.editor();
      const userId = 'test-user-1';

      const [ firstPromise ] = editor.userLookup.fetchUsers([ userId ]);
      const [ secondPromise ] = editor.userLookup.fetchUsers([ userId ]);

      await expect(firstPromise).to.eventually.deep.equal(
        await secondPromise,
        'Should return same data for subsequent requests'
      );
    });

    it('Should reject promise for non-existent users', async () => {
      const editor = hook.editor();
      const nonExistentId = 'non-existent-user';

      const [ userPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);

      await expect(userPromise).to.eventually.be.rejectedWith(
        Error,
        `User ${nonExistentId} not found`,
        'Should reject for non-existent user'
      );
    });

    it('Should handle repeated requests for non-existent users', async () => {
      const editor = hook.editor();
      const nonExistentId = 'non-existent-user';
      const errorMessage = `User ${nonExistentId} not found`;

      const [ firstPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);
      await expect(firstPromise).to.eventually.be.rejectedWith(errorMessage);

      // Second request should use cached rejection
      const [ secondPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);
      await expect(secondPromise).to.eventually.be.rejectedWith(errorMessage);
    });

    it('Should handle mix of existing and non-existent users', async () => {
      const editor = hook.editor();
      const existingId = 'test-user-1';
      const nonExistentId = 'non-existent-user';

      const [ existingPromise, nonExistentPromise ] = editor.userLookup.fetchUsers([ existingId, nonExistentId ]);

      await expect(existingPromise).to.eventually.deep.equal({
        id: existingId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        description: 'Test Description'
      });

      await expect(nonExistentPromise).to.be.rejectedWith(`User ${nonExistentId} not found`);
    });

    it('Should handle concurrent requests for the same user', async () => {
      const editor = hook.editor();
      const userId = 'test-user-1';

      // Make multiple concurrent requests
      const [ promise1, promise2, promise3 ] = [
        editor.userLookup.fetchUsers([ userId ])[0],
        editor.userLookup.fetchUsers([ userId ])[0],
        editor.userLookup.fetchUsers([ userId ])[0]
      ];

      await Promise.all([
        expect(promise1).to.eventually.deep.equal(await promise2),
        expect(promise2).to.eventually.deep.equal(await promise3),
      ]);
    });

    it('Should handle invalid user IDs gracefully', async () => {
      const editor = hook.editor();
      const invalidIds = [ '', ' ', undefined, null, false, 123 ] as any[];

      // Test each invalid ID asynchronously
      await Promise.all(Arr.map(invalidIds, async (invalidId) => {
        const [ promise ] = editor.userLookup.fetchUsers([ invalidId ]);
        await expect(promise).to.be.rejectedWith(
          `User ${invalidId} not found`,
          `Should reject for invalid ID: ${invalidId}`
        );
      }));
    });

    it('Should maintain separate caches for different user IDs', async () => {
      const editor = hook.editor();
      const userId1 = 'test-user-1';
      const userId2 = 'test-user-2';

      const [ promise1 ] = editor.userLookup.fetchUsers([ userId1 ]);
      const [ promise2 ] = editor.userLookup.fetchUsers([ userId2 ]);

      await Promise.all([
        expect(promise1).to.eventually.have.property('id').that.equals(userId1),
        expect(promise2).to.eventually.have.property('id').that.equals(userId2),
        expect(promise1).to.eventually.not.equal(promise2)
      ]);
    });

    it('Should handle large batches of users efficiently', async () => {
      const editor = hook.editor();
      const userIds = Arr.range(100, (i) => `test-user-${i}`);

      const promises = editor.userLookup.fetchUsers(userIds);
      const users = await Promise.all(promises);

      await Promise.all(Arr.map(users, async (user, index) =>
        expect(Promise.resolve(user)).to.eventually.have.property('id').that.equals(`test-user-${index}`)
      ));
    });

    it('Should handle custom user properties', async () => {
      const editor = hook.editor();
      const userId = 'test-user-custom';
      const originalFetchUsers = editor.options.get('fetch_users');
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

      try {
        // Override fetch_users for this test
        editor.options.set('fetch_users', () => Promise.resolve([ customUser ]));

        const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

        await expect(userPromise).to.eventually.deep.equal(customUser);
        await expect(userPromise).to.eventually.have.deep.property('custom', customUser.custom);
      } finally {
        // Restore the original fetch_users function we overrode
        editor.options.set('fetch_users', originalFetchUsers);
      }
    });

    it('Should handle network failures gracefully', async () => {
      const editor = hook.editor();
      const userId = 'test-user-network-error';
      const originalFetchUsers = editor.options.get('fetch_users');

      try {
        // Override fetch_users to simulate network failure
        editor.options.set('fetch_users', () => Promise.reject(new Error('Network error')));

        const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

        await expect(userPromise).to.be.rejectedWith('Network error');
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

        await expect(userPromise).to.be.rejectedWith(`User ${userId} not found`);
      } finally {
        // Restore the original fetch_users function we overrode
        editor.options.set('fetch_users', originalFetchUsers);
      }
    });

    it('Should handle various combinations of optional properties correctly', async () => {
      const editor = hook.editor();
      const testCases = [
        {
          input: { id: 'user-1' },
          expected: { id: 'user-1' }
        },
        {
          input: { id: 'user-2', name: 'John' },
          expected: { id: 'user-2', name: 'John' }
        },
        {
          input: {
            id: 'user-3',
            name: undefined,
            avatar: null,
            description: '',
            custom: {}
          },
          expected: { id: 'user-3', description: '', custom: {}}
        },
        {
          input: {
            id: 'user-4',
            name: 'Jane',
            avatar: 'avatar.jpg',
            description: null,
            custom: { role: 'admin' }
          },
          expected: {
            id: 'user-4',
            name: 'Jane',
            avatar: 'avatar.jpg',
            custom: { role: 'admin' }
          }
        }
      ];

      // Override the fetch_users fn to return our test cases
      editor.options.set('fetch_users', () => Promise.resolve(Arr.map(testCases, (c) => c.input)));

      const userIds = Arr.map(testCases, (c) => c.input.id);
      const promises = editor.userLookup.fetchUsers(userIds);

      await expect(Promise.all(promises)).to.eventually.deep.equal(
        Arr.map(testCases, (c) => c.expected),
        'Should resolve with expected user objects'
      );
    });
  });
});
