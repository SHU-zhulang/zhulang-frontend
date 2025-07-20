import {
  request
} from "../../request/index";
import Toast from '@vant/weapp/toast/toast';
const app = getApp();
Page({
  data: {
    // 当前路线信息
    curRoute: wx.getStorageSync('currentRoute'),

    // 当前用户信息
    curUser: wx.getStorageSync('currentUser'),

    // 当前用户的照片url
    curUrl: "",

    // 当前路线的所有队员
    allMember: [],

    // 想要使用的名字
    nickName: "",

    // 想对自己说的话
    self: "",

    // 是否做出了更新
    isUpdated: false,

    // 当前总字数
    totalWords: 0,

    // 自动计时器对象
    autoSaveTimer: null,

    // 是否上传过头图
    headImageUploaded: false
  },

  async onShow() {
    // 因为每次提交完图片再进来都会走一次onShow，会把上次填写的内容刷没，所以如果内容做过更新，就不再走onShow
    if(this.data.isUpdated){
      return;
    }
    // 初始化数据
    this.setData({
      curRoute: wx.getStorageSync('currentRoute'),
      curUser: wx.getStorageSync('currentUser'),
      curUrl: "",
      allMember: [],
      nickName: "",
      self: ""
    })
    // 获取当前路线的所有队员
    const am = await request({
      url: '/user/getByString',
      method: 'GET',
      data: {
        team: this.data.curRoute.member
      }
    });

    // 获取当前用户的人物贴，可能为空
    const curPeople = await request({
      url: '/people/myPeople',
      method: 'GET',
      data: {
        routeId: this.data.curRoute.id,
        memberId: this.data.curUser.uid,
      }
    })

    // 初始化当前用户的人物贴
    if (curPeople.data.length === 0) {
      // 为空，这个用户还没有写过人物贴，全部赋值为空串
      am.data.forEach(m => {
        m["people"] = "";
      })
    } else {
      // 这个用户已经写过人物贴了，需要把数据库里People表里的内容拿下来处理
      const content = JSON.parse(curPeople.data[0].content);
      am.data.forEach(m => {
        m["people"] = content.find(p => p.uid === m.uid)?.people || ""
      });
      this.setData({
        curUrl: curPeople.data[0].photo,
        nickName: curPeople.data[0].nickName,
        self: curPeople.data[0].self,
        headImageUploaded: !!curPeople.data[0].photo // 只要有图片就表示已有头图
      })
    }
    this.setData({
      allMember: am.data
    })
    // 更新当前的总字数
    this.updateTotalWords();
    // 启动30秒自动保存
    this.startAutoSave();
  },
  onHide() {
    // 页面隐藏时自动保存
    if (this.data.isUpdated) {
      this.autoSave();
    }
    // 清除定时器
    this.clearAutoSave();
  },
  onUnload() {
    // 页面卸载时自动保存
    if (this.data.isUpdated) {
      this.autoSave();
    }
    // 清除定时器
    this.clearAutoSave();
  },
  startAutoSave() {
    // 清除之前的定时器
    this.clearAutoSave();
    // 启动30秒自动保存
    this.data.autoSaveTimer = setInterval(() => {
      if (this.data.isUpdated) {
        this.autoSave();
      }
    }, 30000); // 30秒
  },
  clearAutoSave() {
    if (this.data.autoSaveTimer) {
      clearInterval(this.data.autoSaveTimer);
      this.data.autoSaveTimer = null;
    }
  },

  // 上传照片按钮点击事件
  uploadImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.uploadFile({
          filePath: res.tempFilePaths[0],
          name: "photo",
          url: app.globalData.baseUrl + '/people/photo',
          formData: {
            uid: this.data.curUser.uid
          },
          success: (uploadRes) => {
            const url = JSON.parse(uploadRes.data).data;
            this.setData({
              curUrl: url,
              headImageUploaded: true,
              isUpdated: true
            });
          }
        })
      }
    })
  },

  // 微信小程序不支持复杂双向绑定，需要增加函数监听输入框的值变化
  onInput(event) {
    const index = event.currentTarget.dataset.index; // 获取输入框的索引
    const value = event.detail; // 获取输入框的值
    const curChange = this.data.allMember; // 获取未更新前的allMember

    // 更新 allMember 中对应成员的 people 字段
    curChange[index].people = value;

    // 更新数据
    this.setData({
      allMember: curChange
    });

    // 人物贴已更新
    this.data.isUpdated = true
    this.updateTotalWords();
  },

  onInput2(event){
    // 人物贴已更新
    this.data.isUpdated = true
    this.updateTotalWords();
  },

  // 统计当前总字数
  updateTotalWords() {
    let total = 0;
    // 统计self和nickName
    total += (this.data.self ? this.data.self.length : 0);
    total += (this.data.nickName ? this.data.nickName.length : 0);
    // 统计allMember[*].people
    if (this.data.allMember && this.data.allMember.length > 0) {
      this.data.allMember.forEach(m => {
        if (m.people) total += m.people.length;
      });
    }
    this.setData({ totalWords: total });
  },

  // 手动保存
  async save() {
    if (!this.data.curUrl) {
      Toast('请上传照片哦');
      return;
    }
    if(this.data.nickName === ""){
      Toast('请填写你的名字哦');
      return;
    }
    this.handleSave();
    this.clearAutoSave();
    setTimeout(() => {
      wx.navigateBack({
        url: '../myRoute/myRoute',
      });
    }, 1000);
  },

  // 自动保存
  async autoSave() {
    if (!this.data.curUrl || this.data.nickName === "") {
      return; // 必填项未完成时不保存
    }
    this.handleSave();
  },

  // 执行保存操作
  async handleSave() {
    // 形成content内容
    const curChange = this.data.allMember;
    // 解构赋值
    const content = curChange.map(({
      uid,
      people
    }) => ({
      uid,
      people
    }));
    // 构建content字符串
    const contentString = JSON.stringify(content);

    // 构建请求体
    let people = {
      routeId: this.data.curRoute.id,
      memberId: this.data.curUser.uid,
      nickName: this.data.nickName,
      photo: this.data.curUrl,
      self: this.data.self,
      content: contentString
    }

    // 发起请求
    await request({
      url: '/people/save',
      method: 'POST',
      data: people
    });
    Toast('保存成功');
    this.data.isUpdated = false;
  }
})