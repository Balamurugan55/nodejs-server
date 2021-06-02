var express = require('express');
var router = express.Router();
var jwt=require('jsonwebtoken');
var soapRequest = require('easy-soap-request');
var { transform} = require('camaro');
var multer=require('multer');
var path= require('path');
var reader= require('xlsx')
const { post } = require('.');
const sampleHeaders = {
  'user-agent': 'sampleTest',
  'Content-Type': 'text/xml;charset=UTF-8',
  'Authorization': 'Basic UE9VU0VSOlRlY2hAMjAyMQ=='
};
function verifyToken(req,res,next)
{
  if(!req.headers.authorization)
  {
    return res.status(401).send('unauthorized');
  }
  let tok= req.headers.authorization.split(' ')[1]
  if(tok== 'null'){
    return res.status(401).send('unauthorized');
  }
  let verify=jwt.verify(tok,'Bala');
  if(verify=='null')
  {
    return res.status(401).send('unauthorized');
  }
  req.cusid=verify.subject;
  next();
}
/* GET home page. */
router.post('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  var user=req.body.venid;
  var pass=req.body.password;
  var payload={subject:user};
  

const template = {
    RETURN:{
      TYPE:'//SOAP:Body//RETURN/TYPE',
      CODE:'//SOAP:Body//RETURN/CODE',
      MESSAGE:'//SOAP:Body//RETURN/MESSAGE',
      LOG_NO:'//SOAP:Body//RETURN/LOG_NO',
      LOG_MSG_NO:'//SOAP:Body//RETURN/LOG_MSG_NO',
      MESSAGE_V1:'//SOAP:Body//RETURN/MESSAGE_V1',
      MESSAGE_V2:'//SOAP:Body//RETURN/MESSAGE_V2',
      MESSAGE_V3:'//SOAP:Body//RETURN/MESSAGE_V3',
      MESSAGE_V4:'//SOAP:Body//RETURN/MESSAGE_V4'
    } 
};

const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENLOGIN&receiverParty=&receiverService=&interface=SI_VENLOGIN&interfaceNamespace=http://bala.com';

var val = 22;
console.log(pass);
const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:ZBAPIVENLOGIN_FM>
      <!--You may enter the following 3 items in any order-->
      <PASS>${pass}</PASS>
      <STYPE>V</STYPE>
      <VEN_ID>${user}</VEN_ID>
   </urn:ZBAPIVENLOGIN_FM>
</soapenv:Body>
</soapenv:Envelope>`;

var xmlData;
(async () => {
  const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
  const { headers, body, statusCode } = response;
  console.log(headers);
  console.log(body);
  console.log(statusCode);

  xmlData = body;
  const result = await transform(xmlData, template);
  //const result=parser.xml2json(xmlData, {compact: true, spaces: 4});
  if(result.RETURN.MESSAGE== 'true')
  {
      let tok=jwt.sign(payload,'Bala');
      console.log(tok);
      res.status(200).send({tok});
  }
  else{
    res.status(401).send('unauthorized');
  }
})();




});
router.get('/special',verifyToken,(req,res)=>{
  let events =[]
  res.json(events);
});
router.post('/venprofile',(req,res)=>{
  var venid=req.body.venid;
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIVENPROF_FM>
        <!--You may enter the following 2 items in any order-->
        <VEN_ID>${venid}</VEN_ID>
       
     </urn:ZBAPIVENPROF_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={
  VENID:'//SOAP:Body//IT_VENPROF/item/VENDOR',
  FNAME: '//SOAP:Body//IT_VENPROF/item/NAME',
  LNAME: '//SOAP:Body//IT_VENPROF/item/NAME_2',
  CITY:'//SOAP:Body//IT_VENPROF/item/CITY',
  DISTRICT:'//SOAP:Body//IT_VENPROF/item/DISTRICT',
  POSTCODE:'//SOAP:Body//IT_VENPROF/item/POSTL_CODE',
  STREET:'//SOAP:Body//IT_VENPROF/item/STREET',
  COUNTRY:'//SOAP:Body//IT_VENPROF/item/COUNTRY',
  TELEPHONE:'//SOAP:Body//IT_VENPROF/item/TELEPHONE',
  REGION:'//SOAP:Body//IT_VENPROF/item/REGION'
};
const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENPROF&receiverParty=&receiverService=&interface=SI_VENPROF&interfaceNamespace=http://bala.com';
var xmlData;
(async () => {
  const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
  const { headers, body, statusCode } = response;
  console.log(headers);
  console.log(body);
  console.log(statusCode);

  xmlData = body;
  const result = await transform(xmlData, temp);
  console.log(result);
  res.status(200).send(result);
})();
});
router.post('/vensave',(req,res)=>{
  //var cusid=req.body.cusid;
  //cusid=179999;
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIVENSAVE_FM>
        <!--You may enter the following 10 items in any order-->
        <CITY>${req.body.city}</CITY>
        <CONTNO>${req.body.contno}</CONTNO>
        <COUNTRY>${req.body.country}</COUNTRY>
        <DISTRICT>${req.body.district}</DISTRICT>
        <FNAME>${req.body.fname}</FNAME>
        <LNAME>${req.body.lname}</LNAME>
        <POSTCODE>${req.body.postcode}</POSTCODE>
        <REGION>${req.body.region}</REGION>
        <STREET>${req.body.street}</STREET>
        <VEN_ID>${req.body.venid}</VEN_ID>
     </urn:ZBAPIVENSAVE_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={TYPE:'//SOAP:Body//RETURN/TYPE'};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENSAVE&receiverParty=&receiverService=&interface=SI_VENSAVE&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
   const { headers, body, statusCode } = response;
   console.log(headers);
   console.log(body);
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   console.log(result);
   res.status(200).send(result);
 })();

});


module.exports=router;