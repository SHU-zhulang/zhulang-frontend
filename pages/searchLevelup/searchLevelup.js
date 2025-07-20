import { request } from "../../request/index";

Page({
  data: {
    dataList: []
  },
  onShow(){
    request({
      url: "/user/searchLevelup",
      method: "GET"
    }).then(res => {
      console.log(res);
      this.setData({
        dataList: res.data,
      })
    })
  },
  levelup(event){
    const item = event.currentTarget.dataset.item;
    wx.showModal({
      title: "升级请求",
      content: "是否批准" + item.realName + "的账号升级请求",
      confirmColor: "#0b9b8a",
      success(res){
        if(res.confirm){
          request({
            url: "/user/levelup",
            method: "POST",
            data: item
          }).then(res => {
            if(res.code === "0"){
              request({
                url: "/user/searchLevelup",
                method: "GET"
              }).then(res => {
                console.log(res);
                wx.switchTab({
                  url: '../about/about',
                })
              })
            }
          })
        }
      }
    })
  },
  refuseToLevelup(event){
    const item = event.currentTarget.dataset.item;
    wx.showModal({
      title: "升级请求",
      content: "是否拒绝" + item.realName + "的账号升级请求",
      confirmColor: "#0b9b8a",
      success(res){
        if(res.confirm){
          request({
            url: "/user/refuseToLevelup",
            method: "POST",
            data: item
          }).then(res => {
            if(res.code === "0"){
              request({
                url: "/user/searchLevelup",
                method: "GET"
              }).then(res => {
                console.log(res);
                wx.switchTab({
                  url: '../about/about',
                })
              })
            }
          })
        }
      }
    })
  }
})