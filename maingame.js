class Cell { //основной класс
  constructor(id, x, y, state) {
    //установка позиции:
    this.x = x ?? random(options.size-style.size)+(style.size/2);
    this.y = y ?? random(options.size-style.size)+(style.size/2);
    
    this.speed = { x: random(options.speed)-(options.speed/2), y: random(options.speed)-(options.speed/2) }; //установка скорорости
    
    //инициализация:
    this.state = 0; 
    this.alive = true;
    this.id = id;
    this.time = timeNow();
    this.st = states[0];
    this.infectable = false;
    this.frame = this.state ? 0:false;
    this.teleportated = false;
    this.magnet = null;
    this.magneted = false;
    this.infect = this.st.infect ?? this.state;
    this.infectable = this.st.zone && this.st.prob;
    this.parasitetime = false;
    this.relived = false;
    this.speedc = 1;
    this.type = "cell";
    this.landscape();
    this.NaN = false;
    
    //обновление счётчика:
    counter.cells++;
    this.st.count.cells++;
    
    if (state) this.toState(state, true);
    
    { //установка "дома"
      let shome = { minx: style.size/2, miny: style.size/2, maxx: options.size-(style.size/2), maxy: options.size-(style.size/2) };
      if (options.quar) {
        this.home = { minx: Math.max(style.size/2, this.x-options.quar), miny: Math.max(style.size/2, this.y-options.quar), maxx: Math.min(options.size-(style.size/2), this.x+options.quar), maxy: Math.min(options.size-(style.size/2), this.y+options.quar) };
      } else {
        this.home = shome;
      }
    }
  }
  toState(state, init) { //метод перехода в другое состояние
    if (this.alive) {
      let laststate = this.st;
      this.st.count.cells--; //обновление счётчика
      
      if (this.st.allone) { //свойство "все за одного"
        this.st.allone = false;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id != this.id && arr[i].state == this.state) arr[i].toState(state);
        }
        this.st.allone = true;
      }
      
      this.state = state;
      this.time = timeNow();
      this.frame = frame;
      this.st = states[state];
      this.infect = this.st.infect ? this.st.infect-1:this.state;
      
      this.st.count.cells++; //обновление счётчика
      
      if (this.st.teleporto && !init) { //свойство "телепорт"
        this.teleportated = { st: laststate, x: this.x, y: this.y }
        this.x = testCordMinMax(this.x+random(this.st.teleporto*2+1)-this.st.teleporto, style.size);
        this.y = testCordMinMax(this.y+random(this.st.teleporto*2+1)-this.st.teleporto, style.size);
      } else {
        this.teleportated = false;
      }
      
      if (this.st.prob && this.st.zone) { //свойство "отдых" и проверка зарожаимости
        if (this.st.rest) {
          this.restend = timeNow()+this.st.rest;
          this.infectable = false;
        } else {
          this.infectable = true;
        }
      } else {
        this.infectable = false;
      }
    }
  }
  timeend() {
    if (rnd() <= this.st.heal) { //свойство "излечение"
      this.toState(this.st.transform == -1 ? Math.floor(random(states.length)):(this.st.transform ?? 0)); 
    } else {
      this.dead();
    }
  }
  dead() { //метод "смерти"
    if (this.alive) {
      if (this.land.type == 11 && this.land.pow > rnd()) { //ландшафт "лагерь"
        this.toState(0);
      } else {
        //обновление:
        this.alive = false;
        this.time = timeNow();
        this.frame = frame;
        
        if (!this.st.after) {
          this.infectable = false;
          //обновление счётчика:
          this.st.count.cells--;
          counter.cells--;
        } else { //свойство "инфекция после смерти"
          if (!this.infectable) {
            //обновление счётчика:
            this.st.count.cells--;
            counter.cells--;
          }
        }
        if (this.st.mosquito) { //свойство "москиты"
          for (let i = 0; i < this.st.mosquito; i++) {
            mosq.push(new Mosquito(mosq.length, this.x, this.y, this.state));
          }
        }
      }
      if (this.land.type == 6 && this.land.pow > rnd()) arr.push(new Rat(arr.length, this.x, this.y)); //ландшафт "свалка"
    }
  }
  handler() { //метод обработчика
    if (this.alive) {
      //обработка ландшафтов:
      if (this.land.type == 1 && this.land.pow > rnd()) this.dead(); //"отравленная зона"
      if (this.land.type == 18 && this.land.pow > rnd() && event.dragoned) this.dead(); //"драконья зона"
      if (this.land.type == 12 && this.land.pow/(this.st.builder ? 100:1) > rnd()) this.dead(); //"строительная зона"
      if (this.state && this.land.type == 2 && this.land.pow > rnd()) this.toState(0); //"санитарная зона"
      if (this.land.type == 7 && this.land.pow > rnd() && this.st.allergy != -1) this.toState(this.st.allergy); //"аллергенная зона"
      if (this.land.type == 13 && this.land.pow > rnd()) {
        this.dead();
        arr[this.id] = new Rat(this.id, this.x, this.y, this.state);
      } //"магическая зона"
      if (this.state && this.land.type == 9 && this.land.pow > rnd() && this.st.waterscary) this.dead(); //"морская зона"
      if (this.land.type == 10 && this.land.pow/1000 > rnd()) explosion(); //"взрывоопасная зона"
      if (this.land.type == 16 && this.land.pow > rnd()) {
        this.teleportated = { st: this.st, x: this.x, y: this.y };
        this.frame = frame;
        this.x = random(options.size-style.size)+(style.size/2);
        this.y = random(options.size-style.size)+(style.size/2);
      } //"научная зона"
      
      if (this.st.time && this.time+this.st.time <= timeNow()) this.timeend(); //обработка "срока жизни"
    }
    
    if (this.restend && this.restend < timeNow() && this.alive) { //свойство "отдых"
      this.infectable = true;
      this.restend = false;
    }
    
    if (!this.alive && this.infectable && this.st.after+this.time < timeNow()) { //свойство "инфекция после смерти"
      this.infectable = false;
      this.st.count.cells--;
      counter.cells--;
    }
    
    if (!this.alive && this.st.relivetime && this.time+this.st.relivetime < timeNow() && !this.relived) { //свойство "воскрешение"
      if (this.st.reliveprob > rnd()) arr[this.id] = new Cell(this.id, this.x, this.y, this.st.transform == -1 ? Math.floor(random(states.length)):(this.st.transform ?? 0));
      else this.relived = true; //уже пытался "возродиться"
    }
    
    if ((this.infectable || (this.st.magnet && this.st.magnetpow && this.alive) || (this.st.parasite && this.alive)) && this.frame !== frame) { //проверка "заражения"
      let inzone = 0; //счётчик клеток в зоне заражения
      for (let i = 0; i < arr.length; i++) { //проверка всех клеток
        let p = arr[i];
        if (p.state != this.infect && p.state != this.state && p.alive && (!this.st.group || this.st.group != p.st.group)) { //проверка "не мой ли это друг?"
          if (p.type == "cell" && this.st.magnet && this.st.magnetpow && p.x >= this.x-this.st.magnet && p.x <= this.x+this.st.magnet && p.y >= this.y-this.st.magnet && p.y <= this.y+this.st.magnet) { //свойство "магнит"
            let c = (this.st.magnet-Math.sqrt(((this.x-p.x)**2)+((this.y-p.y)**2)))/this.st.magnet; //расстояние
            p.magnet = p.magnet ?? { x: 0, y: 0 };
            p.magnet.y += p.y < this.y ? this.st.magnetpow*c:-this.st.magnetpow*c;
            p.magnet.x += p.x < this.x ? this.st.magnetpow*c:-this.st.magnetpow*c;
          }
          if (((this.land.type == 3 && this.land.pow > rnd() && p.land.type == 3 && p.type == "cell") /* ландшафт "зона биологической опасности" */ || (this.x-this.st.zone <= p.x && this.x+this.st.zone >= p.x && this.y-this.st.zone <= p.y && this.y+this.st.zone >= p.y)) && ! (this.land.type == 14 && this.land.pow > rnd() && p.land.type == 14 && p.type == "cell") /* ландшафт "зона строгого контроля" */) { //проверка зоны заражения
            inzone++;
            if (this.st.stopping) p.speedc *= 1-this.st.stopping; //свойство "остановка"
            if (this.infectable) {
              if (rnd() < this.st.prob /* свойство "вероятность" */+(p.st.defect ?? 0 /* свойство "уязвимость" */)+(this.land.type == 5 ? this.land.pow:0 /* ландшафт "зона повышенного заражения */) && (p.st.protect ?? 0 /* свойство "защита" */)-(this.st.spikes ?? 0 /* свойство "шипы" */) < rnd()) { //проверка вероятности заражения
                let killer = Math.max(this.st.killer, (event.wared && this.land.type == 20) ? this.land.pow:0);
                if (rnd() < killer) { //свойство "убийца"
                  p.dead();
                } else {
              	if (!event.quared) {
                    if (rnd() < p.st.potion) this.dead();
                    p.toState(this.infect);
                  }
                }
                for (let i = 0; i < this.st.farinf; i++) arr[Math.floor(random(arr.length))].toState(this.state); //свойство "дальняя атака"
              } else {
                if (rnd() < this.st.attacktrans && p.state != this.st.transform) { //свойство "переатака"
                  p.toState(this.st.transform == -1 ? Math.floor(random(states.length)):(this.st.transform ?? 0));
                } else {
                  if (rnd() < p.st.cattack) this.toState(p.state); //свойство "контратака"
                }
              }
            }
          }
        }
      }
      if (this.alive && inzone == 0 && this.st.parasite) { //свойство "паразит"
        if (!this.parasitetime) this.parasitetime = timeNow();
      } else {
        this.parasitetime = false;
      }
    }
    
    if (this.st.parasite && this.alive && this.parasitetime && this.parasitetime+this.st.parasite < timeNow()) this.dead(); //свойство "паразит"
  }
  move() { //метод движения
    if (this.alive) {
      if (this.st.crazy/10 > rnd()) this.speed = { x: random(options.speed)-(options.speed/2), y: random(options.speed)-(options.speed/2) }; //свойство "сумасшедший"
      
      let c = this.land.type == 4 ? 1-(this.land.pow):(this.land.type == 17 ? this.land.pow+1:1); //ландшафт "пляжная зона"
      
      if (this.st.robber && options.quar) this.home = { minx: Math.max(style.size/2, this.x-options.quar), miny: Math.max(style.size/2, this.y-options.quar), maxx: Math.min(options.size-(style.size/2), this.x+options.quar), maxy: Math.min(options.size-(style.size/2), this.y+options.quar) }; //свойство "грабитель"
      
      let home = Object.assign({}, this.home);
      
      if (!this.st.builder) { //свойство "строитель"
        let px = options.size/landscape.res;
        if (this.land.x != landscape.res-1) {
          if (landscape.type[this.land.x+1][this.land.y] == 12) home.maxx = Math.min(home.maxx, ((this.land.x+1)*px)-(style.size/2));
        }
        if (this.land.x != 0) {
          if (landscape.type[this.land.x-1][this.land.y] == 12) home.minx = Math.max(home.minx, (this.land.x*px)+(style.size/2));
        }
        if (this.land.y != landscape.res-1) {
          if (landscape.type[this.land.x][this.land.y+1] == 12) home.maxy = Math.min(home.maxy, ((this.land.y+1)*px)-(style.size/2));
        }
        if (this.land.y != 0) {
          if (landscape.type[this.land.x][this.land.y-1] == 12) home.miny = Math.max(home.miny, (this.land.y*px)+(style.size/2));
        }
      }
      
      let magnet = this.magnet ?? { x: 0, y: 0 };
      if (this.magnet) this.magneted = true;
      else this.magneted = false;
      
      //движение:
      this.x += (this.speed.x*(this.st.speed ?? 1)*c*this.speedc)+magnet.x;
      this.y += (this.speed.y*(this.st.speed ?? 1)*c*this.speedc)+magnet.y;
      
      //проверка касания края
      if (this.x < home.minx) this.speed.x *=-1, this.x = home.minx;
      if (this.x > home.maxx) this.speed.x *=-1, this.x = home.maxx;
      if (this.y < home.miny) this.speed.y *=-1, this.y = home.miny;
      if (this.y > home.maxy) this.speed.y *=-1, this.y = home.maxy;
      
      this.landscape();
    }
  }
  render() { //метод отрисовки на холсте
    if (!this.st.invisible) { //свойство "невидимка"
      if (this.alive) {
        let f = function(o) {
          let trans = o.st.transparent ? 128:255;
          ctx.fillStyle = o.st.color + ahex(trans);
          ctx.fillRect(X((o.x-(style.size/2))*scale+15), Y((o.y-(style.size/2))*scale+15), X(style.size*scale), Y(style.size*scale));
        };
        if (this.teleportated) { //отрисовка "телепортации"
          if (frame < this.frame+5 && style.anim && this.frame !== false) {
            let fram = frame-this.frame;
            let cellTrans = this.st.transparent ? 128:255;
            let trans = cellTrans*fram/5;
            ctx.fillStyle = this.st.color + ahex(trans);
            ctx.fillRect(X((this.x-(style.size/2))*scale+15), Y((this.y-(style.size/2))*scale+15), X(style.size*scale), Y(style.size*scale));
            cellTrans = this.teleportated.st.transparent ? 128:255;
            trans = cellTrans*fram/5;
            ctx.fillStyle = this.teleportated.st.color+ ahex(255-trans);
            ctx.fillRect(X(((this.teleportated.x-(style.size/2)))*scale+15), Y((this.teleportated.y-(style.size/2))*scale+15), X(style.size*scale), Y(style.size*scale));
          } else f(this);
        } else {
          f(this);
          if (this.magneted && style.anim) { //отрисовка "магнита"
            let trans = this.st.transparent ? 64:128;
            ctx.fillStyle = this.st.color + ahex(trans);
            ctx.fillRect(X((this.x-(style.size))*scale+15), Y((this.y-(style.size))*scale+15), X(style.size*2*scale), Y(style.size*2*scale));
          } else {
            if (frame < this.frame+5 && style.chanim && this.frame !== false) { //отрисовка заражения
              let fram = frame-this.frame;
              let cellTrans = this.st.transparent ? 128:255;
              let trans = ahex(cellTrans*(5-fram)/10);
              let size = 2*style.size;              
              ctx.fillStyle = this.st.color + trans;
              ctx.fillRect(X((this.x-(size/2))*scale+15), Y((this.y-(size/2))*scale+15), X(size*scale), Y(size*scale));
            }
          }
        }
      } else {
        if (frame < this.frame+15 && style.deadanim) { //отрисовка "смерти"
          let fram = frame-this.frame;
          let size = (fram/7.5+1)*style.size;
          let cellTrans = this.st.transparent ? 128:255;
          let trans = ahex(cellTrans*(15-fram)/15);
          ctx.fillStyle = this.st.color + trans;
          ctx.fillRect(X((this.x-(size/2))*scale+15), Y((this.y-(size/2))*scale+15), X(size*scale), Y(size*scale));
        }
      }
    }
  }
  first() { //метод пре-отрисовки (для элементов нижнего слоя)
    if (!this.alive) {
      if (this.infectable) { //отрисовка "инфекции после смерти"
        let cellTrans = this.st.transparent ? 128:255;
        let fill = (x, y, s, x_, y_, c) => {
          ctx.fillStyle = c;
          ctx.fillRect(X((x_+(style.size*x))*scale+15), Y((y_+(style.size*y))*scale+15), X(s*style.size*scale), Y(s*style.size*scale));
        };
        fill(-0.75, -0.75, 0.6, this.x, this.y, this.st.color + ahex(cellTrans/3*(style.anim ? Math.sin(degToRad(frame*30))+1:1)));
        fill(0.75, -0.75, 1, this.x, this.y, this.st.color + ahex(cellTrans/3*(style.anim ? Math.sin(degToRad(frame*30+180))+1:1)));
        fill(-0.75, 0.75, 1, this.x, this.y, this.st.color + ahex(cellTrans/3*(style.anim ? Math.sin(degToRad(frame*30+180))+1:1)));
        fill(0.75, 0.75, 0.8, this.x, this.y, this.st.color + ahex(cellTrans/3*(style.anim ? Math.sin(degToRad(frame*30))+1:1)));
      } else {
        if (style.dots) { //отрисовка "следов"
          let cellTrans = this.st.transparent ? 128:255;
          ctx.fillStyle = (style.dots.color == "ill" ? this.st.color:style.dots.color) + (style.dots.transparent ? ahex(cellTrans-80):"");
          ctx.fillRect(X(this.x*scale+15-(style.dots.size/2)), Y(this.y*scale+15-(style.dots.size/2)), X(style.dots.size*scale), Y(style.dots.size*scale));
        }
      }
    }
  }
  end() { //метод окончания обработки
    this.magnet = null;
    this.speedc = 1;
  }
  landscape() { //метод проверки ландшафта
    let px = options.size/landscape.res;
    this.land = { x: Math.floor(this.x/px), y: Math.floor(this.y/px) };
    this.land.type = this.st.antiland > rnd() ? 0:landscape.type[this.land.x][this.land.y];
    this.land.pow = landscape.pow[this.land.x][this.land.y];
  }
}

