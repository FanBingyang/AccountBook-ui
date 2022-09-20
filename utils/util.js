// 获取日期 eg:2019-09-07
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
//   const hour = date.getHours()
//   const minute = date.getMinutes()
//   const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-')
}

// 获取不带秒数的时间 eg:18:10
const formatTime = date => {
    // const year = date.getFullYear()
    // const month = date.getMonth() + 1
    // const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    // const second = date.getSeconds()

    return [hour, minute].map(formatNumber).join(':')
}

// 获取时间 eg:18:10:55
const formatTimes = date => {
    // const year = date.getFullYear()
    // const month = date.getMonth() + 1
    // const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [hour, minute, second].map(formatNumber).join(':')
}

// 获取秒数
const formatSecond = date => {
    const second = date.getSeconds()

    return [second].map(formatNumber)
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}



module.exports = {
  formatTime: formatTime,
  formatTimes: formatTimes,
  formatDate: formatDate,
  formatSecond: formatSecond
}
