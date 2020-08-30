// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()
  const result = await cloud.openapi.subscribeMessage.send({
    touser: OPENID,
    page: `/pages/blogcomment/blogcomment?id=${event.id}`,
    data: {
      thing1: {
        value: event.nickName
      },
      time2: {
        value: event.createTime
      },
      thing3: {
        value: event.content
      },
      templateId: 'g1k4HnbX3LfmwDG_7ST91mfjFnwkcG1KyX5C0oRUf5o',
      // formId: event.formId
    }
  })
  return result
}