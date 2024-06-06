import { request } from "../../request/index";

const app = getApp();

Page({
  data: {
    dataList: [],
  },
  onShow(){
    this.setData({
      dataList: wx.getStorageSync('currentRouteMember')
    })
  },
  deleteMember(event){
    const item = event.currentTarget.dataset.item;
    if(wx.getStorageSync('currentRouteLeader').some(leader => leader.uid === item.uid)){
      wx.showToast({
        title: '无法删除领队',
        icon: 'error'
      })
      return;
    }
    let filteredArr = this.data.dataList.filter(member => member.uid !== item.uid);
    wx.setStorageSync('currentRouteMember', filteredArr);
    wx.navigateBack({
      url: '../manageTeam/manageTeam',
    })
  }
})