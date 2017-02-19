/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/no-unresolved: 0 */
/* eslint import/extensions: 0 */
/* eslint no-unused-expressions: 0 */
/* eslint no-unused-vars: [2, { "args": "none" }] */
import dotenv from 'dotenv';
import 'babel-polyfill';
import chai from 'chai';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import app from '../app';
import factory from '././helpers/factory.helpers';
import db from '../models/';

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY || 'jhebefuehf7yu3832978ry09iofe';

const expect = chai.expect;
const request = supertest(app);

let user, token, secondUser, thirdUser, updateDetails;

describe('User Suite', () => {
  before((done) => {
    user = factory.users;
    secondUser = factory.secondUser;
    thirdUser = factory.thirdUser;
    updateDetails = factory.updateDetails;
    db.User.destroy({ where: {} });
    done();
  });

  after((done) => {
    db.User.destroy({ where: {} });
    done();
  });

  describe('Get All Users GET: /api/users', () => {
    before((done) => {
      request
        .post('/api/users/signup')
        .send(user)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should successfully get all users if the user has admin role',
      (done) => {
        request
          .get('/api/users/')
          .set('authorization', token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            done();
          });
      });
    it('should return an error if no token is passed', (done) => {
      request
        .get('/api/users')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });
    it('should return an error if the user is not an admin', (done) => {
      request
        .post('/api/users/signup')
        .send(secondUser)
        .end((err, res) => {
          if (err) return done(err);
          request
            .get('/api/users')
            .set('authorization', res.body.token)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(403);
              done();
            });
        });
    });
  });

  describe('Get User GET: /api/users/:id', () => {
    let thirdUserToken, thirdUserResult;
    before((done) => {
      request
        .post('/api/users/signup')
        .send(thirdUser)
        .end((err, res) => {
          if (err) return done(err);
          thirdUserToken = res.body.token;
          thirdUserResult = res.body.user;
          done();
        });
    });
    it('returns the details of the particular user', (done) => {
      request
        .get(`/api/users/${thirdUserResult.id}`)
        .set('authorization', thirdUserToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('should return not found if the user has not been saved', (done) => {
      request
        .get(`/api/users/${thirdUserResult.id * 5}`)
        .set('authorization', thirdUserToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('should return an error if the user is not logged in', (done) => {
      request
        .get(`/api/users/${thirdUserResult.id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Update user PUT: /api/users/:id', () => {
    let userId, secondToken;
    before((done) => {
      jwt.verify(token, secretKey, (err, result) => {
        userId = result.userId;
      });
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          secondToken = res.body.token;
          done();
        });
    });

    it('should update the user\'s details for the admin or owner', (done) => {
      request
        .put(`/api/users/${userId}`)
        .set('authorization', token)
        .send(updateDetails)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.user).to.be.an('object');
          done();
        });
    });
    it('should return an error when trying to update a non-existing user', (done) => {
      request
        .put(`/api/users/${userId * 2}`)
        .set('authorization', token)
        .send(updateDetails)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('returns an error if the user is not an admin or owner', (done) => {
      request
        .put(`/api/users/${userId}`)
        .set('authorization', secondToken)
        .send(updateDetails)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(403);
          done();
        });
    });
  });

  describe('Delete User DELETE: /api/users/:id', () => {
    let deleteUser, deleteToken;
    before((done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          deleteUser = res.body.user.id;
          deleteToken = res.body.token;
          done();
        });
    });
    it('should return an error if the user does not have admin role', (done) => {
      request
        .delete(`/api/users/${deleteUser}`)
        .set('Authorization', deleteToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(403);
          done();
        });
    });
    it('should delete another user if the user has a role admin', (done) => {
      request
        .delete(`/api/users/${deleteUser}`)
        .set('Authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('should return an error if the user does not exist', (done) => {
      request
        .delete(`/api/users/${deleteUser}`)
        .set('Authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
});
