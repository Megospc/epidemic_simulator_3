var cheats = localStorage.getItem("epidemic_simulator_cheats_pinned") ? true:false;
function cheat(str) {
  pause = true;
  if (typeof str == "string" && str) {
    let keys = [];
    let s = "";
    for (let i = 0; i < str.length; i++) {
      if (str[i] == ' ') {
        keys.push(s);
        s = "";
      } else s += str[i];
    }
    if (s) keys.push(s);
    let log = alert;
    let res = (a) => log("Результат: " + a);
    let resBool = (bool) => res(bool ? "true":"false");
    let warn = (a) => log("Предупреждение: " + a);
    let err = (a) => log("Ошибка: " + a);
    let defined = (a) => typeof a != "undefined";
    let string = (i) => { return { i: i, ok: typeof keys[i] == "string", n: keys[i] }; };
    let bool = (i) => {
      if (keys[i] == "true") return { i: i, ok: true, n: true };
      else {
        if (keys[i] == "false") return { i: i, ok: true, n: false };
        else return { i: i, ok: false };
      }
    };
    let rgb = (i) => {
      let r = num(i, { up: 255, down: 0, flr: true });
      let g = num(i+1, { up: 255, down: 0, flr: true });
      let b = num(i+2, { up: 255, down: 0, flr: true });
      return { i: i+2, ok: r.ok && g.ok && b.ok, n: "#"+ahex(r.n)+ahex(g.n)+ahex(b.n) };
    };
    let num = (i, range, req) => {
      let n = Number(keys[i]);
      if ((range ?? {}).flr) n = Math.floor(n);
      let ok = false;
      if (!isNaN(n) && typeof n == "number") {
        if ((typeof range != "object" || range === null) || (range.up >= n && range.down <= n)) ok = true;
        else {
          if (req ?? true) err(`Аргумент '${keys[i]}' вышел из допустимого диапазона.`);
        }
      } else {
        if (req ?? true) err(`Аргумент '${keys[i]}' не является числом.`);
      }
      return { i: i, ok: ok, n: n };
    };
    let object = (i) => {
      let o = {};
      let ok = true;
      for (; i < keys.length; i += 2) {
        let n = parse(i+1);
        let s = string(i);
        if (n.ok && s.ok) {
          o[s.n] = n.n;
          i = n.i-1;
        } else {
          ok = false;
          break;
        }
      }
      return { i: i, ok: ok, n: o };
    };
    function parse(i) {
      let ok = false;
      if (keys[i]) {
        switch (keys[i]) {
          case "str": return string(i+1); break;
          case "num": return num(i+1); break;
          case "bool": return bool(i+1); break;
          case "RGB": return rgb(i+1); break;
          case "obj": return object(i+1); break;
          default: return string(i); break;
        }
      }
    }
    if (cheats) {
      let n, o;
      switch (keys[0]) {
        case "heal":
          switch (keys[1]) {
            case "zone?":
              res(options.healzone);
              break;
            case "to?":
              res(options.healto);
              break;
            case "zone":
              o = num(2);
              if (o.ok) options.healzone = o.n;
              break;
            case "to":
              o = num(2, { up: states.length-1, down: -1, flr: true });
              if (o.ok) options.healto = o.n;
              break;
            case "all":
              for (let i = 0; i < arr.length; i++) arr[i].toState(options.healto ?? 0);
              break;
            case "state":
              o = num(2, { up: states.length-1, down: 0, flr: true });
              if (o.ok) {
                n = o.n;
                if (n == options.healto) warn(`Состояние #${n} является 'излечаемым в'.`);
                else {
                  for (let i = 0; i < arr.length; i++) {
                    if (arr[i].state == n) arr[i].toState(options.healto ?? 0);
                  }
                }
              }
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "land":
          switch (keys[1]) {
            case "type": {
                let x = num(2, { up: landscape.res, down: 0, flr: true });
                let y = num(3, { up: landscape.res, down: 0, flr: true });
                let type = num(4, { up: lands.length-1, down: 0, flr: true });
                if (x.ok && y.ok && type.ok) landscape.type[x.n][y.n] = type.n;
              }
              break;
            case "type?": {
                let x = num(2, { up: landscape.res, down: 0, flr: true });
                let y = num(3, { up: landscape.res, down: 0, flr: true });
                if (x.ok && y.ok) res(landscape.type[x.n][y.n]);
              }
              break;
            case "pow": {
                let x = num(2, { up: landscape.res, down: 0, flr: true });
                let y = num(3, { up: landscape.res, down: 0, flr: true });
                let pow = num(4, { up: 1, down: 0 });
                if (x.ok && y.ok && pow.ok) landscape.pow[x.n][y.n] = pow.n;
              }
              break;
            case "pow?": {
                let x = num(2, { up: landscape.res, down: 0, flr: true });
                let y = num(3, { up: landscape.res, down: 0, flr: true });
                if (x.ok && y.ok) res(landscape.pow[x.n][y.n]);
              }
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "state":
          n = num(1);
          o = parse(3);
          if (o.ok && n.ok) states[n.n][keys[2]] = o.n;
          break;
        case "state?":
          n = num(1);
          o = string(2);
          if (o.ok && n.ok) res(JSON.stringify(states[n.n][o.n]));
          break;
        case "cell":
          o = num(1, { up: arr.length-1, down: 0, flr: true });
          if (o.ok && keys[2]) {
            switch (keys[2]) {
              case "heal":
                arr[o.n].toState(options.healto ?? 0);
                break;
              case "infect":
                if (defined(keys[3])) arr[o.n].toState(keys[3]);
                break;
              case "kill":
                arr[o.n].dead();
                break;
              default:
                err(`Команда '${keys[2]}' не найдена.`);
            }
          }
          break;
        case "new":
          switch (keys[1]) {
            case "cell": {
            	let s = num(2, { up: states.length-1, down: 0, flr: true }, false);
                let x = num(3, { up: options.size-(style.size/2), down: style.size/2 }, false);
                let y = num(4, { up: options.size-(style.size/2), down: style.size/2 }, false);
                arr.push(new Cell(arr.length, x.ok ? x.n:null, y.ok ? y.n:null, s.ok ? s.n:0));
              }
              break;
            case "rat": {
            	let s = num(2, { up: states.length-1, down: 0, flr: true }, false);
                let x = num(3, { up: options.size-(style.size/2), down: style.size/2 }, false);
                let y = num(4, { up: options.size-(style.size/2), down: style.size/2 }, false);
                arr.push(new Rat(arr.length, x.ok ? x.n:null, y.ok ? y.n:null, s.ok ? s.n:0));
              }
              break;
            case "ball": {
            	let s = num(2, { up: states.length-1, down: 0, flr: true }, false);
                let x = num(3, { up: options.size-(style.size/2), down: style.size/2 }, false);
                let y = num(4, { up: options.size-(style.size/2), down: style.size/2 }, false);
                arr.push(new Ball(arr.length, x.ok ? x.n:null, y.ok ? y.n:null, s.ok ? s.n:0));
              }
              break;
            case "state": {
            	let n = string(2, { up: states.length-1, down: 0, flr: true }, false);
                let c = parse(3, { up: options.size-(style.size/2), down: style.size/2 }, false);
                states.push({ name: n.ok ? n.n:"без имени", color: c.ok ? c.n:"#000000", count: { cells: 0, special: 0 } });
              }
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "cheats":
          let pinned = localStorage.getItem("epidemic_simulator_cheats_pinned");
          switch (keys[1]) {
            case "pin":
              if (!pinned) {
                log(`Чит-коды закреплены.`);
                localStorage.setItem("epidemic_simulator_cheats_pinned", 'true');
              } else warn(`Чит-коды уже закреплены.`);
              break;
            case "unpin":
            	if (pinned) {
                log(`Чит-коды откреплены.`);
                localStorage.setItem("epidemic_simulator_cheats_pinned", '');
              } else warn(`Чит-коды ещё не закреплены.`);
              break;
            case "install":
              warn(`Чит-коды уже активированы.`);
              break;
            case "installed?":
              resBool(true);
              break;
            case "pinned?":
              resBool(localStorage.getItem("epidemic_simulator_cheats_pinned"));
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "theme":
          switch (keys[1]) {
            case "back":
              n = parse(2);
              if (n.ok) colors.back = n.n;
              break;
            case "elements": 
              n = parse(2);
              if (n.ok) colors.elements = n.n;
              break;
            case "shadow":
              n = parse(2);
              if (n.ok) colors.shadow = n.n;
              break;
            case "blur":
              n = num(2);
              if (n.ok) colors.blur = n.n;
              break;
            case "text":
              n = parse(2);
              if (n.ok) colors.text = n.n;
              break;
            case "dark":
              colors = { back: "#202020", elements: "#606060", text: "#ffffff" };
              break;
            case "light":
              colors = { back: "#ffffff", elements: "#d0d0d0", text: "#000000" };
              break;
            case "back?":
              res(colors.back);
              break;
            case "elements?":
              res(colors.elements);
              break;
            case "shadow?":
              res(colors.shadow);
              break;
            case "blur?":
              res(colors.blur);
              break;
            case "text?":
              res(colors.text);
              break;
            case "dark?":
              res(colors.dark);
              break;
            case "light?":
              res(colors.light);
              break;
            case "default":
              localStorage.setItem("epidemic_simulator_default_theme", JSON.stringify(colors));
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "options?":
          if (keys[1]) {
            res(JSON.stringify(options[keys[1]]));
          }
          break;
        case "style?":
          if (keys[1]) {
            res(JSON.stringify(style[keys[1]]));
          }
          break;
        case "options":
          o = parse(2);
          if (keys[1] && o.ok) {
            if (confirm(`Симуляция будет перезапущена. Продолжить?`)) {
              options[keys[1]] = o.n;
              start();
            }
          }
          break;
        case "style":
          o = parse(2);
          if (keys[1] && o.ok) {
            if (confirm(`Симуляция будет перезапущена. Продолжить?`)) {
              style[keys[1]] = o.n;
              start();
            }
          }
          break;
        case "music":
          switch (keys[1]) {
            case "off":
              if (options.music) {
                options.music = false;
                music.pause();
              } else warn(`Музыка уже выключена.`);
              break;
            case "on":
              if (!options.music) {
                options.music = true;
                music.play();
              } else warn(`Музыка уже включена.`);
              break;
            case "on?":
              resBool(options.music);
              break;
            case "volume?":
              res(music.volume);
              break;
            case "volume":
              o = num(2, { up: 1, down: 0.1 });
              if (o.ok) {
                music.volume = o.n;
                if (!options.music) warn(`В данный момент музыка выключена.`);
              }
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "vibrate":
          switch (keys[1]) {
            case "off":
              if (options.vibrate) options.vibrate = false;
              else warn(`Вибрации уже выключены.`);
              break;
            case "on":
              if (!options.vibrate) options.vibrate = true;
              else warn(`Вибрации уже включены.`);
              break;
            case "on?":
              resBool(options.vibrate);
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "turbo":
          switch (keys[1]) {
            case "off":
              if (!style.anim && !style.deadanim && !style.chanim && style.onlygame) {
                style.anim = true;
                style.chanim = true;
                style.deadanim = true;
                style.onlygame = false;
              } else warn(`Турбо-режим уже выключён.`);
              break;
            case "on":
              if (style.anim && style.deadanim && style.chanim && !style.onlygame) {
                style.anim = false;
                style.chanim = false;
                style.deadanim = false;
                style.onlygame = true;
              } else warn(`Турбо-режим уже включён.`);
              break;
            case "on?":
              resBool(style.anim && style.deadanim && style.chanim && !style.onlygame);
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "big-graph":
          switch (keys[1]) {
            case "off":
              if (style.biggraph) style.biggraph = false;
              else warn(`Большой график уже выключён.`);
              break;
            case "on":
              if (!style.biggraph) style.biggraph = true;
              else warn(`Большой график уже включён.`);
              break;
            case "on?":
              resBool(style.biggraph);
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "graph-move":
          switch (keys[1]) {
            case "off":
              if (style.graphmove) style.graphmove = false;
              else warn(`Сдвиг графика уже выключён.`);
              break;
            case "on":
              if (!style.graphmove) style.graphmove = true;
              else warn(`Сдвиг графика уже включён.`);
              break;
            case "on?":
              resBool(style.graphmove);
              break;
            default:
              err(`Команда '${keys[1]}' не найдена.`);
          }
          break;
        case "speed":
          o = num(1);
          if (o.ok) {
            options.showspeed = o.n;
            goalFPS = fps*n, fpsTime = 1000/goalFPS;
          }
          break;
        case "resolution":
          o = num(1, { up: 8, down: 1 });
          if (o.ok) options.showspeed = Math.floor(o.n)*900;
          break;
        case "event":
          n = string(1);
          if (n.ok && typeof event[n.n] == "function") {
            o = object(2);
            if (o.ok) event[n.n](o.n);
          } else err(`Событие '${keys[1]}' не найдено.`);
          break;
        case "speed?":
          res(options.showspeed);
          break;
        case "resolution?":
          res(options.resolution);
          break;
        default:
          err(`Команда '${keys[0]}' не найдена.`);
      }
    } else {
      if (keys[0] == "cheats") {
        if (keys[1] == "install") {
          cheats = true;
          log("Чит-коды активированы. Внимание: любое действие может привести к сбою программы!");
        }
        if (keys[1] == "installed?") resBool(false);
      }
    }
    vib(50);
    setTimeout(() => cheat(prompt('', '')), 60);
  } else vib(50);
}
