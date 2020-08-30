let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    // 登录组件是否显示
    loginShow: false,
    // 底部弹出层是否显示
    modalShow: false,
    content: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getcontent(event) {
      console.log(event)
      let content = event.detail.value
      this.setData({
        content
      })
    },
    // 判断用户是否授权
    onComment() {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            // 授权获取个人信息
            wx.getUserInfo({
              success: res => {
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow: true
                })
              }
            })
          } else {
            // 授权
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },
    // 授权回调
    loginhandel(data) {
      this.setData({
        loginShow: false
      })
      if (data.detail.userinfo) {
        userInfo = data.detail.userinfo
        this.setData({
          modalShow: true
        })
      } else {
        wx.showModal({
          title: '授权用户才能评论',
          content: ' '
        })
      }
    },
    onSend(event) {
      // 插入数据
      // 推送模板消息

      // let content = event.detail.value.content
      let content = this.data.content
      const {
        avatarUrl,
        nickName
      } = userInfo


      if (content.trim() == "") {
        wx.showModal({
          title: '评论内容不能为空',
          content: ''
        })
        return
      }



      wx.requestSubscribeMessage({
        name: 'sendMessage',
        tmplIds: ['g1k4HnbX3LfmwDG_7ST91mfjFnwkcG1KyX5C0oRUf5o'],
        data: {
          content,
          nickName,
          createTime: db.serverDate(),
          blogId: this.properties.blogId
        },
        success(res) {
          console.log(res)
        },
        fail(err) {
          console.log('err:', err)
        },
        complete(data) {
          console.log('complete:', data)
        }
      })




      wx.showLoading({
        title: '评价中',
        mask: true
      })

      db.collection('blog-comment').add({
        data: {
          id: this.properties.blogId,
          content,
          createTime: db.serverDate(),
          avatarUrl,
          nickName
        }
      }).then(res => {
        wx.hideLoading()
        this.setData({
          modalShow: false
        })
        wx.showToast({
          title: '评论成功',
        })

        // 推送
        // wx.cloud.callFunction({
        //   name: 'sendMessage',
        //   data: {
        //     content,
        //     formId,
        //     nickName,
        //     createTime: db.serverDate(),
        //     blogId: this.properties.blogId
        //   }
        // }).then((res) => {
        //   console.log(res)
        // })


        // 父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
      })
    }
  }
})