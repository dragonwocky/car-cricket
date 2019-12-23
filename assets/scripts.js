/*
 * Car Cricket - It's cricket! Well, kinda. You play it in a car.
 * ===============================================================
 * Copyright (c) 2019 dragonwocky <thedragonring.bod@gmail.com>, under the ISC License.
 */

let onclose = false;
// define the default set of data
const defaults = {
    playing: false,
    current: {
      team: '',
      runs: 0,
      wickets: 0,
      balls: 0,
      type: 'test',
      timer: 0
    },
    history: []
  },
  // function to close popup on ESC keypress, then remove event
  keypressClose = event => {
    if (event.keyCode === 27) popup(0, 0, false);
  },
  // open popup with text and buttons
  popup = (text, buttons, open, final) => {
    if (open) {
      if (final) onclose = final;
      else onclose = false;
      document.querySelector('.popup .text').innerHTML = text;
      document.querySelector('.popup .buttons').innerHTML = buttons;
      document
        .querySelectorAll('body, .play')
        .forEach(el => el.classList.add('is-clipped'));
      document.querySelector('.popup').classList.add('is-active');
      document.addEventListener('keydown', keypressClose);
    } else {
      if (onclose) onclose();
      document.removeEventListener('keydown', keypressClose);
      document
        .querySelectorAll('body, .play')
        .forEach(el => el.classList.remove('is-clipped'));
      document.querySelector('.popup').classList.remove('is-active');
    }
  },
  // manage the timer for one-dayers
  day = () => {
    const timer = setInterval(() => {
      const data = JSON.parse(localStorage.carCricket);
      data.current.timer += 1;
      localStorage.carCricket = JSON.stringify(data);
      if (data.current.timer === 1800) end(3), clearInterval(timer);
    }, 1000);
  },
  // make sure data is valid/exists
  load = () => {
    let data;
    try {
      data = JSON.parse(localStorage.carCricket);
      if (typeof data.playing != 'boolean') data.playing = false;
      if (typeof data.current != 'object') data.current = defaults.current;
      if (typeof data.current.team != 'string')
        data.current.team = defaults.current.team;
      if (typeof data.current.runs != 'number')
        data.current.runs = defaults.current.runs;
      if (typeof data.current.wickets != 'number')
        data.current.wickets = defaults.current.wickets;
      if (typeof data.current.balls != 'number')
        data.current.balls = defaults.current.balls;
      if (!['free', 'test', 't20', 'day'].includes(data.current.type))
        data.current.type = defaults.current.type;
      if (typeof data.current.timer != 'number')
        data.current.timer = defaults.current.timer;
      if (!Array.isArray(data.history)) data.history = defaults.history;
    } catch (e) {
      data = defaults;
    }
    document
      .querySelector(`[value=${data.current.type}]`)
      .setAttribute('checked', true);
    if (data.playing) {
      if (data.current.type === 'day') day();
      document
        .querySelectorAll(`[name=settings]`)
        .forEach(option => option.setAttribute('disabled', true));
      document.querySelector('.team').innerHTML = data.current.team;
      document.querySelector('.runs').innerHTML = data.current.runs;
      document.querySelector('.wickets').innerHTML = data.current.wickets;
      document.querySelector('.play').style.display = 'block';
    } else document.querySelector('.choose').style.display = 'block';
    localStorage.carCricket = JSON.stringify(data);
  },
  // set the game type
  set = type => {
    const data = JSON.parse(localStorage.carCricket);
    data.current.type = type;
    localStorage.carCricket = JSON.stringify(data);
  },
  // choose the team name for the current game
  choose = team => {
    const data = JSON.parse(localStorage.carCricket);
    if (team) {
      document
        .querySelectorAll(`[name=settings]`)
        .forEach(option => option.setAttribute('disabled', true));
      data.current.team = team;
      data.playing = true;
      if (data.current.type === 'day') day();
      document.querySelector('.team').innerHTML = team;
      document.querySelector('.runs').innerHTML = data.current.runs;
      document.querySelector('.wickets').innerHTML = data.current.wickets;
      document.querySelector('.choose').style.display = 'none';
      document.querySelector('.play').style.display = 'block';
    } else return false;
    localStorage.carCricket = JSON.stringify(data);
  },
  // display game data saved to history
  history = () => {
    let scores = '';
    JSON.parse(localStorage.carCricket).history.forEach(game => {
      scores = `<li>${game.team} scored ${game.runs} run${
        game.runs === 1 ? '' : 's'
      } for ${game.wickets} wicket${game.wickets === 1 ? '' : 's'} in a ${
        game.balls
      }-ball ${
        game.type === 'day'
          ? 'one-day match'
          : game.type === 't20'
          ? 'T20 match'
          : 'test match'
      }.</li>${scores}`;
    });
    if (scores === '') scores = '<h3><i>History is empty.</i></h3>';
    else scores = `<ol reversed>${scores}</ol>`;
    popup(
      scores,
      `<button class="other" onclick="
            const data = JSON.parse(localStorage.carCricket);
            data.history = [];
            document.querySelector('.popup .text').innerHTML = '<h3><i>History is empty.</i></h3>';
            document.querySelector('.popup .buttons').innerHTML = '';
            localStorage.carCricket = JSON.stringify(data);
          ">CLEAR</button>`,
      true
    );
  },
  // add amount to number of runs or wickets in current game
  score = (amount, wicket) => {
    const data = JSON.parse(localStorage.carCricket);
    if (wicket) {
      data.current.wickets += 1;
      document.querySelector('.wickets').innerHTML = data.current.wickets;
    } else {
      data.current.runs += amount;
      document.querySelector('.runs').innerHTML = data.current.runs;
    }
    data.current.balls += 1;
    setTimeout(() => {
      if (data.current.type !== 'free' && data.current.wickets === 10) end(1);
      if (data.current.type === 't20' && data.current.balls === 20) end(2);
    }, 1);
    localStorage.carCricket = JSON.stringify(data);
  },
  // end the game
  end = type => {
    if (type === 1)
      finish(),
        popup(
          '<p>Game over! You were bowled out (you got 10 wickets). Your current score has been saved to history.</p>',
          '<button class="other" onclick="popup(0, 0, false)">OK</button>',
          true,
          display
        );
    else if (type === 2)
      finish(),
        popup(
          '<p>Game over! 20 balls have been bowled.Your current score has been saved to history.</p>',
          '<button class="other" onclick="popup(0, 0, false)">OK</button>',
          true,
          display
        );
    else if (type === 3)
      finish(),
        popup(
          '<p>Game over! 30 minutes are up. Your current score has been saved to history.</p>',
          '<button class="other" onclick="popup(0, 0, false)">OK</button>',
          true,
          display
        );
    else
      popup(
        '<p>Do you wish to start a new innings? Your current score will be saved to history.</p>',
        `<button class="other" onclick="finish(); display(); popup(0, 0, false)">OK</button>
          <button class="other" onclick="popup(0, 0, false)">CANCEL</button>`,
        true
      );
  },
  // save data to history
  finish = () => {
    const data = JSON.parse(localStorage.carCricket);
    data.history = data.history.concat({
      team: data.current.team,
      runs: data.current.runs,
      wickets: data.current.wickets,
      balls: data.current.balls,
      type: data.current.type
    });
    (data.playing = false),
      (data.current = defaults.current),
      (data.current.type = data.history[data.history.length - 1].type);
    localStorage.carCricket = JSON.stringify(data);
  },
  // display team name choice page
  display = () => {
    document
      .querySelectorAll(`[name=settings]`)
      .forEach(option => option.removeAttribute('disabled'));
    document.querySelector('.choose').style.display = 'block';
    document.querySelector('.choose input').value = '';
    document.querySelector('.play').style.display = 'none';
  };
