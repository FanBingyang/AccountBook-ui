const app = getApp()
var baseUrl = app.globalData.baseUrl
var openId = app.globalData.openId
var resourceUrl = app.globalData.resourceUrl
Page({
    data: {
        resourceUrl: resourceUrl,
        // 用于判断账单类型。0：月账单；1：年账单
        index: 0,
        // 其他数据
        other:[
            {
                url:'/monthly',
                title:'月账单',
                datas:{
                    openId:'',
                    monthlyTime:''
                }
            },
            {
                url: '/yearly',
                title: '年账单',
                datas: {
                    openId: '',
                    yearlyTime: ''
                }
            }
        ],
        list: [],
        // 文本框中的值
        value: '',
    },
    // 键盘点击完成时，获取并保存输入框中的值
    bindconfirm: function(e) {
        this.setData({
            value: e.detail.value
        })
    },
    // 输入框失去焦点时，获取并保存输入框中的值
    bindblur: function(e) {
        this.setData({
            value: e.detail.value
        })
    },
    // 请求数据
    requestList:function(){
        var that = this
        // 设置用户openId
        var openId = 'other[' + that.data.index + '].datas.openId'
        that.setData({
            [openId]:app.globalData.openId
        })
        var temp = that.data.other[that.data.index]
        wx.request({
            url: baseUrl + temp.url + '/selectByExample.do',
            data: temp.datas,
            success: function (res) {
                // 账单列表
                that.setData({
                    list: res.data
                })
            },
        })
    },

    // 点击搜索图标
    searchTap: function(e) {
        var that = this
        // 拿到数据对象
        var datas = 'other[' + that.data.index + '].datas'
        // 分类赋值,将文本框输入的内容设置到对象中
        if (that.data.index == 0) {
            that.setData({
                [datas + '.monthlyTime']: that.data.value,
            })
        }else if (that.data.index == 1) {
            that.setData({
                [datas + '.yearlyTime']: that.data.value,
            })
        }
        // 请求数据
        that.requestList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this
        // 获取账单类型
        that.setData({
            index: options.index
        })
        // 设置页面标题
        switch (options.index) {
            case '0':
                wx.setNavigationBarTitle({
                    title: '月账单列表'
                });
                break;
            case '1':
                wx.setNavigationBarTitle({
                    title: '年账单列表'
                });
                break;
        }
        //请求数据
        that.requestList()

    },

    
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        // 下拉刷新
        this.setData({
            list:[]
        })
        this.requestList();
        // 手动关闭刷新动画
        wx.stopPullDownRefresh()
    },

    /**
       * 用户点击右上角分享
       */
    onShareAppMessage: function (res) {
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
    }

})