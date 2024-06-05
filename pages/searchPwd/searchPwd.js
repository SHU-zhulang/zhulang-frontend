import { request } from "../../request/index";

Page({
  data: {
    phone: "",
    showError_phone: false,
    errorMessage_phone: "",
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
        email: "",
        whatsup: ""
      };
      request({
        url: "/user/searchPwd",
        method: "POST",
        data: data
      }).then(res => {
        wx.showModal({
          title: "密码查询",
          content: this.data.phone + "的密码是" + res.data.password,
          confirmColor: "#CFAFF9",
        })
      })
    }
  }
})