class  Mosquito { //класс "москита"
  constructor(id, x, y, state) {
    this.speed = { x: random(options.mosquitospeed)-(options.mosquitospeed/2), y: random(options.mosquitospeed)-(options.mosquitospeed/2) }; //установка скорости
    //инициализация:
    this.x = x;
    this.y = y;
    this.state = state;
    this.id = id;
    this.alive = true;
    this.st = states[this.state];
    this.time = timeNow();
    this.type = "mosquito";
    this.landscape();
  }
  render() { //метод отрисовки на холсте
    if (this.alive) {
      let x_ = style.anim ? Math.cos(degToRad(frame*30))*style.mosquitosize*1.5:0;
      let y_ = style.anim ? Math.sin(degToRad(frame*30))*style.mosquitosize*1.5:0;
      let trans = this.st.transparent ? 128:255;
      
      ctx.fillStyle = this.st.color + ahex(trans);
      ctx.fillRect(X(testCordMinMax(this.x-(style.mosquitosize/2)+x_, style.mosquitosize)*scale+15), Y(testCordMinMax(this.y-(style.mosquitosize/2)+y_, style.mosquitosize)*scale+15), X(style.mosquitosize*scale), Y(style.mosquitosize*scale));
      ctx.fillStyle = this.st.color + ahex(trans/2);
      ctx.fillRect(X(testCordMinMax(this.x-(style.mosquitosize)+x_, style.mosquitosize*2)*scale+15), Y(testCordMinMax(this.y-(style.mosquitosize)+y_, style.mosquitosize*2)*scale+15), X(style.mosquitosize*2*scale), Y(style.mosquitosize*2*scale)); 
    }
  }
  handler() { //метод обработчика
    if (this.land.type == 8 && this.land.pow > rnd()) this.alive = false; //ландшафт "охотничья зона"
    
    if (this.alive) { //проверка заражения
      for (let i = 0; i < arr.length; i++) { //проверка всех остальных клеток
        let p = arr[i];
        if (p.state != this.state && p.alive && (!this.st.group || this.st.group != p.st.group)) { //прверка "не мой ли это друг?"
          if (this.x - options.mosquitozone <= p.x && this.x + options.mosquitozone >= p.x && this.y - options.mosquitozone <= p.y && this.y + options.mosquitozone >= p.y) { //проверка зоны заражения
            if (rnd() < options.mosquitoprob && (p.st.protect ?? 0 /* свойство "защита" */) < rnd()) { //проверка вероятности
              p.toState(this.state);
            }
          }
        }
      }
      
      if (options.mosquitotime && this.time+options.mosquitotime < timeNow()) this.alive = false; //проверка "срока жизни"
      
      { //блок движения
        let home = { minx: style.mosquitosize/2, miny: style.mosquitosize/2, maxx: options.size-(style.mosquitosize/2), maxy: options.size-(style.mosquitosize) };
        
        //движение:
        this.x += this.speed.x;
        this.y += this.speed.y;
        
        //проверка касания края:
        if (this.x < home.minx) this.speed.x *=-1, this.x = home.minx;
        if (this.x > home.maxx) this.speed.x *=-1, this.x = home.maxx;
        if (this.y < home.miny) this.speed.y *=-1, this.y = home.miny;
        if (this.y > home.maxy) this.speed.y *=-1, this.y = home.maxy;
        
        this.landscape();
      }
    }
  }
  landscape() { //метод проверки ландшафта
    let px = options.size/landscape.res;
    this.land = { x: Math.floor(this.x/px), y: Math.floor(this.y/px) };
    this.land.type = landscape.type[this.land.x][this.land.y];
    this.land.pow = landscape.pow[this.land.x][this.land.y];
  }
}

