/* eslint import/no-unresolved: 0 */
import Users from '../controllers/api/Users';
import Documents from '../controllers/api/Documents';
import Search from '../controllers/api/Search';
import Roles from '../controllers/api/Roles';

const routes = (router, authenticate) => {
  // Search routes
  router.get('/documents/search', authenticate.verifyToken, Search.searchAll);

  // Users routes
  router.post('/users/login', Users.login);
  router.post('/users/signup', Users.signup);
  router
    .route('/users/create-admin')
    .post(authenticate.verifyToken, authenticate.isAdmin, Users.createAdmin);
  router.post('/users/logout', Users.logout);

  router.get('/users', authenticate.verifyToken, authenticate.isAdmin, Users.findAll);

  router
    .route('/users/:id')
      .get(authenticate.verifyToken, Users.findOne)
      .patch(authenticate.verifyToken, authenticate.userPermission, Users.updateOne)
      .delete(authenticate.verifyToken, authenticate.isAdmin, Users.remove);

  // Document routes
  router
    .route('/documents')
      .post(authenticate.verifyToken, Documents.create)
      .get(authenticate.verifyToken, Documents.getAll);

  router
    .route('/users/:id(\\d+)/documents')
    .get(authenticate.verifyToken, Documents.getDocumentsForUser);

  router
    .route('/documents/:id')
      .get(authenticate.verifyToken, authenticate.viewDocPermission, Documents.getOne)
      .patch(authenticate.verifyToken, authenticate.editDocPermission, Documents.update)
      .delete(authenticate.verifyToken, authenticate.deleteDocPermission, Documents.remove);

  router
    .route('/roles')
      .post(authenticate.verifyToken, authenticate.isAdmin, Roles.create)
      .get(authenticate.verifyToken, authenticate.isAdmin, Roles.getAll);

  router
    .route('/roles/:id')
      .get(authenticate.verifyToken, authenticate.isAdmin, Roles.getOne)
      .patch(authenticate.verifyToken, authenticate.isAdmin, Roles.update)
      .delete(authenticate.verifyToken, authenticate.isAdmin, Roles.delete);
};

export default routes;
