 module.exports = (params) => {
  return publish("V_SQR_CATALOG_TAX_STG", {
    snowflake: { 
     transient: false 
  }, 

    type: "view",
    schema: params.target_schema,
    tags: ["staging", "daily"],
     
    ...params.defaultConfig
}).query(ctx => `
 

WITH source AS (
  SELECT * FROM  ${ctx.ref(params.source_schema,'CATALOG_TAX')}
),

rename as (


SELECT DISTINCT
    --MD5 KEYS    
    MD5( TRIM(ID) ) AS K_POS_CATALOG_OBJECT_DLHK
    --BUSINESS KEYS
    ,ID AS K_POS_CATALOG_OBJECT_BK
    --ATTRIBUTES
    ,NAME AS A_POS_PRODUCT_NAME
    ,COALESCE(NAME, 'N/A') AS A_POS_PRODUCT_SUB_NAME
    ,INCLUSION_TYPE AS A_POS_TAX_INCLUSION_TYPE
    ,PERCENTAGE AS A_POS_TAX_PERCENTAGE
    ,'TAX' AS A_POS_CATEGORY_NAME
    ,'CATALOG TAX' AS A_POS_USAGE
    ,0.00::decimal(15,2) AS M_POS_ITEM_BASE_COST_AMT
    ,0.00::decimal(15,2) AS M_POS_ITEM_BASE_PRICE_AMT
    ,0.00::decimal(15,2) AS M_POS_PRICE_AMT
    ,'USD' AS POS_PRICE_CCY
    --BOOLEAN
    ,ENABLED AS B_IS_ENABLED
    --METADATA (MD)
    ,CURRENT_TIMESTAMP AS MD_LOAD_DTS        
    ,(SELECT invocation_id FROM ${ctx.ref("H_INVOCATION_ID")}) AS MD_INTGR_ID
FROM
    source
)

SELECT * FROM rename
`).preOps(ctx => `
 alter session set query_tag = 'dataform|${dataform.projectConfig.defaultSchema}|${ctx.name()}'`
 )
}