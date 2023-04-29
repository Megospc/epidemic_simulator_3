const version = "3.10.0"; //версия программы
const fps = 30; //количество кадров в игровой секунде
const lands = [ //массив цветов ландшафтов
  "#ffffff",
  "#80a000",
  "#00a0a0",
  "#a000a0",
  "#90a000",
  "#a00000",
  "#606000",
  "#f0a070",
  "#a00050",
  "#0040a0",
  "#802000",
  "#408020",
  "#000000",
  "#5000a0",
  "#a05000",
  "#a07800",
  "#0060a0",
  "#60c0d0",
  "#50a000",
  "#f0f080",
  "#600000",
  "#804080",
  "#404080"
];

//получение JSON симуляции:
var json;
{
  let url = new URL(location.href);
  json = (url.searchParams.get('open') ? sessionStorage.getItem('epidemic_simulator_json'):null) ?? `{
    "name": "epidemic_simulator",
    "states": [
      { "color": "#00a000", "name": "здоровые", "hiddengraph": true }, 
      { "color": "#a05000", "prob": 0.05, "time": 30000, "initial": 10, "zone": 8, "name": "коклюш" },
      { "color": "#a0a000", "prob": 0.1, "time": 20000, "initial": 3, "zone": 6, "name": "скарлатина" },
      { "color": "#a00000", "prob": 0.5, "time": 1000, "initial": 1, "zone": 8, "name": "COVID-19" },
      { "color": "#0000a0", "prob": 0.03, "time": 10000, "initial": 20, "zone": 10, "name": "грипп" },
      { "color": "#000000", "prob": 0.0001, "time": 2000, "initial": 5, "zone": 420, "name": "чума" },
      { "color": "#a000a0", "prob": 0.05, "time": 15000, "initial": 5, "zone": 8, "speed": 3, "name": "бешенство" },
      { "color": "#00a0a0", "prob": 1, "initial": 1, "zone": 2.5, "protect": 0.9, "transparent": true, "name": "призраки" },
      { "color": "#00a0a0", "prob": 0.03, "initial": 1, "time": 20000, "zone": 10, "protect": 0.6, "heal": 1, "name": "насморк" },
      { "color": "#a00050", "prob": 0.01, "time": 60, "initial": 25, "zone": 10, "after": 10000, "name": "свинка" },
      { "color": "#80a0ff", "prob": 0.03, "initial": 50, "zone": 10, "infect": 1, "protect": 0.999, "name": "доктора" },
      { "color": "#a0a0a0", "initial": 100, "protect": 0.995, "hidden": true, "allone": true, "name": "джекпот" },
      { "color": "#a050a0", "prob": 0.5, "initial": 1, "zone": 10, "parasite": 1000, "name": "паразиты" }
    ], 
    "options": {
      "count": 1000,
      "size": 420,
      "speed": 7,
      "music": true
    },
    "style": {
      "size": 5, 
      "sort": true, 
      "dots": { "color": "ill", "size": 2, "transparent": true },
      "deadanim": true, 
      "chanim": true,
      "anim": true
    }
  }`; //JSON по умолчанию
}

//объявление переменных:
var cw, ch, cc, cx, cy, interval; //характеристики холста и интервал
var canvas = document.getElementById('canvas'); //DOM холста
var ctx = canvas.getContext('2d'); //контекст холста
var arr = [], counts = [], mosq = [], sorted = [], stats = []; //массивы
var lastTime = 0, frame = 0, date = 0, randomed = 0, heals = 0; //счётчики и другое
var obj = JSON.parse(json); //объект симуляции
var states = obj.states, options = obj.options, style = obj.style; //быстрый доступ к полям объекта
var landscape = obj.landscape ?? { type: [[0]], pow: [[0]], res: 1 }, events = [], gravitation = {}; //быстрый доступ к ландшафтам, событиям и гравитации
var scale = 420/options.size; //масштаб поля
var counter = { cells: 0, special: 0 }; //суммарный счётчик
var started = false, pause = false; //"начата ли симуляция?" и пауза
var event = {}; //объект событий
var music = new Audio(`assets/music${options.musictype ?? 0}.mp3`); //музыка (от zvukipro.com)
var goalFPS = fps*(options.showspeed ?? 1), fpsTime = 1000/goalFPS, maxFPS = fps; //переменные FPS
obj.events = obj.events ?? [];

stats.push({ perf: performance.now(), sum: options.count }); //сохранение первого кадра

