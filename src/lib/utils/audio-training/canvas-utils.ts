export class CanvasUtils {
	static drawGrid(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		gridColor: string = '#374151'
	): void {
		ctx.strokeStyle = gridColor;
		ctx.lineWidth = 1;

		// Horizontal lines
		for (let y = 0; y <= height; y += height / 10) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}

		// Vertical lines
		for (let x = 0; x <= width; x += width / 10) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
	}

	static drawBackground(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		bgColor: string = '#1f2937'
	): void {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, width, height);
	}

	static drawTooltip(
		ctx: CanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		maxWidth: number
	): void {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		ctx.font = 'bold 14px Inter, sans-serif';
		const textWidth = ctx.measureText(text).width;
		const padding = 8;
		const textHeight = 16;

		// Adjust position to keep tooltip within bounds
		let tooltipX = x + 10;
		let tooltipY = y - 10;

		if (tooltipX + textWidth + padding * 2 > maxWidth) {
			tooltipX = x - textWidth - padding * 2 - 10;
		}
		if (tooltipY - textHeight - padding < 0) {
			tooltipY = y + textHeight + padding + 10;
		}

		// Draw background
		ctx.fillRect(
			tooltipX - padding,
			tooltipY - textHeight - padding / 2,
			textWidth + padding * 2,
			textHeight + padding
		);

		// Draw text
		ctx.fillStyle = '#10b981';
		ctx.textAlign = 'left';
		ctx.fillText(text, tooltipX, tooltipY - padding / 2);
	}
}
