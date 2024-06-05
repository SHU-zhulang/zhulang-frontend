import { request } from "../../request/index";
const app = getApp();
Page({
  data: {
    name: "",
    leaderList: [],
    memberList: [],
  },
  onShow(){
    this.setData({
      name: wx.getStorageSync('currentRoute').name
    });
    request({
      url: '/user/getByString',
      method: 'GET',
      data: {
        team: wx.getStorageSync('currentRoute').leader
      }
    }).then(res => {
      console.log(res);
      if(wx.getStorageSync('currentRouteLeader') === ""){
        wx.setStorageSync('currentRouteLeader', res.data);
      }
      this.setData({
        leaderList: wx.getStorageSync('currentRouteLeader')
      })
    })
    request({
      url: '/user/getByString',
      method: 'GET',
      data: {
        team: wx.getStorageSync('currentRoute').member
      }
    }).then(res => {
      console.log(res);
      if(wx.getStorageSync('currentRouteMember') === ""){
        wx.setStorageSync('currentRouteMember', res.data);
      }
      this.setData({
        memberList: wx.getStorageSync('currentRouteMember')
      })
    })
  },
  addMember(){
    app.globalData.searchType = 2;
    wx.navigateTo({
      url: '../addMember/addMember',
    })
  },
  confirm(){
    let leaderEntity = wx.getStorageSync('currentRouteLeader');
    let leader = leaderEntity[0].uid;
    for(let i = 1; i < leaderEntity.length; i++){
      leader = leader + "," + leaderEntity[i].uid;
    }
    let memberEntity = wx.getStorageSync('currentRouteMember');
    let member = memberEntity[0].uid;
    for(let i = 1; i < memberEntity.length; i++){
      member = member + "," + memberEntity[i].uid;
    }
    request({
      url: "/route/update",
      method: "POST",
      data: {
        id: wx.getStorageSync('currentRoute').id,
        name: this.data.name,
        leader: leader,
        member: member,
        allocated: 0
      }
    }).then(res => {
      console.log(res)
      request({
        url: "/task/delete",
        method: "DELETE",
        data: wx.getStorageSync('currentRoute')
      })
      wx.removeStorageSync('currentRoute');
      wx.removeStorageSync('currentRouteLeader');
      wx.removeStorageSync('currentRouteMember');
      if(res.code === "0"){
        wx.navigateBack({
          url: '../manageRoute/manageRoute',
        })
      }
    })
  }
})