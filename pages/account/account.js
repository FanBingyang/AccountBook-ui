var wxCharts = require('../../utils/wxcharts.js');
const app = getApp()
var baseUrl = app.globalData.baseUrl
var pieChart = null;
var columnChart = null;
Page({
    data: {
        // 请求账单的id
        sceneId: '',
        // 页面数据对象
        scene: {},
        // 是否是编辑状态
        edit: false,
        // 默认文本框宽度
        width: 400,
        // 对象类型属性
        categoryList: ['sceneSnacks', 'sceneFare', 'sceneStay', 'sceneRepast', 'sceneRecreation', 'sceneClothing', 'sceneDaily', 'sceneOther'],
        // 类型
        moneyList: ['零食', '交通', '住宿', '餐饮', '娱乐', '服装', '日常', '其他'],
        // 颜色列表
        colorList: ['#ffb166', '#fe0000', '#ff6600', '#00ff01', '#66fecb', '#0166ff', '#a04da5', '#007f9f'],
        // 绘制饼图的数据
        seriesPie: [],
        // 饼图数据角标
        seriesPieIndex:0,
        // 绘制柱状图的数据
        seriesColumn:[],
    },

    // 继续添加账单
    add: function(e) {
        var that = this
        that.setData({
            width: 250,
            edit: true,
        })
    },
    // 取消添加
    cancle: function(e) {
        var that = this
        that.setData({
            width: 400,
            edit: false,
        })
    },

    // 添加/修改
    submit: function(e) {
        var that = this
        var thisData = that.data
        // 获取提交的表单数据
        var values = e.detail.value
        that.setData({
            'scene.sceneId':that.data.sceneId,
            'scene.sceneTitle':values.sceneTitle,
            'scene.sceneExplain': values.sceneExplain,
        })
        // 循环设置消费
        for (var index in thisData.categoryList)
        {
            var temp = 'scene.' + thisData.categoryList[index]
            that.setData({
                [temp]: values[thisData.categoryList[index]]
            })
        }
        // 请求添加
        wx.request({
            url: baseUrl+'/scene/add.do',
            data: thisData.scene,
            success: function(res) {
                that.setData({
                    scene:res.data,
                    edit: false,
                    width: 400,
                    reachBottom: false,
                })
                // 更新图表数据
                that.updateData();
                // 弹窗提示成功
                wx.showToast({
                    // 显示的文字
                    title: '添加完成',
                    // 显示的图标
                    icon: 'success',
                    //持续的时间
                    duration: 1000
                })
            },
        })
    },

    // 根据id请求账单数据
    requestData: function() {
        var that = this
        var thisData = that.data
        wx.request({
            url: baseUrl+'/scene/selectById.do',
            data: {
                sceneId: that.data.sceneId
            },
            success: function(res) {
                // 设置请求的数据，用于在页面显示
                that.setData({
                    scene: res.data
                })
                // 更新图表数据
                that.updateData();
                // that.drawPie();
                // that.drawColumn();
            }
        })
    },

    // 更新图表数据
    updateData:function(e){
        var that = this
        // 更新图标数据之前，先清空之前所有的图标数据
        that.setData({
            // 绘制饼图的数据
            seriesPie: [],
            // 饼图数据角标
            seriesPieIndex: 0,
            // 绘制柱状图的数据
            seriesColumn: [],
        })
        var thisData = that.data
        // 创建临时变量接收请求的数据
        var sceneTemp = thisData.scene
        for (var index in thisData.categoryList) {
            // 柱状图页面数据对象的字符串形式
            var seriesColumn = 'seriesColumn[' + index + ']'
            // 设置柱状图数据
            that.setData({
                [seriesColumn]: sceneTemp[thisData.categoryList[index]],
            })
            // 只有消费大于0，才会为饼图设置数据
            if (sceneTemp[thisData.categoryList[index]] > 0) {
                var seriesPie = 'seriesPie[' + thisData.seriesPieIndex + ']'
                // 设置饼图数据
                that.setData({
                    [seriesPie + '.name']: thisData.moneyList[index],
                    [seriesPie + '.data']: sceneTemp[thisData.categoryList[index]],
                    [seriesPie + '.color']: thisData.colorList[index],
                    [seriesPie + '.format']: function (val) {
                        return (val * 100).toFixed(2) + '%'
                    },
                })
                // 饼图数据角标自增
                thisData.seriesPieIndex ++;
            }
        }
        // 数据更新完毕之后，重新绘制图表
        that.drawPie();
        that.drawColumn();
    },

    // 绘制柱状图
    drawColumn:function(e){
        var that = this
        columnChart = new wxCharts({
            canvasId: 'columnCanvas',
            type: 'column',
            animation: true,
            categories: that.data.moneyList,
            series:[{
                name: '消费金额',
                data: that.data.seriesColumn,
                format: function (val) {
                    return val.toFixed(2);
                }
            }],
            yAxis: {
                format: function (val) {
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
            width: 320,
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

    // 加载页面
    onLoad: function(options) {
        var that = this
        // 获取到传递过来的账单的id
        that.setData({
            sceneId:options.sceneId
        })
        // 请求数据
        that.requestData()
    },

    // 用户下拉刷新
    onPullDownRefresh() {
        this.setData({
            width: 400,
            edit: false,
        })
        this.requestData();
        // 必须手动关闭刷新动画，不然会一直在
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