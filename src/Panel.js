import {Rectangle} from './Shape';
import Menu from './Menu';

export default class Panel {
	constructor({container, width = 400, height = 400, menuOption}) {
		if(typeof container !== 'string' && container.charAt(0) !== '#'){
			throw new Error('Panel constructor require an id like `#panel` to be initialized.');
		}
		this.container = document.querySelector(container);
		if(!this.container){
			throw new Error('invalid parameter `' + container + '`');	
		}

		this.frontCanvas = document.createElement('canvas');
	  this.bgCanvas = document.createElement('canvas');
	  this.menu = new Menu(this, menuOption);
	  this.width = width;
	  this.height = height;

		this.bgCanvas.width = this.frontCanvas.width = this.width;
		this.bgCanvas.height = this.frontCanvas.height = this.height;
		this.container.classList.add('xpanel');
		this.frontCanvas.classList.add('xpanel-front');
		this.bgCanvas.classList.add('xpanel-background');

		this.shapes = [];
		this.activedShape = null;
		
		// 添加到dom
		this.container.appendChild(this.frontCanvas);
		this.container.appendChild(this.bgCanvas);
		this.container.appendChild(this.menu.element);
		// 存储画布的offset用于确定图形在画布中的相对位置
		this.offset = {left: 0,top: 0};

		this.frontCtx = this.frontCanvas.getContext('2d');
		this.bgCtx = this.bgCanvas.getContext('2d');

		this.offset = this.countOffset(this.frontCanvas);
		// console.log(this.offset);
		this.initEvents();
		this.initBackground();
	}
	initEvents() {
		// 绑定画布的事件
		this.frontCanvas.oncontextmenu = (e)=>{
			e.preventDefault();
			let startX = e.pageX, startY = e.pageY;
			for(var i=this.shapes.length-1;i>=0;i--){
				// 将鼠标位置转为相对画布的位置并判断落点
				if(this.shapes[i].isPointInPath(startX-this.offset.left, startY-this.offset.top)){
					this.activedShape = this.shapes[i];
					break;
				}
			}
			if(i < 0){
				this.activedShape = null;
			}
			this.menu.show({startX: startX, startY: startY});
			e.stopPropagation();
		};
		this.frontCanvas.addEventListener('mousedown', (e)=>{
			let startX = e.pageX, startY = e.pageY;
			// console.log(startX,startY)
			this.menu.hide();
				// 由于层级覆盖，先检查上层的图形
			if(e.button === 0){
				for(var i=this.shapes.length-1;i>=0;i--){
					if(this.shapes[i].isPointInPath(startX-this.offset.left, startY-this.offset.top)){
						this.activedShape = this.shapes[i];
						let onmousemove = (e)=>{
							this.activedShape.setPosition(e.pageX-startX, e.pageY-startY);
							this.repaint();
						};
						this.frontCanvas.addEventListener('mousemove', onmousemove);

						this.frontCanvas.addEventListener('mouseup', (e)=>{
							this.frontCanvas.removeEventListener('mousemove', onmousemove);
							this.activedShape && this.activedShape.drop();
						});
						break;
					}
				}
			}
		});
		this.frontCanvas.addEventListener('drop', (e)=>{
			e.preventDefault();
			console.log(e.pageX,e.pageY)
			let rect = this.addShape({
				mouseX: e.pageX-this.offset.left,
				mouseY: e.pageY-this.offset.top,
				data: JSON.parse(e.dataTransfer.getData('data')),
				ctx: this.frontCtx
			});
			this.shapes.push(rect);
		});
		this.frontCanvas.addEventListener('dragover', (e)=>{
			e.preventDefault();
		});
	}
	initBackground() {
		// 绘制背景网格线
		const GRID_INTERVAL = 10, 
					GRIDROWS = this.bgCanvas.height / GRID_INTERVAL, 
					GRIDCOLS = this.bgCanvas.width / GRID_INTERVAL;

		this.bgCtx.lineWidth=0.2;
		this.bgCtx.strokeStyle='#555';
		this.bgCtx.moveTo(0, 0);
		for(var i=1;i<GRIDROWS;i++){
			this.bgCtx.beginPath();
			this.bgCtx.moveTo(0, i*GRID_INTERVAL);
			this.bgCtx.lineTo(this.bgCanvas.width, i*GRID_INTERVAL);
			this.bgCtx.stroke();
			this.bgCtx.closePath();
		}
		this.bgCtx.moveTo(0, 0);
		for(var i=1;i<GRIDCOLS;i++){
			this.bgCtx.beginPath();
			this.bgCtx.moveTo(i*GRID_INTERVAL, 0);
			this.bgCtx.lineTo(i*GRID_INTERVAL, this.bgCanvas.height);
			this.bgCtx.stroke();
			this.bgCtx.closePath();
		}

	}
	countOffset(DOMElement) {
		if(DOMElement.offsetParent){
			var {left, top} = this.countOffset(DOMElement.offsetParent);
		}
		left = left || 0;
		top = top || 0;
		left += DOMElement.offsetLeft;
		top += DOMElement.offsetTop;
		return {left: left, top: top};
	}
	repaint() {
		this.frontCtx.clearRect(0, 0, this.width, this.height);
		for(var s of this.shapes){
			s.draw();
		}
	}
	deleteShape(shape) {
		for(var i=0;i<this.shapes.length;i++){
			if(shape === this.shapes[i]){
				this.shapes.splice(i,1);
				this.repaint();
			}
		}
	}
	addShape({mouseX, mouseY, width, height, data, ctx}) {
		return new Rectangle(
				mouseX,
				mouseY,
				width, 
				height, 
				data,
				ctx
			);
	}
	hasShape() {
		return this.shapes.length > 0?true:false;
	}
	extractShapes() {

	}
	exportCanavsData() {
		let metaData = [];
		for(let s of this.shapes){
			metaData.push(s.exportMetaData());
		}
		console.log(metaData)
		return metaData;
	}
	importCanvasData(context = this.frontCtx, metaData) {
		for(var d of metaData){
			let rect = new Rectangle(d);
			rect.setContext(context);
			rect.draw();
		}
	}
	saveAsImage() {
		let tmpCanvas = document.createElement('canvas');
		tmpCanvas.width=this.frontCanvas.width;
		tmpCanvas.height=this.frontCanvas.height;
		let tmpCtx = tmpCanvas.getContext('2d');

		tmpCtx.fillStyle = '#fff';
		tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
		for(var s of this.shapes){
			s.draw(tmpCtx);
		}

		let image = new Image();
		image.src = tmpCanvas.toDataURL('image/png');
		return image;
	}
}
// 观察者模式
// class EventHandler {
// 	constructor() {
// 		this.events = {};
// 	}
// 	publish(eventName, ...data) {
// 		for(var e of this.events[eventName]){
// 			e.apply(null, data);
// 		}
// 	}
// 	subscribe({eventName, callback}) {
// 		!this.events[eventName] && (this.events[eventName] = []);
// 		this.events[eventName].push(callback);
// 		return this;
// 	}
// }

// const eventHandler = new EventHandler();