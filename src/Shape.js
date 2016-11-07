class Shape {
	constructor(color = '#000', backgroundColor = '#fff') {
		this.color = color;
		this.backgroundColor = backgroundColor;
	}
	setColor(color) {
		this.color = color;
	}
	setBackgroundColor(color) {
		this.backgroundColor = color;
	}
}

export class Rectangle extends Shape {
	constructor(x = 10, y = 10, width = 80, height = 40, data, canvasContext) {
		super();
		this.width = width;
		this.height = height;
		this.position = {x: x-width/2, y: y-height/2, originX: x-width/2, originY: y-height/2};
		this.data = data;
		this.text = this.data.text || '';
		this.font = {
			size: 18,
			family: 'Helvetica',
			toString() {
				return this.size+'px "'+this.family+'"';
			}
		};
		this.ctx = canvasContext;
		this.draw();
	}
	setContext(ctx) {
		this.ctx = ctx;
	}
	setPosition(x, y) {
		this.position.x = this.position.originX + x;
		this.position.y = this.position.originY + y;
	}
	drop() {
		this.position.originX = this.position.x;
		this.position.originY = this.position.y;
	}
	draw(ctx = this.ctx) {
		ctx.beginPath();
		ctx.fillStyle = this.backgroundColor;
		ctx.strokeStyle = this.color;
		ctx.textAlign='center';
		ctx.font=this.font.toString();
		ctx.textBaseline='middle';
		ctx.shadowBlur=10;
		ctx.shadowColor='#bbb';
		ctx.lineWidth=1;

		ctx.rect(this.position.x, this.position.y, this.width, this.height);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle=this.color;
		ctx.fillText(this.text, this.position.x+this.width/2, this.position.y+this.height/2);
		ctx.shadowBlur=0;
		ctx.closePath();
	}
	isPointInPath(x, y) {
		return this.position.x<x && x<this.position.x+this.width && this.position.y<y && y<this.position.y+this.height;
	}
	exportMetaData() {
		return {x: this.position.x, y: this.position.y, width: this.width, height: this.height, data: this.data};
	}
}

class Line extends Shape {

}