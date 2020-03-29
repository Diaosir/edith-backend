import { Controller } from 'egg';
export default class ApiController extends Controller {
  async index() {
    const ctx = this.ctx;
    const { packages } = ctx.params;
    const res = await this.ctx.service.package.combinations(ctx.helper.formatPackages(packages))
    // 设置响应体和状态码
    ctx.helper.success({
      ctx,
      res,
      status: 200
    })
  }
}