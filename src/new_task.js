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
		var queue = 'task_queue';
		
		
        channel.assertQueue(queue, {
            durable: true
        });
		
		var i =0;
		setInterval(function(){ 
			var msg = process.argv.slice(2).join(' ') || "Hello World!"+ i;
			channel.sendToQueue(queue, Buffer.from(msg), {
				persistent: true
			});
			console.log(" [x] Sent '%s'", msg);
			i++
		}, 3000);
		
		
	});
	
    /*setTimeout(function() {
        connection.close();
        process.exit(0);
	}, 500); */
	
});
