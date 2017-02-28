/* eslint no-unused-expressions: 0 */
/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import chai from 'chai';
import factory from '../helpers/factory.helpers';
import documents from '../helpers/documents.helper';
import db from '../../models/';

const expect = chai.expect;

const notNullAttrs = ['title', 'content', 'OwnerId'];

let document, roleParams, documentParams, userParams;

describe('Document model', () => {
  before((done) => {
    roleParams = factory.adminRole;
    userParams = factory.users;
    documentParams = documents.searchPublicDoc;
    db.Role.create(roleParams).then((role) => {
      userParams.RoleId = role.id;
      return db.User.create(userParams);
    }).then((owner) => {
      documentParams.OwnerId = owner.id;
      done();
    });
  });

  beforeEach(() => {
    document = db.Document.build(documentParams);
  });

  // clear DB after each test
  after((done) => {
    db.Document.sequelize.sync({ force: true }).then(() => {
      db.User.sequelize.sync({ force: true }).then(() => {
        db.Role.sequelize.sync({ force: true }).then(() => {
          done();
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
        .then(newDocument => expect(newDocument.isPublic).to.be.true)
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
      document.isPublic = 'invalid access';
      return document.save()
        .then(newDocument => expect(newDocument).to.not.exist)
        .catch(err => expect(/isIn failed/.test(err.message)).to.be.true);
    });
  });
});
