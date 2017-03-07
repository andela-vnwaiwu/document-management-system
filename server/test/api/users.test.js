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
import app from '../../app';
import factory from '../helpers/factory.helpers';
import db from '../../models/';

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY || 'jhebefuehf7yu3832978ry09iofe';

const expect = chai.expect;
const request = supertest(app);

describe('User Suite', () => {
  let user, token, secondUser, thirdUser, updateDetails, userDetails, adminUser;
  let adminRole, regularRole, userToken, secondAdmin;
  before((done) => {
    user = factory.users;
    secondUser = factory.secondUser;
    thirdUser = factory.thirdUser;
    db.Role.bulkCreate([factory.adminRole, factory.regularRole], {
      returning: true
    }).then((newRoles) => {
      adminRole = newRoles[0];
      regularRole = newRoles[1];
      secondUser.RoleId = regularRole.id;
      thirdUser.RoleId = regularRole.id;
      user.RoleId = adminRole.id;
      factory.secondAdmin.RoleId = adminRole.id;

      request.post('/api/users/signup')
        .send(user)
        .end((err, res) => {
          token = res.body.token;
          adminUser = res.body.user;
          done();
        });
    });
  });

  after((done) => {
    db.User.sequelize.sync({ force: true }).then(() => {
      db.Role.sequelize.sync({ force: true }).then(() => {
        done();
      });
    });
  });

  describe('Create an Admin POST: /api/users', () => {
    it('creates another admin if the creator is an admin', (done) => {
      request
        .post('/api/users/create-admin')
        .send(factory.secondAdmin)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          secondAdmin = res.body.result;
          expect(res.status).to.equal(201);
          expect(res.body.result.RoleId).to.equal(1);
          done();
        });
    });

    it('returns an error if the admin wants to create an already existing user',
      (done) => {
        request
          .post('/api/users/create-admin')
          .send(factory.secondAdmin)
          .set('authorization', token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(409);
            done();
          });
      });
  });

  describe('Get All Users GET: /api/users', () => {
    before((done) => {
      request
        .post('/api/users/signup')
        .send(secondUser)
        .end((err, res) => {
          userToken = res.body.token;
          userDetails = res.body.user;
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
            expect(res.body.pagination.totalCount).to.equal(3);
            expect(res.body.users[0].firstName).to.equal(secondUser.firstName);
            done();
          });
      });

    it(`should successfully get all users if the user has
        admin role with pagination`, (done) => {
      request
        .get('/api/users?limit=2&offset=1')
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.pagination.totalCount).to.equal(3);
          expect(res.body.users[0].firstName).to.equal(secondAdmin.firstName);
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
        .get('/api/users')
        .set('authorization', userToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(403);
          done();
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
        .put(`/api/users/${userDetails.id}`)
        .set('authorization', token)
        .send(updateDetails)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.user).to.be.an('object');
          done();
        });
    });

    it('should return an error when trying to update a non-existing user',
      (done) => {
        request
          .put(`/api/users/${userId * 8}`)
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

    it('does not change their role when a regular user tries to update their roles',
      (done) => {
        request
          .put(`/api/users/${userDetails.id}`)
          .set('authorization', secondToken)
          .send({ RoleId: adminRole.id })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.user.RoleId).to.equal(userDetails.RoleId);
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

    it('should return an error if the user does not have admin role',
      (done) => {
        request
          .delete(`/api/users/${deleteUser}`)
          .set('Authorization', deleteToken)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(403);
            done();
          });
      });

    it('should return an error when trying to delete the admin', (done) => {
      request
        .delete(`/api/users/${secondAdmin.id}`)
        .set('Authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('should return an error when trying to delete the last admin',
      (done) => {
        request
          .delete(`/api/users/${adminUser.id}`)
          .set('Authorization', token)
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
