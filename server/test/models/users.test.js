/* eslint no-unused-expressions: 0 */
/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import chai from 'chai';
import factory from '../helpers/factory.helpers';
import db from '../../models/';

const expect = chai.expect;

const uniqueAttrs = ['username', 'email'];

let user, userParams, roleParams;

describe('User model', () => {
  before((done) => {
    userParams = factory.users;
    roleParams = factory.adminRole;
    db.Role.create(roleParams).then((role) => {
      userParams.RoleId = role.id;
      done();
    });
  });

  beforeEach(() => {
    user = db.User.build(userParams);
  });

  afterEach((done) => {
    db.User.destroy({ where: {} });
    done();
  });

  // clear DB after each test
  after((done) => {
    db.User.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  describe('Create user', () => {
    it('creates a User instance', () =>
      expect(user).to.exist);

    it('has both first and last name', () => {
      expect(user.firstName).to.equal(userParams.firstName);
      expect(user.lastName).to.equal(userParams.lastName);
    });

    it('saves user with valid attributes', () =>
      user.save().then(newUser =>
        expect(newUser.firstName).to.equal(user.firstName)));

    it('has a role defined', () =>
      user.save().then(newUser =>
        db.User.findById(newUser.id, { include: [{ model: db.Role }] })
          .then((foundUser) => {
            expect(foundUser.Role.title).to.equal(roleParams.title);
          })));

    it('creates user and hashes password', () =>
      user.save().then(newUser =>
          expect(newUser.password).to.not.equal(userParams.password)));
  });

  describe('Update user', () => {
    it('hashes update password', () =>
      user.save()
        .then(newUser => newUser.update({ password: 'newpassword' }))
        .then((updatedUser) => {
          expect(updatedUser.password).to.not.equal('newpassword');
        }));
  });

  describe('Validations', () => {
    describe('UNIQUE attributes', () => {
      uniqueAttrs.forEach((attr) => {
        it(`fails for non unique ${attr}`, () =>
          user.save()
            .then((newUser) => {
              userParams.RoleId = newUser.RoleId;
              return db.User.build(userParams).save();
            })
            .then(newUser2 => expect(newUser2).to.not.exist)
            .catch(err =>
              expect(/UniqueConstraintError/.test(err.name)).to.be.true));
      });
    });

    it('fails for invalid email', () => {
      user.email = 'invalid email';
      return user.save()
        .then(newUser => expect(newUser).to.not.exist)
        .catch(err =>
          expect(/Invalid email address provided/.test(err.message)).to.be.true);
    });
  });

  describe('user.validPassword', () => {
    it('valid for correct password', () =>
      user.save().then(newUser =>
        expect(newUser.matchPassword(userParams.password)).to.be.true));

    it('invalid for incorrect password', () =>
      user.save().then(newUser =>
        expect(newUser.matchPassword('invalid password')).to.be.false));
  });
});
