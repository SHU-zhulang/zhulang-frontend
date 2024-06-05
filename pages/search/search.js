import { request } from "../../request/index";

Page({
  data: {
    phone: "",
    realName: "",
    nickName: "",
    gender: "全部",
    dataList: []
  },
  onShow(){
    request({
      url: "/user/getUser",
      method: "GET",
      data: {
        phone: "",
        realName: "",
        nickName: "",
        gender: "全部"
      }
    }).then(res => {
      console.log(res);
      this.setData({
        dataList: res.data,
      })
    })
  },
  getUser(){
    request({
      url: "/user/getUser",
      method: "GET",
      data: {
        phone: this.data.phone,
        realName: this.data.realName,
        nickName: this.data.nickName,
        gender: this.data.gender
      }
    }).then(res => {
      console.log(res);
      this.setData({
        dataList: res.data,
      })
    })
  }
})