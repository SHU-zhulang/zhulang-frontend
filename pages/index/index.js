import {request} from "../../request/index"
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    phone: '',
    password: '',
    showError: false,
    errorMessage: '',
    showError2: false,
    errorMessage2: ''
  },
  checkPhone() {
    const phone = this.data.phone;
    const phonePattern = /^1[3456789]\d{9}$/;
    if(this.data.phone === ""){
      this.setData({
        showError: true,
        errorMessage: "用户名不能为空"
      })
      return false;
    }
    // else if (!phonePattern.test(phone)) {
    //   this.setData({
    //     showError: true,
    //     errorMessage: "请输入正确的用户名"
    //   });
    //   return false;
    // } 
    else {
      this.setData({
        showError: false,
        errorMessage: ""
      });
      return true;
    }
  },
  checkPassword(){
    if(this.data.password === ""){
      this.setData({
        showError2: true,
        errorMessage2: "密码不能为空"
      })
      return false;
    }
    else{
      this.setData({
        showError2: false,
        errorMessage2: ""
      })
      return true;
    }
  },
  login(){
    if(this.checkPhone() && this.checkPassword()){
      let data = {
        phone: this.data.phone,
        password: this.data.password
      }
      request({
        url: "/user/login",
        method: "POST",
        data: data
      }).then(res => {
        console.log(res);
        if(res.code !== "0"){
          Toast(res.msg);
        }
        else{
          wx.setStorageSync('currentUser', res.data);
          Toast("登录成功");
          wx.switchTab({
            url: '../myRoute/myRoute',
          })
        }
      })
    }
  },
  signup(){
    wx.navigateTo({
      url: '../signup/signup',
    })
  },
  findPwd(){
    wx.navigateTo({
      url: '../findPwd/findPwd',
    })
  },
  onShareAppMessage: function () {
    return {
      title: '上大逐浪小助手'
    }
  },
  onShareTimeline: function () {
    return {
      title: '上大逐浪小助手'
    }
  }
})
