/* eslint no-unused-expressions: 0 */
/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import chai from 'chai';
import factory from '../helpers/factory.helpers';
import rolePermissions from '../helpers/rolePermissions.helper';
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

let role, roleParams;

describe('Role model', () => {
  before((done) => {
    roleParams = factory.testRole;
    db.Permission.bulkCreate(permissions, { returning: true }).then(() => {
      db.Role.bulkCreate(roles, { returning: true }).then(() => {
        db.RolePermission.bulkCreate(rolesPermission, { returning: true }).then(() => {
          done();
        });
      });
    });
  });

  beforeEach(() => {
    role = db.Role.build(roleParams);
  });

  // clear DB after each test
  after((done) => {
    db.RolePermission.sequelize.sync({ force: true }).then(() => {
      db.Role.sequelize.sync({ force: true }).then(() => {
        db.Permission.sequelize.sync({ force: true }).then(() => {
          done();
        });
      });
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
        .then((createdRoles) => {
          expect(createdRoles[0].title).to.equal('admin');
          expect(createdRoles[1].title).to.equal('manager');
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
