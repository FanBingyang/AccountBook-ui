var util = require("../../utils/util.js")
const app = getApp()
var baseUrl = app.globalData.baseUrl
var resourceUrl = app.globalData.resourceUrl
Page({

    /**
     * 页面的初始数据
     */
    data: {
        resourceUrl: resourceUrl,
        // 时间选择器的结束时间
        endtime: '',
        // 时间选择器的时间
        date: '',
        // 类型选择的标志，true:禁用;false:使用。默认:false
        categorySwitch: true,
        // 时间选择的标志，true:禁用;false:使用。默认:false
        timeSwitch: true,
        // 消费类型是否禁用而添加的样式
        disabledCategoryClass: 'disable',
        // 时间选择器是否禁用而添加的样式
        disabledTimeClass: 'disable',
        // 查询类型,0:账单查询;1:消费查询
        index: 0,
        list: [{
                title: '账单',
                url: '/scene',
                datas: {}
            },
            {
                title: '消费',
                url: '/expense',
                datas: {},
            },
        ],
        // 类型选择器的角标,默认是0,也就是默认其他
        index_2: 0,
        // 消费类型
        categoryList: ["其他", "零食", "交通", "住宿", "餐饮", "娱乐", "服装", "日常"],
    },

    // 类型选择器开关
    categorySwitchChange: function(e) {
        var that = this
        that.setData({
            categorySwitch: !that.data.categorySwitch,
        })
        if (that.data.categorySwitch) {
            that.setData({
                disabledCategoryClass: 'disable'
            })
        } else {
            that.setData({
                disabledCategoryClass: ''
            })
        }
    },
    // 时间选择器开关
    timeSwitchChange: function(e) {
        var that = this
        that.setData({
            timeSwitch: !that.data.timeSwitch,
        })
        if (that.data.timeSwitch) {
            that.setData({
                disabledTimeClass: 'disable'
            })
        } else {
            that.setData({
                disabledTimeClass: ''
            })
        }
    },
    // 时间选择器有改变执行的函数
    bindDateChage: function(e) {
        // 将选择的时间同步到页面数据
        this.setData({
            date: e.detail.value
        })
    },
    // 消费类型选择器改变执行的函数
    bindPickerChange: function(e) {
        // 用临时变量保存当前选中的值，e.detail.value是选中值在数组中的下标
        var category = this.data.categoryList[e.detail.value];
        // 使其封装成页面对象的字符串形式 'list[1].datas.expenseCategory',然后再通过[]进行赋值操作,
        // 在setData里面使用[]给对象赋值，[]里面的必须是页面对象的字符串形式
        var temp = 'list[' + this.data.index + '].datas';
        // 设置页面显示的数据，同时对数据进行封装
        this.setData({
            index_2: e.detail.value,
            [temp + ".expenseCategory"]: category,
        })
    },
    // 提交执行的方法
    submit: function(e) {
        // 获取到提交的数据集合
        var valus = e.detail.value;
        var that = this
        // 拿到页面的数据对象字符串
        var datas = 'list[' + this.data.index + '].datas';
        // 根据不同的查询类型设置数据
        if (that.data.index == 0) {
            that.setData({
                [datas + ".sceneTitle"]: valus.title,
                [datas + ".openId"]: app.globalData.openId,
            })
            // 如果时间选择器没有被禁用，就设置数据
            if (!that.data.timeSwitch) {
                that.setData({
                    [datas + ".sceneTime"]: valus.time
                })
            } else {
                that.setData({
                    date: ''
                })
            }
        } else {
            that.setData({
                [datas + ".expenseTitle"]: valus.title,
                [datas + ".openId"]: app.globalData.openId,
            })
            // 如果类型选择器没有被禁用，就设置数据
            if (!that.data.categorySwitch) {
                that.setData({
                    [datas + ".expenseCategory"]: valus.category
                })
            } else {
                that.setData({
                    [datas + ".expenseCategory"]: ''
                })
            }
            // 如果时间选择器没有被禁用，就设置数据
            if (!that.data.timeSwitch) {
                that.setData({
                    [datas + ".expenseTime"]: valus.time
                })
            } else {
                that.setData({
                    date: ''
                })
            }
        }
        // 获取请求类型的数据
        var temp = that.data.list[that.data.index]
        wx.request({
            url: baseUrl + temp.url + '/select.do',
            data: temp.datas,
            success: function(res) {
                // 将数组转换成json字符串
                var lists = JSON.stringify(res.data);
                wx.navigateTo({
                    url: '../searchlist/searchlist?index=' + that.data.index + '&lists=' + lists,
                })
            },
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            index: options.index
        })
        // 设置页面标题
        switch (options.index) {
            case '0':
                wx.setNavigationBarTitle({
                    title: '账单查询'
                });
                break;
            case '1':
                wx.setNavigationBarTitle({
                    title:'消费查询'
                });
                break;
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        // 获取当前时间
        var DATE = util.formatDate(new Date());
        // 设置选择器的结束时间和默认选择时间
        this.setData({
            endtime: DATE,
            date: DATE
        })
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