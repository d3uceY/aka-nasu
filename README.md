<p align="center">
  <img src="assets/logo.png" width="96" height="96" alt="Aka Nasu logo: a flat red tomato with a green calyx" />
</p>

# Aka Nasu · トマトの時計

Aka Nasu (赤茄子) is a pomodoro focus timer for the desktop. Aka nasu is the Japanese word for red eggplant, another name for a tomato, and the tagline トマトの時計 translates to "the tomato clock."

The whole app is built around one tomato. You spin it to set your focus time, then a big serif timer counts down while you work through your list for the day.

## Screenshots

![Aka Nasu home screen](docs/screenshots/home/home.png)

![Aka Nasu update prompt](docs/screenshots/update/update-modal.png)

## Download

Grab the latest build for your platform from the [releases page](https://github.com/d3uceY/aka-nasu/releases).

| Platform | File |
| --- | --- |
| Windows | `aka-nasu-setup.exe` |
| macOS | `aka-nasu.dmg` |
| Linux | `aka-nasu.AppImage` |

1. Pick the file for your OS from the releases page.
2. Run the installer, then open Aka Nasu.

The file names above are placeholders until installers get attached to each release.

## Why I built this

I made this app for my raging ADHD, tbh. I know the classic 25 minutes on, 5 minutes off thing is a thing, but it does the opposite for me. Twenty-five minutes of focus and then a break just breaks me out of it, and every time I get back to work I've lost the flow state and have to climb back up from zero. The "productivity hack" was really just a machine for stopping me mid-thought and making me restart.

So i run this at 50 minutes on, 10 minutes off, with a longer break after four. Long enough to actually get deep into something, and a break long enough to stand up, stare at the wall (i honestly do not do this lmao)

Spin the tomato, set your own times. It's your clock, not mine.

## Development

You need Go, Node, and the Wails v3 CLI (`wails3`).

| Command | What it does |
| --- | --- |
| `task dev` | Dev mode with hot reload |
| `task build` | Production build |
| `task run` | Run the built app |
| `npm --prefix frontend run lint` | Lint the frontend with oxlint |