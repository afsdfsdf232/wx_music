Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // properties -> props 传递的值
    playlist: {
      type: Object
    }
  },
  // 数据监听器
  observers: {
    // playlist(val){
    // }
    // 监听对象中某个属性的变化
    ['playlist.playCount'](count) {
      this.setData({
        count: this._tranNumber(count, 2)
      })

    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    // 组件内部需要值
    count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _tranNumber(num, poit) {
      let numStr = num.toString().split('.')[0]
      if (numStr.length < 6) {
        return numStr
      } else if (numStr.length >= 6 && numStr.length <= 8) {
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + poit);
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
      } else if (numStr.length > 8) {
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + poit);
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿';
      }

    },
    goDetail() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?id=${this.properties.playlist.id}`,
      })
    }
  }
})