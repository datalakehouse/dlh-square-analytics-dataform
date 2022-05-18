const common = require("../../common");
 module.exports = (params) => {
  return publish("V_SQR_CUSTOMER_STG", {
  type: "view",
  schema: params.target_schema,
  tags: ["staging", "daily"],

    ...params.defaultConfig
}).query(ctx => `

WITH source AS (
  SELECT 
  * 
  FROM  	
    ${ctx.ref(params.source_schema,'CUSTOMER')}
),
rename AS 
(   
SELECT 
    --MD5 KEYS
     MD5( TRIM(COALESCE(ID, '00000000000000000000000000000000')) ) AS K_POS_CUSTOMER_DLHK
    --BUSINESS KEYS
    ,ID AS K_POS_CUSTOMER_BK
    --ATTRIBUTES
    ,GIVEN_NAME AS A_POS_GIVEN_NAME
    ,FAMILY_NAME AS A_POS_FAMILY_NAME
    ,${common.full_name("GIVEN_NAME","FAMILY_NAME")} AS A_POS_FULL_NAME
    ,EMAIL_ADDRESS AS A_POS_EMAIL
    ,ADDRESS_ADDRESS_LINE_1 AS A_POS_ADDR_LINE_1
    ,ADDRESS_ADDRESS_LINE_2 AS A_POS_ADDR_LINE_2
    ,ADDRESS_ADDRESS_LINE_3 AS A_POS_ADDR_LINE_3
    ,ADDRESS_LOCALITY AS A_POS_ADDR_LOCAL
    ,ADDRESS_SUBLOCALITY AS A_POS_ADDR_SUBLOCAL
    ,ADDRESS_POSTAL_CODE AS A_POS_ADDR_POSTAL_CODE
    ,ADDRESS_COUNTRY AS A_POS_ADDR_COUNTRY
    ,PHONE_NUMBER AS A_POS_PHONE_NUM
    ,CASE 
      WHEN LEFT(BIRTHDAY,4) = '0000' THEN NULL 
      ELSE BIRTHDAY::DATE
     END AS A_POS_BIRTHDAY
    ,REFERENCE_ID AS A_POS_REFERENCE_ID  
    , CASE WHEN EMAIL_ADDRESS IS NOT NULL THEN 'POSLOYAL' ELSE 'ANONYMOUS' END
    AS A_POS_GB_CONSUMER_TYPE
    ,UPDATED_AT AS A_POS_UPDATED_AT_DTS
        --//metadata (MD)
    ,CURRENT_TIMESTAMP as MD_LOAD_DTS
    ,(SELECT invocation_id FROM ${ctx.ref("H_INVOCATION_ID")}) AS MD_INTGR_ID
  FROM
      source    
)


SELECT * FROM rename
`).preOps(ctx => `
 alter session set query_tag = 'dataform|${dataform.projectConfig.defaultSchema}|${ctx.name()}'`
 )
}