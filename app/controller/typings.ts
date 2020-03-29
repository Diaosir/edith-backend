import { Controller } from 'egg';
export default class TypingController extends Controller {
  async index() {
    const ctx = this.ctx;
    const res = await this.ctx.service.package.combinations([]);
    // 设置响应体和状态码
    ctx.helper.success({
      ctx,
      res,
      status: 200
    })
  }
}