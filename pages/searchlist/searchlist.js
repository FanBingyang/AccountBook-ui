const app = getApp()
var baseUrl = app.globalData.baseUrl
var resourceUrl = app.globalData.resourceUrl

Page({
    data: {
        resourceUrl: resourceUrl,
        // 标识是哪个页面跳转过来的，0:账单查询;1:消费查询;2:账单列表
        flag:2,
        // 保存页面数据
        list:[],
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
        console.log("id=",id,"index=",index)
        wx.showModal({
            content: '确定删除该账单吗?',
            confirmText:'删除',
            confirmColor:'red',
            success: function (res) {
                if (res.confirm) {
                    // 根据页面数据类型设置请求的url
                    if (that.data.flag == 1)
                       var url = '/expense/delete.do'
                    else var url = '/scene/delete.do'
                    // 请求删除
                    wx.request({
                        url: baseUrl+url,
                        data: {id:id},
                        success: function(res) {
                            // 显示弹窗
                            wx.showToast({
                                title: '删除成功',
                                icon:'success',
                                duration:1000,
                            })
                            // 根据角标删除list中的元素
                            that.data.list.splice(index, 1)
                            // 更新页面数据
                            that.setData({
                                list: that.data.list
                            })
                        },
                        fail: function(res) {
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        // console.log("1",app.globalData.openId)
        // console.log("2",app.globalData.userInfo)
        // console.log("3",app.globalData.checkLogin)
        // 设置标识
        that.setData({
            flag:options.index
        })
        // 设置页面标题
        switch (options.index) {
            case '0':
            case '2':
                wx.setNavigationBarTitle({
                    title: '账单列表'
                });
                break;
            case '1':
                wx.setNavigationBarTitle({
                    title: '消费列表'
                });
                break;
        }

        // 如果页面是从查询页面跳转过来的
        if (that.data.flag == 0 || that.data.flag == 1)
        {
            // 将数组json字符串装换成数组
            var lists = JSON.parse(options.lists)
            // 设置页面数据
            that.setData({
                list: lists
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this
        //如果页面是从账单列表跳转过来的，每次页面显示时请求数据
        if(that.data.flag == 2)
        {
            that.loadMore();
        }
    },

    // 自定义加载更多函数
    loadMore: function () {
        var that = this
        // 如果没有数据就直接返回
        if (!that.data.hasMore) return;
        wx.request({
            url: baseUrl + '/scene/selectByLimit.do',
            data: {
                openId: app.globalData.openId,
                page: ++that.data.page,
                pageSize: that.data.pageSize
            },
            success: function (res) {
                // 为了防止每次请求数据都将上一次的替换掉，定义新的列表，通过concat将原来的数据和请求过来的数据进行拼接在一起
                var newList = that.data.list.concat(res.data)
                var flag = parseInt(res.data.length) >= that.data.pageSize
                // console.log("页码：", that.data.page, "请求的数据量:", res.data.length, "是否还有更多:", flag)
                that.setData({
                    list: newList,
                    hasMore: flag
                })
            }
        })
    },

   
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this
        if(that.data.flag == 2)
        {
            // 用户下拉刷新
            /**首先清除已经加载的数据，清空默认值，然后再次请求 */
            that.setData({
                list: [],
                page: 0,
                hasMore: true
            })
            that.loadMore();
            // 必须手动关闭刷新动画，不然会一直在
            wx.stopPullDownRefresh();
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this
        if(that.data.flag == 2)
        {
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
        }
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