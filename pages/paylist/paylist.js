const app = getApp()
var openId = app.globalData.openId
var baseUrl = app.globalData.baseUrl
var resourceUrl = app.globalData.resourceUrl
Page({
    data: {
        resourceUrl: resourceUrl,
        // 保存请求过来的数据
        list: [],
        // 页码，由于页码第一次加载时就自增1，所以默认值为0
        page: 0,
        // 每加载的数量
        pageSize: 20,
        // 用于记录是否还有数据
        hasMore: true,
        // 是否显示加载动画
        loading: false,
    },

    // 长按弹出删除框
    del: function (e) {
        var that = this
        // 获取选择的账单id
        var id = e.currentTarget.dataset.id
        // 获取改账单在list中的角标
        var index = e.currentTarget.dataset.index
        wx.showModal({
            content: '确定删除该账单吗?',
            confirmText: '删除',
            confirmColor: 'red',
            success: function (res) {
                if (res.confirm) {
                    // 请求删除
                    wx.request({
                        url: baseUrl + '/expense/delete.do',
                        data: { id: id },
                        success: function (res) {
                            // 显示弹窗
                            wx.showToast({
                                title: '删除成功',
                                icon: 'success',
                                duration: 1000,
                            })
                            // 根据角标删除list中的元素
                            that.data.list.splice(index, 1)
                            // 更新页面数据
                            that.setData({
                                list: that.data.list
                            })
                        },
                        fail: function (res) {
                            wx.showToast({
                                title: '删除失败',
                                duration: 1000,
                            })
                        }
                    })
                } else if (res.cancel) { }
            }
        })
    },

    

    // 自定义加载更多函数
    loadMore: function () {
        var that = this
        // 如果没有数据就直接返回
        if (!that.data.hasMore) return;
        wx.request({
            url: baseUrl + '/expense/selectByLimit.do',
            data: {
                openId: app.globalData.openId,
                page: ++that.data.page,
                pageSize: that.data.pageSize
            },
            success: function (res) {
                // 为了防止每次请求数据都将上一次的替换掉，定义新的列表，通过concat将原来的数据和请求过来的数据进行拼接在一起
                var newList = that.data.list.concat(res.data)
                var flag = parseInt(res.data.length) >= that.data.pageSize
                that.setData({
                    list: newList,
                    hasMore: flag
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 页面加载出来时请求数据
        this.loadMore();
    },

    
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        // 用户下拉刷新
        /**首先清除已经加载的数据，清空默认值，然后再次请求 */
        this.setData({
            list: [],
            page: 0,
            hasMore: true
        })
        this.loadMore();
        // 必须手动关闭刷新动画，不然会一直在
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this
        that.setData({
            loading: true
        })
        // 用户上拉触底之后请求加载新的数据
        setTimeout(function () {
            that.setData({
                loading: false
            });
            that.loadMore();
        }, 500)
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