const { bot } = require('./config')
const AsyncLock = require('async-lock')

const log = require('./util/logger')(module)
const { User } = require('./models')

const handleUser = async (from) => {
  let user = await User.findOne({
    telegram_id: from.id
  })

  if (!user) {
    user = await User.create({
      telegram_id: from.id,
      username: from.username
    })
  }

  return user.isNewFag
}

const isSpam = (msg) => {
  let spam = false
  if (msg.entities && msg.entities.length > 0) {
    msg.entities.forEach(e => {
      spam = spam || e.type === 'mention' || e.type === 'url'
    })
  }

  if (msg.forward_from) {
    spam = true
  }

  return spam
}

const lock = new AsyncLock()
const handleAsync = (msg) => {
  lock.acquire('message', async () => {
    try {
      if (msg.new_chat_member) {
        return
      }

      const isNewFag = await handleUser(msg.from)
      if (isNewFag) {
        const spam = isSpam(msg)
        if (spam) {
          await bot.restrictChatMember(msg.chat.id, msg.from.id, { until_date: -1, can_send_messages: false })
          await bot.deleteMessage(msg.chat.id, msg.message_id)
          return
        }
        return await User.update({ telegram_id: msg.from.id }, { isNewFag: false })
      }
    } catch (e) {
      log.error(e)
    }
  })
}

const longPollingMode = async () => {
  bot.on('message', handleAsync)
};

(async () => {
  await longPollingMode()
})()
