# Setup SourcePawn Action

![](https://github.com/rumblefrog/setup-sp/workflows/Main%20Workflow/badge.svg)

This action sets-up, cache and adds sourcemod scripting directory to the path

# Usage

See [action.yml](https://github.com/rumblefrog/setup-sp/blob/master/action.yml)

## Basic:

```yaml
steps:
- uses: actions/checkout@v3

- uses: rumblefrog/setup-sp@master
  with:
    version: '1.12.x'

- run: spcomp -iAnotherIncludeDirectory plugin.sp -o output/plugin.smx
```

## Matrix:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        sm-version: [ '1.11.x', '1.12.x', '1.11.6467', '>= 1.11.6478']

    name: SM version ${{ matrix.sm-version }}
    steps:
      - uses: actions/checkout@v3

      - name: Setup SP
        uses: rumblefrog/setup-sp@master
        with:
          version: ${{ matrix.sm-version }}

      - run: spcomp -iAnotherIncludeDirectory plugin.sp -o output/plugin.smx
```

## Extract the version of the .sp file:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

    name: SM version ${{ matrix.sm-version }}
    steps:
      - uses: actions/checkout@v1

      - name: Setup SP
        id: setup_sp
        uses: rumblefrog/setup-sp@master
        with:
          version: '1.10.x'
          version-file: ./plugin.sp

      - run: |
          spcomp -iAnotherIncludeDirectory plugin.sp -o output/plugin.smx
          echo Plugin version ${{ steps.setup_sp.outputs.plugin-version }}
```

A complete workflow example can be found [here](https://github.com/Sarrus1/DiscordWebhookAPI/blob/master/.github/workflows/master.yml).