import { Controller } from 'egg';
export default class ProjectController extends Controller {
  async index() {
    const ctx = this.ctx;
    const res = {}
    // 设置响应体和状态码
    const data = await ctx.service.filesystem.getFileList('test');

    ctx.helper.success({
      ctx,
      data,
      status: 200
    })
  }
  async show() {
    const ctx = this.ctx;
    const { id } = this.ctx.params
    // 设置响应体和状态码
    const data = await ctx.service.filesystem.getFileList(id);
    ctx.helper.success({
      ctx,
      res: data,
      msg: '请求成功',
      status: 200
    })
  }
}