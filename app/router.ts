import { Application } from 'egg';
export default (app: Application) => {
  const { router, controller } = app;
  router.resources('topics', '/api/v2/topics', controller.topics);
  router.resources('combinations', '/api/v2/combinations', controller.combinations)
  router.resources('typings', '/api/v2/typings', controller.typings)
}