class Rat { //класс "крысы"
  constructor(id, x, y, state) {
    //установка позиции
    this.x = x ?? random(options.size-style.ratsize)+(style.ratsize/2);
    this.y = y ?? random(options.size-style.ratsize)+(style.ratsize/2);
    
    this.speed = { x: random(options.ratspeed)-(options.ratspeed/2), y: random(options.ratspeed)-(options.ratspeed/2) }; //установка скорости
    
    //инициализация:
    this.state = state ?? 0;
    this.id = id;
    this.alive = true;
    this.time = timeNow();
    this.st = states[this.state];
    this.infectable = false;
    this.frame = this.state ? 0:false;
    this.infect = this.st.infect ?? this.state;
    this.infectable = this.st.zone && this.st.prob;
    this.type = "rat";
    if (state) this.toState(state);
    
    //обновление счётчика:
    counter.special++;
    this.st.count.special++;
    
    this.landscape();
  }
  toState(state) { //метод перехода в другое состояние
    if (this.alive) {
      let laststate = this.st;
      
      //обновление счётчика:
      this.st.count.special--;
      this.state = state;
      
      this.time = timeNow();
      this.frame = frame;
      this.st = states[this.state];
      this.infect = this.st.infect ? this.st.infect-1:this.state;
      this.infectable = this.st.prob && this.st.zone;
      this.st.count.special++; //обновление счётчика
    }
  }
  dead() { //метод "смерти"
    if (this.alive) {
      this.alive = false;
      this.time = timeNow();
      this.frame = frame;
      this.infectable = false;
      
      //обновление счётчика:
      this.st.count.special--;
      counter.special--;
    }
  }
  handler() { //метод обработчика
    if (this.land.type == 8 && this.land.pow > rnd()) this.dead(); //ландшафт "охотничья зона"
    if (this.alive && this.land.type == 15 && this.land.pow > rnd()) {
        this.dead();
        arr[this.id] = new Cell(this.id, this.x, this.y, this.state);
      } //ландшафт "человечья зона"
    
    if (this.infectable && this.frame !== frame) { //проверка заражения
      for (let i = 0; i < arr.length; i++) { //проверка всех клеток
        let p = arr[i];
        if (p.state != this.infect && p.state != this.state && p.alive && p.type != "rat") { //проверка "не мой ли это друг?" и "не крыса ли это?"
          if (this.x-this.st.zone <= p.x && this.x+this.st.zone >= p.x && this.y-this.st.zone <= p.y && this.y+this.st.zone >= p.y) { //проверка зоны заражения
            if (rnd() < this.st.prob && (p.st.protect ?? 0 /* свойство "защита" */) < rnd()) p.toState(this.infect); //проверка вероятности заражения
          }
        }
      }
    }
  }
  move() { //метод движения
    if (this.alive) {
      let home = { minx: style.ratsize/2, miny: style.ratsize/2, maxx: options.size-(style.ratsize/2), maxy: options.size-(style.ratsize/2) };
      
      //движение:
      this.x += this.speed.x;
      this.y += this.speed.y;
      
      //проверка касания края:
      if (this.x < home.minx) this.speed.x *=-1, this.x = home.minx;
      if (this.x > home.maxx) this.speed.x *=-1, this.x = home.maxx;
      if (this.y < home.miny) this.speed.y *=-1, this.y = home.miny;
      if (this.y > home.maxy) this.speed.y *=-1, this.y = home.maxy;
      
      this.landscape();
    }
  }
  render() { //метод отрисовки на холсте
    if (!this.st.invisible) { //свойство "невидимка"
      let fig = function(obj, size) {
        let px = size*style.ratsize;
        let l = px/2;
        ctx.beginPath();
        ctx.moveTo(X((obj.x-l)*scale+15), Y((obj.y+l)*scale+15));
        ctx.lineTo(X((obj.x+l)*scale+15), Y((obj.y+l)*scale+15));
        ctx.lineTo(X(obj.x*scale+15), Y((obj.y-l)*scale+15));
        ctx.closePath();
        ctx.fill();
      };
      if (this.alive) {
        let trans = this.st.transparent ? 128:255;
        ctx.fillStyle = this.st.color + ahex(trans);
        fig(this, 1);
        if (frame < this.frame+5 && style.chanim && this.frame !== false) { //отрисовка перехода в другое состояние
          let fram = frame-this.frame;
          let cellTrans = this.st.transparent ? 128:255;
          let trans = ahex(cellTrans*(5-fram)/10);
          ctx.fillStyle = this.st.color + trans;
          fig(this, 2);
        }
      } else {
        if (frame < this.frame+15 && style.deadanim) { //отрисовка "смерти"
          let fram = frame-this.frame;
          let size = fram/7.5+1;
          let cellTrans = this.st.transparent ? 128:255;
          let trans = ahex(cellTrans*(15-fram)/15);
          ctx.fillStyle = this.st.color + trans;
          fig(this, size);
        }
      }
    }
  }
  landscape() { //метод проверки ландшафта
    let px = options.size/landscape.res;
    this.land = { x: Math.floor(this.x/px), y: Math.floor(this.y/px) };
    this.land.type = landscape.type[this.land.x][this.land.y];
    this.land.pow = landscape.pow[this.land.x][this.land.y];
  }
  first() {} //метод пре-отрисовки (пока не нужен)
  end() {}  //метод конца обработки (пока не нужен)
}

