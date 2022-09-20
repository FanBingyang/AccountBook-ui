//app.js
App({
    onLaunch: function() {
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
    },
    
    globalData: {
        checkLogin: false,
        userInfo: null,
        openId: null,
        baseUrl: 'https://cynosure.online/account/account',
        // baseUrl: 'http://127.0.0.1:8080',
        resourceUrl: 'https://resource.cynosure.online/account',
    }
})