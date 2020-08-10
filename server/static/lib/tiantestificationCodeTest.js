'use strict';
var params = {}
params['type'] = 'test';
if (!params['type']) {
    alert('需要type参数')
}

var tip_msg = params['type'] === 'negative' ? "请在下方<span>划 非勾</span>" : "请在下方<span>打勾</span>"
var _tiantest = {
        _verify:(callback)=>{
            callback({
                data:{
                    status:1,
                    bigImg: "https://static.tiantest.com/static/img/grey.jpg",
                    smallImg: null,
                    position: null,
                    type:1,
                    point:0,
                    msg:tip_msg
                },
                code:0
            })
        },

    }
    
var cst = {
 MAX_SPEED : 3 ,
 MAX_SCALE : 110,//1.1倍 ，500:::5倍
 MIN_SCALE : 100,
 NORMAL_SCALE : 100,

 NORMAL_TEXT : "点击此处进行人机验证",
 LOADING_TEXT : "人机验证加载中",
 SUCCESS_TEXT : "验证通过",
 OPEN_CANVAS_TEXT : "人机验证中",
 ERRPR_TEXT : "验证错误, 点击重试",
 CANCEL_TEXT : "验证中断, 点击继续验证",

 FAQ_URL : "https://tiantest.com/help",

 SUCCESS_IMG : "https://static.tiantest.com/static/img/success.jpg",
 FAIL_IMG : "https://static.tiantest.com/static/img/error.jpg",
 NORMAL_IMG : "https://static.tiantest.com/static/img/normal.jpg",
 CIRCULAR_IMG_URL : "https://static.tiantest.com/static/img/circular.png",
};

function supportCss3(style) {
    var prefix = ['webkit', 'Moz', 'ms', 'o'],
        i,
        humpString = [],
        htmlStyle = document.documentElement.style,
        _toHumb = function (string) {
            return string.replace(/-(\w)/g, function ($0, $1) {
                return $1.toUpperCase();
            });
        };

    for (i in prefix)
        humpString.push(_toHumb(prefix[i] + '-' + style));

    humpString.push(_toHumb(style));

    for (i in humpString)
        if (humpString[i] in htmlStyle) return true;

    return false;
}
function isIpad() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["iPad", "iPod"];
    var flag = false;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = true;
            break;
        }
    }
    return flag;
}
function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
function isEdge() {
    let userAgent = navigator.userAgent;
    return userAgent.indexOf("Edge") > -1
}
function initElemeSize(ele) {
    (function (doc, win) {
        const docEl = doc.documentElement,
            resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
            recalc = function () {
                const clientWidth = docEl.clientWidth;
                if (!clientWidth) return;
                let  mql;
                try {
                    mql = window.matchMedia("(orientation: portrait)");
                }catch (e) {}
                let result =  150 * (clientWidth / 750);
                if(mql && !mql.matches){
                    result = result/2.5;
                }
                ele.style.fontSize =  result <= 100 ? result + 'px' : '100px';
            };
        recalc();
        if (!doc.addEventListener) return;
        win.addEventListener(resizeEvt, recalc, false);
        doc.addEventListener('DOMContentLoaded', recalc, false);
    })(document, window);
}
function loadImg(imgSrc) {
    return new Promise((resolve,reject)=>{
        const img = new Image();
        img.src = imgSrc;

        img.onload = function () {
            resolve(img);
        };
        img.onerror = function (err) {
            reject(err);
        };
    })

}
function throttle(method, mustRunDelay) {
    let timer,
        start;
    return function loop() {
        let args = arguments;
        let self = this;
        let now = Date.now();
        if(!start){
            start = now;
        }
        if(timer){
            clearTimeout(timer);
        }
        if(now - start >= mustRunDelay){
            method.apply(self, args);
            start = now;
        }else {
            timer = setTimeout(function () {
                loop.apply(self, args);
            }, 50);
        }
    }
}
function disableBodyTouch(state) {
    if(!isPC()){
        if(state){
            document.querySelector('body').addEventListener('touchstart', preventDefaultFn,{passive:false});
        }else{
            document.querySelector('body').removeEventListener('touchstart', preventDefaultFn);
        }

    }
}
function preventDefaultFn(e){
    try{
        return new Promise(()=>{
            if(e.preventDefault){
                e.preventDefault();
            }
        })
    }
    catch (e){}
}
function detectionCoordinate(x,y,targetX,targetY,w,h) {
    return x >= targetX && x <= targetX + w && y >= targetY && y <= targetY + h;
}

function removeNodeFromBody(node) {
    let body = document.body || document.getElementsByTagName("body")[0];
    body.removeChild(node);
}

