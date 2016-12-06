import {Rectangle, Line} from './Shape';
import Menu from './Menu';
// 产生每个图形的id
let incrementalId=1;

export default class Panel {
	constructor({container, width = 400, height = 400, menuOption}) {
		if(typeof container !== 'string' && container.charAt(0) !== '#'){
			throw new Error(`Panel constructor require an id like #panel to be initialized.`);
		}
		this.container = document.querySelector(container);
		if(!this.container){
			throw new Error(`invalid parameter ${container}.`);	
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
		// 连线选中的图形上的点
		this.dotInfo = null;
		this.activedShape = null;
		// 是否处于连线状态
		this.drawLine = false;
		// 是否处于局部/整体拖动状态
		this.move = false;
		// 新建路径的起点图形
		this.pathStart = {shape: null, direction: null};
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
		this.shapeRule['Line'] = Line;
	}
	// 查找激活的连线
	findActiveLine(mouseX, mouseY, callback) {
		let pointInCanvasLeft = mouseX-this.offset.left,
			pointInCanvasTop = mouseY-this.offset.top;
		// 筛选出鼠标所在连线起点与终点确定的矩形区域并根据公式计算出点是否在线条附近
		for(var p of this.paths){
			// 起点在终点左边或右边的与上边或下边情况
			// if(pointInCanvasLeft>p.path.lines[0].x && pointInCanvasLeft<p.path.lines[p.path.lines.length-1].x 
			   // && pointInCanvasTop)
		}
		// console.log(this.paths);
	}
	findActiveShape(mouseX, mouseY, callback) {
		let lastActivedShape = this.activedShape;
		this.dotInfo = null;
		// 检查上次选中的图形中是否选择连线结点
		if(lastActivedShape){
			// console.log(mouseX-this.offset.left, mouseY-this.offset.top);
			this.dotInfo = lastActivedShape.isPointInDots(mouseX-this.offset.left, mouseY-this.offset.top);
		}
		// console.log(dot)
		if(this.dotInfo){
			// 被选中的点所在图形的位置
			this.pathStart.direction = this.dotInfo.direction;
			callback && callback(this.activedShape, this.dotInfo.dot);
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
				callback && callback();
			}
			// 新选中了别的图形或者画布
			if(lastActivedShape && this.activedShape !== lastActivedShape){
				lastActivedShape.setBorderColor();
				this.repaint();
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
		let onmousemove, relation = {};
		this.frontCanvas.addEventListener('mousedown', (e)=>{
			// 避免鼠标超出边界后回来，事件没有注销
			onmousemove && this.frontCanvas.removeEventListener('mousemove', onmousemove);
			let startX = e.pageX, startY = e.pageY;
			this.menu.hide();
				// 由于层级覆盖，先检查上层的图形
			if(e.button === 0){ // 鼠标左键
				this.findActiveShape(startX, startY, (activedShape, activedDot)=>{
					if(!activedShape){
						// 全局拖动
						onmousemove= (e)=>{
							this.move=true;
							this.repaint(e.pageX-startX, e.pageY-startY);	
						};
					}else{
						onmousemove = (e)=>{
							if(this.drawLine && relation.path){
								// 连线的末端点移动
								relation.path.close({x: e.pageX- this.offset.left, y: e.pageY-this.offset.top});
							}else{
								this.activedShape && this.activedShape.setPosition(e.pageX-startX, e.pageY-startY);
							}
							this.repaint();
							if(this.drawLine){
								// 仅在连线的时候检测鼠标移动过程中碰到的图形和点，防止因鼠标移动导致activeShape被替换
								this.findActiveShape(e.pageX, e.pageY, (activedShape, activedDot)=>{
									// 在连线的过程中碰到了图形，则显示连接点
									if(activedShape){
										activedShape.drawDots();
										relation.endShapeId = activedShape.id;
									}
									if(activedDot){
										// 检查连接点是否在该图形内
										// 确定该点的位置(小于0为未找到 or 大于0为找到)，创建连线
										relation.endDot = activedShape.findDot(activedDot);
									}
								});
							}else{
								// 非连线状态
								if(activedShape){
									// 重新定位连线结点并绘制
									activedShape.drawDots();
								}
							}
						};
					}
					if(this.drawLine && activedDot){
						// 绘制连接点标亮的状态
						activedDot.setBackgroundColor('#ff0000');
						activedDot.draw({x: activedDot.position.x+activedDot.width/2, y: activedDot.position.y+activedDot.height/2});

						relation = this.addPath({x: e.pageX- this.offset.left, y: e.pageY-this.offset.top});
					}

					this.frontCanvas.addEventListener('mousemove', onmousemove);

				});
				this.findActiveLine(startX, startY, (activeLine)=>{
					// console.log(activeLine)
				});
			}
		});
		this.frontCanvas.addEventListener('mouseup', (e)=>{
			this.frontCanvas.removeEventListener('mousemove', onmousemove);
			this.activedShape && this.activedShape.drop();

			// 处于连线状态
			this.drawLine = false;
			// 处于移动图形状态
			if(this.move){
				for(let s of this.shapes){
					s.drop();
				}
				this.move = false;
			}
			this.pathStart = {};
			if(relation.path && relation.endDot < 0){
				this.deletePath(relation);
			}
			relation = {};
			this.frontCanvas.style.cursor='default';
			let startX = e.pageX, startY = e.pageY;
			this.findActiveShape(startX, startY, (activedShape)=>{
				if(activedShape){
					activedShape.setBorderColor('#ff0000');
				}
				this.repaint();
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
		this.bgCtx.strokeStyle='#555555';
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
	// x,y为鼠标移动值
	repaint(x = 0,y = 0) {
		console.log(x,y)
		this.frontCtx.clearRect(0, 0, this.width, this.height);
		// 绘制图形
		for(let s of this.shapes){
			if(this.move){
				s.setPosition(x, y);
			}
			s.draw();
		}
		// 绘制路径
		for(var r of this.paths){
			if(r.startShapeId && r.endShapeId){
				let sdot,edot;
				for(let s of this.shapes){
					if(s.id===r.startShapeId){
						sdot = s.findDotByIndex(r.startDot);
					}
					if(s.id===r.endShapeId){
						edot = s.findDotByIndex(r.endDot);
					}
				}
				if(sdot && edot){
					let pathStart = {x: sdot.position.x, y: sdot.position.y},
						pathEnd = {x: edot.position.x, y: edot.position.y};
					if(this.move){
						pathStart.x+=x;
						pathStart.y+=y;

						pathEnd.x+=x;
						pathEnd.y+=y;
					}
					r.path.begin(pathStart);
					r.path.close(pathEnd);
					r.path.draw();
				}
			}
			
		}
	}
	deleteShape(shape) {
		// 删除图形及其相关的连线
		for(var i=0;i<this.shapes.length;i++){
			if(shape.id === this.shapes[i].id){
				this.shapes.splice(i,1);
				// splice会改变数组长度，从后往前删除不会受长度变化影响
				for(let j=this.paths.length-1;j>-1;j--){
					if(this.paths[j] && (this.paths[j].startShapeId===shape.id || this.paths[j].endShapeId===shape.id)){
						this.deletePath(this.paths[j]);
					}
				}
				this.repaint();
			}
		}
	}
	addShape(type, ...params) {
		if(!params[0].id){
			params[0].id=incrementalId++;
		}
		let shape = Reflect.construct(this.shapeRule[type], params);
		this.shapes.push(shape);
		return shape;
	}
	addPath(...params) {		
		// 记录连线的关系，所连图形的
		let relation = new Line({
			id: incrementalId++,
			canvasContext: this.frontCtx,
			startShapeId: this.pathStart.shape.id,
			endShapeId: null,
			pathParams: params,
			startDot: this.dotInfo.direction,
			endDot: -1 // 默认无连接点
		});
		this.paths.push(relation);
		return relation;
	}
	deletePath(relation) {
		this.paths.splice(this.paths.indexOf(relation), 1);
	}
	hasShape() {
		return this.shapes.length > 0?true:false;
	}
	exportCanavsData() {
		let metaData = {
			shapes:[],
			lines:[]
		};
		// 导出图形
		for(let s of this.shapes){
			metaData.shapes.push(s.exportMetaData());
		}
		// 导出连线
		for(let p of this.paths){
			metaData.lines.push(p.exportMetaData());
		}
		return metaData;
	}
	importCanvasData(metaData) {
		this.reset();
		// 记录导入数据后的id值
		let finalId=0;
		// 导入图形
		for(let s of metaData.shapes){
			s['canvasContext'] = this.frontCtx;
			s.x=s.position.x+s.width/2;
			s.y=s.position.y+s.height/2;
			if(s.id > finalId){
				finalId=s.id;
			}
			this.addShape(s.shape, s);
		}
		// 导入连线
		for(let l of metaData.lines){
			l['canvasContext'] = this.frontCtx;
			if(l.id > finalId){
				finalId=l.id;
			}
			let line = Reflect.construct(this.shapeRule[l.shape], [l]);
			this.paths.push(line);
		}
		this.repaint();
		// 确定下次的id起始值
		incrementalId = finalId+1;
	}
	reset() {
		this.frontCtx.clearRect(0, 0, this.width, this.height);
		this.shapes=[];
		this.paths=[];
		incrementalId=1;
	}
	saveAsImage() {
		let tmpCanvas = document.createElement('canvas');
		tmpCanvas.width=this.frontCanvas.width;
		tmpCanvas.height=this.frontCanvas.height;
		let tmpCtx = tmpCanvas.getContext('2d');

		tmpCtx.fillStyle = '#ffffff';
		tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
		for(var s of this.shapes){
			s.draw(tmpCtx);
		}
		for(let p of this.paths){
			p.path.draw(tmpCtx);
		}

		let image = new Image();
		image.src = tmpCanvas.toDataURL('image/png');
		return image;
	}
}