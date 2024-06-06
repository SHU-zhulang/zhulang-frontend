import { request } from "../../request/index";
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    dataList: [],
  },
  onShow(){
    console.log(wx.getStorageSync('currentUser'))
    request({
      url: "/route/myLeadRoute",
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
  create(){
    if(wx.getStorageSync('currentRouteLeader') !== ""){
      wx.removeStorageSync('currentRouteLeader');
    }
    wx.navigateTo({
      url: '../createRoute/createRoute',
    })
  },
  createTask(event){
    const item = event.currentTarget.dataset.item;
    if(item.leader === item.member){
      wx.showModal({
        title: '创建天使与主人',
        content: '请添加队员后再创建',
      })
      return;
    }
    wx.showModal({
      title: "创建天使与主人",
      content: "创建时是否区分男女生",
      confirmText: "区分",
      cancelText: "不区分",
      confirmColor: "#CFAFF9",
      success(res){
        if(res.confirm){
          request({
            url: "/task/createByGender",
            method: "POST",
            data: item
          }).then(res => {
            if(res.code === "0"){
              wx.showToast({
                title: '创建成功',
              })
            }
            wx.switchTab({
              url: '../myRoute/myRoute',
            })
          })
        }
        else if(res.cancel){
          request({
            url: "/task/create",
            method: "POST",
            data: item
          }).then(res => {
            if(res.code === "0"){
              wx.showToast({
                title: '创建成功',
              })
            }
            wx.switchTab({
              url: '../myRoute/myRoute',
            })
          })
        }
      }
    })
  },
  deleteTask(event){
    const item = event.currentTarget.dataset.item;
    wx.showModal({
      title: "删除天使与主人",
      content: "是否删除本条线路的天使与主人分配",
      confirmColor: "#CFAFF9",
      success(res){
        if(res.confirm){
          request({
            url: "/task/delete",
            method: "DELETE",
            data: item
          }).then(res => {
            if(res.code === "0"){
              wx.showToast({
                title: '删除成功',
              })
            }
            wx.switchTab({
              url: '../myRoute/myRoute',
            })
          })
        }
      }
    })
  },
  manageTeam(event){
    if(wx.getStorageSync('currentRouteLeader') !== ""){
      wx.removeStorageSync('currentRouteLeader');
    }
    if(wx.getStorageSync('currentRouteMember') !== ""){
      wx.removeStorageSync('currentRouteMember');
    }
    const item = event.currentTarget.dataset.item;
    wx.setStorageSync('currentRoute', item)
    wx.navigateTo({
      url: '../manageTeam/manageTeam',
    })
  },
  deleteTeam(event){
    const item = event.currentTarget.dataset.item;
    wx.showModal({
      title: "删除队伍",
      content: "是否删除队伍" + item.name,
      confirmColor: "#CFAFF9",
      success(res){
        if(res.confirm){
          request({
            url: "/route/delete",
            method: "DELETE",
            data: item
          }).then(res => {
            console.log(res);
            request({
              url: "/task/delete",
              method: "DELETE",
              data: item
            }).then(res => {
              if(res.code === "0"){
                Toast("删除成功");
                wx.switchTab({
                  url: '../myRoute/myRoute',
                })
              }
            })
          })
        }
      }
    })
  }
})