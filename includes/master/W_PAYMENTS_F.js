 module.exports = (params) => {
  return publish("W_PAYMENTS_F", {
  type: "table",
  schema: params.target_schema,
  tags: ["staging", "daily"],
  snowflake: { 
     transient: false 
  }, 


    ...params.defaultConfig
}).query(ctx => `

SELECT
    K_POS_PAYMENT_DLHK 
    ,K_POS_MERCH_LOC_DLHK
    ,K_POS_ORDER_DLHK
    ,K_POS_CUSTOMER_DLHK 
    ,K_CURRENCY_DLHK
    ,K_EMPLOYEE_DLHK
    ,K_DATE_ID
    ,K_POS_PAYMENT_BK
    ,K_POS_PAYMENT_LOCATION_BK
    ,K_POS_PAYMENT_ORDER_BK
    ,K_POS_PAYMENT_CUSTOMER_BK
    ,K_EMPLOYEE_BK
    ,M_PAYMENT_MONEY_AMT
    ,M_PAYMENT_APP_FEE_AMT
    ,M_PAYMENT_REFUND_MONEY_AMT
    ,M_PAYMENT_TIP_AMT
    ,A_POS_PAYMENT_CURRENCY
    ,A_POS_PAYMENT_RECEIPT_NUMBER
    ,A_POS_PAYMENT_RECEIPT_URL
    ,A_POS_PAYMENT_SOURCE_TYPE
    ,A_POS_PAYMENT_STATUS
    ,A_POS_PAYMENT_CREATED_DTS
    ,A_POS_PAYMENT_UPDATED_DTS   
    ,MD_LOAD_DTS
    ,MD_HASH_COL
    ,MD_INTGR_ID
FROM
  ${ctx.ref("V_PAYMENT_STG")} AS P
  
`)
}