#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'payments_created3';
        channel.assertExchange(exchange, 'fanout', {
            durable: false
        });
        channel.assertQueue(exchange, {
          durable: true,
          persistent: true
        });
        channel.consume(exchange, function(msg) { 
          var secs = msg.content.toString().split('.').length - 1;
          console.log(" [x] Received %s", msg.content.toString());
          setTimeout(function() {
              // update DB (msg)
              console.log(" [x] Done");
              channel.ack(msg);
          }, secs * 1000);

        }, {
            noAck: false
        });        
    });
});
