/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint import/no-unresolved: 0 */
/* eslint import/extensions: 0 */
/* eslint no-unused-expressions: 0 */
/* eslint no-unused-vars: ["error", { "args": "none" }] */
import dotenv from 'dotenv';
import 'babel-polyfill';
import chai from 'chai';
import supertest from 'supertest';
import app from '../app';
import factory from './helpers/factory.helpers';
import sampleDoc from './helpers/documents.helper';
import db from '../models/';

dotenv.config();

const expect = chai.expect;
const request = supertest(app);

let user, secondUser, thirdUser, token, document1, document2, badDocument;
let privateDoc, adminDoc;

describe('Document suite', () => {
  before((done) => {
    db.User.destroy({ where: {} });
    user = factory.users;
    secondUser = factory.secondUser;
    thirdUser = factory.thirdUser;
    document1 = sampleDoc.first;
    badDocument = sampleDoc.badDoc;
    privateDoc = sampleDoc.third;
    request
      .post('/api/users/signup')
      .send(user)
      .end((err, res) => {
        token = res.body.token;

        request
          .post('/api/documents')
          .send(document1)
          .set('authrization', token)
          .end((err, res) => {
            adminDoc = res.body.document;
            done();
          });
      });
  });

  after(() => {
    db.User.destroy({ where: {} });
    db.Document.destroy({ where: {} });
  });

  describe('Create Document POST: /api/documents/', () => {
    it('should create a document successfully', (done) => {
      request
        .post('/api/documents')
        .send(document1)
        .set('authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.document).to.be.defined;
          expect(res.body.document).to.be.an('object');
          expect(res.body.document.title).to.be.defined;
          done();
        });
    });
    it('should not create a document if the user is not logged in', (done) => {
      request
        .post('/api/documents')
        .send(document1)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
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
        });
    });
  });

  describe('Get All Document GET: /api/documents/', () => {
    let secondToken;
    before((done) => {
      request
      .post('/api/users/signup')
      .send(secondUser)
      .end((err, res) => {
        secondToken = res.body.token;
        request
          .post('/api/documents')
          .send(document2)
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
          expect(Object.keys(res.body.documents)).to.equal(2);
          done();
        });
    });
    it('returns an error if the user is not an admin', (done) => {
      request
        .get('/api/documents')
        .set('authorization', secondToken)
        .end((err, res) => {
          expect(res.status).to.equal(403);
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
    let secondToken, result2, documentResult;
    before((done) => {
      request
        .post('/api/documents')
        .send(privateDoc)
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          result2 = res.body.document;
        });
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          secondToken = res.body.token;
          request
            .post('/api/documents')
            .send(document2)
            .set('authorization', secondToken)
            .end((err, res) => {
              if (err) done(err);
              documentResult = res.body.document;
              done();
            });
        });
    });
    it('returns the document if the document has public access', (done) => {
      request
        .get(`/api/documents/${adminDoc.id}`)
        .set('authorization', secondToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
        });
    });
    it('returns an error if the document has private access', (done) => {
      request
        .get(`/api/documents/${result2.id}`)
        .set('authorization', secondToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(403);
        });
    });
    it('returns the document if the document belongs to the user', (done) => {
      request
        .get(`/api/documents/${documentResult.id}`)
        .set('authorization', secondToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
        });
    });
  });

  describe('Update Document PUT: /api/documents/:id', () => {
    let result, userToken;
    before((done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          userToken = res.body.token;
          request
            .post('/api/documents')
            .send(document1)
            .set('authorization', userToken)
            .end((err, res) => {
              result = res.body.document;
              done();
            });
        });
    });
    it('successfully updates a document', (done) => {
      request
        .put(`/api/documents/${result.id}`)
        .send(document2)
        .set('authorization', userToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body.document).to.be.defined;
          done();
        });
    });
    it('returns an error if it does not belong to the user', (done) => {
      request
        .put(`/api/documents/${adminDoc.id}`)
        .send(document2)
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
        .send(document2)
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
        .send(document2)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });
  });

  describe('Get A User\'s Documents GET: /api/users/:id/documents', () => {
    let userResult, userToken;
    before((done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          userToken = res.body.token;
          request
            .post('/api/documents')
            .send(document1)
            .set('authorization', userToken)
            .end((err, res) => {
              userResult = res.body.document;
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
    let userResult, userToken;
    before((done) => {
      request
        .post('/api/users/login')
        .send(secondUser)
        .end((err, res) => {
          userToken = res.body.token;
          request
            .post('/api/documents')
            .send(document1)
            .set('authorization', userToken)
            .end((err, res) => {
              userResult = res.body.document;
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
          expect(res.status).to.equal(403);
          done();
        });
    });
    it('deletes the document if the user is the owner', (done) => {
      request
        .delete(`/api/documents/${adminDoc.id}`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
    });
    it('deletes the document if the user is the admin', (done) => {
      request
        .delete(`/api/documents/${userResult.id}`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
    });
  });
});
