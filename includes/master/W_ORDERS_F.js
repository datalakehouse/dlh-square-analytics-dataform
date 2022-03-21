 module.exports = (params) => {
  return publish("W_ORDERS_F", {
  type: "table",
  schema: params.target_schema,
  tags: ["staging", "daily"],
  snowflake: { 
     transient: false 
  }, 


    ...params.defaultConfig
}).query(ctx => `

WITH source_item_allocated as (
  select 
        MAX(OLI.M_ORDER_LINE_BASE_PRICE_AMT)/COUNT(1) AS M_POS_ITEM_BASE_PRICE_AMT
        ,MAX(OLI.M_ORDER_LINE_GROSS_SALES_AMT)/COUNT(DISTINCT COALESCE(OLIM.K_POS_ORDER_ITEM_MODIFIER_DLHK,OLI.K_POS_ORDER_LINE_DLHK)) AS M_ORDER_LINE_GROSS_SALES_AMT
        ,K_POS_ORDER_LINE_BK
        ,OLI.K_POS_ORDER_BK
        FROM 
        ${ctx.ref("V_ORDER_LINE_ITEM_STG")} OLI
        LEFT JOIN ${ctx.ref("V_ORDER_LINE_ITEM_MODIFIER_STG")} OLIM ON OLIM.K_POS_ORDER_LINE_ITEM_BK = OLI.K_POS_ORDER_LINE_BK AND OLIM.K_POS_ORDER_BK = OLI.K_POS_ORDER_BK
        GROUP BY K_POS_ORDER_LINE_BK, OLI.K_POS_ORDER_BK
),
source_order_allocated as (
  select MAX(O.M_NET_TIP_MONEY_AMT)/COUNT(1) AS M_NET_TIP_MONEY_AMT
        ,MAX(O.M_TOTAL_SERVICE_CHARGE_AMT)/COUNT(1) AS M_TOTAL_SERVICE_CHARGE_AMT        
        ,O.K_POS_ORDER_DLHK  
        FROM 

        ${ctx.ref("V_ORDER_HEADER_STG")} O
        LEFT JOIN ${ctx.ref("V_ORDER_LINE_ITEM_STG")} OLI ON OLI.K_POS_ORDER_DLHK = O.K_POS_ORDER_DLHK AND OLI.K_POS_ORDER_BK = O.K_POS_ORDER_BK
        LEFT JOIN ${ctx.ref("V_ORDER_LINE_ITEM_MODIFIER_STG")} OLIM ON OLIM.K_POS_ORDER_LINE_ITEM_BK = OLI.K_POS_ORDER_LINE_BK AND OLIM.K_POS_ORDER_BK = OLI.K_POS_ORDER_BK
        GROUP BY O.K_POS_ORDER_DLHK
),
final as (
SELECT
  O.K_POS_ORDER_DLHK
  ,O.K_POS_LOCATION_DLHK
  ,O.K_POS_REFERENCE_DLHK
  ,O.K_POS_CUSTOMER_DLHK
  ,O.K_POS_ORDER_BK
  ,O.K_POS_LOCATION_BK
  ,O.K_POS_CUSTOMER_BK
  ,O.K_POS_REFERENCE_BK
  ,O.A_ORDER_CREATED_DTS
  ,O.A_ORDER_UPDATED_DTS
  ,O.A_ORDER_CLOSED_DTS
  ,O.A_ORDER_STATE
  ,O.A_ORDER_SOURCE
  ,OLI.K_POS_ORDER_LINE_DLHK
  ,COALESCE(OLIM.K_POS_CATALOG_OBJECT_HASH_DLHK,OLI.K_POS_CATALOG_OBJECT_HASH_DLHK) AS K_POS_CATALOG_OBJECT_DLHK
  ,OLI.K_CURRENCY_DLHK
  ,OLI.K_POS_ORDER_LINE_BK
  ,OLI.A_POS_ORDER_LINE_NAME
  ,OLI.M_POS_ORDER_LINE_QUANTITY
  ,OLI.A_POS_ORDER_LINE_NOTE  
  ,OLI.A_POS_ORDER_LINE_VARIATION_NAME
  --,COALESCE(SIA.M_POS_ITEM_BASE_PRICE_AMT,0) + COALESCE(OLIM.M_BASE_PRICE_AMT,OLI.M_ORDER_LINE_BASE_PRICE_AMT) AS M_ALLOCATED_BASE_PRICE_AMT 
  ,ROUND(DIV0((OLI.M_ORDER_LINE_GROSS_SALES_AMT * SIA.M_ORDER_LINE_GROSS_SALES_AMT), OLI.M_ORDER_LINE_GROSS_SALES_AMT),4)::decimal(15,4) AS M_ALLOCATED_ORDER_LINE_GROSS_SALES_AMT  
  ,ROUND(DIV0((OLI.M_ORDER_LINE_TOTAL_TAX_AMT * M_ALLOCATED_ORDER_LINE_GROSS_SALES_AMT), OLI.M_ORDER_LINE_GROSS_SALES_AMT),4)::decimal(15,4) AS M_ALLOCATED_ORDER_LINE_TOTAL_TAX_AMT  
  ,ROUND(DIV0((OLI.M_ORDER_LINE_TOTAL_DISCOUNT_AMT * M_ALLOCATED_ORDER_LINE_GROSS_SALES_AMT), OLI.M_ORDER_LINE_GROSS_SALES_AMT),4)::decimal(15,4) AS M_ALLOCATED_ORDER_LINE_TOTAL_DISCOUNT_AMT  
  ,ROUND(DIV0((OLI.M_POS_ITEM_NET_AMT * M_ALLOCATED_ORDER_LINE_GROSS_SALES_AMT), OLI.M_ORDER_LINE_GROSS_SALES_AMT),4)::decimal(15,4) AS M_ALLOCATED_POS_ITEM_NET_AMT  
  ,M_ALLOCATED_POS_ITEM_NET_AMT + M_ALLOCATED_ORDER_LINE_TOTAL_TAX_AMT AS M_ALLOCATED_POS_TOTAL_AMT
  ,ROUND(DIV0((O.M_NET_TIP_MONEY_AMT * M_ALLOCATED_ORDER_LINE_GROSS_SALES_AMT),O.M_TOTAL_AMT - O.M_TAX_TOTAL_AMT + O.M_DISCOUNT_TOTAL_AMT - O.M_NET_TIP_MONEY_AMT),4)::decimal(15,4) as M_ALLOCATED_NET_TIP_MONEY_AMT
  ,ROUND(DIV0((O.M_TOTAL_SERVICE_CHARGE_AMT * M_ALLOCATED_ORDER_LINE_GROSS_SALES_AMT),O.M_TOTAL_AMT - O.M_TAX_TOTAL_AMT + O.M_DISCOUNT_TOTAL_AMT - O.M_NET_TIP_MONEY_AMT),4)::decimal(15,4) as M_ALLOCATED_TOTAL_SERVICE_CHARGE_AMT
  ,NVL(OLIM.M_BASE_PRICE_AMT,000)::decimal(15,4) AS M_POS_ITEM_MOD_PRICE_AMT
  ,NVL(OLIM.M_TOTAL_PRICE_AMOUNT,000)::decimal(15,4) AS M_POS_ITEM_MOD_TOTAL_AMT  
  ,O.MD_LOAD_DTS
  ,O.MD_INTGR_ID
FROM
  ${ctx.ref("V_ORDER_HEADER_STG")} AS O 
  INNER JOIN ${ctx.ref("V_ORDER_LINE_ITEM_STG")} OLI ON OLI.K_POS_ORDER_DLHK = O.K_POS_ORDER_DLHK
  LEFT JOIN ${ctx.ref("V_ORDER_LINE_ITEM_MODIFIER_STG")} OLIM ON OLIM.K_POS_ORDER_LINE_ITEM_BK = OLI.K_POS_ORDER_LINE_BK AND OLIM.K_POS_ORDER_BK = OLI.K_POS_ORDER_BK
  LEFT JOIN source_item_allocated SIA ON SIA.K_POS_ORDER_LINE_BK = OLI.K_POS_ORDER_LINE_BK AND SIA.K_POS_ORDER_BK = OLI.K_POS_ORDER_BK
  LEFT JOIN source_order_allocated SOA ON SOA.K_POS_ORDER_DLHK = O.K_POS_ORDER_DLHK  
)

SELECT * FROM final
`)
}