class Ball { //класс "шара"
    constructor(id, x, y, state) {
    //установка позиции
    this.x = x ?? random(options.size-style.ratsize)+(style.ratsize/2);
    this.y = y ?? random(options.size-style.ratsize)+(style.ratsize/2);
    
    this.speed = { x: 0, y: 0 }; //установка скорости
    
    //инициализация:
    this.state = state ?? 0;
    this.id = id;
    this.alive = true;
    this.time = timeNow();
    this.st = states[this.state];
    this.infectable = false;
    this.frame = this.state ? 0:false;
    this.infect = this.st.infect ?? this.state;
    this.infectable = this.st.zone && this.st.prob;
    this.type = "ball";
    if (state) this.toState(state);
    
    //обновление счётчика:
    counter.special++;
    this.st.count.special++;
    
    this.landscape();
  }
  toState(state) { //метод перехода в другое состояние
    if (this.alive) {
      let laststate = this.st;
      
      //обновление счётчика:
      this.st.count.special--;
      this.state = state;
      
      //"подскок":
      this.speed.x += -gravitation.x*10;
      this.speed.y += -gravitation.y*10;
      
      this.time = timeNow();
      this.frame = frame;
      this.st = states[this.state];
      this.infect = this.st.infect ? this.st.infect-1:this.state;
      this.infectable = this.st.prob && this.st.zone;
      this.st.count.special++; //обновление счётчика
    }
  }
  dead() { //метод "смерти"
    if (this.alive) {
      this.alive = false;
      this.time = timeNow();
      this.frame = frame;
      this.infectable = false;
      
      //обновление счётчика:
      this.st.count.special--;
      counter.special--;
    }
  }
  handler() { //метод обработчика
    if (this.land.type == 8 && this.land.pow > rnd()) this.dead(); //ландшафт "охотничья зона"
    if (this.alive && this.land.type == 15 && this.land.pow > rnd()) {
        this.dead();
        arr[this.id] = new Cell(this.id, this.x, this.y, this.state);
      } //ландшафт "человечья зона"
    
    if (this.infectable && this.frame !== frame) { //проверка заражения
      for (let i = 0; i < arr.length; i++) { //проверка всех клеток
        let p = arr[i];
        if (p.state != this.infect && p.state != this.state && p.alive) { //проверка "не мой ли это друг?"
          if (this.x-this.st.zone <= p.x && this.x+this.st.zone >= p.x && this.y-this.st.zone <= p.y && this.y+this.st.zone >= p.y) { //проверка зоны заражения
            if (rnd() < this.st.prob && (p.st.protect ?? 0 /* свойство "защита" */) < rnd()) p.toState(this.infect); //проверка вероятности заражения
          }
        }
      }
    }
  }
  move() { //метод движения
    if (this.alive) {
      let home = { minx: style.ballsize/2, miny: style.ballsize/2, maxx: options.size-(style.ballsize/2), maxy: options.size-(style.ballsize/2) };
      
      //движение:
      this.speed.x += gravitation.x;
      this.speed.y += gravitation.y;
      this.x += this.speed.x;
      this.y += this.speed.y;
      
      //проверка касания края:
      if (this.x < home.minx) this.speed.x *=-options.balljump, this.x = home.minx;
      if (this.x > home.maxx) this.speed.x *=-options.balljump, this.x = home.maxx;
      if (this.y < home.miny) this.speed.y *=-options.balljump, this.y = home.miny;
      if (this.y > home.maxy) this.speed.y *=-options.balljump, this.y = home.maxy;
      
      this.landscape();
    }
  }
  render() { //метод отрисовки на холсте
    if (!this.st.invisible) { //свойство "невидимка"
      let fig = function(obj, size) {
        ctx.beginPath();
        ctx.arc(X(obj.x*scale+15), Y(obj.y*scale+15), X(size*style.ballsize/2), 0, Math.PI*2);
        ctx.fill();
      };
      if (this.alive) {
        let trans = this.st.transparent ? 128:255;
        ctx.fillStyle = this.st.color + ahex(trans);
        fig(this, 1);
        if (frame < this.frame+5 && style.chanim && this.frame !== false) { //отрисовка перехода в другое состояние
          let fram = frame-this.frame;
          let cellTrans = this.st.transparent ? 128:255;
          let trans = ahex(cellTrans*(5-fram)/10);
          ctx.fillStyle = this.st.color + trans;
          fig(this, 2);
        }
      } else {
        if (frame < this.frame+15 && style.deadanim) { //отрисовка "смерти"
          let fram = frame-this.frame;
          let size = fram/7.5+1;
          let cellTrans = this.st.transparent ? 128:255;
          let trans = ahex(cellTrans*(15-fram)/15);
          ctx.fillStyle = this.st.color + trans;
          fig(this, size);
        }
      }
    }
  }
  landscape() { //метод проверки ландшафта
    let px = options.size/landscape.res;
    this.land = { x: Math.floor(this.x/px), y: Math.floor(this.y/px) };
    this.land.type = landscape.type[this.land.x][this.land.y];
    this.land.pow = landscape.pow[this.land.x][this.land.y];
  }
  first() {} //метод пре-отрисовки (пока не нужен)
  end() {}  //метод конца обработки (пока не нужен)
}

