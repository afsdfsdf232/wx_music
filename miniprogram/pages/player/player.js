// 歌曲列表
let musiclist = []
// 正在播放歌曲的index
let nowPlayingIndex = -1
// 获取全局唯一的背景音乐管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, //当前播放状态
    isLyricShow: false,
    lyric: "",
    isSame: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {
      index,
      id
    } = options
    nowPlayingIndex = index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(id)
  },
  togglePlaying() {
    const isPlaying = this.data.isPlaying;
    isPlaying ? backgroundAudioManager.pause() : backgroundAudioManager.play();
    this.setData({
      isPlaying: !isPlaying
    })
  },
  triggermusicstate(data) {
    this.setData({
      isPlaying: data.detail.state
    })
  },
  async _loadMusicDetail(id) {
    let isSame= id == app.getPlayMusicId()
    // 先停止上一首，再加载下一首
    if(!isSame){
      backgroundAudioManager.stop();
    }
    
    wx.showLoading({
      title: '加载中',
    })
    let music = musiclist[nowPlayingIndex];
    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl,
      isSame: id == app.getPlayMusicId()
    })
    //  获取音乐的url
    const data = await wx.cloud.callFunction({
      name: 'music',
      data: {
        id,
        $url: "musicurl"
      }
    })
    if (data.result.code == 200) {
      // 音乐地址
      if(!isSame){
        backgroundAudioManager.src = data.result.data[0].url
      }
      
      // 音乐标题
      backgroundAudioManager.title = music.name
      // 音乐图片
      backgroundAudioManager.coverImgUrl = music.al.picUrl
      // 歌手信息
      backgroundAudioManager.singer = music.ar[0].name
      // 专辑名
      backgroundAudioManager.epname = music.al.name
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
      // 保存播放历史
      this.savePlayHistory()
    }
    // 获取歌词

    const lyric_data = await wx.cloud.callFunction({
      name: 'music',
      data: {
        id,
        $url: "lyric"
      }
    })
    let lyric = "暂无歌词"
    if (lyric_data.result.code == 200 && lyric_data.result.lrc && lyric_data.result.lrc.lyric) {
      console.log('歌词:', lyric_data)
      lyric = lyric_data.result.lrc.lyric
    }
    this.setData({
      lyric
    })
    app.setPlayMusicId(id)

  },

  onChangeLyricShow() {
    // 歌词封面切换
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  // 上一首
  onPrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 下一首
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  timeupdate(e) {
    // 选择组件传递时间
    this.selectComponent('.lyric').update(e.detail.currentTime)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
    // 保存播放历史
    savePlayHistory() {
      //  当前正在播放的歌曲
      const music = musiclist[nowPlayingIndex]
      const openid = app.globalData.openid
      const history = wx.getStorageSync(openid)
      let bHave = false
      for (let i = 0, len = history.length; i < len; i++) {
        if (history[i].id == music.id) {
          bHave = true
          break
        }
      }
      if (!bHave) {
        history.unshift(music)
        wx.setStorage({
          key: openid,
          data: history,
        })
      }
    },
})