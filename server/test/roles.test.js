/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/no-unresolved: 0 */
/* eslint import/extensions: 0 */
/* eslint no-unused-expressions: 0 */
/* eslint no-unused-vars: [2, { "args": "none" }] */
import dotenv from 'dotenv';
import 'babel-polyfill';
import chai from 'chai';
import supertest from 'supertest';
import app from '../app';
import factory from './helpers/factory.helpers';
// import sampleDoc from './helpers/documents.helper';
import db from '../models/';

dotenv.config();

const expect = chai.expect;
const request = supertest(app);

describe('Roles Suite', () => {
  let adminToken, newRole;
  before((done) => {
    db.User.destroy({ where: {} }).then(() => {
      db.Role.destroy({ where: { title: 'newRole' } }).then(() => {
        request
          .post('/api/users/signup')
          .send(factory.users)
          .end((err, res) => {
            if (err) return done(err);
            adminToken = res.body.token;
            done();
          });
      });
    });
  });

  after((done) => {
    db.Role.destroy({ where: { title: 'newRole' } }).then(() => {
      db.User.destroy({ where: {} }).then(() => {
        done();
      });
    });
  });

  describe('Create Role POST: /api/roles', () => {
    it('creates a new role if the role does not exist', (done) => {
      request
        .post('/api/roles')
        .send({ title: 'newRole' })
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          newRole = res.body;
          expect(res.status).to.equal(201);
          done();
        });
    });
    it('returns an error if the role exists', (done) => {
      request
        .post('/api/roles')
        .send({ title: 'admin' })
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(409);
          done();
        });
    });
  });

  describe('Edit Role PUT: /api/roles/:id', () => {
    it('edits a role if the role exists', (done) => {
      request
        .put(`/api/roles/${newRole.id}`)
        .send({ title: 'changedRole' })
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns an error if the role does not exists', (done) => {
      request
        .put(`/api/roles/${newRole.id * 8}`)
        .send({ title: 'changedRole' })
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('returns an error if the role is the admin role', (done) => {
      request
        .put('/api/roles/1')
        .send({ title: 'changedRole' })
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(403);
          done();
        });
    });
  });

  describe('Get All Roles GET: /api/roles', () => {
    it('returns all the roles', (done) => {
      request
        .get('/api/roles')
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
  });

  describe('Get A Role GET: /api/roles/:id', () => {
    it('returns a role if the role exists', (done) => {
      request
        .get(`/api/roles/${newRole.id}`)
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns an error if the role does not exists', (done) => {
      request
        .get(`/api/roles/${newRole.id * 8}`)
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
  });

  describe('Delete A Role DELETE: /api/roles/:id', () => {
    it('deletes a role if the role exists', (done) => {
      request
        .delete(`/api/roles/${newRole.id}`)
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns an error if the role does not exists', (done) => {
      request
        .delete(`/api/roles/${newRole.id * 8}`)
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('returns an error if the role is the admin role', (done) => {
      request
        .delete('/api/roles/1')
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(403);
          done();
        });
    });
  });
});
