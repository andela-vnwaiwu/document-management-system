/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/no-unresolved: 0 */
/* eslint no-unused-vars: [2, { "args": "none" }] */
/* eslint no-underscore-dangle: 0 */
/* eslint no-unused-expressions: 0 */
import 'babel-polyfill';
import httpMocks from 'node-mocks-http';
import chai from 'chai';
import sinon from 'sinon';
import events from 'events';
import supertest from 'supertest';
import app from '../../app';
import factory from '../helpers/factory.helpers';
import sampleDoc from '../helpers/documents.helper';
import db from '../../models/';
import authenticate from '../../middlewares/authenticate';

const expect = chai.expect;
const agent = supertest(app);

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
    it('returns an error if valid token is not passed', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users',
      });

      authenticate.verifyToken(request, response);

      response.on('end', () => {
        expect(response._getData().message).to.equal('Unauthorized Access');
      });
    });

    it('returns an error if a wrong token is passed', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users',
        headers: { authorization: 'ueyufhjkhfqwy783r2-3q09rygeff809r09r3.jjf' }
      });

      authenticate.verifyToken(request, response);

      response.on('end', () => {
        expect(response._getData().message).to.equal('Invalid Token');
      });
    });

    it('should not call the next function if the token is invalid', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users',
        headers: { authorization: 'hwefb23r90piru82um233.bhfvi32of2o.jf2ieoi' }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.verifyToken(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).not.to.have.been.called;
    });

    it('calls the next function if the token is valid', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users',
        headers: { authorization: token }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.verifyToken(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).to.have.been.called;
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

      authenticate.isAdmin(request, response);

      response.on('end', () => {
        expect(response._getData().message).to.equal('You are not an Admin');
        done();
      });
    });

    it('should not call the next function if the user is not the admin', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users',
        headers: { authorization: 'hwefb23r90piru82um233.bhfvi32of2o.jf2ieoi' },
        decoded: { RoleId: 2 }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.isAdmin(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).not.to.have.been.called;
    });

    it('calls the next function if the user is an admin', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/',
        headers: { authorization: token },
        decoded: { RoleId: 1 }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.isAdmin(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).to.have.been.called;
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

      authenticate.userPermission(request, response);

      response.on('end', () => {
        expect(response._getData().message).to.equal('You are not the owner');
        done();
      });
    });

    it('should not call the next function if the user is not the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/users/2',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, RoleId: 2 },
        params: { id: 2 },
        body: { username: 'johnny' }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.userPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).not.to.have.been.called;
    });

    it('calls the next function if the user is the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/users/2',
        headers: { authorization: userToken },
        decoded: { userId: 3, RoleId: 2 },
        params: { id: 2 },
        body: { username: 'bimpe' }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.userPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).to.have.been.called;
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

      authenticate.viewPermission(request, response);

      response.on('end', () => {
        expect(response._getData().message)
          .to.equal('You are not allowed to view this document');
        done();
      });
    });

    it('should not call the next function if the user is not the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/documents/1',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, RoleId: 2 },
        params: { id: 1 }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.userPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).not.to.have.been.called;
    });

    it('calls the next function if the user is the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, RoleId: 2 },
        params: { id: 1 }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.viewPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).to.have.been.called;
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

    it('should not call the next function if the user is not the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, RoleId: 2 },
        params: { id: 1 },
        body: { title: 'money' }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.userPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).not.to.have.been.called;
    });

    it('calls the next function if the user is the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, RoleId: 2 },
        params: { id: 1 },
        body: { title: 'money' }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.docPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).to.have.been.called;
    });
  });
});
