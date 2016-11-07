import Panel from './Panel';

new Panel({
	container: '#panel',
	width: 800,
	height: 400,
	menuOption: [
		{text: '导出元数据', cb: (panel)=>{
			console.log(panel.exportCanavsData());
		}, type: 0},
		{text: '导入元数据', cb: (panel)=>{

		}, type: 0}
	]
});