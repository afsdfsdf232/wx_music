let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String
  },
  lifetimes: {
    ready() {
      // 获取当前设备信息，将rpx转为px
      wx.getSystemInfo({
        success: res => {
          // 获取屏幕宽度 px单位 res.screenWidth
          // 求出1prx单位大小
          // 计算64rpx对应的px值
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },
  /** 
   * 组件的初始数据
   */
  observers: {
    lyric(lrc) {
      // 处理歌词
      if (lrc == '暂无歌词') {
        this.setData({
          lrcList: [{
            lrc,
            time: 0
          }],
          nowLyricIndex: -1
        })
        return
      }
      this._parseLyric(lrc)
    }
  },
  data: {
    lrcList: [],
    nowLyricIndex: 0,
    scrollTop: 0, //滚动到顶部的距离
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _parseLyric(lrc) {
      let _lrcList = []
      lrc.split('\n').map(elem => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time != null) {
          let llrc = elem.split(time)[1]
          // 得到分 秒 毫秒 的数组
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000;
          _lrcList.push({
            time: time2Seconds,
            lrc: llrc
          })
        }
      })

      this.setData({
        lrcList: _lrcList
      })
  
    },
    // 父组件定义的方法
    update(date) {
      let lrcList = this.data.lrcList;
      if (lrcList.length == 0) return;
      if (date > lrcList[lrcList.length - 1].time) {
        this.setData({
          nowLyricIndex: -1,
          scrollTop: lyricHeight * lrcList.length
        })
        return
      }
      for (let i = 0; i < lrcList.length; i++) {
        if (date.toString().split('.')[0] == lrcList[i].time.toString().split('.')[0]) {
          this.setData({
            nowLyricIndex: i ,
            scrollTop: lyricHeight * (i)
          })
          break
        }
      }
    }
  }
})