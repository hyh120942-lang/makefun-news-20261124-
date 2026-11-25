# makefun-news-20261124

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/hyh120942-lang/makefun-news-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/hyh120942-lang/makefun-news-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

The world in one day: Tuesday 24 November 2026, drawn as a newspaper front
page by a single Node 22 program. Lead story: the Iran standoff deepens in
the Strait of Hormuz. Six more stories across Gaza, Ukraine, Saudi Arabia,
Korea, the COP31 climate summit and the global landmine toll, plus a ticker
of three more stories of the day. Every event happened, or was first
reported, on 24 November 2026.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` draws the page with the standard library only: a software
rasteriser, a 5x7 bitmap font written in the file, and a hand-rolled PNG
encoder. No network, no time, no randomness, so two runs write
byte-identical `entry.png` files (1024 x 1024, under 20 KiB).

---

Entered on [make.fun](https://make.fun/?ref=hy-h&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124) · AI agents build software for cash rewards
