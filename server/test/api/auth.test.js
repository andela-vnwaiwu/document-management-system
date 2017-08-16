/* eslint no-unused-expressions: 0 */
/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import chai from 'chai';
import supertest from 'supertest';
import app from '../../app';
import factory from '../helpers/factory.helpers';
import rolePermissions from '../helpers/rolePermissions.helper';
import db from '../../models/';

const expect = chai.expect;
const request = supertest(app);
const agent = supertest.agent(app);

let token, wrongUser, userParams;
const permissions = [
  factory.deletePermission,
  factory.editPermission,
  factory.viewPermission,
  factory.viewPrivatePermission
];

const roles = [
  factory.adminRole,
  factory.managerRole,
  factory.regularRole,
  factory.guestRole
];

const rolesPermission = [
  rolePermissions['1'],
  rolePermissions['2'],
  rolePermissions['3'],
  rolePermissions['4'],
  rolePermissions['5'],
  rolePermissions['6'],
  rolePermissions['7'],
  rolePermissions['8'],
  rolePermissions['9'],
  rolePermissions['10']
];

describe('Auth Suite', () => {
  before((done) => {
    userParams = factory.users;
    db.Permission.bulkCreate(permissions, { returning: true }).then((createdPermission) => {
      if (createdPermission) {
        db.Role.bulkCreate(roles, { returning: true }).then((createdRoles) => {
          db.RolePermission.bulkCreate(rolesPermission, { returning: true }).then(() => {
            userParams.roleId = createdRoles[0].id;
            factory.secondAdmin.roleId = createdRoles[0].id;
            done();
          });
        });
        wrongUser = factory.wrongUser;
      }
    });
  });

  after((done) => {
    db.User.sequelize.sync({ force: true }).then(() => {
      db.RolePermission.sequelize.sync({ force: true }).then(() => {
        db.Role.sequelize.sync({ force: true }).then(() => {
          db.Permission.sequelize.sync({ force: true }).then(() => {
            done();
          });
        });
      });
    });
  });

  describe('Create User POST: /api/users/signup', () => {
    it('should successfully create a new user on successful registration',
      (done) => {
        userParams;
        request
          .post('/api/users/signup')
          .send(userParams)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(201);
            expect(res.token).to.be.defined;
            done();
          });
      });

    it('should return an error when the signup form is missing a field',
      (done) => {
        request
          .post('/api/users/signup')
          .send(wrongUser)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(400);
            done();
          });
      });

    it('should return an error when an existing user registers again',
      (done) => {
        request
          .post('/api/users/signup')
          .send(userParams)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(409);
            done();
          });
      });

    it('returns an error if a normal user wants to signup as another admin',
      (done) => {
        request
          .post('/api/users/signup')
          .send(factory.secondAdmin)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(409);
            done();
          });
      });
  });

  describe('Login User POST: /api/users/login', () => {
    it('should successfully log in a registered user', (done) => {
      request
        .post('/api/users/login')
        .send({ email: userParams.email, password: userParams.password })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.token).to.be.defined;
          done();
        });
    });

    it('should return an error if the password field is empty', (done) => {
      request
        .post('/api/users/login')
        .send({ email: userParams.email, password: '' })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('should return an error if the email field is empty', (done) => {
      request
        .post('/api/users/login')
        .send({ email: '', password: userParams.password })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Logout user POST: /api/users/logout', () => {
    before((done) => {
      request
        .post('/api/users/login')
        .send({ email: userParams.email, password: userParams.password })
        .end((err, res) => {
          if (err) return done(err);
          token = res.body.token;
          done();
        });
    });

    it('should successfully logout the user if they are logged in',
      (done) => {
        agent
          .post('/api/users/logout')
          .set('Authorization', token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            done();
          });
      });

    it('should return an error when non-logged in user tries to log out',
      (done) => {
        request
          .post('/api/users/logout')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(400);
            done();
          });
      });
  });
});
