## @0x/instant

## Integration

Looking to integrate 0x Instant into your web application or site? Check out the dedicated [instant documentation](docs/integrate-instant.mdx) to get started. The documentation covers instant and related topics in depth. For on demand developer support, join our [Discord](https://discordapp.com/invite/d3FTX3M).

## Installation

The package is available as a UMD module named `zeroExInstant` at https://instant.0x.org/v4/instant.js.

```html
<head>
    <script type="text/javascript" src="https://instant.0x.org/v4/instant.js" charset="utf-8"></script>
</head>
<body>
    <div id="zeroExInstantContainer"></div>
    <script>
        zeroExInstant.render(
            {
                // Initialization options
            },
            '#zeroExInstantContainer',
        );
    </script>
</body>
```

## Deploying

To run any of the following commands you need to configure your `.env` file. There is an example `.env_example` file to show you what values are required.

You can deploy a work-in-progress version of 0x Instant at http://0x-instant-dogfood.s3-website-us-east-1.amazonaws.com/instant.js for easy sharing.

To build and deploy the bundle run

```
yarn deploy_dogfood
```

We also have a staging bucket that is to be updated less frequently can be used to share a beta version of instant externally: http://0x-instant-staging.s3-website-us-east-1.amazonaws.com/instant.js

To build and deploy to this bundle, run

```
yarn deploy_staging
```

Finally, we have our live production bundle that is only meant to be updated with stable, polished releases: https://instant.0x.org/v4/instant.js

To build and deploy to this bundle, run

```
yarn deploy_production
```

**NOTE: On deploying the site to staging and dogfood, it will say the site is available at a non-existent URL. Please ignore and use the (now updated) URL above.**

## Contributing

We welcome improvements and fixes from the wider community! To report bugs within this package, please create an issue in this repository.

Please read our [contribution guidelines](../../CONTRIBUTING.md) before getting started.

### Install dependencies

Install dependencies

```bash
yarn install
```

### Build

To build this package:

```bash
yarn build
```

Or continuously rebuild on change:

```bash
yarn watch
```

### Clean

```bash
yarn clean
```

### Lint

```bash
yarn lint
```

### Run Tests

```bash
yarn test
```
