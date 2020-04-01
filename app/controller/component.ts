import { Controller } from 'egg';
export default class ComponentController extends Controller {
  async index() {
    const ctx = this.ctx;
    const res = {}
    // 设置响应体和状态码
    ctx.helper.success({
      ctx,
      res,
      status: 200
    })
  }
}