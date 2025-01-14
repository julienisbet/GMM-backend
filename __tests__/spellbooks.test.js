const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

//* Dummy user for testing
const mockUser = {
  email: 'test@example.com',
  password: '12345',
};

// since you're using this function across multiple files
// you could think about moving it out into a utils file
const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test
  const agent = request.agent(app);

  // Create a user to sign in with
  const user = await UserService.create({ ...mockUser, ...userProps });

  // ...then sign in
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('spellbooks routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });
  // make sure to describe your route -- which route should return all known spells for a user?
  it('should return all known spells for a user', async () => {
    const spell = {
      id: 4,
    };
    const spell2 = {
      id: 1,
    };
    const userInfo = {
      charClass: 'Wizard',
      charLvl: 7,
    };
    // you might want to consider adjusting your create user route
    // to allow this additional information to be sent up on create
    // that would save this extra post after user creation
    const [agent] = await registerAndLogin();
    const user = await agent.patch('/api/v1/users/6').send(userInfo);
    expect(user.body.charClass).toEqual('Wizard');
    expect(user.body.casterLvl).toEqual(4);

    const learnedSpell = await agent.post('/api/v1/spells/4/learn').send(spell);
    expect(learnedSpell.body).toMatchInlineSnapshot(`
      Object {
        "id": "8",
        "prepared": false,
        "spellId": "4",
        "userId": "6",
      }
    `);
    // do you need the second test here? isn't this just testing the same thing?
    const anotherLearnedSpell = await agent
      .post('/api/v1/spells/1/learn')
      .send(spell2);
    expect(anotherLearnedSpell.body).toMatchInlineSnapshot(`
      Object {
        "id": "9",
        "prepared": false,
        "spellId": "1",
        "userId": "6",
      }
    `);

    const res = await agent.get('/api/v1/spellbook');
    expect(res.body.length).toEqual(2);
  });
  // which route?
  it('should let users delete a known spell', async () => {
    const spell = {
      id: 4,
    };
    const userInfo = {
      charClass: 'Wizard',
      charLvl: 7,
    };
    const [agent] = await registerAndLogin();
    const user = await agent.patch('/api/v1/users/6').send(userInfo);
    expect(user.body.charClass).toEqual('Wizard');
    expect(user.body.casterLvl).toEqual(4);

    // do you need to send up the spell here?
    // i think the route just uses the id from the parameters not the request body?
    const { body } = await agent.post('/api/v1/spells/4/learn').send(spell);
    expect(body).toMatchInlineSnapshot(`
      Object {
        "id": "8",
        "prepared": false,
        "spellId": "4",
        "userId": "6",
      }
    `);

    await agent.delete('/api/v1/spellbook/4').expect(200);

    await agent.get('/api/v1/spellbook/4').expect(404);
  });

  it('should let users update the preparation of a spell', async () => {
    const spell = {
      id: 4,
    };
    const userInfo = {
      charClass: 'Wizard',
      charLvl: 7,
    };
    const [agent] = await registerAndLogin();
    const user = await agent.patch('/api/v1/users/6').send(userInfo);
    expect(user.body.charClass).toEqual('Wizard');
    expect(user.body.casterLvl).toEqual(4);

    const learnedSpell = await agent.post('/api/v1/spells/4/learn').send(spell);
    // you don't need to test this again bc you tested the post works above
    // you could also just create the spellbook entry directly in the database
    // using the model to avoid the API call
    // i.e. Spellbook.insertKnownSpell({userId: user.id, spellId: 4, prepared: false})
    expect(learnedSpell.body).toMatchInlineSnapshot(`
      Object {
        "id": "8",
        "prepared": false,
        "spellId": "4",
        "userId": "6",
      }
    `);
    const updatedInfo = {
      prepared: true,
    };
    const updatedSpell = await agent
      .patch('/api/v1/spellbook/4/prepare')
      .send(updatedInfo);
    expect(updatedSpell.body.prepared).toEqual(true);
  });

  it('should return all prepared spells for a user', async () => {
    const spell = {
      id: 4,
    };
    const userInfo = {
      charClass: 'Wizard',
      charLvl: 7,
    };
    const [agent] = await registerAndLogin();
    const user = await agent.patch('/api/v1/users/6').send(userInfo);
    expect(user.body.charClass).toEqual('Wizard');
    expect(user.body.casterLvl).toEqual(4);

    const learnedSpell = await agent.post('/api/v1/spells/4/learn').send(spell);
    expect(learnedSpell.body).toMatchInlineSnapshot(`
      Object {
        "id": "8",
        "prepared": false,
        "spellId": "4",
        "userId": "6",
      }
    `);
    const updatedInfo = {
      prepared: true,
    };
    const updatedSpell = await agent
      .patch('/api/v1/spellbook/4/prepare')
      .send(updatedInfo);
    expect(updatedSpell.body.prepared).toEqual(true);

    const res = await agent.get('/api/v1/spellbook/prepared');
    expect(res.body.length).toEqual(1);
  });
});
