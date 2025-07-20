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

    // 照片
    photoList: [],

    // 想要使用的名字
    nickName: "",

    // 想对自己说的话
    self: "",

    // 是否正在上传照片
    isUploading: false,

    // 是否做出了更新
    isUpdated: false,
    totalWords: 0,
    autoSaveTimer: null,
    headImageUploaded: false
  },
  async onShow() {
    console.log("isUpdated: ", this.data.isUpdated)
    if(this.data.isUpdated){
      return;
    }
    // 初始化数据
    this.setData({
      curRoute: wx.getStorageSync('currentRoute'),
      curUser: wx.getStorageSync('currentUser'),
      curUrl: "",
      allMember: [],
      photoList: [],
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
      if (!this.data.isUploading && (!this.data.photoList || this.data.photoList.length === 0)) {
        // 先清空photoList，避免van-uploader diff递归
        this.setData({ photoList: [] });
        const curPhoto = [];
        let photoUrl = curPeople.data[0].photo;
        if (photoUrl && !/^https?:\/\//.test(photoUrl)) {
          photoUrl = app.globalData.baseUrl + photoUrl;
        }
        if (photoUrl) {
          curPhoto.push({
            url: photoUrl,
            name: '人物贴照片',
            type: 'image'
          });
        }
        this.setData({
          photoList: curPhoto,
        });
      }
      this.setData({
        curUrl: curPeople.data[0].photo,
        nickName: curPeople.data[0].nickName,
        self: curPeople.data[0].self,
        headImageUploaded: !!curPeople.data[0].photo // 只要有图片就显示上传成功
      })
    }
    this.setData({
      allMember: am.data
    })
    this.updateTotalWords();
    // 启动30秒自动保存
    this.startAutoSave();
    // 离开页面前拦截
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
  async autoSave() {
    // 自动保存，不显示提示，不跳转页面
    if (this.data.photoList.length === 0 || this.data.nickName === "") {
      return; // 必填项未完成时不保存
    }
    
    try {
      // 若上传了新照片，则上传照片到服务器
      if (this.data.isUploading) {
        const uploadImage = () => {
          return new Promise((resolve, reject) => {
            wx.uploadFile({
              filePath: this.data.photoList[0].url,
              name: "photo",
              url: app.globalData.baseUrl + '/people/photo',
              formData: {
                uid: this.data.curUser.uid
              },
              success(res) {
                resolve(res);
              },
              fail(err) {
                reject(err);
              }
            })
          })
        }
        const res = await uploadImage();
        this.setData({
          curUrl: JSON.parse(res.data).data
        })
      }

      // 形成content内容
      const curChange = this.data.allMember;
      const content = curChange.map(({uid, people}) => ({uid, people}));
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
      
      this.data.isUpdated = false;
      console.log('自动保存成功');
    } catch (error) {
      console.error('自动保存失败:', error);
    }
  },
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
              headImageUploaded: true
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

  async save() {
    if (!this.data.curUrl) {
      Toast('请上传照片哦');
      return;
    }
    if(this.data.nickName === ""){
      Toast('请填写你的名字哦');
      return;
    }

    // 若上传了新照片，则上传照片到服务器
    if (this.data.isUploading) {
      const uploadImage = () => {
        return new Promise((resolve, reject) => {
          wx.uploadFile({
            filePath: this.data.photoList[0].url,
            name: "photo", // 后端接收参数的名字
            url: app.globalData.baseUrl + '/people/photo',
            formData: {
              uid: this.data.curUser.uid
            },
            success(res) {
              resolve(res); // 成功时调用 resolve
            },
            fail(err) {
              reject(err); // 失败时调用 reject
            }
          })
        })
      }
      const res = await uploadImage();
      this.setData({
        curUrl: JSON.parse(res.data).data
      })
    }

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
    console.log(people)

    // 发起请求
    await request({
      url: '/people/save',
      method: 'POST',
      data: people
    });
    Toast('保存成功');
    setTimeout(() => {
      wx.navigateBack({
        url: '../myRoute/myRoute',
      });
    }, 1000);
    this.data.isUpdated = false;
    this.data.isUploading = false;
    this.clearAutoSave();
  }
})