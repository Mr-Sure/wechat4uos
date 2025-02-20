'use strict'
require('babel-register')
const Wechat = require('./src/wechat.js')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')

let bot
/**
 * 尝试获取本地登录数据，免扫码
 * 这里演示从本地文件中获取数据
 */
try {
  bot = new Wechat(require('./sync-data.json'))
} catch (e) {
  bot = new Wechat()
}
/**
 * 启动机器人
 */
if (bot.PROP.uin) {
  // 存在登录数据时，可以随时调用restart进行重启
  bot.restart()
} else {
  bot.start()
}
/**
 * uuid事件，参数为uuid，根据uuid生成二维码
 */
bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  })
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})
/**
 * 登录用户头像事件，手机扫描后可以得到登录用户头像的Data URL
 */
bot.on('user-avatar', avatar => {
  console.log('登录用户头像Data URL：', avatar)
})
/**
 * 登录成功事件
 */
bot.on('login', () => {
  console.log('登录成功')
  // 保存数据，将数据序列化之后保存到任意位置
  fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData))
})
/**
 * 登出成功事件
 */
bot.on('logout', () => {
  console.log('登出成功')
  // 清除数据
  fs.unlinkSync('./sync-data.json')
})
/**
 * 联系人更新事件，参数为被更新的联系人列表
 */
bot.on('contacts-updated', contacts => {
  console.log(contacts)
  console.log('联系人数量：', Object.keys(bot.contacts).length)
})
/**
 * 错误事件，参数一般为Error对象
 */
bot.on('error', err => {
  console.error('错误：', err)
})
/**
 * 如何发送消息 
 */
bot.on('login', () => {
  /**
   * 演示发送消息到文件传输助手
   * 通常回复消息时可以用 msg.FromUserName
   */
  let ToUserName = 'filehelper'

  /**
   * 发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])
   */
  // bot.sendMsg('发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])', ToUserName)
  //     .catch(err => {
  //         bot.emit('error', err)
  //     })

  /**
   * 通过表情MD5发送表情
   */
  // bot.sendMsg({
  //     emoticonMd5: '00c801cdf69127550d93ca52c3f853ff'
  // }, ToUserName)
  //     .catch(err => {
  //         bot.emit('error', err)
  //     })

  /**
   * 以下通过上传文件发送图片，视频，附件等
   * 通用方法为入下
   * file为多种类型
   * filename必填，主要为了判断文件类型
   */
  // bot.sendMsg({
  //   file: Stream || Buffer || ArrayBuffer || File || Blob,
  //   filename: 'bot-qrcode.jpg'
  // }, ToUserName)
  //   .catch(err => {
  //     bot.emit('error',err)
  //   })

  /**
   * 发送图片
   */
  // bot.sendMsg({
  //     file: request('https://raw.githubusercontent.com/nodeWechat/wechat4u/master/bot-qrcode.jpg'),
  //     filename: 'bot-qrcode.jpg'
  // }, ToUserName)
  //     .catch(err => {
  //         bot.emit('error', err)
  //     })

  /**
   * 发送表情
   */
  // bot.sendMsg({
  //     file: fs.createReadStream('./media/test.gif'),
  //     filename: 'test.gif'
  // }, ToUserName)
  //     .catch(err => {
  //         bot.emit('error', err)
  //     })

  /**
   * 发送视频
   */
  // bot.sendMsg({
  //     file: fs.createReadStream('./media/test.mp4'),
  //     filename: 'test.mp4'
  // }, ToUserName)
  //     .catch(err => {
  //         bot.emit('error', err)
  //     })

  /**
   * 发送文件
   */
  // bot.sendMsg({
  //     file: fs.createReadStream('./media/test.txt'),
  //     filename: 'test.txt'
  // }, ToUserName)
  //     .catch(err => {
  //         bot.emit('error', err)
  //     })

  /**
   * 发送撤回消息请求
   */
  // bot.sendMsg('测试撤回', ToUserName)
  //     .then(res => {
  //         // 需要取得待撤回消息的MsgID
  //         return bot.revokeMsg(res.MsgID, ToUserName)
  //     })
  //     .catch(err => {
  //         console.log(err)
  //     })
})
/**
 * 如何处理会话消息
 */
