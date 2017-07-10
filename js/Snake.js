



//ES6 全局变量使用const关键字定义：  只读
const northImg = new Image();
northImg.src = "img/north_head.png";
const southImg = new Image();
southImg.src = "img/south_head.png";
const eastImg = new Image();
eastImg.src = "img/east_head.png";
const westImg = new Image();
westImg.src = "img/west_head.png";
const bodyImg = new Image();
bodyImg.src = "img/body.png";
const foodImg = new Image();
foodImg.src = "img/food1.png";
const foodImg2 = new Image();
foodImg2.src ="img/food2.png";
const foodImg3 = new Image();
foodImg3.src ="img/food4.png";
const bgImg = new Image();
bgImg.src = "img/bg1.png";
const startImg = new Image();
startImg.src = "img/init.png";
//将欢迎界面的图片放在最后，表示加载成功后，其他图片已经加载完毕，无需再进行onload判断
var speed=500;//游戏速度，用于设置定时器
var scoreType=1;//分数类型标志位

function Snake() {
	this.canvas = $("#gameView")[0]; //canvas画布对象
	this.ctx = this.canvas.getContext('2d'); //画笔
	this.width = 500; //背景（游戏屏幕）宽度
	this.height = 500; //背景（游戏屏幕）高度
	this.step = 25; //设计步长
	this.stepX = Math.floor(this.width / this.step); //X轴步数
	this.stepY = Math.floor(this.height / this.step); //Y轴步数
	this.snakeBodyList = []; //设置蛇身数组
	this.foodList = []; //设置食物数组
	this.timer = null; //蛇动时定时器
	this.score = 0; //分数 +10 存入localStorage中
	this.isDead = false; //蛇是否活着标识位
	this.isEaten = false; //食物是否被吃掉标识位
	this.isPhone = false; //判断设备是否为移动端
	this.isClick = true; //点击标识符
	/*
	 * 1-生成初始化页面 点击该页面 进入游戏
	 */
	this.init = function() {
		this.device();//判断设备类型
			this.ctx.drawImage(startImg, 0, 0, this.width, this.height);
		}
		/*
		 * 2-游戏开始 绘制背景 蛇 食物
		 */
	this.start = function() {
		//设定制定背景
		if(this.isClick){
			
//			if(bgpd==1){
//				bgImg.src = "img/bg1.png";
//				console.log("aa");
//			}else if(bgpd==2){
//				bgImg.src = "img/bg2.png";
//			}
//			else{
//				bgImg.src = "img/bg3.png";
//			}

			this.device(); //判断设备类型
			this.score = 0; //积分清零
			this.paint();
			this.move();
//			this.isClick = false;
		}
		
	}

	/*
	 * 判断当前设备是否是移动端
	 */
	this.device = function() {
		//1-读取BOM对象navigator的userAgent信息
		var deviceInfo = navigator.userAgent;
		//2-判断是否为PC端(是否含有Windows字符串)
		if (deviceInfo.indexOf("Windows") == -1) {
			this.isPhone = true;
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.stepX = this.width / this.step;
			this.stepY = this.height / this.step;
			console.log(this.width + ":" + this.height);
		}
	}

	this.paint = function() {
			//2.1画出背景
			//根据样式选择设定背景图片
//			bgImg.src="img/bg2.png"
			this.ctx.drawImage(bgImg, 0, 0, this.width, this.height);
			//2.2画蛇
			this.drawSnake();
			//2.3随机画出食物
			this.drawFood();

		}
		/*
		 * 2.2画蛇：算法[{x:横坐标，y:纵坐标，img:图片,direct:运动方向}]
		 */
	this.drawSnake = function() {
			//2.2.1循环生成snakeBodyList数组中的对象集合（默认，蛇居于中间，蛇头向西）
			if (this.snakeBodyList.length < 5) {
				for (var i = 0; i < 5; i++) {
					//{x:横坐标，y:纵坐标，img:图片,direct:运动方向}蛇的节点设计
					this.snakeBodyList.push({
						x: Math.floor(this.stepX / 2) + i - 2, //注意：X不是px像素坐标点，而是x轴步数
						y: Math.floor(this.stepY / 2), //注意：Y不是px像素坐标点，而是y轴步数
						img: bodyImg,
						direct: "west"
					});
				}
				//2.2.2替换snakeBodyList数组第一个元素的img,替换成westImg蛇头图片
				this.snakeBodyList[0].img = westImg;
			}

			//		console.log(this.snakeBodyList);

			//2.2.3遍历snakeBodyList数组，并画出蛇的初始状态
			for (var i = 0; i < this.snakeBodyList.length; i++) {
				var snode = this.snakeBodyList[i];
				this.ctx.drawImage(snode.img, snode.x * this.step, snode.y * this.step, this.step, this.step);
			};
		}
		/*
		 * 2.3画食物
		 */
	this.drawFood = function() {
		//2.3.1当食物已经存在时，画面刷新时，食物在原有位置重绘
		if (this.foodList.length > 0) {
			var fnode = this.foodList[0];
			this.ctx.drawImage(fnode.img, fnode.x * this.step, fnode.y * this.step, this.step, this.step);
			return;
		}
		//2.3.2如果食物没有（食物被吃或游戏初始化），生成x y随机坐标，判断是否与蛇身重复
		//如果重复，重绘，调用this.drawfood()，否则按照随机生成的点push到数组中，绘制图案
		var foodX = Math.floor(Math.random() * this.stepX);
		var foodY = Math.floor(Math.random() * this.stepY);
		var foodFlag = false; //判断食物与蛇身是否重复的标识位，true重复，false不重复
		for (var i = 0; i < this.snakeBodyList.length; i++) {
			var snode1 = this.snakeBodyList[i];
			if (foodX == snode1.x && foodY == snode1.y) {
				foodFlag = true;
			}
		}
		if (foodFlag) {
			foodFlag = false; //修改标识位
			this.drawFood(); //如果重复则绘制
		} else {
			var foodimg=Math.random()*10;//定义随机食物种类
				if(foodimg<=3&&foodimg>=0){
					scoreType=1;
					this.foodList.push({
						x: foodX,
						y: foodY,
						img: foodImg
					}); //新生成一个食物
				}else if(foodimg>3&&foodimg<=7){
					scoreType=2;
					this.foodList.push({
						x: foodX,
						y: foodY,
						img: foodImg2
					}); //新生成一个食物
				}else{
					scoreType=3;
					this.foodList.push({
						x: foodX,
						y: foodY,
						img: foodImg3
					}); //新生成一个食物
				}
			var fnode = this.foodList[0];
			this.ctx.drawImage(fnode.img, fnode.x * this.step, fnode.y * this.step, this.step, this.step)
		}

	}

	/*
	 * 3-蛇动
	 * 3.1判断设备，如果是pc，响应键盘事件，否则，响应触碰事件
	 * 3.2生成键盘事件处理器this.keyHander(),和触屏事件处理器this.touchHander()
	 */
	this.keyHandler = function(event) { //键盘事件处理器
		//事件处理是异步的，所以，无法传递this对象
		var _this = this;
		document.onkeydown = function(ev) {
			var ev = ev || window.event;
			//			console.log(ev.key+":"+ev.keyCode);
			console.log(_this.snakeBodyList);
			switch (ev.keyCode) {
				case 37: //向左
				//禁止蛇头向相反方向移动
					 if(_this.snakeBodyList[0].direct=='east'){
					 	break;
					 }
					_this
					_this.snakeBodyList[0].img = westImg;
					_this.snakeBodyList[0].direct = 'west';
					break;
				case 38: //向上
				//禁止蛇头向相反方向移动
					 if(_this.snakeBodyList[0].direct=='south'){
					 	break;
					 }
					_this.snakeBodyList[0].img = northImg;
					_this.snakeBodyList[0].direct = 'north';
					break;
				case 39: //向右
				//禁止蛇头向相反方向移动
					 if(_this.snakeBodyList[0].direct=='west'){
					 	break;
					 }
					_this.snakeBodyList[0].img = eastImg;
					_this.snakeBodyList[0].direct = 'east';
					break;
				case 40: //向下
				//禁止蛇头向相反方向移动
					 if(_this.snakeBodyList[0].direct=='north'){
					 	break;
					 }
					_this.snakeBodyList[0].img = southImg;
					_this.snakeBodyList[0].direct = 'south';
					break;
			}
		}
	}
	this.touchHandler = function(event) {
		var _this = this;
		//触屏事件处理器
		document.addEventListener("touchstart", function(ev) {
//			ev.preventDefault();
			console.log(ev)
			var touchX = ev.changedTouches[0].clientX;
			var touchY = ev.changedTouches[0].clientY;
			console.log(touchX + ":" + touchY);
			var head = _this.snakeBodyList[0];
			var headX = head.x * _this.step; //注意蛇头x坐标值与px的转换，乘以_this.step
			var headY = head.y * _this.step;
			if (head.direct == "north" || head.direct == "south") {
				if (touchX < headX) {
					head.direct = "west";
					head.img = westImg;
				} else {
					head.direct = "east";
					head.img = eastImg;
				}
			} else if (head.direct == "west" || head.direct == "east") {
				if (touchY < headY) {
					head.direct = "north";
					head.img = northImg;
				} else {
					head.direct = "south";
					head.img = southImg;
				}
			}
		})
	}

	this.move = function() {
			if (!this.isPhone) {
				this.keyHandler();
			} else {
				this.touchHandler();
			}
			//3.1运用定时器移动蛇（蛇的坐标变化，然后重绘）
			var _this = this;
			this.timer = setInterval(function() {
				//首先：解决蛇身跟随的问题
				for (var i = _this.snakeBodyList.length - 1; i > 0; i--) {
					_this.snakeBodyList[i].x = _this.snakeBodyList[i - 1].x;
					_this.snakeBodyList[i].y = _this.snakeBodyList[i - 1].y;
				}
				//其次，根据方向及坐标，处理蛇头的移动新坐标
				var shead = _this.snakeBodyList[0];
				switch (shead.direct) {
					case 'north':
						shead.y--;
						break;
					case 'south':
						shead.y++;
						break;
					case 'west':
						shead.x--;
						break;
					case 'east':
						shead.x++;
						break;
				}
				//3.1.1判断，蛇移动后新位置是否已经触边界，或者自身 true--dead
				_this.dead(); //判断蛇生死，isDead
				if (_this.isDead) {
					//alert你的最终分数
					
					$(".score_p").text( _this.score);
					$(".gameo").css("display", "block");
					clearInterval(_this.timer); //如果不清除定时器，则速度会不断加快
					_this.isDead = false; //改变isDead,否则，每次直接死掉
					_this.snakeBodyList = [];
					_this.init();
					
				} else {
					//3.1.2 false:蛇活着，判断蛇头是否与食物的坐标一只，如果一致，清空食物数组（多个食物时，可以使用标识位）
					_this.eat(); //判断食物是否被吃，iseatens
					if (_this.isEaten) {
						console.log(1)
						_this.isEaten = false;
						//清空食物数组
						_this.foodList = [];

						//判定加多少分
						if(scoreType==1){
							_this.score += 10;
					
						}else if(scoreType==2){
							_this.score += 20;
					
						}else{
							_this.score += 30;
					
						}
						$("#scoreBoard").html(_this.score); //分数面板显示
						//蛇身长一节
						var lastNodeIndex = _this.snakeBodyList.length;
						_this.snakeBodyList[lastNodeIndex] = {
							x: -2,
							y: -2,
							img: bodyImg,
							direct: _this.snakeBodyList[lastNodeIndex - 1].direct
						};
					}
					//3.1.3 否则重绘
					_this.paint(); //重绘游戏画面（背景+蛇+食物）
				}

			}, speed);
		}
		/*
		 * 4-蛇死（触碰到边界或者自身--dead）
		 */
	this.dead = function() {
			const LEFT_END = 0; //左边界
			const RIGHT_END = this.stepX; //右边界
			const NORTH_END = 0; //上边界
			const SOUTH_END = this.stepY; //下边界
			const HEAD_X = this.snakeBodyList[0].x; //蛇头横坐标x
			const HEAD_Y = this.snakeBodyList[0].y; //蛇头纵坐标y
			//判断边界
			if (HEAD_X < LEFT_END - 1 || HEAD_Y < NORTH_END - 1 || HEAD_X > RIGHT_END || HEAD_Y > SOUTH_END) {
				this.isDead = true;
				//死亡声音
				$("#sMusic1")[0].pause();
				$("#sMusic2")[0].play();
			
				return; //精简判断过程
			}
			//			//判断是否撞到自身
			for (var k = this.snakeBodyList.length - 1; k > 0; k--) {
				if (this.snakeBodyList[k].x == HEAD_X && this.snakeBodyList[k].y == HEAD_Y) {
					this.isDead = true;
					$("#sMusic1")[0].pause();
					$("#sMusic2")[0].play();
				}
			}

		}
		/*
		 * 5-蛇吃食物
		 */
	this.eat = function() {
		const HEAD_X = this.snakeBodyList[0].x; //蛇头横坐标x
		const HEAD_Y = this.snakeBodyList[0].y; //蛇头纵坐标y
		const FOOD_X = this.foodList[0].x; //食物横坐标x
		const FOOD_Y = this.foodList[0].y; //食物横坐标y
		if (HEAD_X == FOOD_X && HEAD_Y == FOOD_Y) {
			this.isEaten = true;
			//吃东西声音
			$("#sMusic3").prop("src","css/eat.mp3");
		}
	}
}


