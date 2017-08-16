/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/no-unresolved: 0 */
/* eslint import/extensions: 0 */
/* eslint no-unused-expressions: 0 */
/* eslint no-unused-vars: [2, { "args": "none" }] */
import dotenv from 'dotenv';
import 'babel-polyfill';
import chai from 'chai';
import supertest from 'supertest';
import app from '../../app';
import factory from '../helpers/factory.helpers';
import db from '../../models/';

dotenv.config();

const expect = chai.expect;
const request = supertest(app);

const roles = [
  factory.adminRole,
  factory.managerRole,
  factory.regularRole,
  factory.guestRole
];

describe('Roles Suite', () => {
  let user, adminToken, newRole, adminRole;
  before((done) => {
    user = factory.users;
    db.Role.bulkCreate(roles, {
      returning: true
    }).then((newRoles) => {
      if (newRoles) {
        adminRole = newRoles[0];
        user.roleId = adminRole.id;

        request.post('/api/users/signup')
          .send(user)
          .end((err, res) => {
            adminToken = res.body.token;
            done();
          });
      }
    });
  });

  after((done) => {
    db.User.sequelize.sync({ force: true }).then(() => {
      db.Role.sequelize.sync({ force: true }).then(() => {
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

    it('returns an error if no title is passed', (done) => {
      request
        .post('/api/roles')
        .send({})
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(400);
          done();
        });
    });
  });

  describe('Edit Role PUT: /api/roles/:id', () => {
    it('edits a role if the role exists', (done) => {
      request
        .patch(`/api/roles/${newRole.role.id}`)
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
        .patch(`/api/roles/${newRole.role.id * 8}`)
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
        .patch('/api/roles/1')
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
    it('returns all the roles with pagination', (done) => {
      request
        .get('/api/roles?limit=2&offset=1')
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.pagination.totalCount).to.equal(5);
          expect(res.body.result.length).to.equal(2);
          done();
        });
    });

    it('returns all the roles in the second page with pagination', (done) => {
      request
        .get('/api/roles?limit=2&offset=2')
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.pagination.totalCount).to.equal(5);
          expect(res.body.result.length).to.equal(2);
          done();
        });
    });
  });

  describe('Get A Role GET: /api/roles/:id', () => {
    it('returns a role if the role exists', (done) => {
      request
        .get(`/api/roles/${newRole.role.id}`)
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('returns not found if the role does not exists', (done) => {
      request
        .get(`/api/roles/${newRole.role.id * 8}`)
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
        .delete(`/api/roles/${newRole.role.id}`)
        .set('authorization', adminToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('returns an error if the role does not exists', (done) => {
      request
        .delete(`/api/roles/${newRole.role.id * 8}`)
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
