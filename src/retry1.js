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
		var exchange = 'logs_with_ack';
		var exchange_created = 'logs_with_ack_created'; 
        channel.assertExchange(exchange, 'fanout', {
            durable: false
		});		 
		channel.assertQueue(exchange_created, {
			durable: true,
			persistent: true,
			arguments: { "x-dead-letter-exchange": "logs_with_ack_retry" }
		});
 
		var exchange_retry = 'logs_with_ack_retry'; 
		var exchange_wait_queue = 'logs_with_ack_queue';
        channel.assertExchange(exchange_retry, 'fanout', {
            durable: false
		});
		channel.assertQueue(exchange_wait_queue, {
			durable: true,
			persistent: true,
			arguments: { "x-message-ttl": 5000, "x-dead-letter-exchange": "logs_with_ack_retry_2"}
		});
		
		var exchange_retry2 = 'logs_with_ack_retry_2'; 
        channel.assertExchange(exchange_retry2, 'fanout', {
            durable: false
		});
		/*channel.assertQueue(exchange_retry2, {
			durable: true,
			persistent: true
		});*/

		//channel.prefetch(10);
		channel.bindQueue(exchange_wait_queue, exchange_retry, '');
		channel.bindQueue(exchange_created, exchange, '');
		channel.bindQueue(exchange_created, exchange_retry2, '');

		console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", exchange_created);
		
        channel.consume(exchange_created, function(msg) {
            var secs = msg.content.toString().split('.').length - 1;
			//var count = (msg.properties['headers']);
			var countDelivery = msg.fields['deliveryTag'];
			//channel.reject(msg);
			//console.log(" [x] Received acking %s"+ countDelivery, msg.content.toString());
			//channel.ack(msg);
			
			const headers = msg.properties.headers || {};
			const retryCount = ( headers[ "x-retries" ] || 0 ) + 1;
			const count_real =  headers["x-death"];

			if(countDelivery <= 3 ) { 
				console.log(" Reject" + countDelivery);
				channel.reject(msg, false); 
			} else {
				console.log(" [x] Received acking %s"+ countDelivery, msg.content.toString());
				channel.ack(msg);
			}

        }, {
            noAck: false
		});

		var msg_publish = process.argv.slice(2).join(' ') || 'Hello World!';
		channel.publish(exchange, '', Buffer.from(msg_publish), {
			persistent: true
		}); 
	
	});
	
	setTimeout(function() {
        connection.close();
        process.exit(0);
	}, 21000);
});

