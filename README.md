# Setup SourcePawn Action

![](https://github.com/rumblefrog/setup-sp/workflows/Main%20Workflow/badge.svg)

This action sets-up, cache and adds sourcemod scripting directory to the path

# Usage

See [action.yml](https://github.com/rumblefrog/setup-sp/blob/master/action.yml)

Basic:

```yaml
steps:
- uses: actions/checkout@v1

- uses: rumblefrog/setup-sp@master
  with:
    version: '1.10.x'

- run: spcomp -iAnotherIncludeDirectory plugin.sp -o output/plugin.smx
```

Matrix:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        sm-version: [ '1.10.x', '1.11.x', '1.11.6467', '>= 1.11.6478']

    name: SM version ${{ matrix.sm-version }}
    steps:
      - uses: actions/checkout@v1

      - name: Setup SP
        uses: rumblefrog/setup-sp@master
        with:
          version: ${{ matrix.sm-version }}

      - run: spcomp -iAnotherIncludeDirectory plugin.sp -o output/plugin.smx
```