const {
    MAX_SPEED,
    MAX_SCALE,
    MIN_SCALE,
    NORMAL_SCALE,
    NORMAL_TEXT,
    LOADING_TEXT,
    SUCCESS_TEXT,
    OPEN_CANVAS_TEXT,
    ERRPR_TEXT,
    CANCEL_TEXT,
    FAQ_URL,
    SUCCESS_IMG,
    FAIL_IMG,
    NORMAL_IMG,
    CIRCULAR_IMG_URL
}= cst;
function initRender(labelVisible) {

    let normalIcon =`<div  class="tiantest-animation-box" >
                <div class="tiantest-animation-scale">
                    <div class="rotor-x">
                        <div class="rotor-y">
                            <div class="rotor-z">
                                <div class="triangle-a">
                                    <div class="triangle face-1"></div>
                                    <div class="triangle face-2"></div>
                                    <div class="triangle face-3"></div>
                                    <div class="triangle face-4"></div>
                                </div>
                                <div class="triangle-b">
                                    <div class="triangle face-1"></div>
                                    <div class="triangle face-2"></div>
                                    <div class="triangle face-3"></div>
                                    <div class="triangle face-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    let successIcon = `<span class="tiantest-icon--success__line tiantest-icon--success__line--long"></span>
                <span class="tiantest-icon--success__line tiantest-icon--success__line--tip"></span>

                <div class="tiantest-icon--success__ring"></div>
                <div class="tiantest-icon--success__hide-corners"></div>`;
    let failIcon = ` <span class="tiantest-icon--error__line tiantest-icon--error__line--a"></span>
                <span class="tiantest-icon--error__line tiantest-icon--error__line--b"></span>

                <div class="tiantest-icon--error__ring"></div>
                <div class="tiantest-icon--error__hide-corners"></div>`;
    let ieClassNmae = "";
    if(!supportCss3("animation")){
        ieClassNmae = "ie-disable-animation";
        normalIcon = `
<div  class="tiantest-animation-box" style="display: none">
                <div class="tiantest-animation-scale">
                    <div class="rotor-x">
                        <div class="rotor-y">
                            <div class="rotor-z">
                                <div class="triangle-a">
                                    <div class="triangle face-1"></div>
                                    <div class="triangle face-2"></div>
                                    <div class="triangle face-3"></div>
                                    <div class="triangle face-4"></div>
                                </div>
                                <div class="triangle-b">
                                    <div class="triangle face-1"></div>
                                    <div class="triangle face-2"></div>
                                    <div class="triangle face-3"></div>
                                    <div class="triangle face-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
<img class="tiantest-ie-icon tiantest-ie-icon-normal" src="${NORMAL_IMG}" style="height: inherit;top: .08em; left: 0.15em;width: 0.18em;" />`;
        successIcon = `<img class="tiantest-ie-icon" src="${SUCCESS_IMG}" />`;
        failIcon = `<img class="tiantest-ie-icon" src="${FAIL_IMG}" />`;
    }

    let themeClassName;

    if(this.state.themeColor === "blue"){
        themeClassName = "tiantest-root-blue-theme";
    }
    else if(this.state.themeColor === "white"){
        themeClassName = "tiantest-root-white-theme";
    }
    else{
        themeClassName = "tiantest-root-normal-theme";
    }

    let html = `
     <div class="tiantest-root ${themeClassName}">
        <div class="tiantest-box" style="display: ${labelVisible ? "" : "none"};line-height: ${this.state.lineHeight};height:${this.state.lineHeight}; "> 
        
        
                 ${normalIcon}

            <div class="tiantest-icon tiantest-success-animation ${ieClassNmae?ieClassNmae:"tiantest-icon--success "}">
                ${successIcon}
            </div>


            <div class="tiantest-icon tiantest-error-animation ${ieClassNmae?ieClassNmae:"tiantest-icon--error "}">
                  ${failIcon}
            </div>

            <div class="tiantest-icon tiantest-icon--info tiantest-info-animation"></div>
        

            <div class="tiantest-content">
                
                <div class="tiantest-info-box">
                     <i class="tiantest iconmethod-draw-image tiantest-logo-icon"></i>
                     <span  class="tiantest-info">
                     ${NORMAL_TEXT}
                     </span>
                </div>
                
                 <div class="tiantest-success-box tiantest-end-box">
                     <div class="bg"></div>
                     <div class="font">
                     <i class="tiantest iconshiliangzhinengduixiang- tiantest-logo-icon"></i>
                     <span  class="tiantest-info">
                     ${SUCCESS_TEXT}
                     </span>
                     </div>
                </div>
                
                
                  <div class="tiantest-error-box tiantest-end-box">
                     <div class="bg"></div>
                     <div class="font">
                     <i class="tiantest iconyanzhengcuowu tiantest-logo-icon"></i>
                     <span  class="tiantest-info">
                     ${ERRPR_TEXT}
                     </span>
                     </div>
                </div>
                
                <div class="tiantest-info-box-no ">
                     <div class="bg"></div>
                     <div class="font">
                     <i class="tiantest tiantest-logo-icon ${this.state.themeColor === "normal" ? "iconmethod-draw-image" : "iconyanzhengcuowu"}"></i>
                     <span  class="tiantest-info">
                     ${CANCEL_TEXT}
                     </span>
                     </div>
                </div>
                
            </div>
        </div>

        <div class="tiantest-pop-full" style="display: none">
            <div class="tiantest-pop-bg"></div>
            <div class="tiantest-pop-content">
                <div class="tiantest-pop-floor">

                    <div class="tiantest-pop-mr"> <div class="tiantest-pop-text">请将 <span>圆圈</span> 依次拖过:</div></div>
                    <img src="" alt="" class="tiantest-right-img" />
                    
                             <div class="tiantest-btn tiantest-btn-close"><i class="tiantest iconguanbi"></i>
                                <div class="tiantest-tooltip  tiantest-tooltip-placement-top  tiantest-tooltip-hidden">
                                    <div class="tiantest-tooltip-content">
                                        <div class="tiantest-tooltip-arrow"></div>
                                        <div class="tiantest-tooltip-inner" role="tooltip">关闭验证</div>
                                    </div>
                                </div>
                             </div>
                </div>
                <div class="canvas-box">
                    <div  class="tiantest-canvas tiantest-img-loading">
                    <i class="tiantest icontupian1"></i>
                    <p>加载中</p>
                    </div>
                    <canvas  class="tiantest-canvas circle-block"></canvas>
                    <canvas  class="tiantest-canvas tiantest-canvas-big"></canvas>
                    <div  class="tiantest-error-text-box">
                        <div class="tiantest-error-text">小伙砸，你很不错</div>
                    </div>
                    <div  class="tiantest-success-text-box">
                        <div class="tiantest-success-text">验证通过</div>
                    </div>
                    <div class="tiantest-type-click-render-list"></div>
                </div>

                <div class="tiantest-btn-box">
                        <p class="tiantest-company-tr"><i class="tiantest iconmethod-draw-image"></i>由天验提供技术支持</p>

                    <div class="tiantest-btn tiantest-btn-refresh"><i class="tiantest iconshuaxin"></i>
                                                    <div class="tiantest-tooltip  tiantest-tooltip-placement-top  tiantest-tooltip-hidden">
                                    <div class="tiantest-tooltip-content">
                                        <div class="tiantest-tooltip-arrow"></div>
                                        <div class="tiantest-tooltip-inner" role="tooltip">刷新验证</div>
                                    </div>
                                </div>
                    </div>
                    <div class="tiantest-btn tiantest-btn-faq" title="帮助反馈"><a style="text-decoration:none" href="${FAQ_URL}" target="_blank"><i class="tiantest iconjieshi"></i></a>
                                                                        <div class="tiantest-tooltip  tiantest-tooltip-placement-top  tiantest-tooltip-hidden">
                                    <div class="tiantest-tooltip-content">
                                        <div class="tiantest-tooltip-arrow"></div>
                                        <div class="tiantest-tooltip-inner" role="tooltip">帮助反馈</div>
                                    </div>
                                </div>
                    </div>
            
                </div>
            </div>
        </div>
        
        <div class="tiantest-pop-full-loading-box" style="display: none">
        <div class="tiantest-pop-full-loading-bg"></div>
        <div class="tiantest-pop-full-loading-content">
        <div class="tiantest-pop-full-loading-animation"><i class="tiantest iconshuaxin"></i></div>
        <div class="tiantest-pop-full-loading-title">增强验证检测中...</div>
        <div class="tiantest-pop-full-loading-text"><p><i class="tiantest iconmethod-draw-image"></i>由天验提供技术支持</p></div>
</div>
</div>
    </div>
    `;
    this.state.ele.innerHTML += html;
}

const {
    MAX_SPEED: MAX_SPEED$1,
    MAX_SCALE: MAX_SCALE$1,
    MIN_SCALE: MIN_SCALE$1,
    NORMAL_SCALE: NORMAL_SCALE$1,
    NORMAL_TEXT: NORMAL_TEXT$1,
    LOADING_TEXT: LOADING_TEXT$1,
    SUCCESS_TEXT: SUCCESS_TEXT$1,
    OPEN_CANVAS_TEXT: OPEN_CANVAS_TEXT$1,
    ERRPR_TEXT: ERRPR_TEXT$1,
    CANCEL_TEXT: CANCEL_TEXT$1,
    FAQ_URL: FAQ_URL$1,
    SUCCESS_IMG: SUCCESS_IMG$1,
    FAIL_IMG: FAIL_IMG$1,
    NORMAL_IMG: NORMAL_IMG$1,
    CIRCULAR_IMG_URL: CIRCULAR_IMG_URL$1
}= cst;

function initAnimation(){
    let root = this.state.ele.querySelectorAll(".tiantest-root")[0];
    if(isPC() || isIpad()){
        let tiantestBox = this.state.ele.querySelectorAll(".tiantest-box")[0];
        tiantestBox.className += " tiantest-box-pc";
        root.className += " tiantest-root-pc";
    }else{
        this.state.speed = 1;
        let popBox = this.state.ele.querySelectorAll(".tiantest-pop-content")[0];
        //popBox.className = "tiantest-pop-content tiantest-pop-content-mobile"
        root.className += " tiantest-root-mobile";
    }
}

function translate(direction,speed){
    if(direction === null){
        direction = this.state.direction;
    }
    if(direction === "leftMove"){
        speed = -speed;
    }else{
        speed = Math.abs(speed);
    }
    this.state.speed = speed;
}

function startAnimation() {
    let body = document.body || document.getElementsByTagName("body")[0];

    let tiantestAnimation = this.state.ele.querySelectorAll(".rotor-x")[0];
    let tiantestBoxScale = this.state.ele.querySelectorAll(".tiantest-animation-scale")[0];

    let tiantestInfo =  this.state.ele.querySelectorAll(".tiantest-info")[0];

    let tiantestPopFull =  this.state.ele.querySelectorAll(".tiantest-pop-full")[0];
    let canvasBig = this.state.ele.querySelectorAll(".tiantest-canvas-big")[0];
    let ctxBig = canvasBig.getContext("2d");
    let circleBlock = this.state.ele.querySelectorAll(".circle-block")[0];
    let circleBlockCtx = circleBlock.getContext("2d");
    let loadingBOx = this.state.ele.querySelectorAll(".tiantest-pop-full-loading-box")[0];

    let tiantestLeftImg =  this.state.ele.querySelectorAll(".tiantest-right-img")[0];
    let self = this;

    let scaleState = true;

    let secnRender = false;

    let temp = function () {

        if(!self.state){
            return;
        }

        tiantestInfo.innerText !== self.state.msg ? tiantestInfo.innerText = self.state.msg : "";

        if(self.state.isOver === true){
            tiantestPopFull.style.display = "none";
            return;
        }

        if(self.state.isShowCanvas){
            if(secnRender){
                setTimeout(()=>{
                    tiantestPopFull.style.top = "";
                    loadingBOx.style.display = "none";
                },500);
            }
            if(tiantestPopFull.style.display === "none"){

                tiantestPopFull.style.display = "block";
                tiantestPopFull.style.top = "-999px";
                secnRender = true;


                if(self.state.canvas.topMsg){
                    let tiantestPopText = self.state.ele.querySelectorAll(".tiantest-pop-text")[0];
                    tiantestPopText.innerHTML = self.state.canvas.topMsg;
                }
            }else{
                secnRender = false;
            }
            renderCanvas();
        }else if(self.state.isShowCanvas === false){
            tiantestPopFull.style.display = "none";
        }




        if(self.state.isStop === false){

            if(self.state.animationDeg >= 360){
                self.state.animationDeg -= 360;
            }
            else if(self.state.animationDeg <= -360){
                self.state.animationDeg += 360;
            }
            self.state.animationDeg += self.state.speed;
            let animationDeg = self.state.animationDeg;
            renderDeg(animationDeg);
        }
        if(self.state.isScale=== true || self.state.scale !== NORMAL_SCALE$1){

            if(self.state.scale === MAX_SCALE$1){
                scaleState = false;
            }
            else if(self.state.scale === MIN_SCALE$1){
                scaleState = true;
            }
            if(scaleState){
                self.state.scale += 0.25;
            }else{
                self.state.scale -= 0.25;
            }
            let scale = self.state.scale/100;
            tiantestBoxScale.style.transform = "scale3d("+scale+","+scale+","+scale+")";
        }

        if(requestAnimationFrame){
            requestAnimationFrame(temp);
        }else{
            setTimeout(temp,16);
        }
    };

    function renderDeg(animationDeg){
        tiantestAnimation.style.transform = "rotateY("+animationDeg+"deg)";
    }

    let isFrist = true;
    let prevLen = 0;
    let clickRenderListBox =  this.state.ele.querySelectorAll(".tiantest-type-click-render-list")[0];

    let resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

    self.addEvent(resizeEvt,()=>{
        let canvasW = circleBlock.offsetWidth,
            canvasH = circleBlock.offsetHeight;

        circleBlock.width=canvasW;
        circleBlock.height=canvasH;
        circleBlockCtx.fillStyle = 'rgba(255, 255, 255, 0)';
        circleBlockCtx.fillRect(0,0,canvasW,canvasH);

        canvasBig.width=canvasW;
        canvasBig.height=canvasH;

        let circleWH = Math.ceil(canvasW*self.state.canvas.circlePercent);
        self.state.canvas.circleWH = [circleWH,circleWH];
        ctxBig.fillStyle = 'rgba(255, 255, 255, 0)';
        ctxBig.fillRect(0,0,canvasW,canvasH);

        self.state.canvas.isRest = true;
        self.state.canvas.circlePosition = self.state.canvas.originPosition;

        if(self.state.canvas.fullPopCanvas ){
            self.state.mouse.isStart = false;
            self.state.data.track = [];
            self.state.data.circleTrack = [];
            this.removeFullCanvasNode(self.state.canvas.fullPopCanvas);
        }
    }, false);

    function renderCanvas() {
        let fullPopCanvasCtx = self.state.canvas.fullPopCanvasCtx;
        if(isFrist){
            isFrist = false;

            let canvasW = circleBlock.offsetWidth,
                canvasH = circleBlock.offsetHeight;


            circleBlock.width=canvasW;
            circleBlock.height=canvasH;
            circleBlockCtx.fillStyle = 'rgba(255, 255, 255, 0)';
            circleBlockCtx.fillRect(0,0,canvasW,canvasH);

            canvasBig.width=canvasW;
            canvasBig.height=canvasH;

            let circleWH = Math.ceil(canvasW*self.state.canvas.circlePercent);
            self.state.canvas.circleWH = [circleWH,circleWH];
            ctxBig.fillStyle = 'rgba(255, 255, 255, 0)';
            ctxBig.fillRect(0,0,canvasW,canvasH);
        }else{
            circleBlockCtx && circleBlockCtx.clearRect(0,0,circleBlock.offsetWidth,circleBlock.offsetHeight);
            fullPopCanvasCtx && fullPopCanvasCtx.clearRect(0,0,body.offsetWidth,body.offsetHeight);
        }

        let circleWH = self.state.canvas.circleWH;

        if(self.state.canvas.isRest){
            self.state.canvas.isRest = false;
            let canvasW = circleBlock.offsetWidth;
            let position = self.state.canvas.circlePosition;
            if(position){
                self.state.canvas.circlePosition = [position[0]/440 * canvasW ,position[1]/440 * canvasW ];
            }

        }

        let circlePosition = self.state.canvas.circlePosition;

        if(self.state.canvas.verifyType === 1){
            if(self.state.canvas.fullPopCanvasCtx){
                if(self.state.data.circleTrack.length>0){

                    fullPopCanvasCtx.beginPath();
                    fullPopCanvasCtx.moveTo(self.state.data.circleTrack[0][0],self.state.data.circleTrack[0][1]);
                    fullPopCanvasCtx.lineWidth=circleWH[0];
                    fullPopCanvasCtx.lineCap="round";
                    fullPopCanvasCtx.lineJoin="round";
                    fullPopCanvasCtx.strokeStyle="rgba(255, 255, 255, 0.5)";

                    let x,y;
                    self.state.data.circleTrack.forEach((item,index)=>{
                        if(index !== 0){
                            if(Math.abs(item[0]-x)<1 && Math.abs(item[1]-y)<1);else{
                                fullPopCanvasCtx.lineTo(item[0],item[1]);
                            }

                            x = item[0];
                            y = item[1];
                        }
                    });
                    fullPopCanvasCtx.stroke();
                }
                fullPopCanvasCtx.drawImage(self.state.canvas.circleImg,
                    circlePosition[0],circlePosition[1],circleWH[0],circleWH[1]);
            }else{
                circleBlockCtx.drawImage(self.state.canvas.circleImg,
                    circlePosition[0]-circleWH[0]/2,circlePosition[1]-circleWH[1]/2,circleWH[0],circleWH[1]);
            }

        }


        ctxBig.drawImage(self.state.canvas.bigImg,
            0,0,circleBlock.offsetWidth,circleBlock.offsetHeight);


        if(self.state.canvas.verifyType === 2){
            if(self.state.data.circleTrack.length>0){
                let html = "";
                self.state.data.circleTrack.forEach((item,index)=>{
                    item[0] = parseInt(item[0]);
                    item[1] = parseInt(item[1]);
                    if(index>=prevLen && self.state.data.circleTrack.length>=prevLen){
                        html += `<span class="fadeIn" style="left: ${item[0]-15}px;top:${item[1]-15}px"><span>${index+1}</span></span>`;
                    }else{
                        html += `<span style="left: ${item[0]-15}px;top:${item[1]-15}px"><span>${index+1}</span></span>`;
                    }
                });
                if(prevLen !== self.state.data.circleTrack.length){
                    clickRenderListBox.innerHTML = html;
                    prevLen = self.state.data.circleTrack.length;
                }
            }else{
                clickRenderListBox.innerHTML = "";
            }
        }

        if(self.state.mouse.isStart){
            self.state.data.circleTrack.push(
                [Math.round(circlePosition[0]+circleWH[0]/2),
                    Math.round(circlePosition[1]+circleWH[1]/2)
                ]);
        }

        if(self.state.canvas.smallImg && tiantestLeftImg.src !== self.state.canvas.smallImg){
            tiantestLeftImg.src = self.state.canvas.smallImg;
        }

    }

    if(requestAnimationFrame){
        requestAnimationFrame(temp);
    }else{
        setTimeout(temp,16);
    }
}

let lastClassName1,lastClassName2;
function endAnimation(state,self){
    let tiantestBox = self.state.ele.querySelectorAll(".tiantest-box")[0];
    disableBodyTouch(false);

    if(self.state.themeColor === "normal" && state){
        tiantestBox.className = "tiantest-box tiantest-box-ing";
        setTimeout(()=>{
            tiantestBox.className = "tiantest-box tiantest-box-"+state;
        },250);
    }else{
        if(!state){
            if(lastClassName1){
                self.state.ele.querySelectorAll(lastClassName2)[0].style.display = "none";
                self.state.ele.querySelectorAll(".tiantest-info-box")[0].className = lastClassName1;
            }
        }
        else if(state === "info"){
            tiantestBox.className = "tiantest-box tiantest-box-"+state;
        }
        else{
            let box = self.state.ele.querySelectorAll(`.tiantest-${state}-box`)[0];
            let infoBox = self.state.ele.querySelectorAll(".tiantest-info-box")[0];
            lastClassName1 = infoBox.className;
            lastClassName2 =`.tiantest-${state}-box`;
            infoBox.className += " tiantest-info-box-end-animation";
            box.style.display = "block";

            if(self.state.themeColor === "white"){
                if(!supportCss3("clip-path") || isEdge()){
                    box.className += ` tiantest-box-disable-border tiantest-${state}-box-border`;
                }
            }

        }
    }


}

/**
 * @param refresh  是否刷新
 * @param data   提交的时候的轨迹
 * @param ctx   实例对象
 * @returns {Promise<any>}
 */

function requestImages(refresh=false,track=[],ctx) {
    return new Promise(function(resolve, reject){
        console.log('0')
        console.info(JSON.stringify(track));

        $.post("http://tiantest.natapp1.cc/predict", "trace=" + JSON.stringify(track)).then( data => {
           console.log('data', data)
           if (data.code === 0){
               var res = data.data ? '勾' : '不是勾'
               alert(`预测结果：${res}     小伙砸， 对了吧，都是你样本划的好！！`)
           }
        }, err => {

        });
        _tiantest._verify(function (data) {
            if (data.code !== 0) {
                resolve({
                    status: 3
                });
                return console.warn("Tiantest 错误 " + data.msg);
            }
            console.log('1')
            resolve(data.data);
        });
    })
}

function tiantestSubmit(ctx) {
/*    _tiantest.debug = _tiantest.debug ? _tiantest.debug : {};
    _tiantest.debug.track = this.state.data.track;*/

    return new Promise((resolve)=>{
        requestImages(false,ctx.state.data.track).then(resolve);
    })
}

const {
    MAX_SPEED: MAX_SPEED$2,
    MAX_SCALE: MAX_SCALE$2,
    MIN_SCALE: MIN_SCALE$2,
    NORMAL_SCALE: NORMAL_SCALE$2,
    NORMAL_TEXT: NORMAL_TEXT$2,
    LOADING_TEXT: LOADING_TEXT$2,
    SUCCESS_TEXT: SUCCESS_TEXT$2,
    OPEN_CANVAS_TEXT: OPEN_CANVAS_TEXT$2,
    ERRPR_TEXT: ERRPR_TEXT$2,
    CANCEL_TEXT: CANCEL_TEXT$2,
    FAQ_URL: FAQ_URL$2,
    SUCCESS_IMG: SUCCESS_IMG$2,
    FAIL_IMG: FAIL_IMG$2,
    NORMAL_IMG: NORMAL_IMG$2,
    CIRCULAR_IMG_URL: CIRCULAR_IMG_URL$2
}= cst;

function initMouse() {
    let body = document.body || document.getElementsByTagName("body")[0];
    let tiantestBox = this.state.ele.querySelectorAll(".tiantest-box")[0];
    let circleBlock = this.state.ele.querySelectorAll(".circle-block")[0];
    let clientHeight = body.clientHeight;
    let pop = this.state.ele.querySelectorAll(".tiantest-pop-content")[0];
    let box = this.state.ele.querySelectorAll(".canvas-box")[0];
    let tiantestPopBg = this.state.ele.querySelectorAll(".tiantest-pop-bg")[0];

    let btnClose = this.state.ele.querySelectorAll(".tiantest-btn-close")[0];
    let btnRefresh = this.state.ele.querySelectorAll(".tiantest-btn-refresh")[0];
    let btnFaq = this.state.ele.querySelectorAll(".tiantest-btn-faq")[0];

    let isFirst = false;


    tiantestBox.addEventListener("click",function () {
        if(self.state.isOver){
            return false;
        }
        if(self.state.msg !== LOADING_TEXT$2){
            self.state.msg = LOADING_TEXT$2;
            tiantestBox.className = "tiantest-box";
            disableBodyTouch(true);
            self.clicktiantestBox(true,isFirst);
            if(!isFirst){
                isFirst = true;
            }
        }
    });
    let eventName = isPC() ? "click" : "touchstart";
    tiantestPopBg.addEventListener(eventName,close);
    btnClose.addEventListener(eventName,close);
    btnRefresh.addEventListener(eventName,()=>{this.clicktiantestBox(null,true);});

    if(!isPC()){
        btnFaq.addEventListener(eventName,()=>{window.location.href=FAQ_URL$2;});
    }
    let self = this;

    let blockLastX =  0,
        blockLastY =  0;

    if(isPC()){
        self.addEvent("mousemove",throttle(function (e) {

            let offsetX = e.clientX;
            let offsetY = e.clientY;
            let eleY = self.state.ele.getBoundingClientRect().top;

            let distance = Math.abs(offsetY-eleY);
            let speed = (distance/(clientHeight-eleY))* MAX_SPEED$2;


            if(speed > MAX_SPEED$2){
                speed = MAX_SPEED$2;
            }
            if(speed <= 0.5){
                speed = 0.5;
            }
            self.translate(self.state.direction,speed);
        },500));

        tiantestBox.addEventListener("mouseover",function (e) {
            //self.state.isStop = true;
            self.state.isScale = true;
        });
        tiantestBox.addEventListener("mouseout",function (e) {
            //self.state.isStop = false;
            self.state.isScale = false;
        });

        // 采集数据

        circleBlock.addEventListener("mousedown",inTarget(down));
        circleBlock.addEventListener("mousemove",inTarget(moveBefroeDraw));

    }else{

        // 采集数据

        circleBlock.addEventListener("touchstart",inTarget(down));
        circleBlock.addEventListener("touchmove",inTarget(move));
        circleBlock.addEventListener("touchend",inTarget(end));
    }

    self.submitCallback = submitCallback;

    function defineWH() {
        let body = document.body || document.getElementsByTagName("body")[0];
        let html = document.getElementsByTagName("html")[0];
        html.style.height = "100%";
        html.style.width = "100%";
        body.style.height = "100%";
        body.style.width = "100%";
    }

    function insertCanvas() {
        defineWH();
        let canvas = document.createElement("canvas");
        let body = document.body || document.getElementsByTagName("body")[0];
        canvas.className = "tiantest-full-canvas";
        body.appendChild(canvas);
        let ctx = canvas.getContext("2d");
        self.state.canvas.fullPopCanvas = canvas;
        self.state.canvas.fullPopCanvasCtx = ctx;
        canvas.width = body.offsetWidth;
        canvas.height = body.offsetHeight;
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0,0,body.offsetWidth,body.offsetHeight);


        return canvas;
    }

    function removeNode(node) {
        let body = document.body || document.getElementsByTagName("body")[0];
        body.removeChild(node);
        self.state.canvas.fullPopCanvas = null;
        self.state.canvas.fullPopCanvasCtx = null;
    }

    function close() {
        self.state.isShowCanvas = false;
        endAnimation("info",self);
    }

    function down(e,isIn) {
        let {offsetX,offsetY} = e;

        if((isIn || self.state.canvas.isAnyPointStart) && !self.state.mouse.disable && self.state.canvas.verifyType === 1){
            if(!isPC() && !isIpad());else{
                pop.className = "tiantest-pop-content";
            }
            if(self.state.canvas.isAnyPointStart){
                self.state.canvas.originPosition = [offsetX,offsetY];
                self.state.canvas.circlePosition = [offsetX,offsetY];
            }
            blockLastX = offsetX;
            blockLastY = offsetY;
            let circleWH = self.state.canvas.circleWH;
            self.state.mouse.isStart = true;
            self.state.mouse.startTime = new Date().getTime();
            self.state.data.track = [];
            self.state.canvas.circlePosition[0] += pop.offsetLeft+box.offsetLeft-circleWH[0]/2;
            self.state.canvas.circlePosition[1] += pop.offsetTop+box.offsetTop-circleWH[0]/2;

            let canvas = insertCanvas();

            if(isPC()){
                canvas.addEventListener("mousemove",inTarget(move,true));
                canvas.addEventListener("mouseup",inTarget(end,true));
            }else{
                //canvas.addEventListener("touchmove",inTarget(move,true));
                canvas.addEventListener("touchend",inTarget(end,true));
            }
        }else{
            if(self.state.canvas.verifyType === 2){
                --self.state.canvas.pointNum;
                let w = circleBlock.offsetWidth;
                let h = circleBlock.offsetHeight;
                if(self.state.canvas.pointNum >= 0){
                    self.state.data.track.push(
                        [
                            (offsetX / w).toFixed(2),
                            (offsetY / h).toFixed(2)
                        ]
                    );
                    self.state.data.circleTrack.push(
                        [
                            offsetX,
                            offsetY
                        ]
                    );
                }

                if(self.state.canvas.pointNum  === 0){
                    self.state.mouse.disable = true;
                    self.tiantestSubmit(self).then(submitCallback);
                }
            }

        }
    }


    function moveBefroeDraw(e,isIn) {
        if(isIn){
            circleBlock.style.cursor = "pointer";
        }else{
            circleBlock.style.cursor = "";
        }
    }

    let state = false;
    let lastCollectX = 0,
        lastCollectY = 0,
        lastCollectT = 0;

    function move(e,isIn) {
        let {offsetX,offsetY} = e;
        let w = circleBlock.offsetWidth;
        let h = circleBlock.offsetHeight;

        if(self.state.mouse.isStart === true){

            if(state === false && isPC()){
                self.state.canvas.circlePosition[0] -= pop.offsetLeft+box.offsetLeft;
                self.state.canvas.circlePosition[1] -= pop.offsetTop+box.offsetTop;
                state = true;
            }

            self.state.canvas.circlePosition[0]  +=  -(blockLastX - offsetX);
            self.state.canvas.circlePosition[1]  +=  -(blockLastY - offsetY);
            blockLastX = offsetX;
            blockLastY = offsetY;

            if(isPC()){
                offsetX -= pop.offsetLeft + box.offsetLeft;
                offsetY -= pop.offsetTop + box.offsetTop;
            }

            let current_record_time = new Date().getTime() - self.state.mouse.startTime;
            //TYPE 1 Track
            if (!(offsetX > 0 && offsetX < w && offsetY > 0 && offsetY < h)) return;

            if (Math.abs(lastCollectX / w - offsetX / w) < 0.01
                && Math.abs(lastCollectY / h - offsetY / h) < 0.01
                && Math.abs(current_record_time - lastCollectT < 5)) return;
            
            self.state.data.track.push([
                (offsetX / w).toFixed(2),
                (offsetY / h).toFixed(2),
                current_record_time
            ])
            
            lastCollectX = offsetX;
            lastCollectY = offsetY;
            lastCollectT = current_record_time;
        }
    }

    function end() {
        state = false;
        if(self.state.mouse.isStart && self.state.canvas.verifyType === 1){
            self.state.mouse.isStart = false;
            self.state.mouse.disable = true;
            self.tiantestSubmit(self).then(submitCallback);
        }
    }

    function submitCallback(res) {

        if(res.status === 2){
            self.state.msg = SUCCESS_TEXT$2;

            if(self.state.lableVisible === false){
                pop.className += " tiantest-pop-content-success-animation";
                setTimeout(()=>{
                    self.state.isOver = true;
                    self.state.isShowCanvas = false;
                    if(self.state.canvas.fullPopCanvas){
                        removeNode(self.state.canvas.fullPopCanvas);
                    }
                    self.state.ele.removeChild(self.state.ele.querySelectorAll(".tiantest-root")[0]);
                },1500);
                return;
            }else{
                self.state.isOver = true;
                self.state.isShowCanvas = false;
                endAnimation("success",self);
            }
            self.state.mouse.disable = false;
            if(self.state.canvas.fullPopCanvas){
                removeNode(self.state.canvas.fullPopCanvas);
            }
        }
        else if(res.status === 1){
            if(self.state.canvas.fullPopCanvas){
                removeNode(self.state.canvas.fullPopCanvas);
            }
            let name =   pop.className;
            pop.className += " tiantest-pop-content-error-animation";
            setTimeout(()=>{
                self.clicktiantestBox(false,false,res).then(()=>{
                    self.state.mouse.disable = false;
                    setTimeout(()=>{
                        pop.className = name;
                    },3000);
                });
            },500);
        }
        else if(res.status === 3){
            self.state.isShowCanvas = false;
            self.state.msg = ERRPR_TEXT$2;
            if(self.state.canvas.fullPopCanvas){
                removeNode(self.state.canvas.fullPopCanvas);
            }
            endAnimation("error",self);
        }
        self.state.mouse.disable = false;
        self.state.data.track = [];
        self.state.data.circleTrack = [];
    }


    function inTarget(callback,isFull) {
        return function (e) {
            //let {offsetX,offsetY} = e;
            e.preventDefault();

            let srcObj = e.target || e.srcElement;
            let rect = srcObj.getBoundingClientRect();
            let clientx = e.clientX;
            let clienty = e.clientY;
            let offsetX = clientx - rect.left;
            let offsetY = clienty - rect.top;
            let obj = {
                offsetX,offsetY
            };
            if(e.targetTouches && e.targetTouches.length>0){
                offsetX = e.targetTouches && e.targetTouches[0] && e.targetTouches[0].clientX-pop.offsetLeft-box.offsetLeft;
                offsetY = e.targetTouches && e.targetTouches[0] && e.targetTouches[0].clientY-pop.offsetTop-box.offsetTop;

                obj = {
                    offsetX,offsetY
                };
            }
            else if(isFull){
                /* offsetX = offsetX-pop.offsetLeft-box.offsetLeft;
                 offsetY = offsetY-pop.offsetTop-box.offsetTop;*/

                obj = {
                    offsetX,offsetY
                };
            }

            let circlePosition = self.state.canvas.circlePosition;
            let circleWH = self.state.canvas.circleWH;

            if(detectionCoordinate(offsetX,offsetY,circlePosition[0]-circleWH[0]/2,circlePosition[1]-circleWH[0]/2,circleWH[0],circleWH[1])){
                callback(obj,true);
            }else{
                callback(obj,false);
            }
        }
    }

    function restVar() {
        state = false;
        lastCollectX = 0;
        lastCollectY = 0;
        lastCollectT = 0;
        blockLastX =  0;
        blockLastY =  0;
    }

    self.state.canvas.restVar = restVar;
}
function clicktiantestBox(isShowFullLoading=false,isRefresh,resultData=null) {
    let self = this;
    let loading = self.state.ele.querySelectorAll(".tiantest-img-loading")[0];
    let loadingBOx = self.state.ele.querySelectorAll(".tiantest-pop-full-loading-box")[0];
    let retryNum = 0;

    return new Promise((resolve)=>{
        loading.style.display = "block";
        let timer = setTimeout(()=>{
            if(isShowFullLoading){
                loadingBOx.style.display = "block";
            }
        },500);

        self.state.data.track = [];
        self.state.data.circleTrack = [];
        let resultFn = function (res) {

            let {bigImg,smallImg,position,status,msg:topMsg,type=1,point} = res;
            if(status === 2){
                self.submitCallback({status:2});
                loadingBOx.style.display = "none";
                clearTimeout(timer);
                return;
            }
            else if(status === 3){
                self.submitCallback({status:3});
                loadingBOx.style.display = "none";
                clearTimeout(timer);
                return;
            }
            Promise.all([loadImg(bigImg),loadImg(CIRCULAR_IMG_URL$2)])
                .then(([bigImg,circleImg])=>{
                    clearTimeout(timer);
                    if(topMsg){
                        self.state.canvas.topMsg  = topMsg;
                    }


                    self.state.canvas.isRest = true;
                    self.state.canvas.bigImg = bigImg;

                    let box = self.state.ele.querySelectorAll(".tiantest-btn-box")[0];
                    if(smallImg){
                        self.state.canvas.smallImg = smallImg;
                        box.className = "tiantest-btn-box";
                    }else{
                        box.className = "tiantest-btn-box tiantest-btn-box-right";
                    }
                    self.state.msg = OPEN_CANVAS_TEXT$2;
                    endAnimation(null,self);
                    self.changeCanvasStatus(true);
                    setTimeout(()=>{
                        loading.style.display = "none";
                    },300);

                    self.state.canvas.verifyType = type;

                    if(type === 1){
                        self.state.canvas.circleImg = circleImg;
                        if(!position){
                            self.state.canvas.isAnyPointStart = true;
                            self.state.canvas.originPosition = [-100,-100];
                            self.state.canvas.circlePosition = [-100,-100];
                        }else{
                            self.state.canvas.isAnyPointStart = false;
                            let positionToList = [position.x,position.y];
                            self.state.canvas.originPosition = positionToList;
                            self.state.canvas.circlePosition = positionToList;
                        }
                    }
                    else if(type === 2 && point > 0){
                        self.state.canvas.pointNum = point;
                        self.initClickListen();
                    }else {
                        throw "Unknown type "+type
                    }
                    resolve();
                }).catch(e=>{
                if(retryNum>2){
                    endAnimation("error",self);
                }else{
                    ++retryNum;
                    requestImages(isRefresh).then(resultFn);
                }
            });
        };
        if(resultData){
            resultFn(resultData);
        }else{
            requestImages(isRefresh).then(resultFn).catch(function (error) {
                if(retryNum>2){
                    endAnimation("error",self);
                }else{
                    ++retryNum;
                    requestImages(isRefresh).then(resultFn);
                }
            });
        }

    })
}

/**
 * 监听圆点点击撤回操作
 */
function initClickListen() {
    let box =  this.state.ele.querySelectorAll(".tiantest-type-click-render-list")[0];
    let fn = (index)=>{
        this.state.data.circleTrack.splice(index,1);
        this.state.data.track.splice(index,1);
        this.state.canvas.pointNum += 1;
    };
    if(isPC()){
        box.onclick = (e)=>{
            let index = Number(e.target.innerText)-1;
            fn(index);
        };
    }else{
        box.ontouchstart = (e)=>{
            let index = Number(e.target.innerText)-1;
            fn(index);
        };
    }
}

const {
    MAX_SPEED: MAX_SPEED$3,
    MAX_SCALE: MAX_SCALE$3,
    MIN_SCALE: MIN_SCALE$3,
    NORMAL_SCALE: NORMAL_SCALE$3,
    NORMAL_TEXT: NORMAL_TEXT$3,
    LOADING_TEXT: LOADING_TEXT$3,
    SUCCESS_TEXT: SUCCESS_TEXT$3,
    OPEN_CANVAS_TEXT: OPEN_CANVAS_TEXT$3,
    ERRPR_TEXT: ERRPR_TEXT$3,
    CANCEL_TEXT: CANCEL_TEXT$3,
    FAQ_URL: FAQ_URL$3,
    SUCCESS_IMG: SUCCESS_IMG$3,
    FAIL_IMG: FAIL_IMG$3,
    NORMAL_IMG: NORMAL_IMG$3,
    CIRCULAR_IMG_URL: CIRCULAR_IMG_URL$3
}= cst;

class TiantestObject {
    constructor(ele,option){
        let lableVisible = true;
        if(!ele){
            lableVisible = false;
            ele = document.createElement("div");
            document.getElementsByTagName("body")[0].appendChild(ele);
        }
        this.state = {
            ele: ele,

            direction: "rightMove",
            speed: 0.1,
            animationDeg: 180,
            scale: NORMAL_SCALE$3,

            themeColor: "blue",
            lableVisible,
            ...option,

            isStop: false,
            isScale: false,
            isOver: null,
            isShowCanvas: null,

            msg: NORMAL_TEXT$3,

            canvas: {
                fullPopCanvas: undefined,//dom element

                fullPopCanvasCtx: null,
                canvasCtx: null,//canvas content

                circleImg: null,//Image Object
                bigImg: null,//Image Object

                smallImg: null,//Image url


                isRest: true,

                isAnyPointStart: false,

                originPosition: [0, 0],
                circlePosition: [0, 0],
                circleWH: [40, 40],
                circlePercent: 0.12,

                verifyType: null, // 1 拖动 ， 2 点击

                pointNum: 0, //点击次数
            },

            mouse: {
                isStart: false,
                startTime: 0,
            },

            data: {
                track: [], //[ ...[x,y,ms] ]
                circleTrack: [],
            },

            events: []  //save event callback
        }
        ;




        this.initRender(lableVisible);
        initElemeSize(ele.querySelectorAll(".tiantest-root")[0]);
        this.initMouse();
        this.initAnimation();
        this.startAnimation();
    }

    destroy(){
        this.state.isOver = true;
        this.state.events.forEach(({eventName,fn})=>{
            window.removeEventListener(eventName,fn);
        });
        this.state.ele.innerHTML = "";
        this.state = null;
    }

    removeFullCanvasNode(node){
        removeNodeFromBody(node);
        self.state.canvas.restVar();
        self.state.canvas.fullPopCanvas = null;
        self.state.canvas.fullPopCanvasCtx = null;
    }

    addEvent(eventName,fn,state) {
        this.state.events.push({eventName,fn});
        window.addEventListener(eventName,fn,state);
    }

    changeCanvasStatus(state){
        this.state.isShowCanvas = !!state;
    }
    initRender(...props){
        return initRender.bind(this)(...props)
    };
    initMouse(...props){
        return initMouse.bind(this)(...props)
    };
    translate(...props){
        return translate.bind(this)(...props)
    };
    initAnimation(...props){
        return initAnimation.bind(this)(...props)
    };
    clicktiantestBox(...props){
        return clicktiantestBox.bind(this)(...props)
    };
    startAnimation(...props){
        return startAnimation.bind(this)(...props)
    };
    tiantestSubmit(...props){
        return tiantestSubmit.bind(this)(...props)
    };
    initClickListen(...props){
        return initClickListen.bind(this)(...props)
    };
}



new TiantestObject(document.getElementById("tiantestificationCode"),{
            themeColor:"white", // white or blue or normal , default : blue
            lineHeight:null,// default : 44px
        }, _tiantest)
        