$(function(){
			 
			//初始化界面
			var snakegame=new Snake();
			startImg.onload=function(){
				snakegame.init();
			}
			$("#Lv").click(function(){
				$(".btns").hide(200);
				$(".btns2").show(200);
			});
			
			$("#lev1").click(function(){
				speed=500;
				$(".btns2").hide(200);
				$(".btns").show(200);
			});
			$("#lev2").click(function(){
				speed=350;
				$(".btns2").hide(200);
				$(".btns").show(200);
			});
			$("#lev3").click(function(){
				speed=200;
				$(".btns2").hide(200);
				$(".btns").show(200);
			});
			
			$("#start").click(function(){
				$("#start").css("display","none");
				$("#down").css("display","block");
				$("#user").css("display", "block");
				$("#sMusic1")[0].play();
				snakegame.start();

				$("#Lv").css("display","none");
				$("#other").css("display","none");
				$(".author").css("display","none");
			});
			
			//音乐
			var  isPlay = true;//true 为正常播放，false 为暂停音乐增加标识位
			$(".music").click(function() {

				if (isPlay) {
					$(this).css("background-image", "url(img/xmusic.png)");
					$("#sMusic1")[0].pause();
					isPlay = false;
				} else {
					$(this).css("background-image", "url(img/music.png)");
					$("#sMusic1")[0].play();
					isPlay = true;
			
					}

	});
	
	$(".gameo").click(function() {
		$(".gameo").css("display", "none");
		$(".btns").css("display", "block");
		snakegame.start();
		$("#sMusic1")[0].play();
		
	});
			
			//点击选择样式按钮进行背景选择
			$("#other").click(function(){
				$(".bgType").show(200);
				$(".btns").hide(200);
			});
			
			//选择背景样式进行游戏背景切换
			$("#bg01").click(function(){
				bgImg.src="img/bg1.png";
				$(".bgType").hide(200);
				$(".btns").show(200);
				
			});
			$("#bg02").click(function(){
				bgImg.src="img/bg2.png";
				$(".bgType").hide(200);
				$(".btns").show(200);
			});
			$("#bg03").click(function(){
				bgImg.src="img/bg3.jpg";
				$(".bgType").hide(200);
				$(".btns").show(200);
			});
			
//			直接进入游戏界面
//			var snakegame=new Snake();
//			bgImg.onload=function(){
//				snakegame.start();
//			}
    //点击头像div显示积分
	$("#down").click(function(event) {
$("#user").slideToggle();
});
	
	//点击底部div时 显示功能div
	$(".foot").click(function(){
		$(".prop").slideToggle();
	});
	
	
});