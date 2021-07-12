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
  var user=req.body.empid;
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

const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EMPLOGIN1&receiverParty=&receiverService=&interface=SI_EMPLOGIN&interfaceNamespace=http://bala.com';

var val = 22;
console.log(pass);
const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:ZBAPIEMPLOGIN_FM>
      <!--You may enter the following 2 items in any order-->
      <EMP_ID>${user}</EMP_ID>
      <PASS>${pass}</PASS>
   </urn:ZBAPIEMPLOGIN_FM>
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
  if(result.RETURN.MESSAGE== 'true')
  {
      let tok=jwt.sign(payload,'Bala');
      console.log(result);
      res.status(200).json({tok: tok,name:result.RETURN.MESSAGE_V1});
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
router.post('/empprofile',(req,res)=>{
  var empid=req.body.empid;
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIEMPPROF_FM>
        <EMP_ID>${empid}</EMP_ID>
     </urn:ZBAPIEMPPROF_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={
  EMPID:'//SOAP:Body//WA_EMPDET/PERNR',
  FNAME: '//SOAP:Body//WA_EMPDET/VORNA',
  LNAME: '//SOAP:Body//WA_EMPDET/NACHN',
  CITY:'//SOAP:Body//WA_EMPDET/ORT01',
  DISTRICT:'//SOAP:Body//WA_EMPDET/TITEL',
  POSTCODE:'//SOAP:Body//WA_EMPDET/PSTLZ',
  STREET:'//SOAP:Body//WA_EMPDET/STRAS',
  COUNTRY:'//SOAP:Body//WA_EMPDET/LAND',
  TELEPHONE:'//SOAP:Body//WA_EMPDET/TELNR',
  MAILID:'//SOAP:Body//WA_EMPDET/SYSID'
};
const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EMPPROF&receiverParty=&receiverService=&interface=SI_EMPPROF&interfaceNamespace=http://bala.com';
var xmlData;
(async () => {
  const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
  const { headers, body, statusCode } = response;
  console.log(statusCode);

  xmlData = body;
  const result = await transform(xmlData, temp);
  console.log(result);
  res.status(200).send(result);
})();
});
router.post('/empsave',(req,res)=>{
  //var cusid=req.body.cusid;
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIEMPSAVE_FM>
        <!--You may enter the following 10 items in any order-->
        <!--Optional:-->
        <CITY>${req.body.city}</CITY>
        <!--Optional:-->
        <CONTNO>${req.body.contno}</CONTNO>
        <!--Optional:-->
        <COUNTRY>${req.body.country}</COUNTRY>
        <!--Optional:-->
        <DISTRICT>${req.body.district}</DISTRICT>
        <EMP_ID>${req.body.empid}</EMP_ID>
        <!--Optional:-->
        <FNAME>${req.body.fname}</FNAME>
        <!--Optional:-->
        <LNAME>${req.body.lname}</LNAME>
        <!--Optional:-->
        <MAIL_ID>${req.body.mailid}</MAIL_ID>
        <!--Optional:-->
        <POSTCODE>${req.body.postcode}</POSTCODE>
        <!--Optional:-->
        <STREET>${req.body.street}</STREET>
     </urn:ZBAPIEMPSAVE_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={TYPE:'//SOAP:Body//RETURN/TYPE'};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EMPSAVE&receiverParty=&receiverService=&interface=SI_EMPSAVE&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   console.log(result);
   res.status(200).send(result);
 })();

});

