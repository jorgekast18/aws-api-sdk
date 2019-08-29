const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

function sendMessage(userData) {
  const message = `Bienvenido ${userData.client_name}, su requerimiento será atendido en breve.`

  const numbers = [
    '+573162793738',
    '+573187348993'
  ]

  Promise.all(
    
    twilio.messages.create({
      to: '+57' + userData.phone_number,
      from: process.env.TWILIO_MESSAGING_SERVICE_SID,
      body: message
    })
  )
  .then(messages => {
      console.log(`${numbers.length } Messages sent`)
    })
  .catch(error => console.log(error))
}

module.exports = {
  sendMessage
}
