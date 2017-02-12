import users from '../controllers/api/users';

const routes = (router) => {
  router.post('/users/login', users.login);
  router.post('/users/signup', users.create);
  router.post('/users/logout', users.logout);
  router.get('/users', users.findAll);
  router.get('/users/:id', users.findOne);
  router.put('/users/:id', users.updateOne);
  router.delete('/users/:id', users.remove);
};


export default routes;
