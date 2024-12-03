import { request } from "../../request/index";
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    realName: "",
		showError_realName: false,
    errorMessage_realName: "",
    
    nickName: "",
		showError_nickName: false,
    errorMessage_nickName: "",

    gender: "",
    errorMessage_gender: "请选择性别",

    whatsup: ""
  },
  onLoad() {
    // 一定要使用setData，否则无法触发页面重新渲染
    this.setData({
      realName: wx.getStorageSync('currentUser').realName,
      nickName: wx.getStorageSync('currentUser').nickName,
      gender: wx.getStorageSync('currentUser').gender,
      whatsup: wx.getStorageSync('currentUser').whatsup
    })
  },
  checkRealName(){
    if(this.data.realName === ""){
      this.setData({
        showError_realName: true,
        errorMessage_realName: "你的真名不能为空"
      })
      return false;
    }
    else{
      this.setData({
        showError_realName: false,
        errorMessage_realName: ""
      })
      return true;
    }
  },
  checkNickName(){
    if(this.data.nickName === ""){
      this.setData({
        showError_nickName: true,
        errorMessage_nickName: "你的花名不能为空"
      })
      return false;
    }
    else{
      this.setData({
        showError_nickName: false,
        errorMessage_nickName: ""
      })
      return true;
    }
  },
  checkGender(){
    if(this.data.gender === ""){
      wx.showToast({
        title: this.data.errorMessage_gender,
        icon: "error"
      })
      return false;
    }
    else{
      return true;
    }
  },
  confirm(){
    if(this.checkRealName() && this.checkNickName() && this.checkGender()){
      let data = {
        phone: wx.getStorageSync('currentUser').phone,
        realName: this.data.realName,
        nickName: this.data.nickName,
        gender: this.data.gender,
        whatsup: this.data.whatsup.trim()
      };
      request({
        url: "/user/update",
        method: "POST",
        data: data
      }).then(res => {
        console.log(res);
        Toast("修改成功");
        wx.setStorageSync('currentUser', res.data)
        wx.switchTab({
          url: '../about/about',
        })
      })
    }
  }
})