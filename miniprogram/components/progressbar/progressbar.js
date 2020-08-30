let movableAreaWidth = 0;
let movableViewWidth = 0;
let currentSec = 0
let duration = 0
let isMoving= false
const backgroundAudioManager = wx.getBackgroundAudioManager()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: "00:00",
      totalTime: "00:00"
    },
    progress: 0,
    movableDis: 0
  },
  /**
   * 组件定义周期函数
   * **/
  lifetimes: {
    ready() {
      if(this.properties.isSame && this.data.showTime.totalTime =='00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 获取进度条元素宽度
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },

    // 绑定相关事件
    _bindBGMEvent() {
      // 歌曲初始化完成
      backgroundAudioManager.onCanplay(() => {
          // 获取音乐总时长
          if (typeof backgroundAudioManager.duration != 'undefined') {
            this._setTime()
          } else {
            setTimeout(() => this._setTime(), 1000)
          }
        }),
        // 歌曲播放时触发，当前播放时间, 进度监听
        backgroundAudioManager.onTimeUpdate(() => {
          if(isMoving) return;
          // 当前已经播放的时间 单位秒
          const currentTime = backgroundAudioManager.currentTime;
          // 总时长 单位秒
          const duration = backgroundAudioManager.duration
          // 1秒只执行一次
          let sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            // 格式化当前时间格式
            const {
              min,
              sec
            } = this._dateFormat(currentTime)

            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${min}:${sec}`
            })
          }
          currentSec = sec
          // 联动歌词，传递时间
          this.triggerEvent('timeupdate',{currentTime})

        }),
        // 播放结束事件
        backgroundAudioManager.onEnded(()=>{
          // 告诉父级播放下一首
          this.triggerEvent('musicEnd')
        }),
        // 正在播放
        backgroundAudioManager.onPlay(()=>{
          // 结局滑动进度条后会再次执行onChange事件的情况
          isMoving= false
          this.triggerEvent('triggermusicstate',{state:true})
        })
        // 播放结束，同相关页面状态改变
        backgroundAudioManager.onPause(()=>{
          this.triggerEvent('triggermusicstate',{state: false})
        })
    },
    // 设置时长
    _setTime() {
      // 秒为单位
      duration = backgroundAudioManager.duration
      const {
        min,
        sec
      } = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${min}:${sec}`
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      const min = Math.floor(sec / 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(Math.floor(sec % 60))
      }
    },
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    },


    // onChange滑动事件
    onChange(event) {
      // 拖动
      if (event.detail.source == 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
        // console.log('change', isMoving)
      }
    },
    // 滑动结束
    onTouchEnd() {
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    }
  }
})