import {
  request
} from "../../request/index";
const app = getApp();
Page({
  data: {
    // 当前路线信息
    curRoute: wx.getStorageSync('currentRoute'),

    // 当前路线的人数
    memberNumber: 0,

    // 已经提交了的人物贴
    peopleSubmitted: [],

    // 已经提交了人物贴的队员
    memberSubmitted: [],

    // 未提交人物贴的队员
    memberNotSubmitted: [],

    // 下载链接是否显示
    isLinkShow: false,

    // 下载链接
    downloadLink: ""
  },
  async onShow() {
    // 初始化数据
    this.setData({
      curRoute: wx.getStorageSync('currentRoute'),
      memberNumber: 0,
      peopleSubmitted: [],
      memberSubmitted: [],
      memberNotSubmitted: [],
      isLinkShow: false,
      downloadLink: ""
    })

    // 获取当前路线的人数
    this.setData({
      memberNumber: app.countMember(this.data.curRoute.member)
    })

    // 获取已经提交了的人物贴
    const res = await request({
      url: '/people/memberHasSubmitted',
      method: 'POST',
      data: this.data.curRoute
    });
    console.log(res);
    this.setData({
      peopleSubmitted: res.data
    })

    // 拼两个串，已经提交人物贴的uid串，未提交人物贴的uid串
    let memberSubmittedStr = "",
      memberNotSubmittedStr = "";
    // 先获取已经提交人物贴的uid串
    this.data.peopleSubmitted.forEach((ms) => {
      memberSubmittedStr += ms.memberId + ",";
    })
    memberSubmittedStr = memberSubmittedStr.slice(0, -1);
    // 再获取没有提交人物贴的uid串
    memberNotSubmittedStr = app.removeFirstFromSecond(this.data.curRoute.member, memberSubmittedStr);

    // 根据两个uid串分别获取名单
    const res1 = await request({
      url: '/user/getByString',
      method: 'GET',
      data: {
        team: memberSubmittedStr
      }
    });
    const res2 = await request({
      url: '/user/getByString',
      method: 'GET',
      data: {
        team: memberNotSubmittedStr
      }
    });
    this.setData({
      memberSubmitted: res1.data,
      memberNotSubmitted: res2.data
    })
  },
  export () {
    let info = "";
    if (this.data.memberNumber - this.data.peopleSubmitted.length === 0) {
      info = "所有队员均已提交人物贴，是否打包导出"
    } else {
      info = "还剩" + (this.data.memberNumber - this.data.peopleSubmitted.length) + "个队员未提交人物贴，是否打包导出"
    }
    let that = this;
    wx.showModal({
      title: "打包导出",
      content: info,
      confirmColor: "#CFAFF9",
      success(res) {
        if (res.confirm) {
          request({
            url: '/people/export',
            method: 'POST',
            data: that.data.curRoute
          }).then(res => {
            console.log(res);
            that.setData({
              isLinkShow: true,
              downloadLink: res.data
            })
            console.log(that.data.downloadLink)
          })
        }
      }
    })
  }
});