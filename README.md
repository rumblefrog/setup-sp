# Setup AMXXPawn Action

[![Main workflow](https://github.com/wopox1337/setup-amxxpawn/actions/workflows/Test.yml/badge.svg)](https://github.com/wopox1337/setup-amxxpawn/actions/workflows/Test.yml)

This action sets up a [amxmodx](https://github.com/alliedmodders/amxmodx) environment for use in actions by:
- optionally downloading and caching a version of amxmodx version and adding to `PATH`

# Usage

See [action.yml](https://github.com/wopox1337/setup-amxxpawn/blob/master/action.yml)

Basic:

```yaml
steps:
- uses: actions/checkout@v2

- uses: wopox1337/setup-amxxpawn@v1

- run: amxxpc -i"AnotherIncludeDirectory" plugin.sma -o"output/plugin.amxx"
```

Matrix:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        amxx-version: [ '1.9.x', '1.10.x', '1.10.5428', '>= 1.10.5428']

    name: AMXXPawn version ${{ matrix.amxx-version }}
    steps:
      - uses: actions/checkout@v2

      - name: Setup AMXXPawn
        uses: wopox1337/setup-amxxpawn@v1
        with:
          version: ${{ matrix.amxx-version }}

      - run: amxxpc -i"AnotherIncludeDirectory" plugin.sma -o"output/plugin.amxx"
```

# Credits
Thanks to https://github.com/rumblefrog/setup-sp repository author for great example. This action based on this code.
