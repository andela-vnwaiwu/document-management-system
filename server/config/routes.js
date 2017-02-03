import users from '../controllers/api/users';

const routes = (router) => {
  router
    .route('/')
    .get(users.findAll);
};


export default routes;
