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
    // else if (!phonePattern.test(phone)) {
    //   this.setData({
    //     showError_phone: true,
    //     errorMessage_phone: "请输入正确的用户名"
    //   });
    //   return false;
    // } 
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

  confirm(){
    if(this.checkPhone() && this.checkPassword() && this.checkConfirmPassword()){
      let data = {
        phone: this.data.phone,
        password: this.data.password
      };
      request({
        url: "/user/findPwd",
        method: "POST",
        data: data
      }).then(res => {
        console.log(res);
        if(res.code !== "0"){
          Toast(res.msg);
        }
        else{
          Toast("重置密码成功");
          wx.navigateBack({
            url: '../index/index',
          })
        }
      })
    }
  }
})