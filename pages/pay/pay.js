//获取应用实例
const app = getApp()
var baseUrl = app.globalData.baseUrl;

Page({
    data: {
        //asd
        expenseId:'',
        expense:{}
    },
    addpay:function()
    {
        wx.switchTab({
            url: '../addpay/addpay',
        })
    },
    requestData:function(){
        var that = this
        wx.request({
            url: baseUrl+'/expense/selectById.do',
            data: {
                expenseId:that.data.expenseId
            },
            success: function(res) {
                that.setData({
                    expense:res.data
                })
            },
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this
        that.setData({
            expenseId: options.expenseId
        })
        that.requestData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.requestData();
        wx.stopPullDownRefresh();
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