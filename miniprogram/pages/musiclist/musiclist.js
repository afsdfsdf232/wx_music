
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musiclist: [],
    listInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   wx.showLoading({
     title: '加载中',
   })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        id: options.id,
        $url: 'musiclist'
      }
    }).then(res => {
      console.log('res-data:',res)
      if (res.result.code == 200) {
        const pl = res.result.playlist
        this.setData({
          musiclist: pl.tracks,
          listInfo: {
            coverImgUrl: pl.coverImgUrl,
            name: pl.name
          }
        })
      }
      this._setMusiclist()
      wx.hideLoading()
    })
  },
  _setMusiclist(){
   wx.setStorageSync('musiclist', this.data.musiclist)
  }
})
