const version = "3.13.1";
const lands = [
  { color: "#ffffff", bcolor: "#d0d0d0", name: "без ландшафта" },
  { color: "#80a000", bcolor: "#709000", name: "отравленная зона" },
  { color: "#00a0a0", bcolor: "#009090", name: "санитарная зона" },
  { color: "#a000a0", bcolor: "#900090", name: "зона биологической опасности" },
  { color: "#a09000", bcolor: "#908000", name: "пляжная зона", ext: "move" },
  { color: "#a00000", bcolor: "#900000", name: "зона повышенного заражения", ext: "attack" },
  { color: "#605000", bcolor: "#504000", name: "свалочная зона", ext: "cells" },
  { color: "#f0a070", bcolor: "#d09060", name: "аллергенная зона" },
  { color: "#a00050", bcolor: "#900040", name: "охотничья зона", ext: "cells" },
  { color: "#0040a0", bcolor: "#003090", name: "морская зона", ext: "deads" },
  { color: "#802000", bcolor: "#701000", name: "взрывоопасная зона", ext: "deads" },
  { color: "#408020", bcolor: "#307010", name: "лагерная зона", ext: "deads" },
  { color: "#000000", bcolor: "#202020", name: "строительная зона" },
  { color: "#5000a0", bcolor: "#400090", name: "магическая зона", ext: "cells" },
  { color: "#a05000", bcolor: "#a04000", name: "зона строгого конроля" },
  { color: "#a07800", bcolor: "#907000", name: "человеческая зона", ext: "cells" },
  { color: "#0060a0", bcolor: "#005090", name: "научная зона", ext: "move" },
  { color: "#60c0d0", bcolor: "#50b0c0", name: "ледяная зона", ext: "move" },
  { color: "#50a000", bcolor: "#409000", name: "драконья зона", ext: "deads" },
  { color: "#f0f080", bcolor: "#d0d070", name: "светлая зона", ext: "deads" },
  { color: "#600000", bcolor: "#500000", name: "военная зона", ext: "deads" },
  { color: "#804080", bcolor: "#703070", name: "таинственная зона" },
  { color: "#404080", bcolor: "#303070", name: "трёхмерная зона", ext: "move" },
  { color: "#007030", bcolor: "#006020", name: "лесная зона", ext: "cells" }
];
const eventlist = [
  { name: "землетрясение", id: "teleporto", props: [], ext: "move" },
  { name: "карантин", id: "quar", props: [
    { id: "duration", text: "длительность:", check: [0, 120, false], form: "${num}*1000", aform: "${num}/1000" }
  ] },
  { name: "взрыв", id: "boom", props: [
    { id: "pow", text: "сила:", check: [0, 100, false], form: "${num}/100", aform: "${num}*100" }
  ], ext: "deads" },
  { name: "эпидемия", id: "epidemic", props: [
    { id: "pow", text: "сила:", check: [0, 100, false], form: "${num}/100", aform: "${num}*100" },
    { id: "state", text: "состояние:", check: [0, 'states.length', true], form: "${num}-1", aform: "${num}+1" }
  ] },
  { name: "крысиный всплеск", id: "rats", props: [
    { id: "pow", text: "сила:", check: [0, 100, false], form: "${num}/100", aform: "${num}*100" }
  ], ext: "cells" },
  { name: "смена гравитации", id: "gravitation", props: [
    { id: "x", text: "X:", check: [-5, 5, false], form: "${num}", aform: "${num}" },
    { id: "y", text: "Y:", check: [-5, 5, false], form: "${num}", aform: "${num}" }
  ], ext: "cells" },
  { name: "гнев драконов", id: "dragon", props: [
    { id: "duration", text: "длительность:", check: [0, 120, false], form: "${num}*1000", aform: "${num}/1000" }
  ], ext: "deads" },
  { name: "наводнение", id: "water", props: [
    { id: "pow", text: "сила:", check: [0, 100, false], form: "${num}/100", aform: "${num}*100" }
  ], ext: "deads" },
  { name: "лекарство", id: "healer", props: [
    { id: "pow", text: "сила:", check: [0, 100, false], form: "${num}/100", aform: "${num}*100" },
    { id: "state", text: "состояние:", check: [1, 'states.length', true], form: "${num}-1", aform: "${num}+1" }
  ] },
  { name: "ночь", id: "night", props: [
    { id: "pow", text: "сила:", check: [0, 100, false], form: "${num}/100", aform: "${num}*100" }
  ], ext: "deads" },
  { name: "военные действия", id: "war", props: [
    { id: "duration", text: "длительность:", check: [0, 120, false], form: "${num}*1000", aform: "${num}/1000" }
  ], ext: "deads" },
  { name: "третье измерение", id: "thirdmetric", props: [
    { id: "duration", text: "длительность:", check: [0, 120, false], form: "${num}*1000", aform: "${num}/1000" },
    { id: "z", text: "z: ", check: [-2, 2, true], form: "${num}", aform: "${num}" }
  ], ext: "move" },
  { name: "выход из леса", id: "forest", props: [
    { id: "count", text: "количество:", check: [0, 10, false], form: "${num}", aform: "${num}" }
  ], ext: "cells" }
];
const props = [
  { title: "Коэффициент скорости:", type: "num", id: "speed", check: [0, 3, false], default: 1, form: "${num}", aform: "${num}", ext: "move" },
  { title: "Вероятность излечения (%):", type: "num", id: "heal", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "deads" },
  { title: "Трансформация в:", type: "sel", id: "transform", select: "arr = ['случайное']; for (let i = 0; i < states.length; i++) arr.push(i == n ? 'себя':states[i].name);", default: 0, form: "${num}-1", aform: "${num}+1", ext: "attack" },
  { title: "Заражение в:", type: "sel", id: "infect", select: "arr = ['себя']; for (let i = 0; i < states.length; i++) arr.push(states[i].name);", form: "${num}", default: 0, aform: "${num}", ext: "attack" },
  { title: "Паразит (0 = без паразита):", type: "num", id: "parasite", check: [0, 120, false], default: 0, form: "${num}*1000", aform: "${num}/1000", exts: "deads" },
  { title: "Инфекция после смерти (с):", type: "num", id: "after", check: [0, 120, false], default: 0, form: "${num}*1000", aform: "${num}/1000", ext: "deads" },
  { title: "Переатака (%):", type: "num", id: "attacktrans", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "attack" },
  { title: "Отдых (с):", type: "num", id: "rest", check: [0, 120, false], default: 0, form: "${num}*1000", aform: "${num}/1000", ext: "deads" },
  { title: "Телепорт (пкс.):", type: "num", id: "teleporto", check: [0, 420, false], default: 0, form: "${num}", aform: "${num}", ext: "move" },
  { title: "Москиты (шт.):", type: "num", id: "mosquito", check: [0, 3, true], default: 0, form: "${num}", aform: "${num}", ext: "cells" },
  { title: "Убийца (%):", type: "num", id: "killer", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "attack"},
  { title: "Зона магнита (пкс.):", type: "num", id: "magnet", check: [0, 420, false], default: 0, form: "${num}", aform: "${num}", ext: "move" },
  { title: "Сила магнита:", type: "num", id: "magnetpow", check: [0, 12, false], default: 0, form: "${num}", aform: "${num}", ext: "move" },
  { title: "Добавка - время (с):", type: "num", id: "addtime", check: [0, 120, false], default: 0, form: "${num}*1000", aform: "${num}/1000", firstno: true },
  { title: "Добавка - количество (шт.):", type: "num", id: "addcount", check: [0, 20, true], default: 0, form: "${num}", aform: "${num}", firstno: true },
  { title: "Количество добавок (0 = бесконечно):", type: "num", id: "countadd", check: [0, 50, true], default: 0, form: "${num}", aform: "${num}", firstno: true },
  { title: "Шипы (%):", type: "num", id: "spikes", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "attack" },
  { title: "Антиландшафт (%):", type: "num", id: "antiland", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100" },
  { title: "Антисобытие (%):", type: "num", id: "antievent", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100" },
  { title: "Аллергия:", type: "sel", id: "allergy", select: "arr = ['без аллергии']; for (let i = 0; i < states.length; i++) arr.push(states[i].name);", default: 0, form: "${num}-1", aform: "${num}+1" },
  { title: "Контратака (%):", type: "num", id: "cattack", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "attack" },
  { title: "Дальняя атака (шт.):", type: "num", id: "farinf", check: [0, 5, true], default: 0, form: "${num}", aform: "${num}", ext: "attack" },
  { title: "Сумасшедший (‰):", type: "num", id: "crazy", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "move" },
  { title: "Крысы (шт.):", type: "num", id: "ratinit", check: [0, 'options.ratcount-ratsum(n) ', true], default: 0, form: "${num}", aform: "${num}", firstno: true, ext: "cells" },
  { title: "Шары (шт.):", type: "num", id: "ballinit", check: [0, 'options.ballinit-ballsum(n)', true], default: 0, form: "${num}", aform: "${num}", firstno: true, ext: "cells" },
  { title: "Воскрешение - время (с.):", type: "num", id: "relivetime", check: [0, 120, false], default: 0, form: "${num}*1000", aform: "${num}/1000", ext: "deads" },
  { title: "Воскрешение - вероятность(%):", type: "num", id: "reliveprob", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "deads" },
  { title: "Группа:", type: "num", id: "group", check: [0, 'states.length', true], default: 0, form: "${num}", aform: "${num}", ext: "attack" },
  { title: "Уязвимость (%):", type: "num", id: "defect", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "attack" },
  { title: "Остановка (%):", type: "num", id: "stopping", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "move" },
  { title: "Ядовитое (%):", type: "num", id: "potion", check: [0, 100, false], default: 0, form: "${num}/100", aform: "${num}*100", ext: "deads" },
  { title: "Грабитель", type: "chk", id: "robber", default: false },
  { title: "Все за одного", type: "chk", id: "allone", default: false, ext: "deads" },
  { title: "Невидимка", type: "chk", id: "invisible", default: false },
  { title: "Водобоязнь", type: "chk", id: "waterscary", default: false, ext: "deads" },
  { title: "Страх темноты", type: "chk", id: "darkscary", default: false, ext: "deads" },
  { title: "Строитель", type: "chk", id: "builder", default: false, ext: "deads" },
  { title: "Трёхмерный", type: "chk", id: "thirdmetric", default: false, ext: "move" }
];
var setdef = new Map([
  ["ratcount", 0],
  ["ratspeed", 7],
  ["ballcount", 0],
  ["balljump", 80],
  ["mosquitospeed", 7],
  ["mosquitoprob", 50],
  ["mosquitotime", 3],
  ["mosquitozone", 1],
  ["gravx", 0],
  ["gravy", 3]
]);
const extensionlist = [
  { id: "attack", name: "Атака", info: `Ландшафты:
- зона повышенного заражения

Свойства:
- трансформация в
- заражение в
- переатака
- убийца
- шипы
- группа
- контратака
- уязвимость
`, color: "#f08080" },
  { id: "move", name: "Движение", info: `Ландшафты:
- пляжная зона
- лёдная зона
- научная зона
- трёхмерная зона

Свойства:
- коэффициент скорости
- телепорт
- магнит
- сумасшедший
- остановка
- трёхмерный

События:
- землетрясение
- третье измерение
`, color: "#8080f0" },
  { id: "cells", name: "Другие клетки", info: `Ландшафты:
- свалочная зона
- охотничья зона
- магическая зона
- человеческая зона
- лесная зона

Свойства:
- москиты
- крысы
- шары

События:
- крысиный всплеск
- смена гравитации
- выход из леса

Виды клеток:
- крысы
- москиты
- шары
`, color: "#80f080" },
  { id: "deads", name: "Смерти", info: `Ландшафты:
- взрывоопасная зона
- лагерьная зона
- морская зона
- драконья зона
- светлая зона
- военная зона

Свойства:
- вероятность излечения
- паразит
- инфекция после смерти
- отдых
- воскрешение
- ядовитое
- все за одного
- водобоязнь
- строитель
- страх темноты

События:
- взрыв
- гнев драконов
- наводнение
- ночь
- военные действия
`, color: "#f0d080" }
];
const colordeg = 4;
var lastnum = 0, lastev = 0;
var states = [];
var events = [];
var options = {
  size: 420,
  count: 1000,
  speed: 7,
  quar: 0,
  stop: false,
  music: true,
  turbo: false,
  resolution: 1800,
  onlygame: false,
  mosquitospeed: 7,
  mosquitoprob: 0.5,
  mosquitotime: 3000,
  mosquitozone: 1,
  healzone: 30,
  showspeed: 1,
  biggraph: false,
  graphmove: false,
  ratcount: 0,
  ratspeed: 7,
  healto: 0,
  vibrate: false,
  grav: { x: 0, y: 3 },
  ballcount: 0,
  balljump: 0.8,
  musictype: 0
};
var openedadd = [];
var openedaddopt = false;
var landscape = { type: [], pow: [], res: 7 };
var $ = (id) => document.getElementById(id);
var lan = $('landscape').getContext('2d');
var name = "без имени", description = "";
var landsel;
for (let i = 0; i < extensionlist.length; i++) extensionlist[i].added = false;
{
  let saved = JSON.parse(localStorage.getItem("epidemic_simulator_settings"));
  if (navigator.vibrate) {
    if (saved) {
      $('vibrate').checked = saved.vibrate;
      options.vibrate = saved.vibrate;
    }
    $('vibratediv').style.display= 'block';
  }
  if (saved) {
    $('music').checked = saved.music;
    options.music = saved.music;
    $('resshow').innerHTML = `${saved.resolution}р `;
    options.resolution = saved.resolution;
    $('graphmove').checked = saved.graphmove;
    options.graphmove = saved.graphmove;
    $('biggraph').checked = saved.biggraph;
    options.biggraph = saved.biggraph;
    if (saved.musictype) musictype();
  }
}
function landsUpdate() {
  $('landscapes').innerHTML = "";
  for (let i = 0, j = 0; i < lands.length; i++) {
    let p = lands[i];
    if (exadded(p.ext)) {
      if (j%8 == 0 && j) $('landscapes').innerHTML += '<div style="margin-bottom: 0px;"></div>';
      $('landscapes').innerHTML += `<button class="landscape" id="land${i}" style="background-color: ${p.color}; border: 2px solid ${p.bcolor};" onclick="setLand(${i});"></button>`;
      j++;
    }
  }
}
landsUpdate();
{
  for (let i = 0; i < landscape.res; i++) {
    landscape.type[i] = new Array(landscape.res).fill(0);
    landscape.pow[i] = new Array(landscape.res).fill(0);
  }
  setLand(0);
  lan.fillStyle = "#d0d0d0";
  lan.fillRect(0, 0, 450, 15);
  lan.fillRect(0, 435, 450, 15);
  lan.fillRect(0, 0, 15, 450);
  lan.fillRect(435, 0, 15, 450);
}
$('landscape').addEventListener('click', (e) => {
  let r = e.target.getBoundingClientRect();
  let x = (e.clientX-r.left)/160*450-15;
  let y = (e.clientY-r.top)/160*450-15;
  let px = options.size/landscape.res;
  if (x > 0 && y > 0 && x < 420 && y < 420) {
    x = Math.floor(x/px);
    y = Math.floor(y/px);
    landscape.type[x][y] = landsel;
    landscape.pow[x][y] = Number($('landpow').value)/100;
    landrender();
  }
});
function newevent() {
  let div = document.createElement('div');
  let i = events.length;
  let n = lastev;
  lastev++;
  let sel = `<select id="event${n}type" class="evselect" onchange="updateEvents();">`;
  for (let j = 0; j < eventlist.length; j++) {
    if (exadded(eventlist[j].ext)) sel += `<option value="${j}">${eventlist[j].name}</option>`;
  }
  sel += "</select>";
  div.id = `event${events.length}`;
  div.style.width = "600px";
  div.style.marginTop = "5px";
  div.style.border = "2px solid #a0a0a0";
  div.style.borderRadius = "3px";
  div.style.height = "22px";
  div.innerHTML = `
  <p class="label" style="margin-left: 5px;">время:</p>
  <input id="event${n}time" value="0" onchange="updateEvents();" type="number">
  <p class="label">событие:</p>`+sel+
  `<p id="event${n}text0" class="label" style="margin-left: 10px;"></p>
  <input type="number" id="event${n}prop0" value="0" style="display: inline;" onchange="updateEvents();">
  <p id="event${n}text1" class="label" style="margin-left: 10px;"></p>
  <input type="number" id="event${n}prop1" value="0" style="display: inline;" onchange="updateEvents();">
  <p id="event${n}text2" class="label" style="margin-left: 10px;"></p>
  <input type="number" id="event${n}prop2" value="0" style="display: inline;" onchange="updateEvents();">
  <button style="background-color: #00000000; border: none; display: inline;" onclick="deleteevent(${n});"><img src="assets/delete.svg" height="12"></button>`;
  $('events').appendChild(div);
  events.push({ time: 0, type: 0, div: div, num: n });
  updateEvents();
}
function lssg() {
  localStorage.setItem("epidemic_simulator_savepoint", createJSON());
}
function lsog() {
  let json = localStorage.getItem("epidemic_simulator_savepoint");
  if (json) {
    $('console').value = "";
    readgame(json);
  }
}
function landResCh() {
  if (confirm("При изменении разрешения ландшафт будет сброшен. Изменить?")) {
    landscape.res = Number($('landres').value);
    landscape.type = [];
    landscape.pow = [];
    for (let i = 0; i < landscape.res; i++) {
      landscape.type[i] = new Array(landscape.res).fill(0);
      landscape.pow[i] = new Array(landscape.res).fill(0);
    }
    landrender();
  } else {
    $('landres').value = landscape.res;
  }
}
function setLand(i) {
  landsel = i;
  let p = lands[i];
  $('landsel').innerHTML = p.name;
  $('landsel').style.color = p.bcolor;
}
function landrender() {
  lan.fillStyle = "#ffffff";
  lan.fillRect(0, 0, 450, 450);
  lan.fillStyle = "#d0d0d0";
  lan.fillRect(0, 0, 450, 15);
  lan.fillRect(0, 435, 450, 15);
  lan.fillRect(0, 0, 15, 450);
  lan.fillRect(435, 0, 15, 450); 
  let px = 420/landscape.res;
  for (let x = 0; x < landscape.res; x++) {
    for (let y = 0; y < landscape.res; y++) {
      lan.fillStyle = lands[landscape.type[x][y]].color + ahex(landscape.pow[x][y]*120);
      lan.fillRect(x*px+15, y*px+15, px, px);
    }
  }
}
function downloadgame() {
  let blob = new Blob([createJSON()], { type: "application/json" });
  let link = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = link;
  a.download = `${name}.json`;
  a.click();
}
function playgame() {
  sessionStorage.setItem('epidemic_simulator_json', createJSON());
  open('game.html?open=1');
}
function createJSON(space) {
  let opts = Object.assign({}, options);
  delete opts.resolution;
  delete opts.turbo;
  delete opts.biggraph;
  delete opts.movegraph;
  let obj = {
    name: name,
    description: description,
    version: version,
    states: [],
    events: [],
    options: opts,
    landscape: landscape,
    style: {
      size: 5,
      sort: true,
      dots: options.turbo ? false:{ color: "ill", size: 2, transparent: true },
      deadanim: !options.turbo,
      chanim: !options.turbo,
      anim: !options.turbo,
      onlygame: options.turbo,
      resolution: options.resolution,
      mosquitosize: 2,
      biggraph: options.biggraph,
      graphmove: options.graphmove,
      ratsize: 5,
      ballsize: 5
    }
  };
  for (let i = 0; i < states.length; i++) {
    let o = Object.assign({}, states[i]);
    delete o.div;
    delete o.points;
    delete o.num;
    obj.states.push(o);
  }
  for (let i = 0; i < events.length; i++) {
    let o = Object.assign({}, events[i]);
    delete o.div;
    delete o.num;
    obj.events.push(o);
  }
  return JSON.stringify(obj, null, space);
}
function newState(name, color) {
  let num = lastnum;
  let div = document.createElement('div');
  let add = "";
  let colorpal = "";
  {
    for (let i = 0; i < colordeg; i++) {
      let c = 160/colordeg*i;
      clr(`#a0${ahex(c)}00`, `#90${ahex(c*0.9)}00`);
    }
    for (let i = 0; i < colordeg; i++) {
      let c = 160-(160/colordeg*i);
      clr(`#${ahex(c)}a000`, `#${ahex(c*0.9)}9000`);
    }
    for (let i = 0; i < colordeg; i++) {
      let c = 160/colordeg*i;
      clr(`#00a0${ahex(c)}`, `#0090${ahex(c*0.9)}`);
    }
    for (let i = 0; i < colordeg; i++) {
      let c = 160-(160/colordeg*i);
      clr(`#00${ahex(c)}a0`, `#00${ahex(c*0.9)}90`);
    }
    for (let i = 0; i < colordeg; i++) {
      let c = 160/colordeg*i;
      clr(`#${ahex(c)}00a0`, `#${ahex(c*0.9)}0090`);
    }
    for (let i = 0; i < colordeg; i++) {
      let c = 160-(160/colordeg*i);
      clr(`#a000${ahex(c)}`, `#9000${ahex(c*0.9)}`);
    }
    function clr(hex, bhex) {
      colorpal += `<button class="color" style="background-color: ${hex}; border-color: ${bhex};" onclick="$('color${num}').value='${hex}'; updateStates();"></button>\n`;
    }
  }
  for (let i = 0; i < props.length; i++) {
    let p = props[i];
    let n = states.length;
    if (!p.firstno || num != 0) {
      if (p.type == "num") add += `<div id="${p.id+num}div"${exadded(p.ext) ? '':' style="display: none;"'}><label for="${p.id+num}" class="label">${p.title}</label>
      <input type="number" id="${p.id+num}" onchange="updateStates();" value="${p.default}" ${p.default ? "checked":""}></div>`;
      if (p.type == "chk") add += `<div id="${p.id+num}div"${exadded(p.ext) ? '':' style="display: none;"'}><input type="checkbox" id="${p.id+num}" onchange="updateStates();">
      <label for="${p.id+num}" class="label">${p.title}</label></div>`;
      if (p.type == "sel") {
    	let arr;
        eval(p.select);
    	add += `<div id="${p.id+num}div"${exadded(p.ext) ? '':' style="display: none;"'}><label for="${p.id+num}" class="label">${p.title}</label>
        <select id="${p.id+num}" class="pselect" onchange="updateStates();">`;
        for (let j = 0; j < arr.length; j++) add += `<option value="${j}">${arr[j]}</option>`;
        add += "</select></div>";
      }
    }
  }  
  div.innerHTML = `
    <div class="namediv">
      <b id="num${num}" class="label" style="color: ${color};">${states.length+1}</b>
      <input type="text" class="name" id="name${num}" value="${name}" onchange="updateStates();" maxlength="30">${num == 0 ? "":`<button style="background-color: #00000000; border: none; display: inline;" onclick="deletestate(${num});"><img src="assets/delete.svg" height="12"></button>
    <button style="background-color: #00000000; border: none; display: inline;" onclick="copystate(${num});"><img src="assets/copy.svg" height="12"></button>`}
      <input type="checkbox" id="hiddenstat${num}" onchange="updateStates();" style="display: inline;" checked>
      <input type="checkbox" id="hiddengraph${num}" onchange="updateStates();" style="display: inline;" ${num == 0 ? "":"checked"}>
    </div>
    <input type="color" id="color${num}" class="colorsel" value="${color}">
    ${colorpal}
    <button class="color" style="background-color: #000000; border-color: #202020;" onclick="$('color${num}').value='#000000'; updateStates();"></button>
    <div><input type="checkbox" id="transparent${num}" onchange="updateStates()">
    <label for="transparent${num}" class="label">Полупрозрачность</label></div>
    <div><label for="prob${num}" class="label">Вероятность (%):</label>
    <input type="number" id="prob${num}" onchange="updateStates();" value="0"></div>
    <div><label for="zone${num}" class="label">Зона (пкс.):</label>
    <input type="number" id="zone${num}" onchange="updateStates();" value="0"></div>
    ${num == 0 ? "":`<div><label for="zone${num}" class="label">Начальная популяция (шт.):</label>
    <input type="number" id="initial${num}" onchange="if (this.value != 1) $('pos${num}').checked = false; updateStates();" value="0"></div>`}
    <div><label for="time${num}" class="label">Длина жизни (с) 0 = бесконечно:</label>
    <input type="number" id="time${num}" onchange="updateStates();" value="0"></div>
    <div><label for="protect${num}" class="label">Защита (%):</label>
    <input type="number" id="protect${num}" onchange="updateStates();" value="0"></div>
    <p class="add" onclick="addh(${num});">Дополнительно <img src="assets/down.svg" id="add_${num}" width="12"></p>
    <div id="add${num}" style="display: none;">
      ${add}
      ${num == 0 ? "":`<div><input type="checkbox" id="pos${num}" onchange="updateStates();">
      <label for="pos${num}" class="label">Точная позиция</label></div>
      <div><label for="x${num}" class="label">Точная позиция (X):</label>
      <input type="number" id="x${num}" onchange="checknum(this, -100, 100, false); updateStates();" value="0"></div>
      <div><label for="y${num}" class="label">Точная позиция (Y):</label>
      <input type="number" id="y${num}" onchange="checknum(this, -100, 100, false); updateStates();" value="0"></div>`}
      <div><button onclick="$('extensionsdiv').style.display='block'; $('editor').style.display='none';" class="extensions">дополнения</button></div>
    </div>
    <div class="border"></div>
  `;
  let obj = {
    color: color,
    transparent: false,
    hiddenstat: false,
    hiddengraph: num == 0 ? true:false,
    name: name,
    initial: 0,
    prob: 0,
    zone: 0,
    time: 0,
    protect: 0,
    num: num,
    div: div
  };
  for (let i = 0; i < props.length; i++) {
    let p = props[i];
    if (!p.firstno || num != 0) obj[p.id] = p.default ?? 0;
  }
  $('states').appendChild(div);
  $(`color${num}`).addEventListener("change", updateStates)
  states.push(obj);
  openedadd.push(false);
  lastnum++;
  updateStates();
  return obj;
}
function updateState(n) {
  let i = states[n].num;
  checknum($(`protect${i}`), 0, 100, false);
  checknum($(`time${i}`), 0, 120, false);
  if (n != 0) checknum($(`initial${i}`), 0, options.count-checksum(n), true);
  checknum($(`zone${i}`), 0, options.size, false);
  checknum($(`prob${i}`), 0, 100, false);
  if (n != 0) if ($(`initial${i}`).value !== '1') $(`pos${i}`).checked = false;
  let obj = {
    color: $(`color${i}`).value,
    transparent: $(`transparent${i}`).checked,
    hiddenstat: !$(`hiddenstat${i}`).checked,
    hiddengraph: !$(`hiddengraph${i}`).checked,
    name: $(`name${i}`).value,
    div: states[n].div,
    num: i,
    prob: Number($(`prob${i}`).value)/100,
    zone: Number($(`zone${i}`).value),
    initial: n == 0 ? null:Number($(`initial${i}`).value),
    time: Number($(`time${i}`).value)*1000,
    protect: Number($(`protect${i}`).value)/100
  };
  states[n] = obj;
  for (let j = 0; j < props.length; j++) {
    let p = props[j];
    if (!p.firstno || n != 0) {
      if (p.type == "num") checknum($(p.id+i), eval(p.check[0]), eval(p.check[1]), eval(p.check[2]));
      let num = Number($(p.id+i).value);
      if (p.type == "num") obj[p.id] = eval(`eval(\`${p.form}\`);`);
      if (p.type == "chk") obj[p.id] = $(p.id+i).checked;
      if (p.type == "sel") {
        obj[p.id] = eval(`eval(\`${p.form}\`);`);
        let arr, str = "", val = num;
        eval(p.select);
        str += `<div><label for="${p.id+num}" class="label">${p.title}</label></div>
        <select id="${p.id+num}" onchange="updateStates();">`;
        for (let j = 0; j < arr.length; j++) str += `<option value="${j}">${arr[j]}</option>`;
        str += "</select>";
        $(p.id+i).innerHTML = str;
        $(p.id+i).value = val >= arr.length ? 0:val;
      }
    }
  }
  if (n != 0) obj.position = $(`pos${i}`).checked ? [ { x: (Number($(`x${i}`).value)+100)*((options.size-5)/200)+2.5, y: (Number($(`y${i}`).value)+100)*((options.size-5)/200)+2.5 } ]:null;
  else obj.position = null;
  $(`num${i}`).style.color = obj.color;
  $(`num${i}`).innerHTML = n+1;
  let str = `<option value="0">перемешивает</option><option value="1">убивает</option>`;
  for (let i = 0; i < states.length; i++) str += `<option value="${i+2}">${states[i].name}</option>`;
  $('healto').innerHTML = str;
  $('healto').value = options.healto+2;
}
function updateStates() {
  for (let i = 0; i < states.length; i++) {
    updateState(i);
  }
}
function updateEvent(n) {
  let i = events[n].num;
  checknum($(`event${i}time`), -120, 600, false);
  let obj = {
    type: eventlist[Number($(`event${i}type`).value)].id,
    time: Number($(`event${i}time`).value)*1000,
    div: events[n].div,
    num: i
  };
  events[n] = obj;
  let e = eventlist[Number($(`event${i}type`).value)];
  $(`event${i}prop0`).style.display = e.props[0] ? 'inline':'none';
  $(`event${i}prop1`).style.display = e.props[1] ? 'inline':'none';
  $(`event${i}prop2`).style.display = e.props[2] ? 'inline':'none';
  $(`event${i}text0`).style.display = e.props[0] ? 'inline':'none';
  $(`event${i}text1`).style.display = e.props[1] ? 'inline':'none';
  $(`event${i}text2`).style.display = e.props[2] ? 'inline':'none';
  $(`event${i}text0`).innerHTML = e.props[0] ? e.props[0].text:'';
  $(`event${i}text1`).innerHTML = e.props[1] ? e.props[1].text:'';
  $(`event${i}text2`).innerHTML = e.props[2] ? e.props[2].text:'';
  if (e.props[0]) {
    checknum($(`event${i}prop0`), eval(e.props[0].check[0]), eval(e.props[0].check[1]), eval(e.props[0].check[2]));
    let num = Number($(`event${i}prop0`).value);
    obj[e.props[0].id] = eval(`eval(\`${e.props[0].form}\`);`);
  }
  if (e.props[1]) {
    checknum($(`event${i}prop1`), eval(e.props[1].check[0]), eval(e.props[1].check[1]), eval(e.props[1].check[2]));
    let num = Number($(`event${i}prop1`).value);
    obj[e.props[1].id] = eval(`eval(\`${e.props[1].form}\`);`);
  }
  if (e.props[2]) {
    checknum($(`event${i}prop2`), eval(e.props[2].check[0]), eval(e.props[2].check[1]), eval(e.props[2].check[2]));
    let num = Number($(`event${i}prop2`).value);
    obj[e.props[2].id] = eval(`eval(\`${e.props[2].form}\`);`);
  }
}
function updateEvents() {
  for (let i = 0; i < events.length; i++) {
    updateEvent(i);
  }
}
function checknum(obj, min, max, trunc) {
  let num = obj.value;
  num = num == "" ? 0:num;
  if (num < min) num = min;
  if (num > max) num = max;
  if (trunc) num = Math.trunc(num);
  obj.value = num;
}
function deletestate(i) {
  for (let j = 0; j < states.length; j++) {
    if (states[j].num == i) i = j;
  }
  if (confirm(`Вы хотите удалить состояние '${states[i].name}'?`)) {
    states[i].div.remove();
    states.splice(i, 1);
    openedadd.splice(i, 1);
    updateStates();
  }
}
function deleteevent(i) {
  for (let j = 0; j < events.length; j++) {
    if (events[j].num == i) i = j;
  }
  events[i].div.remove();
  events.splice(i, 1);
  updateEvents();
}
function checksum(i) {
  let out = 0;
  for (let j = 1; j < states.length; j++) {
    if (j != i) out += states[j].initial;
  }
  return out;
}
function ratsum(i) {
  let out = 0;
  for (let j = 1; j < states.length; j++) {
    if (j != i) out += states[j].ratinit;
  }
  return out;
}
function ballsum(i) {
  let out = 0;
  for (let j = 1; j < states.length; j++) {
    if (j != i) out += states[j].ballinit;
  }
  return out;
}
function copystate(i) {
  for (let j = 0; j < states.length; j++) {
    if (states[j].num == i) i = j;
  }
  let cs = states[i];
  let num = states.length;
  let ns = newState(cs.name + " копия", cs.color);
  i = ns.num;
  $(`hiddenstat${i}`).checked = !(cs.hiddenstat ?? false);
  $(`hiddengraph${i}`).checked = !(cs.hiddengraph ?? false);
  $(`transparent${i}`).checked = cs.transparent ?? false;
  $(`prob${i}`).value = (cs.prob ?? 0)*100;
  $(`zone${i}`).value = cs.zone ?? 0;
  $(`initial${i}`).value = cs.initial ?? 0;
  $(`protect${i}`).value = (cs.protect ?? 0)*100;
  $(`time${i}`).value = (cs.time ?? 0)/1000;
  for (let j = 0; j < props.length; j++) {
    let p = props[j];
    let num = cs[p.id];
    if (p.type == "num") $(`${p.id+i}`).value = eval(`eval(\`${p.aform}\`);`);
    if (p.type == "chk") $(`${p.id+i}`).checked = p.invert ? !cs[p.id]:cs[p.id];
  }
  updateStates();
}
function opengame(file) {
  let reader = new FileReader();
  let log = (txt) => $('console').value += txt+"\n";
  $('console').value = "";
  reader.readAsText(file);
  reader.onload = function() {
    readgame(reader.result);
  };
  reader.onerror = function() {
    log("Ошибка при чтении файла: " + reader.error);
  };
}
function readgame(json) {
  let log = (txt) => $('console').value += txt+"\n";
  log("Файл обрабатывается...");
  let obj = null;
  try {
    obj = JSON.parse(json);
  } catch(e) {
    log(`Ошибка: ${e.message}`);
    obj = false;
  }
  if (typeof obj == "object") {
    log("JSON прочитан, идёт проверка объекта...");
    if (obj.states && obj.options && obj.style && obj.name) {
      log("Проверка states...");
      if (obj.states[0] && obj.states.length) {
        log("Проверка options...");
        if (typeof obj.options.count != 'undefined' && obj.options.speed) {
          log("Проверка style...");
          if (obj.style.size) {
            log("Проверка landscape...");
            if (obj.landscape) {
              if (obj.landscape.type && obj.landscape.pow && obj.landscape.res) {
                log("landscape существует и содержит обязательные поля");
              } else {
                log("Ошибка: landscape не содержит обязательные поля");
                return;
              }
            } else {
              log("landscape не существует. Замена...");
              obj.landscape = { type: [
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ]
              ], pow: [
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ]
              ], res: 7 };
            }
            for (let y = 0; y < obj.landscape.res; y++) {
              for (let x = 0; x < obj.landscape.res; x++) {
                let l = obj.landscape.type[y][x];
                if (l >= 0 && l < lands.length) {
                  let p = lands[l];
                  if (!exadded(p.ext)) {
                    log(`Загрузка дополнения '${p.ext}'...`);
                    addex(p.ext);
                  }
                } else close();
              }
            }
            log("Проверка events...");
            if (obj.events) {
              log("events существует");
            } else {
              log("events не существует. Замена...");
              obj.events = [];
            }
            log("Загрузка...");
            $('states').innerHTML = "";
            states = [];
            openedadd = [];
            lastnum = 0;
            let sels = [];
            for (let i = 0; i < obj.states.length; i++) {
              let st = obj.states[i];
              newState(st.name ?? "без имени", st.color ?? "#000000");
              $(`hiddenstat${i}`).checked = !(st.hiddenstat ?? false);
              $(`hiddengraph${i}`).checked = !(st.hiddengraph ?? false);
              $(`transparent${i}`).checked = st.transparent ?? false;
              $(`prob${i}`).value = (st.prob ?? 0)*100;
              $(`zone${i}`).value = st.zone ?? 0;
              if (i != 0) $(`initial${i}`).value = st.initial ?? 0;
              $(`protect${i}`).value = (st.protect ?? 0)*100;
              $(`time${i}`).value = (st.time ?? 0)/1000;
              for (let j = 0; j < props.length; j++) {
                let p = props[j];
                let num = st[p.id];
                if ((p.type == "num" || p.type == "sel") && (!p.firstno || i != 0)) {
                  if (p.type == "sel") sels.push({ id: p.id+i, val: eval(`eval(\`${p.aform}\`);`) ?? p.default });
                  else $(`${p.id+i}`).value = eval(`eval(\`${p.aform}\`);`) ?? p.default;
                  if (eval(`eval(\`${p.aform}\`);`) != p.default && !exadded(p.ext) && typeof num != 'undefined') {
                    log(`Загрузка дополнения '${p.ext}'...`);
                    console.log(p.id, eval(`eval(\`${p.aform}\`);`), p.default)
                    addex(p.ext);
                  }
                }
                if (p.type == "chk") {
                  $(`${p.id+i}`).checked = p.invert ? !num:num;
                  if ((p.invert ? !num:num) != p.default && !exadded(p.ext)) {
                    log(`Загрузка дополнения '${p.ext}'...`);
                    addex(p.ext);
                  }
                }
              }
              if (i != 0 && st.position) {
                $(`pos${i}`).checked = true;
                $(`x${i}`).value = Math.floor(((st.position[0].x ?? 210)-2.5)/((options.size-5)/200))-100;
                $(`y${i}`).value = Math.floor(((st.position[0].y ?? 210)-2.5)/((options.size-5)/200))-100;
              }
              updateState(i);
            }
            for (let i = 0; i < sels.length; i++) $(sels[i].id).value = sels[i].val;
            $('events').innerHTML = "";
            events = [];
            lastevent = 0;
            for (let i = 0; i < obj.events.length; i++) {
              let e = obj.events[i];
              if (!exadded(e.ext)) {
                log(`Загрузка дополнения '${p.ext}'...`);
                addex(p.ext);
              }
              let ps;
              newevent();
              let type = 0;
              for (let i = 0; i < eventlist.length; i++) {
                if (eventlist[i].id == e.type) type = i, ps = eventlist[i].props;
              }
              $(`event${i}type`).value = type;
              $(`event${i}time`).value = e.time/1000;
              if (ps[0]) {
                 let num = e[ps[0].id];
                $(`event${i}prop0`).value = eval(`eval(\`${ps[0].aform}\`);`);
              }
              if (ps[1]) {
                 let num = e[ps[1].id];
                $(`event${i}prop1`).value = eval(`eval(\`${ps[1].aform}\`);`);
              }
              if (ps[2]) {
                 let num = e[ps[2].id];
                $(`event${i}prop2`).value = eval(`eval(\`${ps[2].aform}\`);`);
              }
              updateEvent(i);
            }
            name = obj.name;
            $('name').value = name;
            description = obj.description ?? "";
            $('description').value = description;
            function setval(id, val) {
              $(id).value = val;
              $(id).onchange();
              if (val != setdef.get(id) && typeof setdef.get(id) != 'undefined') {
                let ex = $(id).className;
                if (ex) {
                  for (let i = 0; i < extensionlist.length; i++) {
                    if ('ex'+extensionlist[i].id == ex && !exadded(extensionlist[i].id)) {
                      log(`Загрузка дополнения '${extensionlist[i].id}'...`);
                      addex(extensionlist[i].id);
                    }
                  }
                }
              }
            }
            setval('size', obj.options.size);
            setval('count', obj.options.count);
            setval('speed', obj.options.speed);
            setval('quar', obj.options.quar ?? 0);
            setval('mosquitospeed', obj.options.mosquitospeed ?? 7);
            setval('mosquitotime', (obj.options.mosquitotime ?? 3000)/1000);
            setval('mosquitoprob', (obj.options.mosquitoprob ?? 0.5)*100);
            setval('mosquitozone', obj.options.mosquitozone ?? 1);
            setval('healzone', obj.options.healzone ?? 30);
            setval('healto', (obj.options.healto ?? 0)+2);
            setval('ratcount', obj.options.ratcount ?? 0);
            setval('ratspeed', obj.options.ratspeed ?? 7);
            setval('ballcount', obj.options.ballcount ?? 0);
            setval('balljump', (obj.options.balljump ?? 0.8)*100);
            obj.options.gravitation = obj.options.gravitation ?? {};
            setval('gravx', obj.options.gravitation.x ?? 0);
            setval('gravy', obj.options.gravitation.y ?? 3);
            landscape = {
              type: obj.landscape.type,
              pow: obj.landscape.pow,
              res: obj.landscape.res
            };
            $('landres').value = landscape.res;
            landrender();
            log("Загрузка завершена");
            updateStates();
            setTimeout(() => { $('opengame').style.display='none'; $('editor').style.display='block'; }, 500);
          } else {
            log("Ошибка: style не содержит обязательные поля");
          }
        } else {
          log("Ошибка: options не содержит обязательные поля");
        }
      } else {
        log("Ошибка: неверный states");
      }
    } else {
      log("Ошибка: объект не содержит обязательные поля");
    }
  }
}
function addh(i) {
  if (openedadd[i]) {
    $(`add_${i}`).src = 'assets/down.svg';
    $(`add${i}`).style.display = 'none';
    openedadd[i] = false;
  } else {
    $(`add_${i}`).src = 'assets/up.svg';
    $(`add${i}`).style.display = 'block';
    openedadd[i] = true;
  }
}
function addopt() {
  if (openedaddopt) {
    $(`addopt_`).src = 'assets/down.svg';
    $(`addopt`).style.display = 'none';
    openedaddopt = false;
  } else {
    $(`addopt_`).src = 'assets/up.svg';
    $(`addopt`).style.display = 'block';
    openedaddopt = true;
  }
}
function testCount() {
  if (options.count + options.ratcount <= 2000) $('countwarn').innerHTML = "";
  else $('countwarn').innerHTML = " Не запускайте на слабых устройствах!";
}
function ahex(a) {
  a = Math.floor(a);
  return (a < 16 ? "0":"") + a.toString(16);
}
function saveSets() {
  localStorage.setItem("epidemic_simulator_settings", JSON.stringify({
    vibrate: options.vibrate,
    music: options.music,
    musictype: options.musictype,
    resolution: options.resolution,
    biggraph: options.biggraph,
    graphmove: options.graphmove
  }));
}
function infex(id) {
  let i;
  for (let j = 0; j < extensionlist.length; j++) {
    if (id == extensionlist[j].id) i = j;
  }
  alert(extensionlist[i].info);
}
function addex(id) {
  let e;
  for (let j = 0; j < extensionlist.length; j++) {
    if (id == extensionlist[j].id) e = extensionlist[j];
  }
  for (let i = 0; i < props.length; i++) {
    if (props[i].ext == id) {
      for (let j = 0; j < states.length; j++) {
        if (!props[i] .firstno || j != 0) $(props[i].id+states[j].num+'div').style.display = 'block';
      }
    }
  }
  $('addex:'+id).style.display = 'none';
  $('delex:'+id).style.display = 'inline';
  $('defex:'+id).style.display = 'inline';
  $('exlabel:'+id).innerHTML += ' (добавлено)';
  e.added = true;
  landsUpdate();
  let evopt = "";
  for (let i = 0; i < eventlist.length; i++) {
    let p = eventlist[i];
    if (exadded(p.ext)) evopt += `<option value="${i}">${eventlist[i].name}</option>`;
  }
  for (let i = 0; i < events.length; i++) {
    let val = $(`event${events[i].num}type`).value;
    $(`event${events[i].num}type`).innerHTML = evopt;
    $(`event${events[i].num}type`).value = val;
  }
  let arr = document.getElementsByClassName('ex_'+id);
  for (let i = 0; i < arr.length; i++) arr[i].style.display = 'block';
}
function delex(id) {
  let e;
  for (let j = 0; j < extensionlist.length; j++) {
    if (id == extensionlist[j].id) e = extensionlist[j];
  }
  if (confirm(`Вы точно хотите удалить дополнение '${e.name}' со всеми свойствами, чьё значение после нельзя будет восстановить?`)) {
    for (let i = 0; i < props.length; i++) {
      if (props[i].ext == id && (!props.firstno || i != 0)) {
        for (let j = 0; j < states.length; j++) {
          if (!props[i] .firstno || j != 0) {
            $(props[i].id+states[j].num+'div').style.display = 'none';
            $(props[i].id+states[j].num).value = props[i].default;
          }
        }
      }
    }
    $('addex:'+id).style.display = 'inline';
    $('delex:'+id).style.display = 'none';
    $('defex:'+id).style.display = 'none';
    $('defex:'+id).checked = false;
    $('defex:'+id).onchange();
    $('exlabel:'+id).innerHTML = `<b>${e.name}</b>`;
    e.added = false;
    landsUpdate();
    let evopt = "";
    for (let i = 0; i < eventlist.length; i++) {
      let p = eventlist[i];
      if (exadded(p.ext)) evopt += `<option value="${i}">${eventlist[i].name}</option>`;
    }
    for (let i = 0; i < events.length; i++) {
      let val = $(`event${events[i].num}type`).value;
      $(`event${events[i].num}type`).innerHTML = evopt;
      $(`event${events[i].num}type`).value = val;
    }
    let arr = document.getElementsByClassName('ex_'+id);
    for (let i = 0; i < arr.length; i++) arr[i].style.display = 'none';
    arr = document.getElementsByClassName('ex'+id);
    for (let i = 0; i < arr.length; i++) {
      arr[i].value = setdef.get(arr[i].id);
      arr[i].onchange(); 
    }
    for (let i = 0; i < events.length; i++) {
      let e = events[i], ev;
      for (let j = 0; j < eventlist.length; j++) {
        if (eventlist[j].id == e.type) ev = eventlist[j];
      }
      if (ev.ext == id) deleteevent(e.num);
    }
    for (let y = 0; y < landscape.res; y++) {
      for (let x = 0; x < landscape.res; x++) {
        if (lands[landscape.type[y][x]].ext == id) landscape.type[y][x] = 0;
      }
    }
    landrender();
  }
}
function exadded(id) {
  for (let j = 0; j < extensionlist.length; j++) {
    if (id == extensionlist[j].id) return extensionlist[j].added;
  }
  return true;
}
function musictype() {
  options.musictype = options.musictype ? 0:1;
  $('musictype').innerHTML = options.musictype ? '*':'';
  saveSets();
}
{
  for (let i = 0; i < extensionlist.length; i++) {
    let e = extensionlist[i];
    let div = document.createElement('div');
    let add = localStorage.getItem(`defextensions.${e.id}`) ? true:false;
    div.innerHTML = `<button class="addex" id="addex:${e.id}" onclick="addex('${e.id}');">+</button>
    <label for="extensions:attack" class="label" id="exlabel:${e.id}" style="color: ${e.color};"><b>${e.name}</b></label>
    <button class="exinfo"><img src="assets/info.svg" height="8" onclick="infex('${e.id}');"></button>
    <button id="delex:${e.id}" style="background-color: #00000000; border: none; display: none;" onclick="delex('${e.id}');"><img src="assets/delete.svg" height="12"></button>
    <input type="checkbox" id="defex:${e.id}" style="display: none;" onchange="localStorage.setItem('defextensions.${e.id}', this.checked ? 'true':'');"${add ? ' checked':''}>`;
    $('extensionsdiv').appendChild(div);
    if (add) addex(e.id);
  }
}
newState("здоровые", "#00a000");
if (sessionStorage.getItem("epidemic_simulator_open")) {
  $('opengame').style.display = 'block';
  $('editor').style.display = 'none';
  readgame(sessionStorage.getItem("epidemic_simulator_open"));
  sessionStorage.setItem("epidemic_simulator_open", '');
}
