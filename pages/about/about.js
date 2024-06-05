import { request } from "../../request/index";
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    user: null,
    activeNames: ["whatsup"]
  },
  onShow(){
    // 一定要使用setData，否则无法触发页面重新渲染
    this.setData({
      user: wx.getStorageSync('currentUser'),
    });
  },
  onChange(event){
    this.setData({
      activeNames: event.detail,
    })
  },
  updatePersonalInfo(){
    wx.navigateTo({
      url: '../updatePersonalInfo/updatePersonalInfo',
    })
  },
  searchLevelup(){
    wx.navigateTo({
      url: '../searchLevelup/searchLevelup',
    })
  },
  applyForLevelup(){
    const user = this.data.user;
    wx.showModal({
      title: "升级请求",
      content: "是否请求升级为领队账号",
      confirmColor: "#CFAFF9",
      success(res){
        if(res.confirm){
          request({
            url: "/user/applyForLevelup",
            method: "POST",
            data: user
          }).then(res => {
            if(res.code === "0"){
              Toast("申请成功，请重新登录");
              wx.setStorageSync('currentUser', res.data);
              wx.navigateBack({
                url: '../index/index',
              })
            }
          })
        }
      }
    })
  },
  searchPwd(){
    wx.navigateTo({
      url: '../searchPwd/searchPwd',
    })
  },
  logout(){
    wx.showModal({
      title: "退出登录",
      content: "是否要退出登录",
      confirmColor: "#CFAFF9",
      success(res){
        if(res.confirm){
          wx.reLaunch({
            url: '../index/index',
          })
        }
      }
    })
  }
})