bot.on('message', msg => {
  /**
   * 获取消息时间
   */
  console.log(`----------${msg.getDisplayTime()}----------`)
  /**
   * 获取消息发送者的显示名
   */
  console.log(bot.contacts[msg.FromUserName].getDisplayName())
  /**
   * 判断消息类型
   */
  switch (msg.MsgType) {
    case bot.CONF.MSGTYPE_TEXT:
      /**
       * 文本消息
       */
      console.log(msg.Content)
      break
    case bot.CONF.MSGTYPE_IMAGE:
      /**
       * 图片消息
       */
      console.log('图片消息，保存到本地')
      bot.getMsgImg(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.jpg`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })
      break
    case bot.CONF.MSGTYPE_VOICE:
      /**
       * 语音消息
       */
      console.log('语音消息，保存到本地')
      bot.getVoice(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.mp3`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })
      break
    case bot.CONF.MSGTYPE_EMOTICON:
      /**
       * 表情消息
       */
      console.log('表情消息，保存到本地')
      bot.getMsgImg(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.gif`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })
      break
    case bot.CONF.MSGTYPE_VIDEO:
    case bot.CONF.MSGTYPE_MICROVIDEO:
      /**
       * 视频消息
       */
      console.log('视频消息，保存到本地')
      bot.getVideo(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.mp4`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })
      break
    case bot.CONF.MSGTYPE_APP:
      if (msg.AppMsgType == 6) {
        /**
         * 文件消息
         */
        console.log('文件消息，保存到本地')
        bot.getDoc(msg.FromUserName, msg.MediaId, msg.FileName).then(res => {
          fs.writeFileSync(`./media/${msg.FileName}`, res.data)
          console.log(res.type);
        }).catch(err => {
          bot.emit('error', err)
        })
      }
      break
    default:
      break
  }
})
/**
 * 如何处理红包消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.CONF.MSGTYPE_SYS && /红包/.test(msg.Content)) {
    // 若系统消息中带有‘红包’，则认为是红包消息
    // wechat4u并不能自动收红包
  }
})
/**
 * 如何处理转账消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.CONF.MSGTYPE_APP && msg.AppMsgType == bot.CONF.APPMSGTYPE_TRANSFERS) {
    // 转账
  }
})
/**
 * 如何处理撤回消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.CONF.MSGTYPE_RECALLED) {
    // msg.Content是一个xml，关键信息是MsgId
    let MsgId = msg.Content.match(/<msgid>(.*?)<\/msgid>.*?<replacemsg><!\[CDATA\[(.*?)\]\]><\/replacemsg>/)[0]
    // 得到MsgId后，根据MsgId，从收到过的消息中查找被撤回的消息
  }
})
/**
 * 如何处理好友请求消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.CONF.MSGTYPE_VERIFYMSG) {
    bot.verifyUser(msg.RecommendInfo.UserName, msg.RecommendInfo.Ticket)
      .then(res => {
        console.log(`通过了 ${bot.Contact.getDisplayName(msg.RecommendInfo)} 好友请求`)
        /*
        * 新增自动通过好友说明
        */
        const anwser = '我是ChatGPT，是一个大型的语言模型，可以回答各种问题并提供帮助。你可以问我关于任何主题的问题，但我的回答可能需要一些时间来生成。请耐心等待我回答。'
        console.log(msg.RecommendInfo.UserName)
        bot.sendMsg(anwser, msg.RecommendInfo.UserName)
          .catch(err => {
            bot.emit('error', err)
          })
      })
      .catch(err => {
        bot.emit('error', err)
      })
  }
})
/**
 * 如何直接转发消息
 */
bot.on('message', msg => {
  // 不是所有消息都可以直接转发
  //   const ACCESS_TOKEN = 'sk-lidong'
  //   const headers = {
  //     'User-Agent': 'Content-Type: application/json', // 浏览器标识
  //     'Authorization': 'Bearer ' + ACCESS_TOKEN // 认证头部
  //   }
  //   const data = {
  //     model: 'gpt-3.5-turbo',
  //     'messages': [
  //       {
  //         'role': 'user',
  //         'content': msg.Content
  //       }
  //     ]
  //   }
  //   console.log(data.messages[0].content)
  //   const options = {
  //     url: 'https://freechat.xyhelper.cn/v1/chat/completions',
  //     headers: headers,
  //     method: 'POST',
  //     json: true,
  //     body: data
  //   }
  var headers = {
    'authority': 'api.aichatos.cloud',
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'content-type': 'application/json',
    'origin': 'https://chat4.aichatos.com',
    'referer': 'https://chat4.aichatos.com/',
    'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Microsoft Edge";v="114"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.0.0'
  }
  var prompt = '#X\n1."Y"是背景设定, "Z"是交互内容\n2.仅补全"Z"中"AIChat"的单次交互内容\n#Y\nAIChat:我是由少年Sure创造的AIChat，基于ChatGPT最新版本，主要功能是通过自然语言处理技术与用户进行交互，并根据用户提出的问题或任务，尽可能地为用户提供准确、详细和有效的解答或帮助。如果您有任何疑问或需要帮助，请随时向我提问。\n#Z\n用户:' + msg.Content + '\nAIChat:\n'
  console.log(prompt)
  var dataString = {
    'prompt': prompt,
    'userId': msg.FromUserName,
    'network': false,
    'apikey': '',
    'system': '',
    'withoutContext': false
  }
  dataString = JSON.stringify(dataString)
  var options = {
    url: 'https://api.aichatos.cloud/api/generateStream',
    method: 'POST',
    headers: headers,
    body: dataString
  }
  if (msg.CreateTime * 1000 < Date.now() && msg.CreateTime * 1000 > Date.now() - 10 * 1000) {
    console.log('A')
    console.log(msg)
    if (msg.MsgType === bot.CONF.MSGTYPE_TEXT) {
      console.log('msg')
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var anwser = body
          anwser = anwser.replace('AIChat: ', '')
          console.log(anwser)
          bot.sendMsg(anwser, msg.FromUserName)
            .catch(err => {
              bot.emit('error', err)
            })
        }
      })
    }
  } else {
    console.log('B', msg.CreateTime, Date.now())
  }
})
/**
 * 如何获取联系人头像
 */
bot.on('message', msg => {
  bot.getHeadImg(bot.contacts[msg.FromUserName].HeadImgUrl).then(res => {
    fs.writeFileSync(`./media/${msg.FromUserName}.jpg`, res.data)
  }).catch(err => {
    bot.emit('error', err)
  })
})
