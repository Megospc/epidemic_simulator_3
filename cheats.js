var cheats = localStorage.getItem("epidemic_simulator_cheats_pinned") ? true:false;
function cheat(str) {
  let ps = pause;
  pause = true;
  let keys = [];
  let s = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] == ' ') {
      keys.push(s);
      s = "";
    }
    else s += str[i];
  }
  if (s) keys.push(s);
  if (cheats) {
    let n;
    switch (keys[0]) {
      case "heal":
        switch (keys[1]) {
          case "zone":
            n = Number(keys[2]);
            if (!isNaN(n)) options.healzone = n;
            else alert(`Ошибка: Аргумент '${keys[2]}' не является числом.`);
            break;
          case "all":
            for (let i = 0; i < arr.length; i++) arr[i].toState(options.healto ?? 0);
            break;
          case "state":
            n = Number(keys[2]);
            if (!isNaN(n)) {
              if (states.length <= n || n < 0) alert(`Предупреждение: Состояние #${n} не существует.`);
              else {
                if (n == options.healto) alert(`Предупреждение: Состояние #${n} является 'излечаемым в'.`);
                else {
                  for (let i = 0; i < arr.length; i++) {
                    if (arr[i].state == n) arr[i].toState(options.healto ?? 0);
                  }
                }
              }
            } else alert(`Ошибка: Аргумент '${keys[2]}' не является числом.`);
            break;
          default:
            alert(`Ошибка: Команда '${keys[1]}' не найдена.`);
        }
        break;
      case "cheats":
        let pinned = localStorage.getItem("epidemic_simulator_cheats_pinned");
        switch (keys[1]) {
          case "pin":
            if (!pinned) {
              alert(`Чит коды закреплены.`);
              localStorage.setItem("epidemic_simulator_cheats_pinned", 'true');
            } else alert(`Предупреждение: Чит-коды уже закреплены.`);
            break;
          case "unpin":
        	if (pinned) {
        	  alert(`Чит коды откреплены.`);
              localStorage.setItem("epidemic_simulator_cheats_pinned", '');
            } else alert(`Предупреждение: Чит-коды ещё не закреплены.`);
            break;
          case "install":
            alert(`Предупреждение: Чит-коды уже активированы.`);
            break;
          case "installed?":
            alert("истина");
            break;
          case "pinned?":
            alert(localStorage.getItem("epidemic_simulator_cheats_pinned") ? "истина":"ложь");
            break;
          default:
            alert(`Ошибка: Команда '${keys[1]}' не найдена.`);
        }
        break;
      case "music":
        switch (keys[1]) {
          case "off":
            if (options.music) {
              options.music = false;
              music.pause();
            } else alert(`Предупреждение: музыка уже выключена.`);
            break;
          case "on":
            if (!options.music) {
              options.music = true;
              music.play();
            } else alert(`Предупреждение: музыка уже включена.`);
            break;
          case "on?":
            alert(options.music ? "истина":"ложь");
            break;
          default:
            alert(`Ошибка: Команда '${keys[1]}' не найдена.`);
        }
        break;
      case "speed":
        if (keys[1] == "set") {
          n = Number(keys[2]);
          if (!isNaN(n)) {
            options.showspeed = n;
            goalFPS = fps*n, fpsTime = 1000/goalFPS;
          }
          else alert(`Ошибка: Аргумент '${keys[2]}' не является числом.`);
        }
        break;
      case "event":
        if (event[keys[1]]) {
          let e = {};
          for (let i = 2; i < keys.length; i += 2) {
            let n = Numeber(keys[i+1]);
            if (!isNaN(n)) e[keys[i]] = n;
          }
          event[keys[1]](e);
        } else alert(`Ошибка: Событие '${keys[1]}' не существует`);
        break;
      case "speed?":
        alert(options.showspeed);
        break;
      default:
        alert(`Ошибка: Команда '${keys[0]}' не найдена.`);
    }
  } else {
    if (keys[0] == "cheats") {
      if (keys[1] == "install") {
        cheats = true;
        alert("Чит-коды активированы.");
      }
      if (keys[1] == "installed?") alert("ложь");
    }
  }
  pause = ps;
}