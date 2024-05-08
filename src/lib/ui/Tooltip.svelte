<!-- Tooltip.svelte -->
<script>
	export let text;
</script>

<div class="tooltip">
	<span class="tooltiptext">{text}</span>
</div>

<style>
	.tooltip {
		position: relative;
		display: inline-block;
		cursor: help;
	}

	.tooltiptext {
		visibility: hidden;
		width: max-content;
		background-color: #333;
		color: #fff;
		text-align: center;
		border-radius: 6px;
		padding: 5px;
		position: absolute;
		z-index: 1;
		bottom: 125%;
		left: 50%;
		transform: translateX(-50%);
		opacity: 0;
		transition: opacity 0.3s;
	}

	.tooltip:hover .tooltiptext {
		visibility: visible;
		opacity: 1;
	}
</style>
