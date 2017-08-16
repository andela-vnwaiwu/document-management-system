/* eslint no-unused-expressions: 0 */
/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import chai from 'chai';
import factory from '../helpers/factory.helpers';
import rolePermissions from '../helpers/rolePermissions.helper';
import documents from '../helpers/documents.helper';
import db from '../../models/';

const expect = chai.expect;

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

const notNullAttrs = ['title', 'content', 'ownerId'];

let document, roleParams, documentParams, userParams;

describe('Document model', () => {
  before((done) => {
    userParams = factory.users;
    documentParams = documents.searchPublicDoc;

    db.Permission.bulkCreate(permissions, { returning: true }).then((createdPermission) => {
      if (createdPermission) {
        db.Role.bulkCreate(roles, { returning: true }).then((newRoles) => {
          db.RolePermission.bulkCreate(rolesPermission, { returning: true }).then(() => {
            roleParams = newRoles[0];
            factory.users.roleId = roleParams.id;
            db.User.create(userParams).then((owner) => {
              documentParams.ownerId = owner.id;
              done();
            });
          });
        });
      }
    });
  });

  beforeEach(() => {
    document = db.Document.build(documentParams);
  });

  // clear DB after each test
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

  describe('Create document', () => {
    it('creates a Document instance', () => expect(document).to.exist);

    it('has both title and content', () => {
      expect(document.title).to.equal(documentParams.title);
      expect(document.content).to.equal(documentParams.content);
    });

    it('saves document with valid attributes', () =>
      document.save()
        .then((newDocument) => {
          expect(newDocument.title).to.equal(document.title);
          expect(newDocument.content).to.equal(document.content);
        }).catch(err => expect(err).to.not.exist));

    it('sets default access to public', () =>
      document.save()
        .then(newDocument => expect(newDocument.access).to.equal('public'))
        .catch(err => expect(err).to.not.exist));

    it('has a published date defined', () =>
      document.save()
        .then(newDocument => expect(newDocument.createdAt).to.exist)
        .catch(err => expect(err).to.not.exist));
  });

  describe('Validations', () => {
    describe('NOT NULL attributes', () => {
      notNullAttrs.forEach((attr) => {
        it(`fails without ${attr}`, () => {
          document[attr] = null;
          return document.save()
            .then(newDocument => expect(newDocument).to.not.exist)
            .catch(err => expect(/notNull/.test(err.message)).to.be.true);
        });
      });
    });

    it('fails for invalid access type', () => {
      document.access = 'invalid access';
      return document.save()
        .then(newDocument => expect(newDocument).to.not.exist)
        .catch(err => expect(/isIn failed/.test(err.message)).to.be.true);
    });
  });
});
