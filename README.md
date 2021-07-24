# Setup AMXXPawn Action

![](https://github.com/wopox1337/setup-amxxpawn/workflows/Main%20Workflow/badge.svg)

This action sets-up, cache and adds amxmodx scripting directory to the path

# Usage

See [action.yml](https://github.com/wopox1337/setup-amxxpawn/blob/master/action.yml)

Basic:

```yaml
steps:
- uses: actions/checkout@v1

- uses: wopox1337/setup-amxxpawn@master
  with:
    version: '1.10.x'

- run: amxxpc -iAnotherIncludeDirectory plugin.sma -o output/plugin.amxx
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
      - uses: actions/checkout@v1

      - name: Setup AMXXPawn
        uses: wopox1337/setup-amxxpawn@master
        with:
          version: ${{ matrix.amxx-version }}

      - run: amxxpc -iAnotherIncludeDirectory plugin.sma -o output/plugin.amxx
```
