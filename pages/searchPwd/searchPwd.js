import { request } from "../../request/index";
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    phone: "",
    showError_phone: false,
    errorMessage_phone: "",
    showResult: false,
    resultPassword: ""
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
  confirm(){
    if(this.checkPhone()){
      let data = {
        phone: this.data.phone,
        password: "",
        realName: "",
        nickName: "",
        gender: "",
        whatsup: ""
      };
      request({
        url: "/user/searchPwd",
        method: "POST",
        data: data
      }).then(res => {
        if(res.code === "0"){
          this.setData({
            showResult: true,
            resultPassword: res.data.password
          });
        }
        else{
          Toast(res.msg);
        }
      })
    }
  },
  copyPassword() {
    wx.setClipboardData({
      data: this.data.resultPassword,
      success: function() {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  }
})