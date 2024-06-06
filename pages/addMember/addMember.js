import { request } from "../../request/index";

const app = getApp();

Page({
  data: {
    phone: "",
    realName: "",
    nickName: "",
    gender: "全部",
    dataList: [],

    searchType: 0
  },
  onShow(){
    this.setData({
      searchType: app.globalData.searchType
    });
    request({
      url: "/user/getUser",
      method: "GET",
      data: {
        phone: "",
        realName: "",
        nickName: "",
        gender: "全部"
      }
    }).then(res => {
      console.log(res);
      this.setData({
        dataList: res.data,
      })
    })
  },
  getUser(){
    request({
      url: "/user/getUser",
      method: "GET",
      data: {
        phone: this.data.phone,
        realName: this.data.realName,
        nickName: this.data.nickName,
        gender: this.data.gender
      }
    }).then(res => {
      console.log(res);
      this.setData({
        dataList: res.data,
      })
    })
  },
  addMember(event){
    const item = event.currentTarget.dataset.item;
    if(item.uid === 1){
      wx.showToast({
        title: '超管不走线',
        icon: 'error'
      })
      return;
    }
    if(app.globalData.searchType === 1){ 
      let t = wx.getStorageSync('currentRouteLeader');
      for(let i = 0; i < t.length; i++){
        if(item.uid === t[i].uid){
          wx.showToast({
            title: 'ta已被列为领队',
            icon: 'error'
          })
          return;
        }
      }
      t.push(item)
      wx.setStorageSync('currentRouteLeader', t)
      console.log(wx.getStorageSync('currentRouteLeader'))
      wx.navigateBack({
        url: '../createRoute/createRoute',
      })
    }
    else {
      let t = wx.getStorageSync('currentRouteMember');
      for(let i = 0; i < t.length; i++){
        if(item.uid === t[i].uid){
          wx.showToast({
            title: 'ta已被列为队员',
            icon: 'error'
          })
          return;
        }
      }
      t.push(item)
      wx.setStorageSync('currentRouteMember', t)
      console.log(wx.getStorageSync('currentRouteMember'))
      wx.navigateBack({
        url: '../manageTeam/manageTeam',
      })
    }
  }
})