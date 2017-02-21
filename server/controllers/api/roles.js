/* eslint import/no-unresolved: 0 */
import db from '../../models/';

const roles = {
  create: (req, res) => {
    db.Role.find({
      where: {
        title: req.body.title
      }
    }).then((result) => {
      if (result) {
        return res.status(409).json({ message: 'Role already exists' });
      }
      db.Role.create(req.body).then((role) => {
        return res.status(201).json(role);
      })
      .catch((error) => {
        return res.status(400).json(error);
      });
    });
  },

  getOne: (req, res) => {
    const roleId = req.params.id;
    db.Role.findById(roleId).then((result) => {
      if (result < 1) {
        return res.status(404).json({ message: 'Role not found' });
      }
      return res.status(200).json(result);
    });
  },

  getAll: (req, res) => {
    db.Role.findAll().then((result) => {
      if (result < 1) {
        return res.status(404).json({ message: 'Role not found' });
      }
      return res.status(200).json(result);
    });
  },

  update: (req, res) => {
    const roleId = req.params.id;
    db.Role.findById(roleId).then((result) => {
      if (result && result.title === 'admin') {
        return res.status(403).json({ message: 'can\'t update admin role' });
      }
      db.Role.findById(roleId).then((role) => {
        if (!role) {
          return res.status(404).json({ message: 'role not found to update' });
        }
        role.update(req.body).then((updatedRole) => {
          return res.status(200).json(updatedRole);
        });
      });
    });
  },

  delete: (req, res) => {
    const roleId = req.params.id;
    db.Role.findById(roleId).then((result) => {
      if (result && result.title === 'admin') {
        return res.status(403).json({ message: 'can\'t delete admin role' });
      }
      db.Role.destroy({
        where: {
          id: roleId
        }
      }).then((role) => {
        if (role < 1) {
          return res.status(404).json({ message: 'No role found to delete' });
        }
        return res.status(200).json({ message: 'Role successfully deleted' });
      });
    });
  }
};

export default roles;
