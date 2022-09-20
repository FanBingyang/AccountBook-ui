var wxCharts = require('../../utils/wxcharts.js');
const app = getApp()
var baseUrl = app.globalData.baseUrl
var pieChart = null;
var columnChart = null;
Page({
    data: {
        // 是否上拉触底
        reachBottom: true,
        // 页面账单数据
        bill: {},
        // 用于判断账单类型。0：月账单；1：年账单
        index: 0,

        id: '',
        // 其他数据
        other: [{
                url: '/monthly',
                title: '月账单',
                total: 'monthlyTotal',
                time: 'monthlyTime',
                // 对象类型属性
                categoryList: ['monthlySnacks', 'monthlyFare', 'monthlyStay', 'monthlyRepast', 'monthlyRecreation', 'monthlyClothing', 'monthlyDaily', 'monthlyOther'],
            },
            {
                url: '/yearly',
                title: '年账单',
                total: 'yearlyTotal',
                time: 'yearlyTime',
                // 对象类型属性
                categoryList: ['yearlySnacks', 'yearlyFare', 'yearlyStay', 'yearlyRepast', 'yearlyRecreation', 'yearlyClothing', 'yearlyDaily', 'yearlyOther'],

            }
        ],

        // 类型
        moneyList: ['零食', '交通', '住宿', '餐饮', '娱乐', '服装', '日常', '其他'],
        // 颜色列表
        colorList: ['#ffb166', '#fe0000', '#ff6600', '#00ff01', '#66fecb', '#0166ff', '#a04da5', '#007f9f'],
        // 绘制饼图的数据
        seriesPie: [],
        // 饼图数据角标
        seriesPieIndex: 0,
        // 绘制柱状图的数据
        seriesColumn: [],


    },

    // 根据账单id请求数据
    requestData: function(e) {
        var that = this
        var thisData = that.data
        wx.request({
            url: baseUrl + thisData.other[thisData.index].url + '/selectById.do',
            data: {
                id: thisData.id
            },
            success: function(res) {
                that.setData({
                    bill: res.data
                })
                that.updateData();
                that.drawPie();
                that.drawColumn();
            }
        })


    },

    // 更新图表数据
    updateData: function(e) {
        var that = this
        var thisData = that.data
        // 创建临时变量接收请求的数据
        var billTemp = thisData.bill
        for (var index in thisData.other[thisData.index].categoryList) {
            // 柱状图页面数据对象的字符串形式
            var seriesColumn = 'seriesColumn[' + index + ']'
            that.setData({
                // 设置柱状图数据
                [seriesColumn]: billTemp[thisData.other[thisData.index].categoryList[index]],
            })
            // 只有当消费大于0了，饼图才会被设置数据
            if (billTemp[thisData.other[thisData.index].categoryList[index]] > 0) {
                var seriesPie = 'seriesPie[' + thisData.seriesPieIndex + ']'
                that.setData({
                    // 这只饼图数据
                    [seriesPie + '.name']: thisData.moneyList[index],
                    [seriesPie + '.data']: billTemp[thisData.other[thisData.index].categoryList[index]],
                    [seriesPie + '.color']: thisData.colorList[index],
                    [seriesPie + '.format']: function(val) {
                        return (val * 100).toFixed(2) + '%'
                    },
                })
                // 饼图数据角标自增
                thisData.seriesPieIndex++
            }
        }
    },

    // 绘制柱状图
    drawColumn: function(e) {
        var that = this
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }

        columnChart = new wxCharts({
            canvasId: 'columnCanvas',
            type: 'column',
            animation: true,
            categories: that.data.moneyList,
            series: [{
                name: '消费金额',
                data: that.data.seriesColumn,
                format: function(val) {
                    return val.toFixed(2);
                }
            }],
            yAxis: {
                format: function(val) {
                    return val + '元';
                },
                // title: '消费金额',
                min: 0
            },
            xAxis: {
                disableGrid: false,
                type: 'calibration'
            },
            extra: {
                column: {
                    width: 15
                }
            },
            width: windowWidth,
            height: 300,
        });
    },

    // 绘制饼图
    drawPie: function(e) {
        var that = this
        pieChart = new wxCharts({
            // 是否显示动画
            animation: true,
            // 绘制的图的id
            canvasId: 'pieCanvas',
            // 图的类型
            type: 'pie',
            // 图中的数据
            series: that.data.seriesPie,
            width: 330,
            height: 300,
            // 是否显示数据
            dataLabel: true,
            // 是否显示图表下方各类别的标识，默认true
            legend: true,
        });

    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this
        that.setData({
            index: options.index,
            id: options.id
        })
        that.requestData();
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