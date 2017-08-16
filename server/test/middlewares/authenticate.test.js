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
import rolePermissions from '../helpers/rolePermissions.helper';

const expect = chai.expect;
const agent = supertest(app);

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

const buildResponse = () => {
  return httpMocks.createResponse({ eventEmitter: events.EventEmitter });
};

describe('Middleware Unit Test', () => {
  let adminRole, regularRole, token, thirdToken, userToken;
  before((done) => {
    db.Permission.bulkCreate(permissions, { returning: true }).then(() => {
      db.Role.bulkCreate(roles, { returning: true }).then((newRoles) => {
        db.RolePermission.bulkCreate(rolesPermission, { returning: true }).then(() => {
          adminRole = newRoles[0];
          regularRole = newRoles[2];
          factory.secondUser.roleId = regularRole.id;
          factory.thirdUser.roleId = regularRole.id;
          factory.users.roleId = adminRole.id;

          agent.post('/api/users/signup')
            .send(factory.users)
            .end((err, res) => {
              token = res.body.token;
              done();
            });
        });
      });
    });
  });

  after((done) => {
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
        decoded: { roleId: 2 }
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
        decoded: { roleId: 2 }
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
        decoded: { roleId: 1 }
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
        method: 'PATCH',
        url: '/api/users/2',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, roleId: 2 },
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
        method: 'PATCH',
        url: '/api/users/2',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, roleId: 2 },
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
        method: 'PATCH',
        url: '/api/users/2',
        headers: { authorization: userToken },
        decoded: { userId: 3, roleId: 2 },
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

  describe('ViewDocPermission Suite', () => {
    before((done) => {
      agent.post('/api/documents')
        .send(sampleDoc.third)
        .set('authorization', userToken)
        .end((err, res) => {
          done();
        });
    });

    it('returns an error if the user is not the owner or admin', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/documents/1',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, roleId: 2 },
        params: { id: 1 }
      });

      authenticate.viewDocPermission(request, response);

      response.on('end', () => {
        expect(response._getData().message)
          .to.equal('You are not allowed to view this document');
      });
    });

    it('should not call the next function if the user is not the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/documents/1',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, roleId: 2 },
        params: { id: 1 }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.viewDocPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).not.to.have.been.called;
    });

    it('calls the next function if the user is the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, roleId: 2 },
        params: { id: 1 }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.viewDocPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).to.have.been.called;
    });
  });

  describe('EditDocPermission Suite', () => {
    it('returns an error if the user is not the owner or admin', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/documents/1',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, roleId: 2 },
        params: { id: 1 },
        body: { title: 'money' }
      });

      response.on('end', () => {
        expect(response._getData().message)
          .to.equal('You are not allowed to access this document');
      });

      authenticate.editDocPermission(request, response);
    });

    it('should not call the next function if the user is not the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, roleId: 2 },
        params: { id: 1 },
        body: { title: 'money' }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.editDocPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).not.to.have.been.called;
    });

    it('calls the next function if the user is the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, roleId: 2 },
        params: { id: 1 },
        body: { title: 'money' }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.editDocPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).to.have.been.called;
    });
  });

  describe('DeleteDocPermission Suite', () => {
    it('returns an error if the user is not the owner or admin', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/api/documents/1',
        headers: { authorization: thirdToken },
        decoded: { userId: 3, roleId: 2 },
        params: { id: 1 },
      });

      response.on('end', () => {
        expect(response._getData().message)
          .to.equal('You are not allowed to delete this document');
      });

      authenticate.deleteDocPermission(request, response);
    });

    it('returns an error if the document does not exist', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/api/documents/100',
        headers: { authorization: thirdToken },
        decoded: { userId: 1, roleId: 1 },
        params: { id: 100 },
      });

      response.on('end', () => {
        expect(response._getData().message)
          .to.equal('Document not found to delete');
      });

      authenticate.deleteDocPermission(request, response);
    });

    it('should not call the next function if the user is not the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, roleId: 2 },
        params: { id: 1 },
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.deleteDocPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).not.to.have.been.called;
    });

    it('calls the next function if the user is the owner', () => {
      const response = buildResponse();
      const request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/api/documents/1',
        headers: { authorization: userToken },
        decoded: { userId: 2, roleId: 2 },
        params: { id: 1 },
        body: { title: 'money' }
      });

      const middlewareStub = {
        callback: () => {}
      };

      sinon.spy(middlewareStub, 'callback');

      authenticate.deleteDocPermission(request, response, middlewareStub.callback);
      expect(middlewareStub.callback).to.have.been.called;
    });
  });
});
