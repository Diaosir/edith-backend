const moment = require('moment')

// 格式化时间的扩展
exports.formatTime = time => moment(time).format('YYYY-MM-DD HH:mm:ss')

// 格式化成功response的扩展
exports.success = ({ ctx, res = null, status, message })=> {
  ctx.body = res
  ctx.body = {
    code: status,
    payload: res,
    message
  }
  ctx.status = status
}
exports.formatPackages = (str) => {
  str = str.replace(/\.json$/, '')
  return str.split('+');
}
exports.getRequireImportPath = (content) => {
  console.log(content)
}