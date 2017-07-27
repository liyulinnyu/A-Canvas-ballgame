    (function(){
        var theCanvas = document.querySelector("#canvasone");
        var context = theCanvas.getContext("2d");

        var cdiv = document.querySelector("div");
        var speed = 0,
            angle = 0;
        var time1 = null,
            time2 = null,
            temp3 = null;  // 记录蓄力时间差

        var balls = [];
        var gameloop = null;

        // 记录鼠标是否弹起
        var isMouseDown = false;
        var powerR = 0;  // 蓄力半径

        // 背景
        drawBack(context);
        // 积分
        var str = "得分：";
        var num = 0;
        drawPoint(context);
        // 画篮筐
        var r = 20;
        drawCircle(context);
        // 画篮板
        drawBoard(context);
        // 画篮架
        drawLJ(context);
        // 画单臂机器人
        drawRobot(context);

        


        
        cdiv.addEventListener("mousedown", function(e){
            time1 = new Date();
            isMouseDown = true;
            if (gameloop){
                clearInterval(gameloop);
            }
            canvasApp();
        }, false);

        cdiv.addEventListener("mouseup", function(e){
            time2 = new Date();
            speed = (time2.getTime() - time1.getTime())/30;

            // 限制最高速
            if (speed > 50){
                speed = 50;
            }

            // 蓄力结束
            isMouseDown = false;

            var tempx = e.clientX;
            var tempy = 520 - e.clientY;
            angle = Math.atan(tempx/tempy)*180/Math.PI+270;
            // 篮球对象
            var ball = {
                x:0,                // 初始x坐标
                y:theCanvas.height-10,                // 初始y坐标
                angle:angle,           // 初始投出角度
                speed:speed,             // 初始速度
                radius:14,            // 球半径
                isIn:false,            // 是否已经进了，防止多次记分
                isGetFloor:false        // 是否弹地了
            };
            ball.velocityx = Math.cos(ball.angle*Math.PI/180) * ball.speed;
            ball.velocityy = Math.sin(ball.angle*Math.PI/180) * ball.speed;

            if (gameloop){
                clearInterval(gameloop);
            }
            balls.push(ball);
            canvasApp();
        }, false);

        cdiv.addEventListener("mousemove", function(e){
            var tempx = e.clientX;
            var tempy = 520 - e.clientY;
            angle = Math.atan(tempx/tempy)*180/Math.PI;
            drawRobot(context);
        },false);
        



        // 渲染得分效果对象数组
        var showPoint = [];
        // 某时刻是否有进球，用来渲染篮筐效果
        var hasIn = false;
        var hasInCount = 0;

        // 客观对象
        var earth = {
            gravity:0.4,        // 地表重力
            elasticity:0.6,     // 地表弹力
            friction:0.008      // 地表摩擦力
        };

        function canvasApp(){
            
            // 绘制篮球
            function drawSreen(){
                drawBack(context);

                for(var i = 0; i < balls.length; i++){
                    var ball = balls[i];
                    ball.velocityy += earth.gravity;

                    // 弹地事件
                    if ((ball.y + ball.radius) > theCanvas.height-ball.velocityy){
                        ball.velocityy = -(ball.velocityy*earth.elasticity);
                        ball.isGetFloor = true;
                    }

                    // y速度 < 0 && 碰下框事件
                    if ((ball.velocityy < 0) && (ball.x > 560 && ball.x < 640 && ball.y > 180 && ball.y < 200)){
                        ball.velocityy = -(ball.velocityy * 1.1);   // 碰撞动能增加
                    }

                    // y速度 > 0 && 碰上框事件
                    if ((ball.velocityy > 0) && (ball.y > 165 && ball.y < 175) && ((ball.x > 555 && ball.x < 565) || (ball.x > 635 && ball.x < 645))){
                        ball.velocityy = -(ball.velocityy*earth.elasticity);
                    }

                    // 碰篮筐左边沿事件
                    if (ball.velocityx > 0 && ball.x > 540 && ball.x < 550 && ball.y > 180 & ball.y < 190){
                        ball.velocityx = -(ball.velocityx * earth.elasticity);
                    }

                    // 碰篮板左边事件
                    if (ball.velocityx > 0 && (ball.x + ball.radius) > 635 && (ball.x + ball.radius) < 650 && ball.y > 110 && ball.y < 210){
                        ball.velocityx = -(ball.velocityx * earth.elasticity);
                    }

                    // 碰篮板上沿事件
                    if ((ball.velocityy > 0) && (ball.y > 108 && ball.y < 120) && (ball.x > 630) && (ball.x < 660)){
                        ball.velocityy = -(ball.velocityy*earth.elasticity);
                    }

                    // 碰篮板下沿事件
                    if ((ball.velocityy < 0) && (ball.y > 200 && ball.y < 210) && (ball.x > 630) && (ball.x < 660)){
                        ball.velocityy = -(ball.velocityy * 1.1);
                    }


                    // 碰篮架事件
                    if ((ball.velocityy > 0) && (ball.y > 160 && ball.y < 180) && (ball.x > 650) && (ball.x < 830)){
                        ball.velocityy = -(ball.velocityy*earth.elasticity);
                    }


                    // y速度为0
                    if (ball.velocityy < 0.05){
                        ball.velocityx = ball.velocityx - ball.velocityx*earth.friction;
                    }
                    ball.y += ball.velocityy;
                    ball.x += ball.velocityx;


                    // 进球！！
                    if (ball.x > 560 && ball.x < 640 && ball.y > 175 && ball.y < 195 && ball.velocityy > 0 && !ball.isIn){
                        num++;
                        ball.isIn = true;   // 标记已经进了 
                        hasIn = true;
                        // 添加加分效果对象
                        var addOneText = {
                            size:40,
                            x:200,
                            y:130,
                            showtimes:0,
                            alpha:1
                        };
                        showPoint.push(addOneText);
                    }

                    if (ball.isIn){
                        context.fillStyle = "red";
                    }else{
                        context.fillStyle = "#000";
                    }
                    context.beginPath();
                    context.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI, true);
                
                    context.closePath();
                    context.fill();


                    
                }
                
                // 渲染加分效果
                for (var k = 0; k < showPoint.length; k++){
                    context.save();
                    context.fillStyle = "red";
                    if (showPoint[k].showtimes < 50){
                        showPoint[k].showtimes++;
                    }else{
                        showPoint[k].size -= 1;
                        if (showPoint[k].size < 30){
                            showPoint[k].size = 30;
                        }
                        showPoint[k].y -= 3;
                        showPoint[k].alpha -= 0.05;
                        if (showPoint[k].alpha < 0){
                            showPoint[k].alpha = 0;
                        }
                    }
                    context.globalAlpha = showPoint[k].alpha;
                    context.font = "bold " + showPoint[k].size + "px YH";
                    var temptext = " Nice Goal!";
                    context.fillText(temptext, showPoint[k].x, showPoint[k].y);
                    context.restore();
                }

                // 画篮板、篮筐、篮架
                drawCircle(context);
                drawBoard(context);
                drawLJ(context);
                // 单臂机器人
                drawRobot(context);
                // 得分
                drawPoint(context);

                // 画蓄力条
                drawPower(context);
            }

            gameloop = setInterval(drawSreen, 20);
        }

        // 重绘背景
        function drawBack(context){
            context.fillStyle = "#f1f1f1";
            context.fillRect(0, 0, theCanvas.width, theCanvas.height);
            context.strokeStyle = "#336699";
            context.strokeRect(0.5, 0.5, theCanvas.width - 1, theCanvas.height - 1);
        }

        // 画篮筐
        function drawCircle(context){
            context.save();

            context.setTransform(2, 0, 0, 0.25, 0, 0);

            if (hasIn){
                hasInCount++;
                if (hasInCount % 5 === 0){
                    hasInCount = 0;
                    r++;
                }
                if (r > 27){
                    r = 20;
                    hasInCount = 0;
                    hasIn = false;
                }
            }
            context.fillStyle = "red";
            context.beginPath();
            context.arc(300, 750, r, 0, 2*Math.PI, true);
            context.closePath();
            context.fill();

            context.fillStyle = "#fff";
            context.beginPath();
            context.arc(300, 750, 16, 0, 2*Math.PI, true);
            context.closePath();
            context.fill();
            context.restore();
        }

        // 画篮板
        function drawBoard(context){
            
            context.save();
            context.beginPath();
            context.fillStyle = "black";
            context.fillRect(640, 120, 10, 90);
            context.closePath();
            context.fill();
            context.restore();
        }

        // 画篮架
        function drawLJ(context){
            context.save();
            context.strokeStyle = "black";
            context.lineWidth = 5;
            context.lineJoin = "round";
            context.beginPath();
            context.moveTo(650, 190);
            context.lineTo(800, 190);
            context.lineTo(800, theCanvas.height);
            context.lineTo(790, theCanvas.height);
            context.lineTo(790, 180);
            context.lineTo(650, 180);
            context.lineTo(650, 190);
            context.stroke();
            context.closePath();
            context.restore();
        }

        // 得分
        function drawPoint(context){
            context.fillStyle = "#336699";
            context.font = "30px YH";
            context.fillText(str + num, 10, 50);
        }

        // 机器人
        function drawRobot(context){
            clearArc(0, theCanvas.height, 73);
            context.fillStyle = "#f1f1f1";
            context.save();
            context.beginPath();
            context.translate(0, theCanvas.height);
            context.moveTo(0, 0);
            context.arc(0, 0, 73, 0, Math.PI * 1.5, true);
            context.closePath();
            context.fill();
            context.restore();

            // 开始画
            context.fillStyle = "#000";
            context.save();
            context.beginPath();
            // 位移到圆心，方便绘制
            context.translate(0, theCanvas.height);
            // 移动到圆心
            context.moveTo(0, 0);
            // 绘制圆弧
            context.arc(0, 0, 50, 0, Math.PI * 1.5, true);
            // 闭合路径
            context.closePath();
            context.fill();
            context.restore();

            var tempangle = angle*Math.PI/180;
            context.save();
            context.strokeStyle = "#000";
            context.lineWidth = 35;
            context.beginPath();
            
            // 移动到圆心
            context.moveTo(0, theCanvas.height);
            context.lineTo(70 * Math.sin(tempangle), theCanvas.height - 70*Math.cos(tempangle));
            // 闭合路径

            context.stroke();
            context.closePath();
            context.restore();
            
        }

        // 清除圆形区域
        var stepClear=1;
        function clearArc(x,y,radius){   // 圆心(x,y)，半径radius  
            var calcWidth = radius - stepClear;  
            var calcHeight = Math.sqrt(radius*radius - calcWidth*calcWidth);  
                  
            var posX = x - calcWidth;  
            var posY = y - calcHeight;  
                  
            var widthX = 2*calcWidth;  
            var heightY = 2*calcHeight;  
                  
            if(stepClear <= radius){  
                context.clearRect(posX,posY,widthX,heightY);  
                stepClear += 1;  
                clearArc(x,y,radius);  
            }  
        }  
        

        // 画蓄力条
        function drawPower(context){

            // 如果鼠标在蓄力状态
            if (isMouseDown){
                time3 = new Date();

                var subspeed = (time3.getTime() - time1.getTime())/30;
                if (subspeed > 50){
                    subspeed = 50;
                }

                powerR = (subspeed * 50) / 50;

                // 开始画
                var tempcolor = "red";
                switch (Math.floor(powerR / 10)){
                    case 0: tempcolor = "green"; break;
                    case 1: tempcolor = "#336699"; break;
                    case 2: tempcolor = "yellow"; break;
                    case 3: tempcolor = "#ff5809"; break;
                }
                context.fillStyle = tempcolor;
                context.save();
                context.beginPath();
                // 位移到圆心，方便绘制
                context.translate(0, theCanvas.height);
                // 移动到圆心
                context.moveTo(0, 0);
                // 绘制圆弧
                context.arc(0, 0, powerR, 0, Math.PI * 1.5, true);
                // 闭合路径
                context.closePath();
                context.fill();
                context.restore();

            }else{
                // 蓄力结束
                powerR = 0;
                drawRobot(context);
            }
        }

    })();