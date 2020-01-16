let sure;

const app = new Sear({
  persist: 'car-cricket',
  format: {
    version: 1
  },
  data: {
    persisted: {
      playing: false,
      team: '',
      type: 'test',
      runs: 0,
      wickets: 0,
      balls: 0,
      seconds: 0,
      history: []
    },
    overs() {
      return (
        Math.floor(this.persisted.balls / 6) + '.' + (this.persisted.balls % 6)
      );
    },
    time() {
      let hours = Math.floor(this.persisted.seconds / 3600),
        minutes = Math.floor((this.persisted.seconds % 3600) / 60),
        seconds = this.persisted.seconds % 60;
      if (hours / 10 < 1) hours = '0' + hours;
      if (minutes / 10 < 1) minutes = '0' + minutes;
      if (seconds / 10 < 1) seconds = '0' + seconds;
      return hours + ':' + minutes + ':' + seconds;
    },
    warn() {
      return !this.persisted.team && this.interacted;
    },
    conditions() {
      switch (this.persisted.type) {
        case 'free':
          return 'none';
        case 'test':
          return 'ends @ 10 wickets';
        case 't20':
          return 'ends @ 10 wickets or 4 overs (24 balls/cars)';
        case 'day':
          return 'ends @ 10 wickets or 30 minutes';
      }
    },
    popup: {
      open() {
        return (((this.popup.history || this.popup.content) && this.popup.title) || this.popup.check && sure);
      },
      history: false,
      check: '',
      title: '',
      content: ''
    }
  },
  watch: {
    persisted() {
      if (!this.interacted) this.interacted = true;
    },
    'persisted.seconds'() {
      setTimeout(() => {
        if (!this.persisted.playing) return;
        this.persisted.seconds++;
        if (this.persisted.type === 'day' && this.persisted.seconds >= 1800)
          end('the innings has ended! (30 minutes)');
      }, 1000);
    },
    'persisted.balls'() {
      if (this.persisted.type === 'free') return;
      if (this.persisted.type === 't20' && this.persisted.balls >= 24)
        end('the innings has ended! (4 overs)');
      if (this.persisted.wickets >= 10) end('you were bowled out! (10 wickets)');
    }
  }
});
app.interacted = false;
setTimeout(() => {
  if (app.persisted.playing) app.persisted.seconds++;
}, 1000);

function reset() {
  popup.close();
  app.persisted.runs = 0;
  app.persisted.wickets = 0;
  app.persisted.balls = 0;
  app.persisted.seconds = 0;
}
function start() {
  if (!app.interacted) app.interacted = true;
  if (!app.warn) {
    app.persisted.playing = true;
    reset();
    setTimeout(() => {
      app.persisted.seconds++;
    }, 1000);
  }
}
function end(msg) {
  app.persisted.playing = false;
  let save = `team: <b>${app.persisted.team}</b>
  | score: <b>${app.persisted.wickets}</b> for
    <b>${app.persisted.runs}</b>
  | overs: <b>${app.overs}</b>
  | time: <b>${app.time}</b>
  | type: <b>`;
  switch (app.persisted.type) {
    case 'free':
      save += 'freeplay</b>';
      break;
    case 'test':
      save += 'test match</b>';
      break;
    case 't20':
      save += 'T20 match</b>';
      break;
    case 'day':
      save += 'one day international match</b>';
  }
  app.persisted.history.unshift(save);
  app.persisted.team = '';
  reset();
  if (msg) popup.open('game over', msg + '<p><i>results</i></p> ' + save);
}

function score(runs) {
  app.persisted.runs += runs;
  app.persisted.balls++;
}

function ask(msg, func) {
  sure = func;
  app.popup.check = msg;
}

const popup = {
  open(title, content) {
    popup.close();
    app.popup.title = title;
    app.popup.content = content;
  },
  close() {
    sure = undefined;
    app.popup.history = false;
    app.popup.check = '';
    app.popup.title = '';
    app.popup.content = '';
  },
  toggle() {
    if(app.popup.open) {
      popup.close();
    } else history();
  }
};

function history() {
  popup.close();
  app.popup.title = 'history (by recent)';
  app.popup.history = true;
}

let slideup;

const drag = {
  initial: 0,
  current: 0,
  active: false,
  elem: null,
  container: null,
  start(e) {
    if (e.target === drag.elem) {
      drag.active = true;
      
      
    if (e.type === "touchstart") {
      drag.initial = e.touches[0].clientY;
    } else drag.initial = e.clientY;
  }},
  end(e) {
    if (drag.active) {
    
    drag.active = false;
    
    slideup.style['min-height'] = "";
    slideup.style['height'] = "";
    slideup.style['max-height'] = "";
  }},
  move(e) {
    if (drag.active) {
      
    
    if (e.type === "touchmove") {
      drag.current = e.touches[0].clientY;
    } else
      drag.current = e.clientY;
      
    if (drag.initial + 50 < drag.current ) {
      popup.close(); }
    if (drag.initial - 25 >= drag.current && !app.popup.open) history();
    
    // slideup.style['min-height'] = "calc(100% - " + drag.current + "px)";
    // slideup.style['height'] = "calc(100% - " + drag.current + "px)";
    // slideup.style['max-height'] = "calc(100% - " + drag.current + "px)";
   
  }}
};

window.addEventListener('DOMContentLoaded', () => {

slideup = document.querySelector("#slideup");

drag.elem = document.querySelector("#drag");
drag.container = document.body;

drag.container.addEventListener("touchstart", drag.start, false);
drag.container.addEventListener("touchend", drag.end, false);
drag.container.addEventListener("touchmove", drag.move, false);

drag.container.addEventListener("mousedown", drag.start, false);
drag.container.addEventListener("mouseup", drag.end, false);
drag.container.addEventListener("mousemove", drag.move, false);

});
