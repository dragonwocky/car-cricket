const app = new Sear({
    format: {
      name: 'car-cricket',
      version: 1
    },
    data: {
      client: {
        history: [],
        playing: false,
        team: '',
        type: 'test',
        runs: 0,
        wickets: 0,
        balls: 0,
        seconds: 0
      },
      slideup: {
        open: false,
        title: '',
        content: ''
      },
      interacted: false,
      overs() {
        return Math.floor(this['client'].balls / 6) + '.' + (this['client'].balls % 6);
      },
      time() {
        let hours = Math.floor(this['client'].seconds / 3600),
          minutes = Math.floor((this['client'].seconds % 3600) / 60),
          seconds = this['client'].seconds % 60;
        if (hours / 10 < 1) hours = '0' + hours;
        if (minutes / 10 < 1) minutes = '0' + minutes;
        if (seconds / 10 < 1) seconds = '0' + seconds;
        return hours + ':' + minutes + ':' + seconds;
      },
      warn() {
        return !this['client'].team && this.interacted;
      },
      conditions() {
        switch (this['client'].type) {
          case 'free':
            return 'none';
          case 'test':
            return 'ends @ 10 wickets';
          case 't20':
            return 'ends @ 10 wickets or 4 overs (24 balls/cars)';
          case 'day':
            return 'ends @ 10 wickets or 30 minutes';
        }
      }
    },
    watch: {
      'client.team': () => game._interact(),
      'client.type': () => game._interact(),
      'client.balls'() {
        if (this['client'].type === 'free') return;
        if (this['client'].type === 't20' && this['client'].balls >= 24)
          game.end('the innings has ended! (4 overs)');
        if (this['client'].wickets >= 10) game.end('you were bowled out! (10 wickets)');
      }
    }
  }),
  slideup = {
    open(title, content) {
      app.slideup.title = title;
      app.slideup.content = content;
      app.slideup.open = true;
    },
    close() {
      app.slideup.open = false;
    },
    toggle() {
      if (app.slideup.open) {
        this.close();
      } else this.history();
    },
    confirm(msg, func, callback) {
      this._yes = () => {
        this._yes = undefined;
        this.close();
        if (func) func();
      };
      this._cancel = () => {
        this._cancel = undefined;
        this.close();
        if (callback) callback();
      };
      this.open(
        'are you sure?',
        `<p>${msg}</p>
        <button class="action" onclick="slideup._yes()">yes</button>
        <button class="action" onclick="slideup._cancel()">cancel</button>`
      );
    },
    history() {
      this.open(
        'history (by recent)',
        `<i :else="client.history">none</i>
        <div :each="client.history">
          <div class="sidebyside">
            <p><i>[[:each:id]]</i>. [[:each:value:html]]</p>
            <button onclick="slideup.confirm(
                \`you are about to delete the below history record: <br /> <i>[[:each:id]]</i>. [[:each:value:html]]\`,
                () => app['client'].history.splice('[[:each:id]]' - 1, 1), slideup.history
            )" >delete</button>
          </div>
        </div>
        <br />
        <button class="action" onclick="slideup.confirm(
            'you are about to delete all history records.',
            () => app['client'].history = []
        )">clear</button>`
      );
    }
  },
  game = {
    reset() {
      slideup.close();
      app['client'].runs = 0;
      app['client'].wickets = 0;
      app['client'].balls = 0;
      app['client'].seconds = 0;
    },
    start() {
      this._interact();
      if (app.warn) return;
      game.reset();
      app['client'].playing = true;
      setTimeout(this._timer, 1000);
    },
    end(reason) {
      app['client'].playing = false;
      let save = `team: <b>${app['client'].team}</b>,
        score: <b>${app['client'].wickets}</b> for
          <b>${app['client'].runs}</b>,
        overs: <b>${app.overs}</b>,
        time: <b>${app.time}</b>,
        type: <b>`;
      switch (app['client'].type) {
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
      app['client'].history.unshift(save);
      app['client'].team = '';
      if (reason) slideup.open('game over', reason + '<p><i>results</i></p> ' + save);
    },
    score(runs) {
      app['client'].runs += runs;
      app['client'].balls++;
    },
    _interact() {
      if (!app.interacted) app.interacted = true;
    },
    _timer() {
      if (!app['client'].playing) return;
      app['client'].seconds++;
      if (app['client'].type === 'day' && app['client'].seconds >= 1800)
        return game.end('the innings has ended! (30 minutes)');
      setTimeout(game._timer, 1000);
    }
  },
  drag = {
    active: false,
    open: false,
    prev: 0,
    current: 0,
    diff: 0,
    targets: [],
    slideup: null,
    container: null,
    start(e) {
      if (drag.targets.includes(e.target)) {
        drag.active = true;
        drag.open = app.slideup.open;
        drag.prev = 0;
        drag.current = 0;
        drag.diff = 0;
        drag.slideup.style['transition'] = '0s';
      }
    },
    end(e) {
      if (drag.active) {
        drag.active = false;
        drag.slideup.style['min-height'] = '';
        drag.slideup.style['max-height'] = '';
        drag.slideup.style['transition'] = '';
      }
    },
    move(e) {
      if (drag.active) {
        e.preventDefault();
        let check = 5;
        if (e.type === 'touchmove') {
          drag.current = e.touches[0].clientY;
          if (drag.prev < drag.current) drag.diff++;
          if (drag.prev > drag.current) drag.diff--;
        } else {
          drag.current = e.clientY;
          check = 20;
          if (drag.prev < drag.current) drag.diff--;
          if (drag.prev > drag.current) drag.diff++;
        }
        if (drag.diff >= check) slideup.close();
        if (drag.diff <= -check)
          if (drag.open) {
            app.slideup.open = true;
          } else slideup.history();
        drag.prev = drag.current;
        drag.slideup.style['min-height'] = 'calc(100% - ' + drag.current + 'px)';
        drag.slideup.style['max-height'] = 'calc(100% - ' + drag.current + 'px)';
      }
    }
  };

window.addEventListener('DOMContentLoaded', () => {
  drag.targets = [document.querySelector('#drag'), document.querySelector('#tab')];
  drag.slideup = document.querySelector('#slideup');
  drag.container = document.querySelector('#wrapper');
  drag.container.addEventListener('touchstart', drag.start, false);
  drag.container.addEventListener('touchend', drag.end, false);
  drag.container.addEventListener('touchmove', drag.move, false);
  drag.container.addEventListener('mousedown', drag.start, false);
  drag.container.addEventListener('mouseup', drag.end, false);
  drag.container.addEventListener('mousemove', drag.move, false);

  game._timer();
});
