let path = require('path');

module.exports = {
	entry: ['babel-polyfill', './src/draw.js'],
	debug: true,
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: './dist/',
		filename: 'bundle.js'
	},
	module: {
		loaders :[
			{test : /\.js$/, loader: 'babel'}
		]
	}
};