router.post('/empldet',(req,res)=>{
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIEMPLDET_FM>
        <!--You may enter the following 5 items in any order-->
        <EMP_ID>${req.body.empid}</EMP_ID>
        
     </urn:ZBAPIEMPLDET_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={LDET:['//SOAP:Body//IT_LDET/item',{col1:'EMPLOYEENO',col2:'SUBTYPE',col3:'VALIDBEGIN',col4:'VALIDEND',col5:'START',col6:'END',col7:'ABSENCETYPE',col8:'NAMEOFABSENCETYPE',col9:'ABSENCEDAYS',col10:'ABSENCEHOURS'}],
LQUOTA:['//SOAP:Body//IT_LQUOTA/item',{col1:'LOGICALSYSTEM',col2:'QUOTANUMBER',col3:'QUOTATEXT',col4:'FROM_DATE',col5:'TO_DATE',col6:'DEDUCTBEGIN',col7:'DEDUCTEND',col8:'DEDUCT',col9:'ORDERED',col10:'REDUCED'}],
RQUOTA:['//SOAP:Body//IT_RQUOTA/item',{col1:'QUOTANUM',col2:'QUOTATYPE',col3:'LEAVETYPE',col4:'QUOTATEXT',col5:'QUOTABEG',col6:'QUOTAEND',col7:'ENTITLE',col8:'DEDUCT',col9:'ORDERED',col10:'TIME_UNIT'}],
RETURN:['//SOAP:Body//RETURN',{TYPE:'TYPE'}]
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EMPLDET&receiverParty=&receiverService=&interface=SI_EMPLD&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   console.log(result);
   res.status(200).send(result);
 })();

});
router.post('/emppay',(req,res)=>{
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIEMPPAY_FM>
        <!--You may enter the following 4 items in any order-->
        <EMP_ID>${req.body.empid}</EMP_ID>
        <VAR>RAMACO_PAYSLIP</VAR>
     </urn:ZBAPIEMPPAY_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={PAYDET:['//SOAP:Body//IT_PAYDET/item',{col1:'SEQUENCENUMBER',col2:'FPPERIOD',col3:'FPBEGIN',col4:'FPEND',col5:'PAYDATE',col6:'PAYTYPE',col7:'PAYID',col8:'PAYTYPE_TEXT',col9:'OCREASON',col10:'OCREASON_TEXT'}],
PAYPDF:['//SOAP:Body//IT_PAYPDF/item',{pdf:'.'}],
RETURN:['//SOAP:Body//RETURN',{TYPE:'TYPE'}]
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EMPPAY2&receiverParty=&receiverService=&interface=SI_EMPPAY&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 50000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   for(i=0;i<result.PAYPDF.length;i++){
     result.PAYPDF[i]='data:application/pdf;base64,' + result.PAYPDF[i].pdf;
   }
   res.status(200).send(result);
 })();

});
router.post('/empltype',(req,res)=>{
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIEMPLTYPE_FM>
        <!--You may enter the following 2 items in any order-->
        <EMP_ID>${req.body.empid}</EMP_ID>
        
     </urn:ZBAPIEMPLTYPE_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={
  LTYPE:['//SOAP:Body//IT_LTYPE/item',{id:'AWART',description:'ATEXT'}],
RETURN:['//SOAP:Body//RETURN',{TYPE:'TYPE'}]
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EMPLT&receiverParty=&receiverService=&interface=SI_EMPLT&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   console.log(result);
   res.status(200).send(result);
 })();

});

router.post('/emplreq',(req,res)=>{
  //var cusid=req.body.cusid;
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIEMPLREQ_FM>
        <!--You may enter the following 7 items in any order-->
        <!--Optional:-->
        <AHOURS>${req.body.ahours}</AHOURS>
        <EDATE>${req.body.edate}</EDATE>
        <EMP_ID>${req.body.empid}</EMP_ID>
        <!--Optional:-->
        <ETIME>${req.body.etime}</ETIME>
        <LTYPE>${req.body.ltype}</LTYPE>
        <SDATE>${req.body.sdate}</SDATE>
        <!--Optional:-->
        <STIME>${req.body.stime}</STIME>
     </urn:ZBAPIEMPLREQ_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={TYPE:'//SOAP:Body//RETURN/TYPE',
  EMESSAGE:'//SOAP:Body//RETURN/MESSAGE'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EMPLR1&receiverParty=&receiverService=&interface=SI_EMPLR&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   console.log(result);
   res.status(200).send(result);
 })();

});

router.post('/empfset',(req,res)=>{
  //var cusid=req.body.cusid;
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIEMPFSET_FM>
        <!--You may enter the following 4 items in any order-->
        <EMP_ID>${req.body.empid}</EMP_ID>
        
     </urn:ZBAPIEMPFSET_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={TYPE:'//SOAP:Body//RETURN/TYPE',
  FNAME:'//SOAP:Body//FNAME',
  LNAME:'//SOAP:Body//LNAME',
  APPROVER:'//SOAP:Body//APPROVER',
  COMPCODE:'//SOAP:Body//COMPCODE',
  COMP: '//SOAP:Body//COMP',
  CURRENCY: '//SOAP:Body//CURRENCY',
  DEP: '//SOAP:Body//DEP',
  DIVISION:'//SOAP:Body//DIVISION',
  JOINING_DATE: '//SOAP:Body//JOINING_DATE',
  LEAVING_DATE: '//SOAP:Body//LEAVING_DATE',
  LEAVES: '//SOAP:Body//LEAVES',
  ADD_PAY:'//SOAP:Body//ADD_PAY',
  CCENTER: '//SOAP:Body//CCENTER',
  CCENTER_DESC:'//SOAP:Body//CCENTRE_DESC',
  JOB:'//SOAP:Body//JOB',
  NET_SAL: '//SOAP:Body//NET_SAL',
  DED_AMT: '//SOAP:Body//DED_AMT',
  GROSS_SAL: '//SOAP:Body//GROSS_SAL',
  TEN_PERIOD: '//SOAP:Body//TEN_PERIOD',
  WAGES1:['//SOAP:Body//WAGETYPES/item',{WTYPE:'WAGETYPE',AMT:'AMOUNT',DESC:'NAMEOFWAGETYPE'}],
  WAGES2:['//SOAP:Body//PPBWLA/item',{WTYPE:'LGART',AMT:'BETRG'}]
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EMPFSET&receiverParty=&receiverService=&interface=SI_EMPFSET&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   console.log(result);
   res.status(200).send(result);
 })();

});
module.exports=router;