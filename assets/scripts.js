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
      open: false,
      history: false,
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
          end('time');
      }, 1000);
    },
    'persisted.balls'() {
      if (this.persisted.type === 'free') return;
      if (this.persisted.type === 't20' && this.persisted.balls >= 24)
        end('overs');
      if (this.persisted.wickets >= 10) end('wickets');
    }
  }
});
app.interacted = false;
setTimeout(() => {
  if (app.persisted.playing) app.persisted.seconds++;
}, 1000);

function reset() {
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
  app.popup.history = false;
  let save = `${app.persisted.team} scored ${app.persisted.runs} for ${app.persisted.wickets} in ${app.overs} of `;
  switch (app.persisted.type) {
    case 'free':
      save += 'freeplay.';
      break;
    case 'test':
      save += 'a test match.';
      break;
    case 't20':
      save += 'a T20 match.';
      break;
    case 'day':
      save += 'a 1-day International match.';
  }
  app.persisted.history.push(save);
  app.persisted.team = '';
  if (msg) popup.open('game over', msg);
  reset();
}

function score(runs) {
  app.persisted.runs += runs;
  app.persisted.balls++;
}

const popup = {
  open(title, content) {
    app.popup.title = title;
    app.popup.content = content;
    app.popup.open = true;
  },
  close() {
    app.popup.open = false;
    app.popup.history = false;
    app.popup.content = '';
  }
};

function history() {
  app.popup.history = true;
  app.popup.open = true;
}
