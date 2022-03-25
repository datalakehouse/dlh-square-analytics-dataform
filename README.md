# Square package

This dataform package:

*   Contains a Dataform dimensional model based on Square from [Datalakehouse’s](https://www.datalakehouse.io/) connector.
*   The main use of this package is to provide a stable snowflake dimensional model that will provide useful insights.
    

### Models

The primary ouputs of this package are fact and dimension tables as listed below. There are several intermediate models used to create these models.

    
|        Type       |        Model       |        Raw tables involved       |
|:----------------:|:----------------:|----------------|
|Dimension| W_CATALOG_ITEM_D       | CATALOG_CATEGORY<br>CATALOG_MODIFIER<br>CATALOG_ITEM_VARIATION<br>CATALOG_ITEM<br>ORDER_LINE_ITEM<br>|
|Dimension| W_CURRENCY_D         | Manually built |
|Dimension| W_MERCHANT_LOCATION_D       | LOCATION |
|Dimension| W_CUSTOMERS_D      | CUSTOMER|
|Fact| W_ORDERS_F | ORDER<br>ORDER_LINE_ITEM<br>ORDER_LINE_ITEM_MODIFIER|
|Fact| W_PAYMENTS_F          | PAYMENT|

For more information about Square's objects, [use this URL.](https://developer.squareup.com/reference)


Installation Instructions
-------------------------

Check for the [latest installation instructions](https://docs.dataform.co/dataform-cli), if you don't have Dataform CLI installed yet.

Add the package to your `packages.json` file in your Dataform project. The last release of the package can be found on the [releases page](https://github.com/datalakehouse/dlh-square-analytics-dataform/releases).



Configuration
-------------

By default, this package uses `DEVELOPER_SANDBOX` as the source database name and `DEMO_SQUARE_ALT13` as schema name. If this is not the where your Square data is, change ther below variables configuration on your `index.js` file:

```javascript
module.exports = (params) => {
  params = {
    source_database: 'DEVELOPER_SANDBOX',
    source_schema: 'DEMO_SQUARE_ALT13',
    target_schema: 'DATAFORM_SQUARE',
    ...params
  };
```

Create a new JS file on your `definitions/` folder based with the folowing example:

```javascript
const DATAFORM_SQUARE = require("../node_modules/dlh-dataform-square");
    
const models = DATAFORM_SQUARE({
});
```

### Database support

Core:

*   Snowflake
    

### Contributions

Additional contributions to this package are very welcome! Please create issues or open PRs against `main`. Check out [this post](https://docs.dataform.co/packages/contribute-to-an-existing-package) on the best workflow for contributing to a package.


*   Fork and :star: this repository :)
*   Check it out and :star: [the datalakehouse core repository](https://github.com/datalakehouse/datalakehouse-core);
