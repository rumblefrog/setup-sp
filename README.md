# Setup AMXXPawn Action

![](https://github.com/wopox1337/setup-amxxpawn/workflows/Main%20Workflow/badge.svg)

This action sets-up, cache and adds amxmodx scripting directory to the path

# Usage

See [action.yml](https://github.com/wopox1337/setup-amxxpawn/blob/master/action.yml)

## Basic:

```yaml
steps:
- uses: actions/checkout@v3

- uses: wopox1337/setup-amxxpawn@master
  with:
    version: '1.10.x'

- run: amxxpc -iAnotherIncludeDirectory plugin.sma -o output/plugin.amxx
```

## Matrix:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        amxx-version: [ '1.9.x', '1.10.x', '1.10.5467', '>= 1.10.5455']

    name: AMXX version ${{ matrix.amxx-version }}
    steps:
      - uses: actions/checkout@v3

      - name: Setup AMXX
        uses: wopox1337/setup-amxxpawn@master
        with:
          version: ${{ matrix.amxx-version }}

      - run: amxxpc -iAnotherIncludeDirectory plugin.sma -o output/plugin.amxx
```

## Extract the version of the .sma file:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

    name: AMXX version ${{ matrix.amxx-version }}
    steps:
      - uses: actions/checkout@v1

      - name: Setup AMXX
        id: setup_amxx
        uses: wopox1337/setup-amxxpawn@master
        with:
          version: '1.10.x'
          version-file: ./plugin.sma

      - run: |
          amxxpc -iAnotherIncludeDirectory plugin.sma -o output/plugin.amxx
          echo Plugin version ${{ steps.setup_amxx.outputs.plugin-version }}
```

A complete workflow example can be found [here](https://github.com/Sarrus1/DiscordWebhookAPI/blob/master/.github/workflows/master.yml).