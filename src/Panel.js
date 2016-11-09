import {Rectangle, Path} from './Shape';
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
		this.paths = [];
		this.activedShape = null;
		// 是否处于连线状态
		this.drawLine = false;
		this.shapeRule = {};
		
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
		this.shapeRule['Rectangle'] = Rectangle;
	}
	findActiveShape(mouseX, mouseY, callback) {
		let lastActivedShape = this.activedShape;
		// 检查上次选中的图形中是否选择连线结点
		if(lastActivedShape){
			// console.log(mouseX-this.offset.left, mouseY-this.offset.top);
			var dot = lastActivedShape.isPointInDots(mouseX-this.offset.left, mouseY-this.offset.top);
		}
		// console.log(dot)
		if(dot){
			callback && callback(this.activedShape, dot);
		}else{
			// 检查画布的图形上是否有落点
			for(var i=this.shapes.length-1;i>=0;i--){
				// 将鼠标位置转为相对画布的位置并判断落点
				if(this.shapes[i].isPointInPath(mouseX-this.offset.left, mouseY-this.offset.top)){
					this.activedShape = this.shapes[i];
					callback && callback(this.activedShape);
					break;
				}
			}
			if(i < 0){
				this.activedShape = null;
			}
			// 新选中了别的图形或者画布
			if(lastActivedShape && this.activedShape !== lastActivedShape){
				if(!this.activedShape){
					// 落在画布上

				}else{
					// 落在图形上
					lastActivedShape.setBorderColor();
					this.repaint();
				}
			}
		}
	}
	initEvents() {
		// 绑定画布的事件
		this.frontCanvas.oncontextmenu = (e)=>{
			e.preventDefault();
			let startX = e.pageX, startY = e.pageY;
			this.findActiveShape(startX, startY);
			this.menu.show({startX: startX, startY: startY});
			e.stopPropagation();
		};
		let onmousemove, path;
		this.frontCanvas.addEventListener('mousedown', (e)=>{
			// 避免鼠标超出边界后回来，事件没有注销
			onmousemove && this.frontCanvas.removeEventListener('mousemove', onmousemove);
			let startX = e.pageX, startY = e.pageY;
			this.menu.hide();
				// 由于层级覆盖，先检查上层的图形
			if(e.button === 0){
				this.findActiveShape(startX, startY, (activedShape, activedDot)=>{
					// console.log(activedShape, activedDot)
					onmousemove = (e)=>{
						if(this.drawLine && path){
							path.close({x: e.pageX- this.offset.left, y: e.pageY-this.offset.top});
							console.log(path)
							// path.draw();
						}else{
							this.activedShape.setPosition(e.pageX-startX, e.pageY-startY);
						}
						this.repaint();
					};
					// if(activedShape){
						if(activedDot){
							activedDot.setBackgroundColor('#f00');
							activedDot.draw({x: e.pageX- this.offset.left, y: e.pageY-this.offset.top});
							path = this.addPath(this.frontCtx, {x: e.pageX- this.offset.left, y: e.pageY-this.offset.top});
							path.close({x: e.pageX- this.offset.left, y: e.pageY-this.offset.top});
							// path = new Path(this.frontCtx, activedDot.center);
						}
						this.frontCanvas.addEventListener('mousemove', onmousemove);
					// }
				});
			}
		});
		this.frontCanvas.addEventListener('mouseup', (e)=>{
			this.frontCanvas.removeEventListener('mousemove', onmousemove);
			this.activedShape && this.activedShape.drop();

			this.drawLine = false;
			let startX = e.pageX, startY = e.pageY;
			this.findActiveShape(startX, startY, (activedShape)=>{
				if(activedShape){
					activedShape.setBorderColor('#f00');
					this.repaint();
				}
			});
		});
		this.frontCanvas.addEventListener('drop', (e)=>{
			e.preventDefault();
			this.addShape('Rectangle', {
				x: e.pageX-this.offset.left,
				y: e.pageY-this.offset.top,
				data: JSON.parse(e.dataTransfer.getData('data')),
				canvasContext: this.frontCtx
			});
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
		// 绘制图形
		for(let s of this.shapes){
			s.draw();
		}
		// 绘制路径
		for(let p of this.paths){
			p.draw();
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
	addShape(type, ...params) {
		console.log(this.shapeRule[type],params)
		let shape = Reflect.construct(this.shapeRule[type], params);
		this.shapes.push(shape);
		return shape;
	}
	addPath(...params) {
		console.log(Path,params)
		let path = Reflect.construct(Path, params);
		this.paths.push(path);
		return path;
	}
	hasShape() {
		return this.shapes.length > 0?true:false;
	}
	exportCanavsData() {
		let metaData = [];
		for(let s of this.shapes){
			metaData.push(s.exportMetaData());
		}
		return metaData;
	}
	importCanvasData(metaData) {
		for(var d of metaData){
			d['canvasContext'] = this.frontCtx;
			let rect = new Rectangle(d);
			this.shapes.push(rect);
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