import Panel from './Panel';

new Panel({
	container: '#panel',
	width: 800,
	height: 400,
	menuOption: [
		{text: '导出元数据', cb: (panel)=>{
			console.log(JSON.stringify(panel.exportCanavsData()));
		}, type: 0},
		{text: '导入元数据', cb: (panel)=>{
			let data = {"shapes":[{"id":1,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Rectangle","position":{"x":295,"y":192},"width":80,"height":40,"data":{"text":"公司1","properties":{"节点属性1":"one","节点属性2":"two","节点属性3":"three"}},"font":{"size":18,"family":"Helvetica"}},{"id":2,"color":"#000000","backgroundColor":"#00ff00","borderColor":"#000000","shape":"Rectangle","position":{"x":521,"y":128},"width":80,"height":40,"data":{"text":"example#2","properties":{"节点属性1":"one","节点属性2":"two","节点属性3":"three"}},"font":{"size":18,"family":"Helvetica"}},{"id":3,"color":"#408080","backgroundColor":"#8080ff","borderColor":"#000000","shape":"Rectangle","position":{"x":263,"y":61},"width":80,"height":40,"data":{"text":"公司3","properties":{"节点属性1":"one","节点属性2":"two","节点属性3":"three"}},"font":{"size":18,"family":"Helvetica"}},{"id":4,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Rectangle","position":{"x":503,"y":289},"width":80,"height":40,"data":{"text":"公司1","properties":{"节点属性1":"one","节点属性2":"two","节点属性3":"three"}},"font":{"size":18,"family":"Helvetica"}},{"id":5,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Rectangle","position":{"x":86,"y":223},"width":80,"height":40,"data":{"text":"公司3","properties":{"节点属性1":"one","节点属性2":"two","节点属性3":"three"}},"font":{"size":18,"family":"Helvetica"}},{"id":11,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Rectangle","position":{"x":359,"y":289},"width":80,"height":40,"data":{"text":"公司2","properties":{"节点属性1":"one","节点属性2":"two","节点属性3":"three"}},"font":{"size":18,"family":"Helvetica"}},{"id":12,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Rectangle","position":{"x":614,"y":252},"width":80,"height":40,"data":{"text":"公司1","properties":{"节点属性1":"one","节点属性2":"two","节点属性3":"three"}},"font":{"size":18,"family":"Helvetica"}},{"id":15,"color":"#ff8000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Rectangle","position":{"x":120,"y":293},"width":80,"height":40,"data":{"text":"test re-edit","properties":{"节点属性1":"one","节点属性2":"two","节点属性3":"three"}},"font":{"size":"14","family":"Helvetica"}}],"lines":[{"id":6,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Line","startShapeId":3,"endShapeId":2,"startDot":2,"endDot":0,"pathParams":[{"x":303,"y":101},{"x":230,"y":133},{"x":561,"y":128}]},{"id":7,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Line","startShapeId":3,"endShapeId":5,"startDot":3,"endDot":1,"pathParams":[{"x":263,"y":81},{"x":191,"y":114},{"x":166,"y":243}]},{"id":8,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Line","startShapeId":3,"endShapeId":1,"startDot":2,"endDot":0,"pathParams":[{"x":303,"y":101},{"x":232,"y":136},{"x":335,"y":192}]},{"id":9,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Line","startShapeId":3,"endShapeId":2,"startDot":2,"endDot":3,"pathParams":[{"x":303,"y":101},{"x":230,"y":136},{"x":521,"y":148}]},{"id":10,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Line","startShapeId":3,"endShapeId":4,"startDot":2,"endDot":3,"pathParams":[{"x":303,"y":101},{"x":227,"y":135},{"x":503,"y":309}]},{"id":13,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Line","startShapeId":11,"endShapeId":1,"startDot":0,"endDot":2,"pathParams":[{"x":399,"y":289},{"x":144,"y":302},{"x":335,"y":232}]},{"id":14,"color":"#000000","backgroundColor":"#ffffff","borderColor":"#000000","shape":"Line","startShapeId":12,"endShapeId":2,"startDot":0,"endDot":2,"pathParams":[{"x":654,"y":252},{"x":491,"y":260},{"x":561,"y":168}]}]};
			panel.importCanvasData(data);
		}, type: 0},
		{text: '修改', cb: (panel, activeShape)=>{
					// console.log(activeShape)
			// 图形修改框
			let alterModalBg = document.querySelector("#xpanelMenuAlter");
			if(alterModalBg){
				alterModalBg.style.display="block";
			}else{
				alterModalBg = document.createElement('div');
				alterModalBg.classList.add('xpanel-saveimage-bg');
				alterModalBg.setAttribute('id','xpanelMenuAlter');
				document.body.appendChild(alterModalBg);
			}
			alterModalBg.innerHTML=`
			<div class="xpanel-menu-alter">
				<h4>图形属性修改</h4>
				<div>
					<span>显示文本</span><input type="text" value="${activeShape.text}" name="text">
				</div>
				<div>
					<span>字体大小</span><input type="range" value="${activeShape.font.size}" onchange="this.nextSibling.innerHTML=this.value+'px'" name="font.size" min="14" max="20" step="1"><small style="vertical-align: super;">${activeShape.font.size}px</small>
				</div>
				<div>
					<span>背景颜色</span><input type="color" value="${activeShape.backgroundColor}" name="backgroundColor">
				</div>
				<div>
					<span>前景颜色</span><input type="color" value="${activeShape.color}" name="color">
				</div>
				<div>
					<button id="confirmAlter">确定</button>
					<button onclick="this.parentNode.parentNode.parentNode.style.display='none'">取消</button>
				</div>
			</div>
			`;

			document.querySelector("#confirmAlter").onclick=function (){
				var inputs = document.querySelectorAll("#xpanelMenuAlter input");
				for(var i of inputs){
					let name = i.getAttribute('name');
					let path = name.split('.'), propertyPath='activeShape';
					for(var p of path){
						propertyPath+=`['${p}']`;
					}
					// console.log(propertyPath)
					eval('('+propertyPath+'=i.value)');
				}
				activeShape.draw();
				document.querySelector("#xpanelMenuAlter").style.display='none';
			}
			// console.log(activeShape)
		}, type: 1}
	]
});