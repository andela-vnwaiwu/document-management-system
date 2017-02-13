import 'babel-polyfill';
import chai from 'chai';
import supertest from 'supertest';
import app from '../app';
import factory from './factory';
import db from '../models/';

const expect = chai.expect;
const request = supertest(app);
const agent = supertest.agent(app);

let user, token;

describe('User Suite', () => {
  before(() => {
    db.User.destroy({ where: {} });
    user = factory.users;
  });

  after(() => db.User.destroy({ where: {} }));

  describe('Create Users POST: /users', () => {
    it('should successfully create a new user on succesful registration',
      (done) => {
        request
          .post('/api/users/signup')
          .send(user)
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
          .send({
            username: 'faker',
            lastName: 'factory',
            email: 'factory@email.com',
            password: 'password',
            RoleId: 1
          })
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
          .send(user)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(409);
            done();
          });
      });

    describe('Logs in User POST: /users/login', () => {
      it('should successfully log in a registered user', (done) => {
        request
          .post('/api/users/login')
          .send({ email: user.email, password: user.password })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(302);
            expect(res.token).to.be.defined;
            done();
          });
      });
      it('should return an error if the password field is empty', (done) => {
        request
          .post('/api/users/login')
          .send({ email: user.email, password: '' })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(401);
            done();
          });
      });
      it('should return an error if the email field is empty', (done) => {
        request
          .post('/api/users/login')
          .send({ email: '', password: user.password })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(401);
            done();
          });
      });
    });

    describe('Logs out user POST: /users/logout', () => {
      before((done) => {
        request
          .post('/api/users/login')
          .send({ email: user.email, password: user.password })
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
              expect(res.status).to.equal(302);
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
});
