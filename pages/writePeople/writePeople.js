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
    isUploading: false
  },
  async onShow() {
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
      if (!this.data.isUploading) {
        const curPhoto = [];
        curPhoto.push({
          fileType: "image",
          url: curPeople.data[0].photo,
          type: "image"
        })
        console.log(curPhoto)
        this.setData({
          photoList: curPhoto,
        })
      }
      this.setData({
        curUrl: curPeople.data[0].photo,
        nickName: curPeople.data[0].nickName,
        self: curPeople.data[0].self
      })
    }
    this.setData({
      allMember: am.data
    })
  },

  afterRead(event) {
    console.log(event)
    const {
      file
    } = event.detail;
    console.log(file);
    // 预览新图片
    this.setData({
      photoList: file,
      isUploading: true
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
  },

  async save() {
    console.log(this.data.photoList)
    if(this.data.photoList.length === 0){
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
  }
})