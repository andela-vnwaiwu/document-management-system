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
import rolePermissions from '../helpers/rolePermissions.helper';
import sampleDoc from '../helpers/documents.helper';
import db from '../../models/';

dotenv.config();

const expect = chai.expect;
const request = supertest(app);

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

describe('Search Suite', () => {
  let user, secondUser, thirdUser, token, userToken, firstDocument;
  let adminRole, regularRole;
  before((done) => {
    user = factory.users;
    secondUser = factory.secondUser;
    thirdUser = factory.thirdUser;
    firstDocument = sampleDoc.searchPublicDoc;

    db.Permission.bulkCreate(permissions, { returning: true }).then((createdPermission) => {
      if (createdPermission) {
        db.Role.bulkCreate(roles, { returning: true }).then((newRoles) => {
          db.RolePermission.bulkCreate(rolesPermission, { returning: true }).then(() => {
            adminRole = newRoles[0];
            regularRole = newRoles[1];
            secondUser.roleId = regularRole.id;
            thirdUser.roleId = regularRole.id;
            user.roleId = adminRole.id;

            request.post('/api/users/signup')
              .send(user)
              .end((err, res) => {
                token = res.body.token;
                request
                  .post('/api/documents')
                  .send(firstDocument)
                  .set('authorization', token)
                  .end((err, res) => {
                    done();
                  });
              });
          });
        });
      }
    });
  });

  after((done) => {
    db.Document.sequelize.sync({ force: true }).then(() => {
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
  });

  it('successfully returns the document with the search words to the admin',
    (done) => {
      const queryParams = 'and';
      request
        .post('/api/documents')
        .send(sampleDoc.searchPrivateDoc)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          request
            .get(`/api/documents/search?text=${queryParams}`)
            .set('authorization', token)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(200);
              expect(res.body.pagination.totalCount).to.equal(2);
              done();
            });
        });
    });

  it('successfully returns the search words to the admin with paginations',
    (done) => {
      const queryParams = 'and';
      request
        .get(`/api/documents/search?text=${queryParams}&limit=2&offset=1`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.pagination.totalCount).to.equal(2);
          expect(res.body.result.length).to.equal(1);
          done();
        });
    });

  it('returns search results on document that belongs to the owner or public',
  (done) => {
    const queryParams = 'computer';
    request
      .post('/api/users/signup')
      .send(secondUser)
      .end((err, res) => {
        userToken = res.body.token;
        request
          .post('/api/documents')
          .send(sampleDoc.searchPrivateDoc)
          .set('authorization', userToken)
          .end((err, res) => {
            if (err) return done(err);
            request
              .get(`/api/documents/search?text=${queryParams}`)
              .set('authorization', userToken)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.body.pagination.totalCount).to.equal(1);
                done();
              });
          });
      });
  });

  it('successfully returns the search words to the admin with paginations',
    (done) => {
      const queryParams = 'computer';
      request
        .get(`/api/documents/search?text=${queryParams}&limit=1`)
        .set('authorization', userToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.pagination.totalCount).to.equal(1);
          expect(res.body.result.length).to.equal(1);
          done();
        });
    });

  it('returns an empty array if no results are found', (done) => {
    const queryParams = 'ghdxrtyut67rerty';
    request
      .get(`/api/documents/search?text=${queryParams}`)
      .set('authorization', userToken)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(404);
        done();
      });
  });
  it('returns an empty array if no results are found for the admin', (done) => {
    const queryParams = 'ghdxrtyut67rerty';
    request
      .get(`/api/documents/search?text=${queryParams}`)
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(404);
        done();
      });
  });
});
