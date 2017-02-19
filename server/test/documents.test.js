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
import sampleDoc from './helpers/documents.helper';
import db from '../models/';

dotenv.config();

const expect = chai.expect;
const request = supertest(app);

let user, secondUser, thirdUser, token, document1, document2, badDocument;
let privateDoc, adminDoc;

describe('Document suite', () => {
  let userResult1;
  before((done) => {
    db.User.destroy({ where: {} });
    user = factory.users;
    secondUser = factory.secondUser;
    thirdUser = factory.thirdUser;
    document1 = sampleDoc.first;
    document2 = sampleDoc.second;
    badDocument = sampleDoc.badDoc;
    privateDoc = sampleDoc.third;
    request
      .post('/api/users/signup')
      .send(user)
      .end((err, res) => {
        token = res.body.token;
        userResult1 = res.body.user;
        request
          .post('/api/documents')
          .send(document1)
          .set('authorization', token)
          .end((err, res) => {
            adminDoc = res.body;
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
          expect(res.status).to.equal(200);
          expect(res.body).to.be.defined;
          expect(res.body.title).to.be.defined;
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
    it('returns an error if the document has private access', (done) => {
      privateDoc.OwnerId = userResult1.id;
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
              result = res.body;
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
              userResult = res.body;
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
  });
});
