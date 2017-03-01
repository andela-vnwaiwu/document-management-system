/* eslint no-unused-expressions: 0 */
/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import chai from 'chai';
import supertest from 'supertest';
import app from '../../app';
import factory from '../helpers/factory.helpers';
import db from '../../models/';

const expect = chai.expect;
const request = supertest(app);
const agent = supertest.agent(app);

let token, wrongUser, roleParams, userParams;

describe('Auth Suite', () => {
  before((done) => {
    userParams = factory.users;
    roleParams = factory.adminRole;
    db.Role.create(roleParams).then((role) => {
      userParams.RoleId = role.id;
      done();
    });
    wrongUser = factory.wrongUser;
  });

  after((done) => {
    db.User.sequelize.sync({ force: true }).then(() => {
      db.Role.sequelize.sync({ force: true }).then(() => {
        done();
      });
    });
  });

  describe('Create User POST: /api/users/signup', () => {
    it('should successfully create a new user on succesful registration',
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