function resize() { //метод масштабирования холста
  w = window.innerWidth;
  h = window.innerHeight;
  let c = w/h;
  const needc = 2;
  let W, H, X, Y;
  if (c == needc) {
    W = w;
    H = h;
    X = 0;
    Y = 0;
  }
  if (c < needc) {
    W = w;
    H = w/needc;
    X = 0;
    Y = (h-(w/needc))/2;
  }
  if (c > needc) {
    W = h*needc;
    H = h;
    X = (w-(h*needc))/2;
    Y = 0;
  }
  let res = style.resolution ?? 1800;
  canvas.width = Math.floor(res);
  canvas.height = Math.floor(res/2);
  canvas.style.width = `${Math.floor(W)}px`;
  canvas.style.height = `${Math.floor(H)}px`;
  cc = res/900;
  canvas.style.top = `${Math.floor(Y)}px`;
  canvas.style.left = `${Math.floor(X)}px`;
  cx = Math.floor(X);
  cy = Math.floor(Y);
  cw = W;
  ch = H;
  if (!started) startrender();
}

resize();
addEventListener('resize', resize);

//случайные числа:
function random(max) {
  return rnd()*max;
}
function rnd() {
  randomed++;
  return Math.random();
}

function clear() { //метод очистки холста
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//методы масштабирования координат на холсте:
function X(x) {
  return Math.floor(x*cc);
}
function Y(y) {
  return Math.floor(y*cc);
}

function timeNow() { //игровое время
  return frame/fps*1000;
}
function vib(len) { //метод вибрации
  if (options.vibrate && navigator.vibrate) navigator.vibrate(len);
}
function flr(num) { //округление до десятых
  num = Math.floor(num*10)/10;
  return num%1 == 0 ? num+".0":num;
}
function strnn(str) {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] != "\n") out += str[i];
  }
  return out;
}
function explosion() { //ландшафт "взрывоопасная зона"
  vib(50);
  for (let i = 0; i < arr.length; i++) {
    let p = arr[i];
    if (p.type == "cell" && p.land.type == 10) p.dead();
  }
}
function startrender() { //отрисовка изначального окна
  clear();
  ctx.fillStyle = "#a00000a0";
  ctx.font = `${X(21)}px Monospace`;
  ctx.fillText("Кликните чтобы продолжить", X(300), Y(350));
  ctx.fillStyle = "#0000a0a0";
  ctx.font = `${X(36)}px Monospace`;
  ctx.fillText("Симулятор Эпидемии", X(250), Y(100));
   ctx.fillStyle = "#a00050a0";
  ctx.font = `${X(15)}px Monospace`;
  ctx.fillText("Загрузка завершена...", X(360), Y(400));
  ctx.fillStyle = "#a0205050";
  ctx.fillRect(X(400), Y(170), X(100), Y(100));
  ctx.fillRect(X(420), Y(150), X(10), Y(20));
  ctx.fillRect(X(445), Y(150), X(10), Y(20));
  ctx.fillRect(X(470), Y(150), X(10), Y(20));
  ctx.fillRect(X(420), Y(270), X(10), Y(20));
  ctx.fillRect(X(445), Y(270), X(10), Y(20));
  ctx.fillRect(X(470), Y(270), X(10), Y(20));
  ctx.fillRect(X(380), Y(190), X(20), Y(10));
  ctx.fillRect(X(380), Y(215), X(20), Y(10));
  ctx.fillRect(X(380), Y(240), X(20), Y(10));
  ctx.fillRect(X(500), Y(190), X(20), Y(10));
  ctx.fillRect(X(500), Y(215), X(20), Y(10));
  ctx.fillRect(X(500), Y(240), X(20), Y(10));
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(X(420), Y(190), X(60), Y(60));
  ctx.fillStyle = "#a0205050";
  ctx.fillRect(X(445), Y(200), X(25), Y(25));
}
startrender();
function fullScreen(e) { //метод полного экрана
  if(e.requestFullscreen) {
    e.requestFullscreen();
  } else if(e.webkitrequestFullscreen) {
    e.webkitRequestFullscreen();
  } else if(e.mozRequestFullscreen) {
    e.mozRequestFullScreen();
  }
}
function sort() { //метод сортировки статистики
  sorted = [];
  for (let i = 0; i < states.length; i++) {
    let st = states[i];
    if (!(st.hidden || st.hiddenstat)) sorted.push(st);
  }
  if (style.sort) {
    for (let j = 0; j < sorted.length-1; j++) {
      let max = sorted[j];
      let maxi = j;
      for (let i = j; i < sorted.length; i++) {
        let c = sorted[i];
        if (c.count.special+c.count.cells > max.count.special+max.count.cells) {
          maxi = i;
          max = c;
        }
      }
      sorted[maxi] = sorted[j];
      sorted[j] = max;
    }
  }
}
function ahex(a) { //HEX
  a = Math.floor(a);
  return (a < 16 ? "0":"") + a.toString(16);
}
function degToRad(deg) {
  return deg/180*Math.PI;
}
function testCordMinMax(c, size) {
  return Math.min(Math.max(c, size/2), options.size-(size/2));
}
function biggraph() { //отрисовка большого графика
  let max = 2;
  let start = style.graphmove ? (frame < 290 ? 0:frame-290):0;
  let timeinc = start*(1000/fps);
  let size = style.graphmove ? (frame < 290 ? frame:290):frame;
  for (let t = start; t < counts.length; t++) {
    for (let i = 0; i < states.length; i++) {
      if (!(states[i].hidden || states[i].hiddengraph)) {
        let ct = counts[t][i];
        if (ct > max) {
          max = ct;
        }
      }
    }
  }
  ctx.font = `${X(12)}px Monospace`;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(X(465), Y(15), X(420), Y(210));
  ctx.fillStyle = "#d0d0d0";
  ctx.fillRect(X(500), Y(40), X(360), Y(2));
  ctx.fillText(`${max}`, X(470), Y(45), X(30));
  ctx.fillRect(X(500), Y(120), X(360), Y(2));
  ctx.fillText(`${Math.floor(max/2)}`, X(470), Y(125), X(30));
  ctx.fillRect(X(500), Y(200), X(360), Y(2));
  ctx.fillText("0", X(470), Y(205), X(30));
  ctx.fillRect(X(530), Y(15), X(2), Y(195));
  ctx.fillText(`${flr(timeinc/1000)}`, X(525), Y(235), X(30));
  ctx.fillRect(X(602.5), Y(15), X(2), Y(195));
  ctx.fillText(`${flr((timeNow()-timeinc)/4000+(timeinc/1000))}`, X(600), Y(235), X(30));
  ctx.fillRect(X(675), Y(15), X(2), Y(195));
  ctx.fillText(`${flr((timeNow()-timeinc)/2000+(timeinc/1000))}`, X(670), Y(235), X(30));
  ctx.fillRect(X(747.5), Y(15), X(2), Y(195));
  ctx.fillText(`${flr((timeNow()-timeinc)/4000*3+(timeinc/1000))}`, X(742.5), Y(235), X(30));
  ctx.fillRect(X(820), Y(15), X(2), Y(195));
  ctx.fillText(`${flr(timeNow()/1000)}`, X(815), Y(235), X(30));
  ctx.lineWidth = X(3);
  if (frame > 0) {
    for (let i = 0; i < states.length; i++) {
      if (!(states[i].hidden || states[i].hiddengraph)) {
        ctx.beginPath();
        for (let x = 0; x < 290; x++) {
          let ci = Math.floor(x/290*size)+start;
          let y = 160-(counts[ci][i]/max*160);
          if (x == 0) {
            ctx.moveTo(X(x+530), Y(y+40));
          } else {
            ctx.lineTo(X(x+530), Y(y+40));
          }
        }
        ctx.strokeStyle = states[i].color + (states[i].transparent ? "80":"ff");
        ctx.stroke();
      }
    }
  }
}
function graph() {
  let max = 2;
  let start = style.graphmove ? (frame < 160 ? 0:frame-160):0;
  let timeinc = start*(1000/fps);
  let size = style.graphmove ? (frame < 160 ? frame:160):frame;
  for (let t = start; t < counts.length; t++) {
    for (let i = 0; i < states.length; i++) {
      if (!(states[i].hidden || states[i].hiddengraph)) {
        let ct = counts[t][i];
        if (ct > max) {
          max = ct;
        }
      }
    }
  }
  ctx.font = `${X(9)}px Monospace`;
  ctx.fillStyle = "#d0d0d0";
  ctx.fillRect(X(685), Y(20), X(165), Y(1));
  ctx.fillText(`${max}`, X(660), Y(25), X(20));
  ctx.fillRect(X(685), Y(60), X(165), Y(1));
  ctx.fillText(`${Math.floor(max/2)}`, X(660), Y(65), X(20));
  ctx.fillRect(X(685), Y(100), X(165), Y(1));
  ctx.fillText("0", X(660), Y(105), X(20));
  ctx.fillRect(X(690), Y(15), X(1), Y(90));
  ctx.fillText(`${flr(timeinc/1000)}`, X(690), Y(115), X(30));
  ctx.fillRect(X(725), Y(15), X(1), Y(90));
  ctx.fillText(`${flr((timeNow()-timeinc)/4000/20*18+(timeinc/1000))}`, X(720), Y(115), X(30));
  ctx.fillRect(X(760), Y(15), X(1), Y(90));
  ctx.fillText(`${flr((timeNow()-timeinc)/2000/20*18+(timeinc/1000))}`, X(760), Y(115), X(30));
  ctx.fillRect(X(795), Y(15), X(1), Y(90));
  ctx.fillText(`${flr((timeNow()-timeinc)/4000*3/20*18+(timeinc/1000))}`, X(795), Y(115), X(30));
  ctx.fillRect(X(830), Y(15), X(1), Y(90));
  ctx.fillText(`${flr((timeNow()-timeinc)/1000/20*18+(timeinc/1000))}`, X(830), Y(115), X(30));
  ctx.lineWidth = X(2);
  if (frame > 0) {
    for (let i = 0; i < states.length; i++) {
      if (!(states[i].hidden || states[i].hiddengraph)) {
        ctx.beginPath();
        for (let x = 0; x < 160; x++) {
          let ci = Math.floor(x/160*size)+start;
          let y = 100-(counts[ci][i]/max*80);
          if (x == 0) {
            ctx.moveTo(X(x+690), Y(y));
          } else {
            ctx.lineTo(X(x+690), Y(y));
          }
        }
        ctx.strokeStyle = states[i].color + (states[i].transparent ? "80":"ff");
        ctx.stroke();
      }
    }
  }
}
event.teleporto = function() { //событие "большой взмес"
  vib(50);
  event.splashcolor = "#ffffff";
  event.splash = frame;
  for (let i = 0; i < arr.length; i++) {
    if (rnd() >= arr[i].st.antievent) {
      arr[i].x = random(options.size-style.size)+(style.size/2);
      arr[i].y = random(options.size-style.size)+(style.size/2);
    }
  }
};
event.boom = function(e) { //событие "взрыв"
  if (e.pow) {
    vib(50);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type == "cell" && rnd() < e.pow && rnd() >= arr[i].st.antievent) arr[i].dead();
    }
  }
};
event.rats = function(e) { //событие "крысиный всплеск"
  if (e.pow) {
    vib(50);
    event.splashcolor = "#ffffff";
    event.splash = frame;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type == "cell" && rnd() <
e.pow && rnd() >= arr[i].st.antievent) {
	    arr[i].dead();
        arr[i] = new Rat(i, arr[i].x, arr[i].y, arr[i].state);
      }
    }
  }
};
event.gravitation = function(e) { //событие "гравитация"
  vib(50);
  gravitation = { x: e.x, y: e.y };
};
event.epidemic = function(e) { //событие "эпидемия"
  if (e.pow) {
    vib(50);
    for (let i = 0; i < arr.length; i++) {
      if (rnd() < e.pow && rnd() >= arr[i].st.antievent) arr[i].toState(e.state == -1 ? Math.floor(random(states.length)):e.state);
    }
  }
};
event.quar = function(e) { //событие "карантин"
  event.quared = timeNow()+e.duration;
};
event.dragon = function(e) { //событие "гнев драконов"
  vib(50);
  event.splashcolor = "#a08040";
  event.splash = frame;
  event.dragoned = timeNow()+e.duration;
  event.dragonfire = [];
  for (let y = 0; y < landscape.res; y++) {
    for (let x = 0; x < landscape.res; x++) {
      event.dragonfire.push({ now: style.anim ? random(255):200, next: random(255) });
    }
  }
};
event.water = function(e) { //событие "наводнение"
  event.splashcolor = "#4040a0";
  event.splash = frame;
  if (e.pow) {
    vib(50);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type == "cell" && rnd() < e.pow && rnd() >= arr[i].st.antievent && arr[i].st.waterscary) arr[i].dead();
    }
  }
};
event.healer = function(e) { //событие "лекарство"
  if (e.pow) {
    vib(50);
    for (let i = 0; i < arr.length; i++) {
      if (rnd() < e.pow && rnd() >= arr[i].st.antievent && arr[i].state == e.state) arr[i].toState(0);
    }
  }
};
event.night = function(e) { //событие "ночь"
  event.splashcolor = "#000020";
  event.splash = frame;
  if (e.pow) {
    vib(50);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type == "cell" && rnd() < e.pow && rnd() >= arr[i].st.antievent && arr[i].st.darkscary && (arr[i].land.type != 19 || arr[i].land.pow <= rnd())) arr[i].dead();
    }
  }
};
event.war = function(e) { //событие "военные действия"
  vib(50);
  event.splashcolor = "#a00000";
  event.splash = frame;
  event.wared = timeNow()+e.duration;
};
event.thirdmetric = function(e) { //событие "третье измерение"
  vib(50);
  event.splashcolor = "#5050a0";
  event.splash = frame;
  event.z = e.z;
  event.ztime = timeNow()+e.duration;
};