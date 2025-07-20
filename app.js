App({
  globalData: {
    // 后台的请求地址
    // 局域网，win在控制台输入ipconfig，ipv4后面可查看本次局域网ip
    // baseUrl: 'http://192.168.31.104:9090',
    // 本地运行服务端
    // baseUrl: 'http://localhost:9090',
    // 线上
    baseUrl: 'https://www.zhulang.online:8080',

     // 默认设置为0，从createRoute进入addMember时设置为1
     // 从manageTeam进入addMember时设置为2
    searchType: 0
  },
  // 数一数有几个队员
  countMember: member => member.split(',').length,
   
  // 把第二个串里的队员从第一个串里抠掉
  removeFirstFromSecond: (first, second) => {
    if(!first || !second) return first;
    let firstList = first.split(","), secondList = second.split(",");
    let resList = firstList.filter(m => !secondList.includes(m));
    return resList.join(",");
  }
})
