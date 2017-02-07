import users from '../controllers/api/users';

const routes = (router) => {
  router
    .route('/users')
      .get(users.findAll);
};


export default routes;
