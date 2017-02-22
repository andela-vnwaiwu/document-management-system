/* eslint import/no-unresolved: 0 */
import users from '../controllers/api/users';
import documents from '../controllers/api/documents';
import search from '../controllers/api/search';
import roles from '../controllers/api/roles';

const routes = (router, authenticate) => {
  // Search routes
  router.get('/documents/search', authenticate.verifyToken, search.searchAll);

  // Users routes
  router.post('/users/login', users.login);
  router.post('/users/signup', users.create);
  router.post('/users/logout', users.logout);

  router.get('/users', authenticate.verifyToken, authenticate.isAdmin, users.findAll);

  router
    .route('/users/:id')
      .get(authenticate.verifyToken, users.findOne)
      .put(authenticate.verifyToken, authenticate.userPermission, users.updateOne)
      .delete(authenticate.verifyToken, authenticate.isAdmin, users.remove);

  // Document routes
  router
    .route('/documents')
      .post(authenticate.verifyToken, documents.create)
      .get(authenticate.verifyToken, authenticate.viewPermission, documents.getAll);

  router
    .route('/users/:id/documents')
    .get(authenticate.verifyToken, documents.getDocsForUser);

  router
    .route('/documents/:id')
      .get(authenticate.verifyToken, authenticate.viewPermission, documents.getOne)
      .put(authenticate.verifyToken, authenticate.docPermission, documents.update)
      .delete(authenticate.verifyToken, authenticate.docPermission, documents.remove);

  router
    .route('/roles')
      .post(authenticate.verifyToken, authenticate.isAdmin, roles.create)
      .get(authenticate.verifyToken, authenticate.isAdmin, roles.getAll);

  router
    .route('/roles/:id')
      .get(authenticate.verifyToken, authenticate.isAdmin, roles.getOne)
      .put(authenticate.verifyToken, authenticate.isAdmin, roles.update)
      .delete(authenticate.verifyToken, authenticate.isAdmin, roles.delete);
};

export default routes;
