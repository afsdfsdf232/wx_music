let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,
    blogList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()
  },
  // 获取博客列表
  _loadBlogList() {
    wx.showLoading({
      title: '拼命加载中',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'list',
        keyword,
        start: this.data.blogList.length,
        count: 15
      }
    }).then(res => {
      console.log('res:', res)
      this.setData({
        blogList: [...this.data.blogList, ...res.result]
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 发布
  onPublish() {
    // 判断用户是否授权信息
    wx.getSetting({
      success: res => {
        // 授权过
        if (res.authSetting['scope.userInfo']) {
          // 获取用户信息
          wx.getUserInfo({
            success: res => {
              const {
                nickName,
                avatarUrl
              } = res.userInfo
              wx.navigateTo({
                url: '../blogedit/blogedit?nickName=' + nickName + '&avatarUrl=' + avatarUrl,
              })
            }
          })

        } else {
          // 去授权
          this.setData({
            modalShow: true
          })
        }
      }
    })

  },
  // 获取用户信息状态
  loginHandel(data) {
    if (data.detail.userinfo) {
      const {
        nickName,
        avatarUrl
      } = data.detail.userinfo
      wx.navigateTo({
        url: '../blogedit/blogedit?nickName=' + nickName + '&avatarUrl=' + avatarUrl,
      })
    } else {
      wx.showModal({
        title: "授权用户才可发布",
        content: ''
      })
    }
  },

  onSearch(event) {
    this.setData({
      blogList: []
    })
    keyword = event.detail.keyword
    this._loadBlogList()
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
    this.setData({
      blogList: []
    })
    this._loadBlogList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList()
  },
  goComment(e) {
    wx.navigateTo({

      url: './../blogcomment/blogcomment?id=' + e.target.dataset.blogid,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    return {
      title: "个人博客",
      path: `/pages/blog/blog`,
      
    }
  }
  
})