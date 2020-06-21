#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
const fetch = require('node-fetch');

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'logs_with_ack';
        
        channel.assertExchange(exchange, 'fanout', {
            durable: false
        });
		
		var i =0;
		setInterval(function(){ 
			/*
			(async () => { 
				const response = await fetch('http://wordpress.local/wp-json/wp/v2/posts', {
					method: 'get',
					//body: JSON.stringify(body),
					headers: {'Content-Type': 'application/json'}
				});
				const json = await response.json();
	
				const results = json.map(x=>{
					return x.id.toString()
				})
				
				if(results.length > 0) {
					channel.publish(exchange, '', Buffer.from(results));
					console.log(results);
				} else {
					console.log(results);
				}
			})();
			*/
			var msg = process.argv.slice(2).join(' ') || 'Hello World!';
			channel.publish(exchange, '', Buffer.from(msg), {
				persistent: true
			});
			console.log(" [x] Sent %s", msg);
			i++;
			
		}, 2000);
	
    });

    setTimeout(function() {
        connection.close();
        process.exit(0);
	}, 21000);
	
});
