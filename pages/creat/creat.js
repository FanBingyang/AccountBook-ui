//获取应用实例
const app = getApp()
var baseUrl = app.globalData.baseUrl;
var resourceUrl = app.globalData.resourceUrl
Page({
    data: {
        resourceUrl: resourceUrl,
        // 初始的消费类型
        lists: [
            {
                money:0,
                categoryIndex:'0',
            }
        ],
    
        // 消费类型
        moneyList: ['sceneOther', 'sceneSnacks', 'sceneFare', 'sceneStay', 'sceneRepast', 'sceneRecreation', 'sceneClothing', 'sceneDaily'],
        categoryList: ["其他", "零食", "交通", "住宿", "餐饮", "娱乐", "服装", "日常"],
        // 账单封装成对象
        scene:{},
    },

    // 用户提交之后的操作
    submit: function (e) {
        console.log(e)
        var that = this
        // 提取lists数据对象，方便操作
        var list = that.data.lists
        // 通过for循环依次对消费类型和消费金额进行封装
        for (var index in list) {
            // 从集合中依次循环拿到money
            var money = list[index].money
            // 从集合中依次循环拿到消费类型标号，然后在根据编号在moneyList数组中拿到对应的消费类型
            var category = that.data.moneyList[list[index].categoryIndex]
            // 通过字符串拼接，拿到页面账单中某消费类型对象
            var temp = 'scene.' + category
            // 对消费类型进行消费赋值
            that.setData({
                [temp]: money
            })
        }
        console.log("creat_openId=", app.globalData.openId)
        // 设置用户的openId
        that.setData({
            'scene.openId':app.globalData.openId,
            'scene.sceneTitle':e.detail.value.title,
            'scene.sceneExplain': e.detail.value.explain
        })
        // 请求添加
        wx.request({
            url: baseUrl + '/scene/insert.do',
            data: that.data.scene,
            success:function(res){
                // 弹窗提示成功
                wx.showToast({
                    // 显示的文字
                    title: '新建成功',
                    // 显示的图标
                    icon: 'success',
                    //持续的时间
                    duration: 1000
                })
                // 跳转到当前页面
                wx.redirectTo({
                    url: '/pages/creat/creat?list='+that.data.lists,
                })
            }
        })
    },

    // 添加选项
    addList: function() {
        // 拿到当前页面lists对象
        var lists = this.data.lists;
        // 判断数组长度是否小于8，小于8则允许添加
        if(Object.keys(lists).length < 8){
            // 创建一个新的数据对象
            var newData = {
                money: 0,
                categoryIndex: '0',
            };
            // 将新创建的数据对象添加到lists数组，实质是添加lists数组内容，使for循环多一次
            lists.push(newData);
            // 设置页面数据
            this.setData({
                lists: lists,
            })
        }
    },
    // 删除选项
    delList: function() {
        var lists = this.data.lists;
        // 判断数组长度是否大于1，大与1则允许删除
        // 使用Object.keys(lists).length获取数据或json的长度
        if(Object.keys(lists).length > 1 )
        {
            // 删除lists数组中最后一个数对象。实质是删除lists数组内容，使for循环少一次
            lists.pop();
            this.setData({
                lists: lists,
            })
        }
    },
    // 消费类型选择器设置消费类型
    bindPickerChange: function(e) {
        // 第几个picker的值改变了,data-*传递过来的值是字符串形式，作为角标使用需要转换成int
        var index = parseInt(e.currentTarget.dataset.index)
        // e.detail.value是选中值在数组中的下标，将类型的索引下标设置为选中的下标
        this.data.lists[index].categoryIndex = e.detail.value
        // 新建一个list等于现有的lists
        var list = this.data.lists
        // 设置页面显示的数据，同时对数据进行封装
        this.setData({
            lists:list,
        })
    },
    // 输入框失去焦点操作，将输入的数值进行保存
    bindblur:function(e){
        // 拿到操作的是第几个输入框的角标
        var index = e.currentTarget.dataset.index
        // 拿到该输入框的值
        var money = e.detail.value
        // 将消费金额进行设置
        this.data.lists[index].money = money
        // 新建一个list等于现有的lists
        var list = this.data.lists
        // 设置页面显示的数据，同时对数据进行封装
        this.setData({
            lists: list,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
       
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