const signer = createDataItemSigner(window.arweaveWallet);

const process = await ao.spawn({
	module: 'SBNb1qPQ1TDwpD_mboxm2YllmMLXpWw4U8P9Ff8W9vk',
	scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
	signer,

	// -- configure cron
	tags: [
		{ name: 'Cron-Interval', value: '1-minute' },
		{ name: 'Cron-Tag-Action', value: 'TriggerSwap' }
	]
});

// Turn on monitoring to activate cron triggering
await monitor({
	process,
	signer
});

// lua code
// Handlers.add(
// 	"triggerSwap",
// 	function(msg)
// 		-- ensure only authentic cron ticks are matched
// 		return Handlers.utils.hasMatchingTag("Action", "TriggerSwap")(msg)
// 			and msg.Cron
// 	end,
// 	function(msg)
// 	  -- ... perform swap
// 	end
//   )
