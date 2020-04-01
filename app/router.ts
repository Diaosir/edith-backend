import { Application } from 'egg';
export default (app: Application) => {
  const { router, controller } = app;
  router.resources('topics', '/api/v2/topics', controller.topics);
  router.resources('component', '/api/v2/component', controller.component);
  router.resources('project', '/api/v2/project', controller.project);
  router.get('/api/v2/typings/*', controller.typings.index)
  router.get('/api/v2/package/:packageString', controller.package.index)
  router.get('/api/v2/package/combinations/:packages', controller.package.combinations)
}
