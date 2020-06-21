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
		var exchange = 'latihan_retry';
		var exchange_created = 'latihan_retry_created'; 
		var exchange_retry = 'latihan_retry_retry'; 
		var exchange_wait_queue = 'latihan_retry_queue';

		function buildTopology(exchange, exchange_created, exchange_retry, exchange_wait_queue) {
			channel.assertExchange(exchange, 'fanout', {
				durable: false
			});		 
			channel.assertQueue(exchange_created, {
				durable: true,
				persistent: true
			});
			channel.assertExchange(exchange_retry, 'fanout', {
				durable: false
			});
			channel.assertQueue(exchange_wait_queue, {
				durable: true,
				persistent: true,
				arguments: { "x-dead-letter-exchange": "latihan_retry_retry_2"}
			});
			
			var exchange_retry2 = 'latihan_retry_retry_2'; 
			channel.assertExchange(exchange_retry2, 'fanout', {
				durable: false
			}); 

			//channel.prefetch(10)
			channel.bindQueue(exchange_wait_queue, exchange_retry, '');
			channel.bindQueue(exchange_created, exchange, '');
			channel.bindQueue(exchange_created, exchange_retry2, '');
		}
		
		function subscribed(exchange_created, exchange_retry) {
			console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", exchange_created);
			channel.consume(exchange_created, function(msg) {
				var secs = msg.content.toString().split('.').length - 1;
				var countDelivery = msg.fields['deliveryTag']; 
				const headers = msg.properties.headers || {};
				const retryCount = ( headers[ "x-retries" ] || 0 );
				console.log(" [x] Received meesage: retry Count %s"+ retryCount, msg.content.toString());
				channel.ack(msg);
				if(retryCount < 3 ) { 
					var retry_delay = 3000 * (retryCount + 1)
					console.log(" [x] publishing to retry exchange with " + retry_delay );
					
					var msg_publish_retry = process.argv.slice(2).join(' ') || msg.content.toString();
					channel.publish(exchange_retry, '', Buffer.from(msg_publish_retry), {
						expiration: retry_delay,
						headers: { "x-retries": retryCount + 1 }
					}); 
		  
				} else {
					console.log(" [x] MAximal %s"); 
				}
	
			}, {
				noAck: false
			});
		}

		function publish(exchange) {
			var msg_publish = process.argv.slice(2).join(' ') || 'Hello World!';
			channel.publish(exchange, '', Buffer.from(msg_publish), {
				persistent: true
			});
		}

		buildTopology( exchange, exchange_created, exchange_retry, exchange_wait_queue );
		subscribed( exchange_created, exchange_retry );
		publish( exchange );

	});
	
	setTimeout(function() {
        connection.close();
        process.exit(0);
	}, 21000);

});

