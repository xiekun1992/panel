class Shape {
	constructor({color = '#000', backgroundColor = '#fff', borderColor = '#000'}) {
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
	isPointInPath(x, y) {
		// x, y 为相对画布的位置
		// console.log(this.position.x, this.position.y, this.width, this.height)
		return this.position.x<=x && x<=(this.position.x+this.width) && this.position.y<=y && y<=(this.position.y+this.height)?true:false;
	}
}

export class Rectangle extends Shape {
	constructor({x = 10, y = 10, width = 80, height = 40, data, canvasContext, color, backgroundColor, borderColor}) {
		super({color, backgroundColor, borderColor});
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
		// this.ctx = canvasContext;
		this.setContext(canvasContext);
		this.draw();
	}
	setContext(ctx) {
		this.ctx = ctx;
		this.dots = [
			new Dot({x: this.position.x+this.width/2, y: this.position.y, canvasContext: this.ctx, borderColor: '#f00'}), // 上
			new Dot({x: this.position.x, y: this.position.y+this.height/2, canvasContext: this.ctx, borderColor: '#f00'}), // 右
			new Dot({x: this.position.x+this.width/2, y: this.position.y+this.height, canvasContext: this.ctx, borderColor: '#f00'}), // 下
			new Dot({x: this.position.x+this.width, y: this.position.y+this.height/2, canvasContext: this.ctx, borderColor: '#f00'})  // 左
		];
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
	drawDots() {
		this.dots[0].draw({x: this.position.x+this.width/2, y: this.position.y});
		this.dots[1].draw({x: this.position.x, y: this.position.y+this.height/2});
		this.dots[2].draw({x: this.position.x+this.width/2, y: this.position.y+this.height});
		this.dots[3].draw({x: this.position.x+this.width, y: this.position.y+this.height/2});
	}
	isPointInDots(x, y){
		// x, y 为相对画布的位置
		for(var d of this.dots){
			console.log(d.isPointInPath(x, y))
			if(d.isPointInPath(x, y)){
				return d;
			}
		}
	}
	exportMetaData() {
		return {x: this.position.x, y: this.position.y, width: this.width, height: this.height, data: this.data};
	}
}

class Dot extends Shape {
	constructor({x, y, width = 8, height = 8, canvasContext, color, backgroundColor, borderColor}) {
		super({color, backgroundColor, borderColor});
		this.position = {x: x - width/2, y: y - height/2};
		this.width = width;
		this.height = height;
		this.ctx = canvasContext;
		this.center = {x, y};
	}
	draw(position = {x: this.position.x, y: this.position.y}) {
		this.ctx.strokeStyle = this.borderColor;
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.rect(position.x - this.width/2, position.y - this.height/2, this.width, this.height);
		this.ctx.stroke();
		this.ctx.fill();
		this.position = {x: position.x - this.width/2, y: position.y - this.height/2};
	} 
}

class Line {
	constructor({x, y, canvasContext}) {
		this.start={x, y};
	}
}

export class Path {
	// lines为二元坐标的数组
	constructor(canvasContext, ...lines) {
		this.lines = lines;
		this.ctx = canvasContext;
	}
	begin({x, y}) {
		this.lines[0] = {x, y};
	}
	close({x, y}) {
		if(this.lines.length > 2){
			this.lines[this.lines.length-1] = {x, y};
		}else{
			this.lines.push({x, y});
		}
	}
	add({x, y}) {
		this.lines.push({x, y});
	}
	drawLine() {
		this.ctx.strokeStyle = '#000';
		this.ctx.lineWidth = 1;
		this.ctx.beginPath();
		this.ctx.moveTo(this.lines[0].x, this.lines[0].y);
		for(var l of this.lines.slice(1)){
			this.ctx.lineTo(l.x, l.y);
		}
		this.ctx.stroke();
		this.ctx.closePath();
	}
	// 绘制二阶贝塞尔曲线
	draw() {
		this.ctx.strokeStyle = '#555';
		this.ctx.lineWidth = 1;
		this.ctx.beginPath();
		this.ctx.moveTo(this.lines[0].x, this.lines[0].y);
		this.ctx.quadraticCurveTo(this.lines[this.lines.length-1].x, this.lines[0].y, this.lines[this.lines.length-1].x, this.lines[this.lines.length-1].y);
		this.ctx.stroke();
		this.ctx.closePath();
	}
}