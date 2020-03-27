import { Controller } from 'egg';
const createRule = {
  accesstoken: 'string',
  title: 'string',
  tab: { type: 'enum', values: [ 'ask', 'share', 'job' ], required: false },
  content: 'string',
};
export default class TopicController extends Controller {
  async create() {
    const ctx = this.ctx;
    // 校验 `ctx.request.body` 是否符合我们预期的格式
    // 如果参数校验未通过，将会抛出一个 status = 422 的异常
    ctx.validate(createRule, ctx.request.body);
    // 调用 service 创建一个 topic
    const id ='111111'
    // 设置响应体和状态码
    ctx.body = {
      topic_id: id,
    };
    ctx.status = 201;
  }
  async index() {
    const ctx = this.ctx;
    // 设置响应体和状态码
    ctx.helper.success({
      ctx,
      res: ['111'],
      msg: '请求成功'
    })
  }
  async destroy() {

  }
  async update() {

  }
  async show() {

  }
}