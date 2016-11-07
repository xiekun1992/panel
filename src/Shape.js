class Shape {
	constructor(color = '#000', backgroundColor = '#fff', borderColor = '#000') {
		this.color = color;
		this.backgroundColor = backgroundColor;
		this.borderColor = borderColor;
	}
	setColor(color = '#000') {
		this.color = color;
	}
	setBackgroundColor(color = '#fff') {
		this.backgroundColor = color;
	}
	setBorderColor(color = '#000') {
		this.borderColor = color;
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
	clear() {
		this.ctx.clearRect(this.position.x-1, this.position.y-1, this.width+2, this.height+2);
	}
	draw(ctx = this.ctx) {
		ctx.beginPath();
		ctx.fillStyle = this.backgroundColor;
		ctx.textAlign='center';
		ctx.font=this.font.toString();
		ctx.textBaseline='middle';
		// ctx.shadowBlur=2;
		// ctx.shadowColor=this.borderColor || '#bbb';
		ctx.lineWidth=1;

		ctx.strokeStyle = this.color;
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
		// ctx.fill();
		// ctx.stroke();
		ctx.strokeStyle = this.borderColor;
		ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
		ctx.shadowBlur=0;
		ctx.fillStyle=this.color;
		ctx.fillText(this.text, this.position.x+this.width/2, this.position.y+this.height/2);
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