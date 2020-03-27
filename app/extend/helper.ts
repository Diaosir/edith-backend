const moment = require('moment')

// 格式化时间的扩展
exports.formatTime = time => moment(time).format('YYYY-MM-DD HH:mm:ss')

// 格式化成功response的扩展
exports.success = ({ ctx, res = null, status })=> {
  ctx.body = res
  ctx.status = status
}
