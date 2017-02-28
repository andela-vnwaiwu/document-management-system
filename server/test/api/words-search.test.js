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

describe('Search Suite', () => {
  let user, secondUser, thirdUser, token, userToken, firstDocument;
  let adminRole, regularRole;
  before((done) => {
    user = factory.users;
    secondUser = factory.secondUser;
    thirdUser = factory.thirdUser;
    firstDocument = sampleDoc.searchPublicDoc;
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

  after((done) => {
    db.Document.sequelize.sync({ force: true }).then(() => {
      db.User.sequelize.sync({ force: true }).then(() => {
        db.Role.sequelize.sync({ force: true }).then(() => {
          done();
        });
      });
    });
  });

  it('successfully returns the document with the search words to the admin', (done) => {
    const queryParams = 'cooking';
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
                expect(res.body.length).to.equal(1);
                done();
              });
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
