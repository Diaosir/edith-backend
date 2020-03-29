import { Application } from 'egg';
export default (app: Application) => {
  const { router, controller } = app;
  router.resources('topics', '/api/v2/topics', controller.topics);
  router.get('/api/v2/typings/*', controller.typings.index)
  router.get('/api/v2/combinations/:packages', controller.combinations.index)
}
