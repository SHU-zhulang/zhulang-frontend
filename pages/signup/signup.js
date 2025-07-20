import { request } from "../../request/index";
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    phone: "",
    showError_phone: false,
    errorMessage_phone: "",

    password: "",
    showError_password: false,
    errorMessage_password: "",
    
    confirmPassword: "",
		showError_confirmPassword: false,
    errorMessage_confirmPassword: "",
    
    realName: "",
		showError_realName: false,
    errorMessage_realName: "",
    
    nickName: "",
		showError_nickName: false,
    errorMessage_nickName: "",
    
    gender: "",
    errorMessage_gender: "请选择性别",

    whatsup: "",
    totalWords: 0,
    autoSaveTimer: null,
    isUpdated: false
  },
  checkPhone() {
    const phone = this.data.phone;
    const phonePattern = /^1[3456789]\d{9}$/;
    if(this.data.phone === ""){
      this.setData({
        showError_phone: true,
        errorMessage_phone: "用户名不能为空"
      })
      return false;
    }
    else if (!phonePattern.test(phone)) {
      this.setData({
        showError_phone: true,
        errorMessage_phone: "请以手机号的形式指定用户名"
      });
      return false;
    } 
    else {
      this.setData({
        showError_phone: false,
        errorMessage_phone: ""
      });
      return true;
    }
  },
  checkPassword(){
    this.checkConfirmPassword();
    if(this.data.password === ""){
      this.setData({
        showError_password: true,
        errorMessage_password: "密码不能为空"
      })
      return false;
    }
    // 禁止苹果系统自动生成的密码格式：6-6-6，每段6位，数字或大小写字母不限
    const applePasswordPattern = /^[A-Za-z0-9]{6}-[A-Za-z0-9]{6}-[A-Za-z0-9]{6}$/;
    if(applePasswordPattern.test(this.data.password)){
      this.setData({
        showError_password: true,
        errorMessage_password: "不要使用苹果系统自动生成的密码，请退出该页面重试"
      })
      return false;
    }
    else{
      this.setData({
        showError_password: false,
        errorMessage_password: ""
      })
      return true;
    }
  },
  checkConfirmPassword(){
    if(this.data.confirmPassword === ""){
      this.setData({
        showError_confirmPassword: true,
        errorMessage_confirmPassword: "确认密码不能为空"
      })
      return false;
    }
    else if(this.data.password !== this.data.confirmPassword){
      this.setData({
        showError_confirmPassword: true,
        errorMessage_confirmPassword: "两次密码输入不一致"
      })
      return false;
    }
    else{
      this.setData({
        showError_confirmPassword: false,
        errorMessage_confirmPassword: ""
      })
      return true;
    }
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
    if(this.checkPhone() && this.checkPassword() && this.checkConfirmPassword() && this.checkRealName() && this.checkNickName() && this.checkGender()){
      this.performSignup();
    }
  },
  
  performSignup(){
    let data = {
      phone: this.data.phone,
      password: this.data.password,
      realName: this.data.realName,
      nickName: this.data.nickName,
      gender: this.data.gender,
      whatsup: this.data.whatsup.trim()
    };
    request({
      url: "/user/signup",
      method: "POST",
      data: data
    }).then(res => {
      console.log(res);
      if(res.code !== "0"){
        Toast(res.msg);
      }
      else{
        Toast("注册成功");
        setTimeout(() => {
          wx.navigateBack({
            url: '../index/index',
          });
        }, 2000);
      }
    })
  }
})