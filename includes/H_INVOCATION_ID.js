module.exports = (params) => {
  return publish("H_INVOCATION_ID",
 {  type: "table",
...params.defaultConfig
}).query(ctx => ` SELECT uuid_string() as invocation_id from dual 
`)
}