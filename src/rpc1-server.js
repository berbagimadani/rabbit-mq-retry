const amqp = require('amqplib');
const uuid = require('uuid');
const nodemailer = require("nodemailer");
const axios = require('axios'); 
const RABBITMQ = 'amqp://guest:guest@localhost:5672';

const open = require('amqplib').connect(RABBITMQ);
const q = 'example';

// Consumer
open
  .then(function(conn) {
    console.log(`[ ${new Date()} ] Server started`);
    return conn.createChannel();
  })
  .then(function(ch) {
    return ch.assertQueue(q).then(function(ok) {
      ch.prefetch(100);
      return ch.consume(q, async function(msg) {
        console.log(
          `[ ${new Date()} ] Message received: ${JSON.stringify(
            JSON.parse(msg.content.toString('utf8')),
          )}`,
        );
        if (msg !== null) {
           
          var row_parse = JSON.parse(msg.content.toString('utf8'));
          //console.log(row_parse.uuid)

          /*const response = {
            uuid: uuid.v4() + 'abang none',
          };*/
          //const response = await sendEmail(JSON.stringify(JSON.parse(msg.content.toString('utf8'))));
          const response = await sendPayment(row_parse.uuid);

          console.log(
            `[ ${new Date()} ] Message sent: ${JSON.stringify(response)}`,
          );

          ch.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
              correlationId: msg.properties.correlationId,
            },
          );

          ch.ack(msg);
        }
      });
    });
  })
  .catch(console.warn);

  const sendEmail = (msg) =>
    new Promise(resolve => {
      
      let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: '80848ab68bad22', // generated ethereal user
          pass: '93c4ecdf0fd78a'
        },
      });	
      // send mail with defined transport object
      let mailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: msg+'@mail.com', // list of receivers
        subject: msg, // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
          //cb(error, null);
        } else {
          console.log('EMAIL Message sent: %s', info.messageId);
          console.log('EMAIL Preview URL: %s', nodemailer.getTestMessageUrl(info));
          //cb(null, info)
          resolve(info.messageId);
        }
      });
  });

  const sendPayment = (msg) =>
    new Promise(resolve => {
      var url ='https://api.sandbox.midtrans.com/v2/charge';
  
      const username = 'SB-Mid-server-J6G2PGGFarKml8fnboq19jco';
      const password = ''; 
      
      var data = {
        "payment_type": "bank_transfer",
        "transaction_details": {
          "gross_amount": 50000,
          "order_id": uuid.v4()
        },
        "customer_details": {
          "email": msg+"@example.com",
          "first_name": "budi",
          "last_name": "utomo",
          "phone": "+6281 1234 1234"
        },
        "item_details": [
          {
            "id": "item01",
            "price": 25000,
            "quantity": 1,
            "name": "Ayam Zozozo"
          },
          {
            "id": "item02",
            "price": 25000,
            "quantity": 1,
            "name": "Ayam Xoxoxo"
          }
        ],
        "bank_transfer":{
          "bank": "bca",
          "va_number": parseInt(Math.floor(100000 + Math.random() * 9000))
        }
      }
      const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
      axios({
        method: 'post',
        url: url,
        responseType: 'json',
        data: data,
        headers: {
          'Authorization': `Basic ${token}`
        }
      })
      .then(function (response) {   
        console.log(response.data)
        resolve(response.data)
      });
  });