function frame_() { //метод обработки и отрисовки кадра
  if (counter.cells+counter.special > 0 || !options.stop) {
    let FPS = Math.floor(10000/(performance.now()-lastTime))/10;
    let start = performance.now();
    lastTime = performance.now();
    
    if (!pause) { //запись счётчиков в "архив"
      let counts_ = [];
      for (let i = 0; i < states.length; i++) {
        counts_[i] = states[i].count.cells+states[i].count.special;
      }
      counts.sum = counter.cells+counter.special;
      counts.push(counts_);
    }
    
    clear(); //очистка холста
    
    //отрисовка ландшафтов:
    let px = 420/landscape.res;
    for (let x = 0, d = 0; x < landscape.res; x++) {
      for (let y = 0; y < landscape.res; y++) {
        let type = landscape.type[x][y], pow = landscape.pow[x][y];
        if (type == 18 && event.dragoned) { //ландшафт "драконья зона"
          const k = 0.1;
          let f = event.dragonfire[d];
          ctx.fillStyle = "#a08000" + ahex(f.now);
          ctx.fillRect(X(x*px+15), Y(y*px+15), X(px), Y(px));
          if (!pause && style.anim) { //анимация "огня"
            if (frame%5 == 0) f.next = random(192)+63;
            f.now = Math.floor(f.now+(f.next-f.now)*k);
          }
          d++;
        } else {
          ctx.fillStyle = lands[type] + ahex(pow*120);
          ctx.fillRect(X(x*px+15), Y(y*px+15), X(px), Y(px));
        }
      }
    }
    
    if (!pause) {
      for (let i = 0; i < arr.length; i++) { //обработка простых клеток и крыс
        arr[i].handler();
      }
      for (let i = 0; i < mosq.length; i++) { //обработка москитов
        mosq[i].handler();
      }
      
      for (let i = 0; i < events.length; i++) { //обработка событий
        let e = events[i];
        if (!e.done && timeNow() > e.time) {
          event[e.type](e);
          e.done = true;
        }
      }
      if (event.quared && event.quared < timeNow()) event.quared = false; //событие "карантин"
      if (event.dragoned && event.dragoned < timeNow()) event.dragoned = false; //событие "гнев драконов"
      if (event.wared && event.wared < timeNow()) event.wared = false; //событие "военные действия"
      
      //свойство "добавка":
      for (let i = 0; i < states.length; i++) {
        let ill = states[i];
        if (ill.addtime && ill.addcount && (ill.countadd == 0 || ill.added < ill.countadd)) {
          if (ill.addtime+ill.lastadd < timeNow()) {
            for (let j = 0; j < ill.addcount; j++) {
              arr[Math.floor(random(arr.length))].toState(i);
            }
            ill.lastadd = timeNow();
            ill.added++;
          }
        }
      }
    }
    
    for (let i = 0; i < arr.length; i++) { //отрисовка нижнего плана крыс и простых клеток
      arr[i].first();
    }
    for (let i = 0; i < arr.length; i++) { //отрисовка крыс и простых клеток
      arr[i].render();
    }
    for (let i = 0; i < mosq.length; i++) { //отрисовка москитов
      mosq[i].render();
    }
    
    if (!pause) {
      for (let i = 0; i < arr.length; i++) { //движение крыс и простых клеток
        arr[i].move();
      }
      for (let i = 0; i < arr.length; i++) {
        arr[i].end();
      }
    }
    
    if (!style.onlygame) { //отрисовка статистики
      ctx.font = `${X(18)}px Monospace`;
      ctx.fillStyle = "#000000";
      ctx.fillText(`Время: ${flr(timeNow()/1000)}с`, X(490), Y(style.biggraph ? 260:30));
      ctx.fillText(`FPS: ${flr(FPS) + " x" + (options.showspeed ?? 1)}`, X(490), Y(style.biggraph ? 290:60));
      if (!style.biggraph) ctx.fillText("Статистика:", X(490), Y(120));
      ctx.fillText(`${counter.cells+counter.special}${counter.special > 0 ? ` (${counter.cells})`:""} | сумма`, X(490), Y(style.biggraph ? 350:150));
      sort();
      
      ctx.font = `${X(Math.min(Math.floor(9/states.length*18), 18))}px Monospace`;
      
      //отрисовка графиков и статистики
      if (style.biggraph) biggraph();
      else {
        for (let i = 0; i < sorted.length; i++) { //отрисовка статистики
          let st = sorted[i];
          ctx.fillStyle = st.color + (st.transparent ? "80":"ff");
          ctx.fillText(`${st.count.cells+st.count.special}${st.count.special ? ` (${st.count.cells})`:""} | ${st.name} ${st.invisible? "(невидим)":""}`, X(490), Y(180+(i*Math.min(Math.floor(9/states.length*30), 30))));
        }
        
        graph();
      }
    }
    
    ctx.fillStyle = "#d0d0d0";
    ctx.fillRect(0, 0, X(450), Y(15));
    ctx.fillRect(0, Y(435), X(450), Y(15));
    ctx.fillRect(0, 0, X(15), Y(450));
    ctx.fillRect(X(435), 0, X(15), Y(450));
    
    if (event.splash && event.splash+10 > frame && style.anim) { //"всплеск событий"
      let fram = (frame-event.splash)/10;
      ctx.fillStyle = event.splashcolor + ahex(255-(fram*255));
      ctx.fillRect(X(15), Y(15), X(420), Y(420));
    }
    
    ctx.fillStyle = "#d0d0d0";
    if (pause) { //отрисовка "паузы"
      //кнопка "продолжить":
      ctx.beginPath();
      ctx.moveTo(X(850), Y(400));
      ctx.lineTo(X(870), Y(415));
      ctx.lineTo(X(850), Y(430));
      ctx.closePath();
      ctx.fill();
      
      //кнопка "заново":
      ctx.fillRect(X(800), Y(400), X(30), Y(30));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(X(807), Y(407), X(16), Y(16));
      ctx.fillRect(X(820), Y(415), X(16), Y(20));
      ctx.fillStyle = "#d0d0d0";
      ctx.beginPath();
      ctx.moveTo(X(834), Y(410));
      ctx.lineTo(X(825), Y(420));
      ctx.lineTo(X(818), Y(410));
      ctx.closePath();
      ctx.fill();
      
      //кнопка "полный экран":
      ctx.beginPath();
      ctx.moveTo(X(760), Y(400));
      ctx.lineTo(X(770), Y(400));
      ctx.lineTo(X(760), Y(410));
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(X(790), Y(400));
      ctx.lineTo(X(780), Y(400));
      ctx.lineTo(X(790), Y(410));
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(X(760), Y(430));
      ctx.lineTo(X(770), Y(430));
      ctx.lineTo(X(760), Y(420));
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(X(790), Y(430));
      ctx.lineTo(X(780), Y(430));
      ctx.lineTo(X(790), Y(420));
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(X(770), Y(410), X(10), Y(10));
      
      //кнопка "логи":
      for (let i = 0; i < 4; i++) ctx.fillRect(X(725), Y(400+(i*5)), X(25), Y(2));
      for (let i = 0; i < 2; i++) ctx.fillRect(X(730), Y(420+(i*5)), X(20), Y(2));
      ctx.strokeStyle = "#d0d0d0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(X(720), Y(420));
      ctx.lineTo(X(725), Y(425));
      ctx.lineTo(X(720), Y(430));
      ctx.stroke();
    } else {
      ctx.fillRect(X(850), Y(400), X(10), Y(30));
      ctx.fillRect(X(870), Y(400), X(10), Y(30));
      frame++;
    }
    
    let perf = performance.now()-start;
    if (!pause) stats.push({ perf: perf, sum: counter.cells+counter.special });
    
    if (!style.onlygame) { //отрисовка статистики
      ctx.fillStyle = "#000000";
      ctx.font = `${X(18)}px Monospace`;
      ctx.fillText(`Расчёт: ${Math.floor(perf)}мс`, X(490), Y(style.biggraph ? 320:90));
    }
    maxFPS = 1000/(performance.now()-start);
  } else {
    clearInterval(interval);
  }
}
function click(e) { //обоаботчик события 'click'
  let c = cw/900;
  
  //получение координат клика
  let x = (e.pageX-cx)/c;
  let y = (e.pageY-cy)/c;
  
  if (x > 850 && y > 400) { //кнопка "пауза/продолжить"
    vib(50);
    pause = !pause;
  }
  
  if (pause && x > 800 && x < 850 && y > 400) { //кнопка "заново"
    vib(100);
    start();
    pause = false;
  }
  
  if (pause && x > 760 && x < 790 && y > 400) { //кнопка "полный экран"
    vib(100);
    fullScreen(document.documentElement);
  }
  if (pause && x > 720 && x < 750 && y > 400) { //кнопка "логи"
    //генерация логов:
    let fast = { num: 1000/fps };
    let slow = { num: 1000/fps };
    let frames = "";
    for (let j = 0; j < frame; j++) {
      frames += `\nFRAME ${j} (${flr(j/fps)}s):\n${stats[j].sum} | сумма\n`;
      for (let i = 0; i < counts[j].length; i++) {
        frames += `${counts[j][i]} | ${states[i].name}\n`;
      }
      frames += `done in ${flr(stats[j].perf)}ms (maxFPS: ${flr(1000/stats[j].perf)})\n`;
      if (stats[j].perf > slow.num) slow = { num: stats[j].perf, frame: j };
      if (stats[j].perf < fast.num) fast = { num: stats[j].perf, frame: j };
    }
    let logs = `EPIDEMIC_SIMULATOR_3_LOGS:
version = ${version}
name    = ${strnn(obj.name)}
json    = ${strnn(json)}
date    = ${date}
frames  = ${frame} (${flr(frame/fps)}s)
fastest = ${flr(fast.num)}ms (frame: ${fast.frame})
slowest = ${flr(slow.num)}ms (frame: ${slow.frame})
random  = ${randomed}
heals   = ${heals}
${frames}`;
    sessionStorage.setItem("epidemic_simulator_logs", logs);
    open('logs.html');
  }
  if (!pause && options.healzone && y >= 15 && y <= 435 && x >= 15 && x <= 435) { //"излечение кликом"
    vib(30);
    let x_ = (x-15)/420*options.size;
    let y_ = (y-15)/420*options.size;
    let zone = options.healzone;
    for (let i = 0; i < arr.length; i++) {
      let p = arr[i];
      if (p.y >= y_-zone && p.y <= y_+zone && p.x >= x_-zone && p.x <= x_+zone) {
        p.toState(options.healto ?? 0);
      }
    }
    heals++;
  }
}
function start() { //метод инициализации
  let rats = 0, cells = 0, balls = 0;
  
  //установка переменным изначальные значения:
  arr = [];
  counts = [];
  mosq = [];
  stats = [];
  events = [];
  frame = 0;
  randomed = 0;
  heals = 0;
  counter = { cells: 0, special: 0 };
  states[0].count = { cells: 0, special: 0 };
  for (let i = 0; i < obj.events.length; i++) {
    events[i] = Object.assign({}, obj.events[i]);
  }
  Object.assign(gravitation, options.grav ?? { x: 0, y: 3 });
  event.splash = false;
  event.quared = false;
  event.dragoned = false;
  
  //заполнение массивов:
  for (let i = 1, j = 0; i < states.length; i++) {
    let ill = states[i];
    ill.count = { cells: 0, special: 0 };
    ill.lastadd = 0;
    ill.added = 0;
    for (let k = 0; k < ill.initial; k++, j++) {
      let x = null, y = null;
      if (ill.position && ill.position.length > k) x = ill.position[k].x, y = ill.position[k].y;
      arr.push(new Cell(j, x, y, i));
      cells++;
    }
    for (let k = 0; k < ill.ratinit; k++, j++, rats++) arr.push(new Rat(j, null, null, i));
    for (let k = 0; k < ill.ballinit; k++, j++, balls++) arr.push(new Ball(j, null, null, i));
  }
  for (let i = arr.length; cells < options.count; i++, cells++) arr.push(new Cell(i));
  for (let i = arr.length; rats < options.ratcount; i++, rats++)arr.push(new Rat(i));
  for (let i = arr.length; balls < options.ballcount; i++, balls++)  arr.push(new Ball(i));
  
  sort();
}

start(); //инициализация

addEventListener('click', () => { //стартовый клик
  vib(100);
  date = Date.now();
  music.loop = true;
  if (options.music) music.play();
  interval = setInterval(() => { if (performance.now() >= lastTime+fpsTime) frame_(); }, 1);
  started = true;
  document.addEventListener('click', click);
}, { once: true });