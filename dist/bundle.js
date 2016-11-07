/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _arguments = arguments;

	var _Panel = __webpack_require__(1);

	var _Panel2 = _interopRequireDefault(_Panel);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var exportData = function exportData(panel) {
		console.log(_arguments);
		console.log(panel.exportMetaData());
	};

	new _Panel2.default({
		container: '#panel',
		width: 800,
		height: 400,
		menuOption: [{ text: '导出元数据', cb: function cb(panel) {
				console.log(panel.exportCanavsData());
			}, type: 0 }, { text: '导入元数据', cb: function cb(panel) {}, type: 0 }]
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Shape = __webpack_require__(2);

	var _Menu = __webpack_require__(3);

	var _Menu2 = _interopRequireDefault(_Menu);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Panel = function () {
		function Panel(_ref) {
			var container = _ref.container,
			    _ref$width = _ref.width,
			    width = _ref$width === undefined ? 400 : _ref$width,
			    _ref$height = _ref.height,
			    height = _ref$height === undefined ? 400 : _ref$height,
			    menuOption = _ref.menuOption;

			_classCallCheck(this, Panel);

			if (typeof container !== 'string' && container.charAt(0) !== '#') {
				throw new Error('Panel constructor require an id like `#panel` to be initialized.');
			}
			this.container = document.querySelector(container);
			if (!this.container) {
				throw new Error('invalid parameter `' + container + '`');
			}

			this.frontCanvas = document.createElement('canvas');
			this.bgCanvas = document.createElement('canvas');
			this.menu = new _Menu2.default(this, menuOption);
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
			this.offset = { left: 0, top: 0 };

			this.frontCtx = this.frontCanvas.getContext('2d');
			this.bgCtx = this.bgCanvas.getContext('2d');

			this.offset = this.countOffset(this.frontCanvas);
			// console.log(this.offset);
			this.initEvents();
			this.initBackground();
		}

		_createClass(Panel, [{
			key: 'initEvents',
			value: function initEvents() {
				var _this = this;

				// 绑定画布的事件
				this.frontCanvas.oncontextmenu = function (e) {
					e.preventDefault();
					var startX = e.pageX,
					    startY = e.pageY;
					for (var i = _this.shapes.length - 1; i >= 0; i--) {
						// 将鼠标位置转为相对画布的位置并判断落点
						if (_this.shapes[i].isPointInPath(startX - _this.offset.left, startY - _this.offset.top)) {
							_this.activedShape = _this.shapes[i];
							break;
						}
					}
					if (i < 0) {
						_this.activedShape = null;
					}
					_this.menu.show({ startX: startX, startY: startY });
					e.stopPropagation();
				};
				this.frontCanvas.addEventListener('mousedown', function (e) {
					var startX = e.pageX,
					    startY = e.pageY;
					// console.log(startX,startY)
					_this.menu.hide();
					// 由于层级覆盖，先检查上层的图形
					if (e.button === 0) {
						for (var i = _this.shapes.length - 1; i >= 0; i--) {
							if (_this.shapes[i].isPointInPath(startX - _this.offset.left, startY - _this.offset.top)) {
								var _ret = function () {
									_this.activedShape = _this.shapes[i];
									var onmousemove = function onmousemove(e) {
										_this.activedShape.setPosition(e.pageX - startX, e.pageY - startY);
										_this.repaint();
									};
									_this.frontCanvas.addEventListener('mousemove', onmousemove);

									_this.frontCanvas.addEventListener('mouseup', function (e) {
										_this.frontCanvas.removeEventListener('mousemove', onmousemove);
										_this.activedShape && _this.activedShape.drop();
									});
									return 'break';
								}();

								if (_ret === 'break') break;
							}
						}
					}
				});
				this.frontCanvas.addEventListener('drop', function (e) {
					e.preventDefault();
					console.log(e.pageX, e.pageY);
					var rect = _this.addShape({
						mouseX: e.pageX - _this.offset.left,
						mouseY: e.pageY - _this.offset.top,
						data: JSON.parse(e.dataTransfer.getData('data')),
						ctx: _this.frontCtx
					});
					_this.shapes.push(rect);
				});
				this.frontCanvas.addEventListener('dragover', function (e) {
					e.preventDefault();
				});
			}
		}, {
			key: 'initBackground',
			value: function initBackground() {
				// 绘制背景网格线
				var GRID_INTERVAL = 10,
				    GRIDROWS = this.bgCanvas.height / GRID_INTERVAL,
				    GRIDCOLS = this.bgCanvas.width / GRID_INTERVAL;

				this.bgCtx.lineWidth = 0.2;
				this.bgCtx.strokeStyle = '#555';
				this.bgCtx.moveTo(0, 0);
				for (var i = 1; i < GRIDROWS; i++) {
					this.bgCtx.beginPath();
					this.bgCtx.moveTo(0, i * GRID_INTERVAL);
					this.bgCtx.lineTo(this.bgCanvas.width, i * GRID_INTERVAL);
					this.bgCtx.stroke();
					this.bgCtx.closePath();
				}
				this.bgCtx.moveTo(0, 0);
				for (var i = 1; i < GRIDCOLS; i++) {
					this.bgCtx.beginPath();
					this.bgCtx.moveTo(i * GRID_INTERVAL, 0);
					this.bgCtx.lineTo(i * GRID_INTERVAL, this.bgCanvas.height);
					this.bgCtx.stroke();
					this.bgCtx.closePath();
				}
			}
		}, {
			key: 'countOffset',
			value: function countOffset(DOMElement) {
				if (DOMElement.offsetParent) {
					var _countOffset = this.countOffset(DOMElement.offsetParent),
					    left = _countOffset.left,
					    top = _countOffset.top;
				}
				left = left || 0;
				top = top || 0;
				left += DOMElement.offsetLeft;
				top += DOMElement.offsetTop;
				return { left: left, top: top };
			}
		}, {
			key: 'repaint',
			value: function repaint() {
				this.frontCtx.clearRect(0, 0, this.width, this.height);
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this.shapes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var s = _step.value;

						s.draw();
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}
		}, {
			key: 'deleteShape',
			value: function deleteShape(shape) {
				for (var i = 0; i < this.shapes.length; i++) {
					if (shape === this.shapes[i]) {
						this.shapes.splice(i, 1);
						this.repaint();
					}
				}
			}
		}, {
			key: 'addShape',
			value: function addShape(_ref2) {
				var mouseX = _ref2.mouseX,
				    mouseY = _ref2.mouseY,
				    width = _ref2.width,
				    height = _ref2.height,
				    data = _ref2.data,
				    ctx = _ref2.ctx;

				return new _Shape.Rectangle(mouseX, mouseY, width, height, data, ctx);
			}
		}, {
			key: 'hasShape',
			value: function hasShape() {
				return this.shapes.length > 0 ? true : false;
			}
		}, {
			key: 'extractShapes',
			value: function extractShapes() {}
		}, {
			key: 'exportCanavsData',
			value: function exportCanavsData() {
				var metaData = [];
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.shapes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var s = _step2.value;

						metaData.push(s.exportMetaData());
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				console.log(metaData);
				return metaData;
			}
		}, {
			key: 'importCanvasData',
			value: function importCanvasData() {
				var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.frontCtx;
				var metaData = arguments[1];
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = metaData[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var d = _step3.value;

						var rect = new _Shape.Rectangle(d);
						rect.setContext(context);
						rect.draw();
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}
			}
		}, {
			key: 'saveAsImage',
			value: function saveAsImage() {
				var tmpCanvas = document.createElement('canvas');
				tmpCanvas.width = this.frontCanvas.width;
				tmpCanvas.height = this.frontCanvas.height;
				var tmpCtx = tmpCanvas.getContext('2d');

				tmpCtx.fillStyle = '#fff';
				tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = this.shapes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var s = _step4.value;

						s.draw(tmpCtx);
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}

				var image = new Image();
				image.src = tmpCanvas.toDataURL('image/png');
				return image;
			}
		}]);

		return Panel;
	}();
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


	exports.default = Panel;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Shape = function () {
		function Shape() {
			var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '#000';
			var backgroundColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '#fff';

			_classCallCheck(this, Shape);

			this.color = color;
			this.backgroundColor = backgroundColor;
		}

		_createClass(Shape, [{
			key: 'setColor',
			value: function setColor(color) {
				this.color = color;
			}
		}, {
			key: 'setBackgroundColor',
			value: function setBackgroundColor(color) {
				this.backgroundColor = color;
			}
		}]);

		return Shape;
	}();

	var Rectangle = exports.Rectangle = function (_Shape) {
		_inherits(Rectangle, _Shape);

		function Rectangle() {
			var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
			var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
			var width = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 80;
			var height = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 40;
			var data = arguments[4];
			var canvasContext = arguments[5];

			_classCallCheck(this, Rectangle);

			var _this = _possibleConstructorReturn(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).call(this));

			_this.width = width;
			_this.height = height;
			_this.position = { x: x - width / 2, y: y - height / 2, originX: x - width / 2, originY: y - height / 2 };
			_this.data = data;
			_this.text = _this.data.text || '';
			_this.font = {
				size: 18,
				family: 'Helvetica',
				toString: function toString() {
					return this.size + 'px "' + this.family + '"';
				}
			};
			_this.ctx = canvasContext;
			_this.draw();
			return _this;
		}

		_createClass(Rectangle, [{
			key: 'setContext',
			value: function setContext(ctx) {
				this.ctx = ctx;
			}
		}, {
			key: 'setPosition',
			value: function setPosition(x, y) {
				this.position.x = this.position.originX + x;
				this.position.y = this.position.originY + y;
			}
		}, {
			key: 'drop',
			value: function drop() {
				this.position.originX = this.position.x;
				this.position.originY = this.position.y;
			}
		}, {
			key: 'draw',
			value: function draw() {
				var ctx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.ctx;

				ctx.beginPath();
				ctx.fillStyle = this.backgroundColor;
				ctx.strokeStyle = this.color;
				ctx.textAlign = 'center';
				ctx.font = this.font.toString();
				ctx.textBaseline = 'middle';
				ctx.shadowBlur = 10;
				ctx.shadowColor = '#bbb';
				ctx.lineWidth = 1;

				ctx.rect(this.position.x, this.position.y, this.width, this.height);
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = this.color;
				ctx.fillText(this.text, this.position.x + this.width / 2, this.position.y + this.height / 2);
				ctx.shadowBlur = 0;
				ctx.closePath();
			}
		}, {
			key: 'isPointInPath',
			value: function isPointInPath(x, y) {
				return this.position.x < x && x < this.position.x + this.width && this.position.y < y && y < this.position.y + this.height;
			}
		}, {
			key: 'exportMetaData',
			value: function exportMetaData() {
				return { x: this.position.x, y: this.position.y, width: this.width, height: this.height, data: this.data };
			}
		}]);

		return Rectangle;
	}(Shape);

	var Line = function (_Shape2) {
		_inherits(Line, _Shape2);

		function Line() {
			_classCallCheck(this, Line);

			return _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).apply(this, arguments));
		}

		return Line;
	}(Shape);

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Menu = function () {
		function Menu(panel) {
			var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

			_classCallCheck(this, Menu);

			//type 可应用的元素, 0：全局, 1：图形, 2：画布
			//0：只在画布中存在图形时可用；1、2：activeShape为空时自动禁用
			console.log(option);
			this.options = [{ text: '复制', cb: this.copyShape, type: 1 }, { text: '粘贴', cb: this.pasteShape, type: 2 }, { text: '剪切', cb: this.cuteShape, type: 1 }, { text: '删除', cb: this.deleteShape, type: 1 }, { text: '保存为图片', cb: this.saveAsImage, type: 0 }];
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = option[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var o = _step.value;

					this.options.push(o);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			console.log(this.options);

			this.panel = panel;
			this.element = document.createElement('div');
			this.element.classList.add('xpanel-menu');
			var ul = document.createElement('ul'),
			    frag = document.createDocumentFragment();
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var e = _step2.value;

					var li = document.createElement('li');
					li.innerHTML = e.text;
					li.addEventListener('click', this.actionWrapper.bind(this, e.type, e.cb));
					li.setAttribute('data-menutype', e.type);
					ul.appendChild(li);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			frag.appendChild(ul);
			this.element.appendChild(frag);
		}

		_createClass(Menu, [{
			key: 'disable',
			value: function disable(DOMElement) {
				for (var _len = arguments.length, type = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					type[_key - 1] = arguments[_key];
				}

				if (type.indexOf(parseInt(DOMElement.getAttribute('data-menutype'))) !== -1) {
					DOMElement.classList.add('disabled');
				} else {
					DOMElement.classList.remove('disabled');
				}
			}
		}, {
			key: 'toggleGlobalOperation',
			value: function toggleGlobalOperation(e) {
				if (e.getAttribute('data-menutype') == 0) {
					if (e.className.indexOf('disabled') == -1) {
						e.classList.add('disabled');
					} else {
						e.classList.remove('disabled');
					}
				}
			}
		}, {
			key: 'show',
			value: function show(_ref) {
				var startX = _ref.startX,
				    startY = _ref.startY;

				this.element.style.top = startY - window.scrollY + 2 + 'px';
				this.element.style.left = startX - window.scrollX + 2 + 'px';
				var onShape = this.panel.activedShape ? true : false,
				    hasShape = this.panel.hasShape();

				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = this.element.children[0].children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var e = _step3.value;

						if (onShape) {
							this.disable(e, 2);
						} else {
							this.disable(e, 1, 2);
						}
						if (!hasShape) {
							this.toggleGlobalOperation(e);
						}
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}

				this.element.classList.add('show');
			}
		}, {
			key: 'hide',
			value: function hide() {
				this.element.classList.remove('show');
			}
		}, {
			key: 'actionWrapper',
			value: function actionWrapper(actionType, action) {
				if (this.panel.activedShape) {
					if (actionType !== 2) {
						// 只执行除画布操作外的动作
						action.call(this, this.panel, this.panel.activedShape);
					}
				} else {
					if (actionType === 0 && this.panel.hasShape()) {
						// 只执行全局操作的动作
						action.call(this, this.panel);
					}
				}
				this.hide();
			}
		}, {
			key: 'deleteShape',
			value: function deleteShape(panel, activedShape) {
				panel.deleteShape(activedShape);
				this.hide();
			}
		}, {
			key: 'copyShape',
			value: function copyShape(panel, activedShape) {
				alert('copyShape');
			}
		}, {
			key: 'cuteShape',
			value: function cuteShape(panel, activedShape) {
				alert('cuteShape');
			}
		}, {
			key: 'pasteShape',
			value: function pasteShape(panel, activedShape) {
				alert('pasteShape');
			}
		}, {
			key: 'saveAsImage',
			value: function saveAsImage() {
				this.hide();
				var imageName = window.prompt('请输入图片名');
				if (imageName) {
					var div = document.createElement('div'),
					    mention = document.createElement('div'),
					    imgdiv = document.createElement('div'),
					    img = this.panel.saveAsImage(),
					    a = document.createElement('a'),
					    frag = document.createDocumentFragment();

					div.classList.add('xpanel-saveimage-bg');
					mention.classList.add('xpanel-saveimage-mention');
					mention.innerHTML = '在图片上 <span style="font-weight:bold;">鼠标右键另存为</span> 或者 <span style="font-weight:bold;">点击图片</span> 下载, <a href="javascript:void(0)" onclick="document.body.removeChild(this.parentNode.parentNode)">取消</a>';
					img.setAttribute('alt', imageName);
					img.setAttribute('title', imageName);
					a.setAttribute('title', imageName);
					a.appendChild(img);
					a.setAttribute('download', imageName);
					a.setAttribute('href', img.src);
					a.setAttribute('onclick', "document.body.removeChild(this.parentNode.parentNode)");

					imgdiv.appendChild(a);
					div.appendChild(mention);
					div.appendChild(imgdiv);
					frag.appendChild(div);
					document.body.appendChild(frag);
				}
			}
		}]);

		return Menu;
	}();

	exports.default = Menu;

/***/ }
/******/ ]);