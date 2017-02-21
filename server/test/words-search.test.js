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

describe('Search Suite', () => {
  let publicSearchDoc, userToken, token;
  publicSearchDoc = sampleDoc.searchPublicDoc;
  before((done) => {
    db.User.destroy({ where: {} });
    db.Document.destroy({ where: {} });
    request
      .post('/api/users/signup')
      .send(factory.secondUser)
      .end((err, res) => {
        if (err) return done(err);
        userToken = res.body.token;
        request
          .post('/api/documents')
          .send(publicSearchDoc)
          .set('authorization', userToken)
          .end((err, res) => {
            if (err) return done(err)
            done();
          });
      });
  });
  after((done) => {
    db.User.destroy({ where: {} });
    db.Document.destroy({ where: {} });
    done();
  });

  it('successfully returns the document with the search words to the admin', (done) => {
    const queryParams = 'cooking';
    request
      .post('/api/users/signup')
      .send(factory.users)
      .end((err, res) => {
        if (err) return done(err);
        token = res.body.token;
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
                done();
              });
          });
      });
  });
  it('returns search results on document that belongs to the owner or public',
  (done) => {
    const queryParams = 'computer';
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
            expect(res.body.length).to.equal(1);
            done();
          });
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
        expect(res.body.results.length).to.equal(0);
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
        expect(res.body.results.length).to.equal(0);
        done();
      });
  });
});
