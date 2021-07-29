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
router.post('/', function(req,res, next) {
  //res.render('index', { title: 'Express' });
  var user=req.body.empid;
  var pass=req.body.password;
  //var user='5015';
  //var pass='BALA@123';
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

const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MAINLOGIN&receiverParty=&receiverService=&interface=SI_MAINLOGIN&interfaceNamespace=http://bala.com';

var val = 22;
console.log(pass);
const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:ZBAPIMAINLOGIN_FM>
      <!--You may enter the following 2 items in any order-->
      <EMP_ID>${user}</EMP_ID>
      <PASSWORD>${pass}</PASSWORD>
   </urn:ZBAPIMAINLOGIN_FM>
</soapenv:Body>
</soapenv:Envelope>`;

var xmlData;
(async () => {
  const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
  const { headers, body, statusCode } = response;
  console.log(statusCode);

  xmlData = body;
  const result = await transform(xmlData, template);
  //const result=parser.xml2json(xmlData, {compact: true, spaces: 4});
  if(result.RETURN.TYPE == 'S')
  {
      let tok=jwt.sign(payload,'Bala');
      console.log(result);
      res.status(200).json({type:'S'});
  }
  else{
    res.status(200).json({type:'E'});
  }
})();




});
router.get('/special',verifyToken,(req,res)=>{
  let events =[]
  res.json(events);
});

module.exports = router;