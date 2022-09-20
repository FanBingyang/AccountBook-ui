//index.js
//获取应用实例
const app = getApp()
var baseUrl = app.globalData.baseUrl;
var resourceUrl = app.globalData.resourceUrl
app.globalData.userInfo = ''
app.globalData.openId = ''
app.globalData.checkLogin = ''
Page({
    data: {
        showModal: false,
        // 资源请求路径
        resourceUrl: resourceUrl,
        // money为负代表当日的消费额还未请求过来
        money: -1,
        // 轮播图数据
        swiperList: [],
    },

    onLoad: function(options) {
        var that = this;
        // 先进行登录判断用户是否授权
        that.login()
        // 请求轮播图图片
        wx.request({
            url: baseUrl + '/base/swiperItem.do', 
            data: {},
            success: function (res) {
                that.setData({
                    swiperList: res.data
                })
            }
        })

        // 判断是否授权成功
        if (app.globalData.checkLogin) {
            that.selectTotal()
        }
        // 回调函数 
        else {
            app.checkLoginReadyCallback = res => {
                that.selectTotal();
            }
        }
        
    },

    onShow: function() {
        // 每次页面显示的时候再次请求今日消费额
        var that = this;
        // that.login()
        // 先判断是否登录成功
        if (app.globalData.checkLogin) {
            that.selectTotal()
        }
        // 回调函数 
        else {
            app.checkLoginReadyCallback = res => {
                that.selectTotal();
            }
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        wx.showShareMenu();
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: '',
            path: '/pages/index/index',
            imageUrl: "../images/share.png",
            success: (res) => {
                console.log("转发成功", res);
                wx.showToast({
                    title: '转发成功',
                })
            },
            fail: (res) => {
                console.log("转发失败", res);
                wx.showToast({
                    title: '转发失败',
                })
            }
        }
    },

    // 请求今日消费总额
    selectTotal: function () {
        var that = this
        wx.request({
            url: baseUrl + '/expense/selectTotal.do',
            data: {
                openId: app.globalData.openId
            },
            success: function (res) {
                that.setData({
                    money: res.data
                })
            },
        })
    },

    modal_Hidden: function () {
        var that = this
        // 先关闭之前的授权弹窗
        that.setData({
            showModal: false
        })
        wx.showModal({
            title: '提示',
            confirmText: '去设置',
            content: '不授权则无法使用小程序的部分功能，请前往设置授权',
            showCancel: false,
            success: function (res) {
                if (res.confirm) {
                    that.setData({
                        showModal: true
                    })
                }
            }
        })
    },
    // 确定
    GetUserInfo: function (e) {
        console.log(e)
        this.login()
    },


    // 自定义的登录方法，判断用户登录，是否授权
    login: function (e) {
        var that = this
        wx.login({
            success: function (r) {
                var code = r.code; //登录凭证
                // console.log("code_1=======",code)
                if (code) {
                    // 获取用户设置
                    wx.getSetting({
                        success: function (re) {
                            // 判断用户是否授权
                            if (re.authSetting['scope.userInfo']) {
                                // 授权了就进行后台用户数据写入
                                that.register(code)
                                // 设置不显示授权弹窗
                                that.setData({
                                    showModal: false
                                })
                            } else {
                                // 用户没有授权,设置授权弹窗显示
                                that.setData({
                                    showModal: true
                                })
                            }
                        }
                    })
                } else {
                    console.log("获取用户登录状态失败！" + r.errMsg)
                }
            },
            fail: function () {
                console.log("登录失败")
            }
        })
    },

    // 获取到用户的登录授权，请求后台，进行用户信息的操作
    register: function (code) {
        // console.log("code_2===",code)
        //2.调用获取用户信息接口
        wx.getUserInfo({
            success: function (res) {
                // console.log({encryptedData:res.encryptedData,iv:res.iv,code:code})
                //3.请求自己的服务器，解密用户信息，获取unionld等加密信息
                wx.request({
                    // url: app.globalData.baseUrl + '/login.do',
                    url: 'https://cynosure.online/atonce/userwx/loginwx.do',
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        encryptedData: res.encryptedData,
                        iv: res.iv,
                        code: code
                    },
                    success: function (data) {
                        //4.解密成功后，获取自己服务器返回的结果
                        if (data.data.status == 1) {
                            // 解密成功之后更换登录状态
                            app.globalData.checkLogin = true
                            // 接收请求数据
                            var userInfo_ = data.data.userInfo;
                            // 设置用户信息
                            app.globalData.userInfo = userInfo_;
                            app.globalData.openId = userInfo_.openId
                            console.log("用户信息：", userInfo_);

                            //由于这里是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (app.checkLoginReadyCallback) {
                                app.checkLoginReadyCallback(data);
                            }
                        } else {
                            console.log("解密失败")
                        }
                    },
                    fail: function () {
                        console.log("系统错误")
                    }
                })
            },
            fail: function () {
                console.log("获取用户信息失败")
            }
        })
    },
})