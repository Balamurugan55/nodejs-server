var express = require('express');
var router = express.Router();
var soap=require('soap');

xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sap="http://sapdemo5.com">
<soapenv:Header/>
<soapenv:Body>
   <sap:MT_RFC_REQ>
      <matnr>37</matnr>
   </sap:MT_RFC_REQ>
</soapenv:Body>
</soapenv:Envelope>`;
args={name:xml};
url='http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_RFC&receiverParty=&receiverService=&interface=IT_RFC_OUT&interfaceNamespace=http://sapdemo5.com'
/* GET users listing. */
router.post('/', function(req, res, next) {
  console.log(req.body);
  res.send('true');
});
var auth = "Basic UE9VU0VSOlRlY2hAMjAyMQ==";
console.log(auth);
router.get('/',(req, res, next) =>{
  soap.createClient(url,{wsdl_options: {timeout: 1000000},wsdl_headers:{Authorization:auth}},(err,client)=>{
      console.log(client.describe());
      client.IT_RFC_OUT(args,(er,res)=>{
        console.log(er);
      },{timeout: 1000000});
      //console.log(client);
      //console.log(client);
  });
  res.send('true');
});
module.exports = router;
