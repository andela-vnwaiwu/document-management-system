/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/no-unresolved: 0 */
/* eslint no-unused-vars: [2, { "args": "none" }] */
/* eslint no-underscore-dangle: 0 */
import 'babel-polyfill';
import httpMocks from 'node-mocks-http';
import chai from 'chai';
import spies from 'chai-spies';
import events from 'events';
import supertest from 'supertest';
import app from '../../app';
import factory from '../helpers/factory.helpers';
import sampleDoc from '../helpers/documents.helper';
import db from '../../models/';
import authenticate from '../../middlewares/authenticate';

chai.use(spies);
const next = () => {
  return true;
};

const expect = chai.expect;
const agent = supertest(app);
const spy = chai.spy(next);

const buildResponse = () => {
  return httpMocks.createResponse({ eventEmitter: events.EventEmitter });
};

describe('Middleware Unit Test', () => {
  let adminRole, regularRole, token, thirdToken, userToken;
  before((done) => {
    db.Role.bulkCreate([factory.adminRole, factory.regularRole], {
      returning: true
    }).then((newRoles) => {
      adminRole = newRoles[0];
      regularRole = newRoles[1];
      factory.secondUser.RoleId = regularRole.id;
      factory.thirdUser.RoleId = regularRole.id;
      factory.users.RoleId = adminRole.id;
      agent.post('/api/users/signup')
        .send(factory.users)
        .end((err, res) => {
          token = res.body.token;
          done();
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

  describe('VerifyToken Suite', () => {
    it('returns an error if valid token is not passed', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/login',
      });

      response.on('end', () => {
        expect(response._getData().message).to.equal('Unauthorized Access');
        done();
      });

      authenticate.verifyToken(request, response);
    });

    it('returns an error if a wrong token is passed', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/login',
        headers: { authorization: 'ueyufhjkhfqwy783r2-3q09rygeff809r09r3.jjf' }
      });

      response.on('end', () => {
        expect(response._getData().message).to.equal('Invalid Token');
        done();
      });

      authenticate.verifyToken(request, response);
    });

    it('calls the next function if the token is valid', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/login',
        headers: { authorization: token }
      });

      expect(spy()).to.equal(true);
      expect(spy).to.have.been.called();
      done();

      authenticate.verifyToken(request, response, next);
    });
  });

  describe('IsAdmin Suite', () => {
    before((done) => {
      agent.post('/api/users/signup')
        .send(factory.secondUser)
        .end((err, res) => {
          userToken = res.body.token;
          done();
        });
    });

    it('returns an error if the user is not the admin', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/',
        headers: { authorization: userToken },
        decoded: { RoleId: 2 }
      });

      response.on('end', () => {
        expect(response._getData().message).to.equal('You are not an Admin');
        done();
      });

      authenticate.isAdmin(request, response);
    });

    it('calls the next function if the user is an admin', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/',
        headers: { authorization: token },
        decoded: { RoleId: 1 }
      });

      expect(spy()).to.equal(true);
      expect(spy).to.have.been.called();
      done();

      authenticate.isAdmin(request, response, next);
    });
  });

  describe('UserPermission Suite', () => {
    before((done) => {
      agent.post('/api/users/signup')
        .send(factory.thirdUser)
        .end((err, res) => {
          thirdToken = res.body.token;
          done();
        });
    });

    it('returns an error if the user is not the owner or admin', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/users/2',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, RoleId: 2 },
        params: { id: 2 },
        body: { username: 'johnny' }
      });

      response.on('end', () => {
        expect(response._getData().message).to.equal('You are not the owner');
        done();
      });

      authenticate.userPermission(request, response);
    });

    it('calls the next function if the user is the owner', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/users/2',
        headers: { authorization: userToken },
        decoded: { userId: 3, RoleId: 2 },
        params: { id: 2 },
        body: { username: 'bimpe' }
      });

      expect(spy()).to.equal(true);
      expect(spy).to.have.been.called();
      done();

      authenticate.userPermission(request, response, next);
    });
  });

  describe('ViewPermission Suite', () => {
    before((done) => {
      agent.post('/api/documents')
        .send(sampleDoc.third)
        .set('authorization', userToken)
        .end((err, res) => {
          done();
        });
    });

    it('returns an error if the user is not the owner or admin', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/documents/1',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, RoleId: 2 },
        params: { id: 1 }
      });

      response.on('end', () => {
        expect(response._getData().message)
          .to.equal('You are not allowed to view this document');
        done();
      });

      authenticate.viewPermission(request, response);
    });

    it('calls the next function if the user is the owner', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, RoleId: 2 },
        params: { id: 1 }
      });

      expect(spy()).to.equal(true);
      expect(spy).to.have.been.called();
      done();

      authenticate.viewPermission(request, response, next);
    });
  });

  describe('DocPermission Suite', () => {
    it('returns an error if the user is not the owner or admin', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/documents/1',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, RoleId: 2 },
        params: { id: 1 },
        body: { title: 'money' }
      });

      response.on('end', () => {
        expect(response._getData().message)
          .to.equal('You are not allowed to access this document');
        done();
      });

      authenticate.docPermission(request, response);
    });

    it('calls the next function if the user is the owner', (done) => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, RoleId: 2 },
        params: { id: 1 },
        body: { title: 'money' }
      });

      expect(spy()).to.equal(true);
      expect(spy).to.have.been.called();
      done();

      authenticate.docPermission(request, response, next);
    });
  });
});
