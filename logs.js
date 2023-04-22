var logs = sessionStorage.getItem('epidemic_simulator_logs');
var frames = [], props = new Map();
if (logs) {
  document.getElementById('logs').value = logs;
  document.getElementById('logs').style.display = 'block';
  document.getElementById('div').style.display = 'block';
  parse(logs);
} else {
  document.getElementById('file').style.display = 'block';
}
function download() {
  let blob = new Blob([logs], { type: "text/plain" });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `epidemic_simulator_logs.txt`;
  a.click();
}
function read(file) {
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function() {
    logs = reader.result;
    document.getElementById('logs').value = logs;
    document.getElementById('logs').style.display = 'block';
    document.getElementById('div').style.display = 'block';
    document.getElementById('file').style.display = 'none';
    parse(logs);
  };
}
function parse(txt) {
  let res = (txt) => document.getElementById('result').value += txt + "\n";
  let str = "";
  let arr = [];
  for (let i = 0; i < txt.length; i++) {
    if (txt[i] == "\n") {
      arr.push(str);
      str = "";
    } else {
      str += txt[i];
    }
  }
  if (arr[0] == "EPIDEMIC_SIMULATOR_2_LOGS:") {
    res("Начало обработки...");
    let keyval = function(txt) {
      let key = "";
      let value = "";
      let i = 0;
      for (i = 0; txt[i] != "=" && i < txt.length; i++) {
        if (txt[i] != " ") key += txt[i];
      }
      if (i == txt.length) return null;
      for (i += 2; i < txt.length; i++) {
        value += txt[i];
      }
      return { key: key, val: value };
    };
    let i = 0;
    for (i = 1; i < arr.length; i++) {
      let s = keyval(arr[i]);
      if (s) {
        props.set(s.key, s.val);
        res(`Прочитано свойство '${s.key}'`);
      } else {
        res("Свойства прочитаны..");
        break;
      }
    }
    if (props.get('version') && props.get('name') && props.get('json') && props.get('date') && props.get('frames')) {
      res("Общяя информация:");
      const versions = new Map([
        ["2.5.8", "09.03.2023"],
        ["2.5.11", "10.03.2023"],
        ["2.5.14", "11.03.2023"],
        ["2.5.15", "11.03.2023"],
        ["2.5.16", "11.03.2023"],
        ["2.5.17", "12.03.2023"],
        ["2.5.18", "12.03.2023"],
        ["2.5.19", "13.03.2023"],
        ["2.5.20", "13.03.2023"],
        ["2.5.25", "17.04.2023"],
        ["2.6.0", "17.04.2023"],
        ["2.6.2", "17.04.2023"],
        ["2.7.0", "18.04.2023"],
        ["3.0.0", "19.04.2023"],
        ["3.1.0", "20.04.2023"],
        ["3.1.5", "20.04.2023"],
        ["3.3.3", "22.04.2023"],
        ["3.3.8", "22.04.2023"],
        ["3.3.11", "22.04.2023"]
      ]);
      res(`Версия программы: ${props.get('version')} (${versions.get(props.get('version')) ?? "неизвестная"})`);
      res(`Дата: ${new Date(Number(props.get('date')))}`);
      res(`Имя: ${props.get('name')}`);
      res(`Длина: ${props.get('frames')}`);
      let json;
      try {
        json = JSON.parse(props.get('json'));
      } catch(e) {
        res("Синтаксическая ошибка код: 5");
        res(e.message);
        return;
      }
      if (!json.states.length) {
        res("Синтаксическая ошибка код: 6");
        return;
      }
      res("Начало обработки кадров...");
      let done = function() {
        res("Отрисовка графиков...");
        let graph = function(ctx, max, time) {
          ctx.fillStyle = "#d0d0d0";
          ctx.fillRect(50, 20, 400, 2);
          ctx.fillRect(50, 120, 400, 2);
          ctx.fillRect(50, 220, 400, 2);
          ctx.font = "12px Monospace";
          ctx.fillText(flr(max), 0, 20, 50);
          ctx.fillText(flr(max/2), 0, 120, 50);
          ctx.fillText("0.0", 0, 220, 50);
          ctx.fillRect(60, 10, 2, 220);
          ctx.fillRect(155, 10, 2, 220);
          ctx.fillRect(250, 10, 2, 220);
          ctx.fillRect(345, 10, 2, 220);
          ctx.fillRect(440, 10, 2, 220);
          ctx.fillText("0.0", 60, 250, 40);
          ctx.fillText(flr(time/4), 155, 250, 40);
          ctx.fillText(flr(time/2), 250, 250, 40);
          ctx.fillText(flr(time/4*3), 345, 250, 40);
          ctx.fillText(flr(time), 440, 250, 40);
        };
        let ctx = document.getElementById('graph0').getContext('2d');
        let max = 0;
        for (let m = 0; m < frames.length; m++) {
          for (let n = 0; n < frames.length; n++) {
            if (max < frames[m].arr[n]) max = frames[m].arr[n];
          }
        }
        graph(ctx, max, frames.length/30);
        for (let n = 0; n < json.states.length; n++) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = (json.states[n].color ?? "#000000") + (json.states[n].transparent ? "80":"ff");
          ctx.beginPath();
          for (let p = 0; p < 380; p++) {
            let y = 200-(frames[Math.floor(frames.length/380*p)].arr[n]/max*200);
            if (p == 0) ctx.moveTo(p+60, y+20);
            else ctx.lineTo(p+60, y+20);
          }
          ctx.stroke();
        }
        ctx = document.getElementById('graph1').getContext('2d');
        max = 30;
        for (let m = 0; m < frames.length; m++) {
          if (max < 1000/frames[m].perf) max = 1000/frames[m].perf;
        }
        graph(ctx, max, frames.length/30);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        for (let p = 0; p < 380; p++) {
          let y = 200-((1000/frames[Math.floor(frames.length/380*p)].perf)/max*200);
          if (p == 0) ctx.moveTo(p+60, y+20);
          else ctx.lineTo(p+60, y+20);
        }
        ctx.stroke();
        ctx.fillStyle = "#a0000080";
        ctx.fillRect(60, 220-((30/max*200)), 380, 3);
        ctx = document.getElementById('graph2').getContext('2d');
        max = 0;
        for (let m = 0; m < frames.length; m++) {
          if (max < frames[m].sum) max = frames[m].sum;
        }
        graph(ctx, max, frames.length/30);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        for (let p = 0; p < 380; p++) {
          let y = 200-((frames[Math.floor(frames.length/380*p)].sum)/max*200);
          if (p == 0) ctx.moveTo(p+60, y+20);
          else ctx.lineTo(p+60, y+20);
        }
        ctx.stroke();
        ctx = document.getElementById('legend').getContext('2d');
        ctx.font = `${200/(json.states.length < 9 ? 10:json.states.length+1)}px Monospace`;
        for (let n = 0; n < json.states.length; n++) {
          ctx.fillStyle = (json.states[n].color ?? "#000000") + (json.states[n].transparent ? "80":"ff");
          ctx.fillText(json.states[n].name ?? "[имя не известно]", 0, (n+1)*250/(json.states.length < 9 ? 10:json.states.length+1), 500);
        }
        res("Обработка завершена.");
        document.getElementById('parsed').style.display = 'block';
      };
      let f = function() {
        let bool = true, j = 0, n = "", s = "FRAME ";
        for (j = 0; j < s.length; j++) {
          if (arr[i][j] != s[j]) {
            bool = false;
            break;
          }
        }
        if (bool) {
          for (; arr[i][j] != " " && j < arr[i].length; j++) n += arr[i][j];
          if (Number(n) == frames.length) {
            res(`Обработка кадра ${Number(n)}`);
            let obj = { arr: [], sum: 0, perf: 0 }
            i++;
            let str = "";
            for (let k = 0; arr[i][k] != "|"; k++) {
              if (arr[i][k] != " ") str += arr[i][k];
            }
            if (isFinite(Number(str))) obj.sum = Number(str);
            else res("Синтаксическая ошибка код: 2");
            let l = 0;
            i++;
            while(str != "donein") {
              str = "";
              for (l = 0; l < arr[i].length && arr[i][l] != "|" && str != "donein"; l++) {
                if (arr[i][l] != " ") str += arr[i][l];
              }
              if (str != "donein") {
                if (isFinite(Number(str))) obj.arr.push(Number(str));
                else {
                  res("Синтаксическая ошибка код: 3");
                  return;
                }
                i++;
              }
            }
            if (obj.arr.length != json.states.length) {
              res("Синтаксическая ошибка код: 7");
              return;
            }
            str = "";
            for (; l < arr[i].length && arr[i][l] != "m"; l++) {
              if (arr[i][l] != " ") str += arr[i][l];
            }
            if (isFinite(Number(str))) obj.perf = Number(str);
            else {
              res("Синтаксическая ошибка код: 4");
              return;
            }
            frames.push(obj);
            res(`Результат: ${JSON.stringify(obj)}`);
          }
          else {
            res(`Ошибка: кадр с неправильным номером ${n}`);
            return;
          }
        }
        i++;
        if (i < arr.length) setTimeout(f, 0);
        else done();
      }
      f();
    } else {
      res("Синтаксическая ошибка код: 1");
      return;
    }
  } else {
    res("Синтаксическая ошибка код: 0");
    return;
  }
}
function edit() {
  sessionStorage.setItem("epidemic_simulator_open", props.get('json'));
  open('index.html');
}
function flr(num) {
  num = Math.floor(num*10)/10;
  return num%1 == 0 ? num+".0":num;
}
