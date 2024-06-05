import { request } from "../../request/index";
const app = getApp();

Page({
  data: {
    leaderList: [],

    name: "",
    showError_name: false,
    errorMessage_name: "",
  },
  onShow(){
    if(wx.getStorageSync('currentRouteLeader') === ""){
      wx.setStorageSync('currentRouteLeader', [wx.getStorageSync('currentUser')]);
    }
    this.setData({
      name: wx.getStorageSync('currentRouteName'),
      leaderList: wx.getStorageSync('currentRouteLeader')
    })
  },
  addLeader(){
    wx.setStorageSync('currentRouteName', this.data.name);
    app.globalData.searchType = 1;
    wx.navigateTo({
      url: '../addMember/addMember',
    })
  },
  checkName(){
    if(this.data.name === ""){
      this.setData({
        showError_name: true,
        errorMessage_name: "线路名称不能为空"
      })
      return false;
    }
    else{
      this.setData({
        showError_name: false,
        errorMessage_name: ""
      })
      return true;
    }
  },
  confirm(){
    if(this.checkName()){
      let leaderEntity = wx.getStorageSync('currentRouteLeader');
      let leader = leaderEntity[0].uid;
      for(let i = 1; i < leaderEntity.length; i++){
        leader = leader + "," + leaderEntity[i].uid;
      }
      request({
        url: "/route/create",
        method: "POST",
        data: {
          name: this.data.name,
          leader: leader,
          member: leader,
          allocated: 0
        }
      }).then(res => {
        console.log(res)
        wx.removeStorageSync('currentRouteName');
        wx.removeStorageSync('currentRouteLeader');
        if(res.code === "0"){
          wx.navigateBack({
            url: '../manageRoute/manageRoute',
          })
        }
      })
    }
  }
})