const storage = 
[
	{
	  count: 5,
	  exchange: 'logs_with_ack_retry',
	  queue: 'logs_with_ack_queue',
	  reason: 'expired',
	  'routing-keys': [ '' ],
	  time: { '!': 'timestamp', value: 1592629763 }
	},
	{
	  count: 5,
	  exchange: 'logs_with_ack',
	  queue: 'logs_with_ack_created',
	  reason: 'rejected',
	  'routing-keys': [ '' ],
	  time: { '!': 'timestamp', value: 1592629758 }
	}
  ]
  [
	{
	  count: 4,
	  exchange: 'logs_with_ack_retry',
	  queue: 'logs_with_ack_queue',
	  reason: 'expired',
	  'routing-keys': [ '' ],
	  time: { '!': 'timestamp', value: 1592629795 }
	},
	{
	  count: 4,
	  exchange: 'logs_with_ack',
	  queue: 'logs_with_ack_created',
	  reason: 'rejected',
	  'routing-keys': [ '' ],
	  time: { '!': 'timestamp', value: 1592629790 }
	}
  ]
  [
	{
	  count: 4,
	  exchange: 'logs_with_ack_retry',
	  queue: 'logs_with_ack_queue',
	  reason: 'expired',
	  'routing-keys': [ '' ],
	  time: { '!': 'timestamp', value: 1592629795 }
	},
	{
	  count: 4,
	  exchange: 'logs_with_ack',
	  queue: 'logs_with_ack_created',
	  reason: 'rejected',
	  'routing-keys': [ '' ],
	  time: { '!': 'timestamp', value: 1592629790 }
	}
  ]

console.log( storage.length );