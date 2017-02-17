import users from '../controllers/api/users';

const routes = (router, authenticate) => {
  // Users routes
  router.post('/users/login', users.login);
  router.post('/users/signup', users.create);
  router.post('/users/logout', users.logout);

  router.get('/users', authenticate.verifyToken, authenticate.isAdmin, users.findAll);

  router
    .route('/users/:id')
      .get(authenticate.verifyToken, users.findOne)
      .put(authenticate.verifyToken, authenticate.hasPermission, users.updateOne)
      .delete(authenticate.verifyToken, authenticate.isAdmin, users.remove);
};


export default routes;
