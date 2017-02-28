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
import sampleDoc from '../helpers/documents.helper';
import db from '../../models/';

dotenv.config();

const expect = chai.expect;
const request = supertest(app);

describe('Document suite', () => {
  let user, secondUser, thirdUser, token, userToken, firstDocument, secondDocument, badDocument;
  let privateDoc, adminDoc, adminDocument, secondUserResult, adminUserResult;
  let adminRole, regularRole;
  before((done) => {
    user = factory.users;
    secondUser = factory.secondUser;
    thirdUser = factory.thirdUser;
    firstDocument = sampleDoc.first;
    secondDocument = sampleDoc.second;
    badDocument = sampleDoc.badDoc;
    privateDoc = sampleDoc.third;
    db.Role.bulkCreate([factory.adminRole, factory.regularRole], {
      returning: true
    }).then((newRoles) => {
      adminRole = newRoles[0];
      regularRole = newRoles[1];
      secondUser.RoleId = regularRole.id;
      thirdUser.RoleId = regularRole.id;
      user.RoleId = adminRole.id;

      request.post('/api/users/signup')
        .send(user)
        .end((err, res) => {
          adminUserResult = res.body.user;
          token = res.body.token;
          firstDocument.OwnerId = adminUserResult.id;
          request
            .post('/api/documents')
            .send(firstDocument)
            .set('authorization', token)
            .end((err, res) => {
              adminDocument = res.body;
              done();
            });
        });
    });
  });

  after((done) => {
    db.Document.sequelize.sync({ force: true }).then(() => {
      db.User.sequelize.sync({ force: true }).then(() => {
        db.Role.sequelize.sync({ force: true }).then(() => {
          done();
        });
      });
    });
  });

  describe('Get non-existing documents GET: /api/documents/:id', () => {
    it('returns an error to the admin if no documents exists', (done) => {
      request
        .delete(`/api/documents/${adminDocument.id}`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          request
            .get('/api/documents')
            .set('authorization', token)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(404);
              done();
            });
        });
    });
    it('returns an error to a user if no documents exists', (done) => {
      request
        .post('/api/users/signup')
        .send(secondUser)
        .end((err, res) => {
          if (err) return done(err);
          userToken = res.body.token;
          secondUserResult = res.body.user;
          request
            .get('/api/documents')
            .set('authorization', userToken)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(404);
              done();
            });
        });
    });
    it('returns an error if a user has no document', (done) => {
      request
        .get(`/api/users/${secondUserResult.id}/documents`)
        .set('authorization', userToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('returns an error to the admin if a user has no document', (done) => {
      request
        .get(`/api/users/${secondUserResult.id}/documents`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
  });

  describe('Create Document POST: /api/documents/', () => {
    it('should create a document successfully', (done) => {
      request
        .post('/api/documents')
        .send(firstDocument)
        .set('authorization', token)
        .end((err, res) => {
          adminDoc = res.body;
          expect(res.status).to.equal(200);
          expect(res.body).to.be.defined;
          expect(res.body.title).to.be.defined;
          done();
        });
    });
    it('should not create a document if the user is not logged in', (done) => {
      request
        .post('/api/documents')
        .send(firstDocument)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });
    it('should return an error if any field is missing', (done) => {
      request
        .post('/api/documents')
        .send(badDocument)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(400);
          done();
        });
    });
  });

  describe('Get All Document GET: /api/documents/', () => {
    let secondToken;
    before((done) => {
      request
      .post('/api/users/login')
      .send(secondUser)
      .end((err, res) => {
        secondToken = res.body.token;
        request
          .post('/api/documents')
          .send(secondDocument)
          .set('authorization', secondToken)
          .end((err, res) => {
            if (err) done(err);
            done();
          });
      });
    });
    it('should get all documents if the user is an admin', (done) => {
      request
        .get('/api/documents')
        .set('authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.length).to.be.defined;
          done();
        });
    });
    it('returns document that belongs to the user and are public', (done) => {
      request
        .get('/api/documents')
        .set('authorization', secondToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns an error if the user is not logged in', (done) => {
      request
        .get('/api/documents')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get Document GET: /api/documents/:id', () => {
    let secondToken, result2;
    before((done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          secondToken = res.body.token;
          done();
        });
    });
    it('returns the document if the document has public access', (done) => {
      request
        .get(`/api/documents/${adminDoc.id}`)
        .set('authorization', secondToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns an error if the document does not exist', (done) => {
      request
        .get(`/api/documents/${adminDoc.id * 8}`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('returns an error if the document has private access', (done) => {
      privateDoc.OwnerId = adminUserResult.id;
      request
        .post('/api/documents')
        .send(privateDoc)
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          result2 = res.body;
          request
            .get(`/api/documents/${result2.id}`)
            .set('authorization', secondToken)
            .end((err, res) => {
              if (err) done(err);
              expect(res.status).to.equal(403);
              done();
            });
        });
    });
    it('returns the document if the document belongs to the user', (done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          request
            .post('/api/documents')
            .send(privateDoc)
            .set('authorization', res.body.token)
            .end((err, res) => {
              const doc = res.body;
              request
                .get(`/api/documents/${doc.id}`)
                .set('authorization', secondToken)
                .end((err, res) => {
                  if (err) done(err);
                  expect(res.status).to.equal(200);
                  done();
                });
            });
        });
    });
  });

  describe('Update Document PUT: /api/documents/:id', () => {
    let result;
    before((done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          userToken = res.body.token;
          request
            .post('/api/documents')
            .send(firstDocument)
            .set('authorization', userToken)
            .end((err, res) => {
              result = res.body;
              done();
            });
        });
    });
    it('successfully updates a document', (done) => {
      request
        .put(`/api/documents/${result.id}`)
        .send(secondDocument)
        .set('authorization', userToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns an error if it does not belong to the user', (done) => {
      request
        .put(`/api/documents/${adminDoc.id}`)
        .send(secondDocument)
        .set('authorization', userToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(403);
          done();
        });
    });
    it('returns an error when trying to update a document that does not exist',
      (done) => {
        request
        .put(`/api/documents/${result.id * 4}`)
        .send(secondDocument)
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(404);
          done();
        });
      });
    it('returns an error if the user is not logged in', (done) => {
      request
        .put(`/api/documents/${result.id}`)
        .send(secondDocument)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get A User\'s Documents GET: /api/users/:id/documents', () => {
    let userResult;
    before((done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          userToken = res.body.token;
          userResult = res.body.user;
          request
            .post('/api/documents')
            .send(firstDocument)
            .set('authorization', userToken)
            .end((err, res) => {
              done();
            });
        });
    });
    it('returns all documents that belongs to a user', (done) => {
      request
        .get(`/api/users/${userResult.id}/documents`)
        .set('authorization', userToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns all documents that belongs to a user to the admin', (done) => {
      request
        .get(`/api/users/${userResult.id}/documents`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns an error if the user is not logged in', (done) => {
      request
        .get(`/api/users/${userResult.id}/documents`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });
    it('returns only documents that are public to another user', (done) => {
      let thirdToken;
      request
        .post('/api/users/signup')
        .send(thirdUser)
        .end((err, res) => {
          thirdToken = res.body.token;
          request
            .get(`/api/users/${userResult.id}/documents`)
            .set('authorization', thirdToken)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(200);
              done();
            });
        });
    });
  });

  describe('Delete Document DELETE: /api/documents/:id', () => {
    let userResult;
    before((done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          userToken = res.body.token;
          request
            .post('/api/documents')
            .send(firstDocument)
            .set('authorization', userToken)
            .end((err, res) => {
              userResult = res.body;
              done();
            });
        });
    });
    it('returns an error if the user is not an admin or owner', (done) => {
      request
        .delete(`/api/documents/${adminDoc.id}`)
        .set('authorization', userToken)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(403);
          done();
        });
    });
    it('returns an error if the user is not logged in', (done) => {
      request
        .delete(`/api/documents/${adminDoc.id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });
    it('deletes the document if the user is the owner', (done) => {
      request
        .delete(`/api/documents/${adminDoc.id}`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('deletes the document if the user is the admin', (done) => {
      request
        .delete(`/api/documents/${userResult.id}`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('returns an error if document could not be found', (done) => {
      request
        .delete(`/api/documents/${userResult.id * 8}`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
});
