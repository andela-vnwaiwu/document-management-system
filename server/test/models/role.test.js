/* eslint no-unused-expressions: 0 */
/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import chai from 'chai';
import factory from '../helpers/factory.helpers';
import db from '../../models/';

const expect = chai.expect;

let role, roleParams;

describe('Role model', () => {
  before(() => {
    roleParams = factory.role;
    role = db.Role.build(roleParams);
    return db.Role.bulkCreate([factory.adminRole, factory.regularRole]);
  });

  // clear DB after each test
  after((done) => {
    db.Role.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  describe('Create role', () => {
    it('creates a Role instance', () => expect(role).to.exist);

    it('has a title', () => expect(role.title).to.equal(roleParams.title));

    it('saves role with valid attributes', () =>
      role.save()
        .then(newRole => expect(newRole.title).to.equal(role.title)));

    it('has at least "admin" and "regular" roles', () =>
      db.Role.findAll()
        .then((roles) => {
          expect(roles[0].title).to.equal('admin');
          expect(roles[1].title).to.equal('regular');
        }));
  });

  describe('Validations', () => {
    it('fails without a title', () =>
     db.Role.create({})
        .then(newRole => expect(newRole).to.not.exist)
        .catch(err =>
          expect(/notNull/.test(err.message)).to.be.true)
    );

    it('fails for non unique title', () =>
      db.Role.create(roleParams)
        .then(newRole => expect(newRole).to.not.exist)
        .catch(err =>
          expect(/UniqueConstraintError/.test(err.name)).to.be.true));
  });
});
