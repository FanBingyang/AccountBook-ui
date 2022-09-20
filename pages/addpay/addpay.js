var util = require('../../utils/util.js')
//获取应用实例
const app = getApp()
var baseUrl = app.globalData.baseUrl;
var resourceUrl = app.globalData.resourceUrl

Page({
    data: {
        resourceUrl: resourceUrl,
        // 默认消费类型是"其他"
        index: 0,
        // 消费类型
        categoryList: ["其他", "零食", "交通", "住宿", "餐饮", "娱乐", "服装", "日常"],
        // 封装消费对象
        expense:{},
        // 用于显示在页面上的时间和日期，在进入
        time:"",
        date:"",
        // 日期选择器中的结束时间
        endtime:""
    },

    // 点击提交时的方法
    submit: function (e) {
        var that = this
        // 获取提交过来的数据集合
        var values = e.detail.value
        // 获取提交的时的秒数
        var second = util.formatSecond(new Date())
        // 将时间连在一起 eg:2019-9-20 17:44:32
        var expenseTime = values.date + " " + values.time + ":" + second
        // 将数据封装成对象
        that.setData({
            'expense.openId': app.globalData.openId,
            'expense.expenseTitle': values.title,
            'expense.expenseCategory': values.category,
            'expense.expenseMoney': values.money,
            'expense.expenseExplain': values.explain,
            'expense.expenseTime': expenseTime
        })
        // 请求添加
        wx.request({
            url: baseUrl + '/expense/insert.do',
            data: that.data.expense,
            success: function (res) {
                // 弹窗提示成功
                wx.showToast({
                    // 显示的文字
                    title: '添加完成',
                    // 显示的图标
                    icon: 'success',
                    //持续的时间
                    duration: 1000
                })


                // 将页面恢复为默认数据
                that.setData({
                    'expense.expenseTitle': '',
                    'expense.expenseMoney': '',
                    'expense.expenseExplain': '',
                    index:0,
                })
                // 页面默认时间设置为当前时间
                that.setDate()
            }
        })
    },


    // 消费类型选择器设置消费类型
    bindPickerChange: function(e) {
        // 用临时变量保存当前选中的值，e.detail.value是选中值在数组中的下标
        var temp = this.data.categoryList[e.detail.value];
        // 设置页面显示的数据，同时对数据进行封装
        this.setData({
            index: e.detail.value,
            'expense.expenseCategory': temp,
        })
    },
    // 时间选择器设置时间
    bindTimeChange:function(e){
        this.setData({
            time:e.detail.value,
        })
    },
    // 日期选择器设置设置日期
    bindDateChange:function(e){
        this.setData({
            date:e.detail.value,
        })
    },
    
    // 获取当前时间并且设置显示在页面上
    setDate:function(){
        // 获取当前时间
        var TIME = util.formatTime(new Date());
        var DATE = util.formatDate(new Date());
        // 设置当前时间，用于页面获取
        this.setData({
            endtime: DATE,
            time: TIME,
            date: DATE
        })
    },

    onLoad: function (options){
        this.setDate()
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