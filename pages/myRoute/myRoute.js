import { request } from "../../request/index";

Page({
  data: {
    dataList: [],
    user: null
  },
  onShow(){
    this.setData({
      user: wx.getStorageSync('currentUser'),
    });
    request({
      url: "/route/myRoute",
      method: "GET",
      data: {
        uid: wx.getStorageSync('currentUser').uid
      }
    }).then(res => {
      console.log(res);
      this.setData({
        dataList: res.data,
      })
    })
  },
  myMaster(event){
    const item = event.currentTarget.dataset.item;
    request({
      url: '/task/myMaster',
      method: 'GET',
      data: {
        uid: this.data.user.uid,
        routeId: item.id
      }
    }).then(res => {
      console.log(res);
      wx.showModal({
        title: '天使与主人',
        content: "你的主人是" + res.data.realName + "(" + res.data.nickName + ")",
        confirmColor: "#CFAFF9",
      })
    })
  },
  manageRoute(){
    wx.navigateTo({
      url: '../manageRoute/manageRoute',
    })
  },
  writePeople(event){
    const item = event.currentTarget.dataset.item;
    wx.setStorageSync('currentRoute', item);
    wx.navigateTo({
      url: '../writePeople/writePeople',
    })
  }
})