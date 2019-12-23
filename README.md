# Car Cricket

It's cricket! Well, kinda. You play it in a car. Works ideally with at least 3 people in the car - a driver, a bowler (calls out car colours), and a batter (clicks buttons/scores).

## Scoring

Runs are based off the colour of cars you drive past. It's up to you to decide whether to include parked cars, which lanes to focus on, etc.

| car colour  | runs |
| ----------- | ---- |
| white       | 1    |
| silver/grey | 2    |
| blue        | 3    |
| black       | 4    |
| pink        | 5    |
| yellow      | 6    |

**red car** = 1 wicket

## Gamemodes

**Freeplay** - keep going as long as you like.

**Test** - ends @ 10 wickets.

**T20** - ends @ 20 cars/balls or 10 wickets.

**One-day** - ends @ 30 minutes of playing or 10 wickets.

## History

Innings are stored in history in the format `<inning-number>. <team> scored <runs> for <wickets> in a <balls> <gamemode>`. History is persisted via localStorage and can be cleared at the click of a button.

## Offline App

| platform            | test status              |
| ------------------- | ------------------------ |
| Chrome (Windows 10) | working - PWA            |
| Safari (iOS 13)     | working - cache.manifest |

_if something is not on this list, it has not been tested. contributions to this list are welcome._

## License

```
ISC License

Copyright (c) 2019, dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```
