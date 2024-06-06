App({
  globalData: {
     // 默认设置为0，从createRoute进入addMember时设置为1
     // 从manageTeam进入addMember时设置为2
    searchType: 0
  },
  countMember: (member) => {
    return member.split(',').length;
  }
})
