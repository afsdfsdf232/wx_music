// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const rp = require('request-promise')
const BASE_URL = 'http://huangpan.natapp1.cc'
// const BASE_URL='http://musicapi.leanapp.cn'
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  app.router('playlist', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc') //第二个参数为 desc  时表示倒叙
      .get()
      .then(res => res)
  })
  app.router('musiclist', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.id))
      .then(res => JSON.parse(res))

    console.log("ctx.body:", ctx.body)
  })

  app.router('musicurl', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + '/song/url?id=' + parseInt(event.id))
      .then(res => JSON.parse(res))
  })
  app.router('lyric', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + '/lyric?id=' + parseInt(event.id)).then(res => JSON.parse(res))
  })
  return app.serve()
}