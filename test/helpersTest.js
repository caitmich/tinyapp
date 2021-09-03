const { assert } = require('chai');

const { verifyUser } = require('../helpers.js');
const { users } = require('../express_server');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('verifyUser', function () {
  it('should return a user with valid email', function () {
    const user = verifyUser(users, 'hello@hello.com')
    const expectedOutput = "userRandomID";
    assert.isObject(user);
  });

  it('should return undefined when passed an unknown email', function () {
    const user = verifyUser(users, 'test@test.com')
    const expectedOutput = "userRandomID";
    assert.isUndefined(user);
  });
});