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
    plangroup:'//SOAP:Body//PLAN_GRP',
    planplant:'//SOAP:Body//PLAN_PLANT',
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
      res.status(200).json(result);
  }
  else{
    res.status(200).json(result);
  }
})();
router.get('/get',(req,res)=>{
  res.status(200).send('true');
});

router.post('/mainnotcr',(req,res)=>{
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIMAINNOTCR_FM>
        <!--You may enter the following 14 items in any order-->
        <!--Optional:-->
        <DESCRIPTION>${req.body.description}</DESCRIPTION>
        <EQUIP_ID>${req.body.equipid}</EQUIP_ID>
        <FUNC_LOC>WTR-STRG</FUNC_LOC>
        <!--Optional:-->
        <MALFUNC_DATE>${req.body.malfunc_date}</MALFUNC_DATE>
        <!--Optional:-->
        <MALFUNC_TIME>${req.body.malfunc_time}</MALFUNC_TIME>
        <NOT_TYPE>${req.body.nottype}</NOT_TYPE>
        <PLAN_GROUP>${req.body.plangroup}</PLAN_GROUP>
        <PLAN_PLANT>${req.body.planplant}</PLAN_PLANT>
        <PRIORITY>${req.body.priority}</PRIORITY>
        <!--Optional:-->
        <REPORTED_BY>${req.body.reported_by}</REPORTED_BY>
        <!--Optional:-->
        <REQ_END_DATE>${req.body.req_edate}</REQ_END_DATE>
        <!--Optional:-->
        <REQ_END_TIME>00:00:00</REQ_END_TIME>
        <!--Optional:-->
        <REQ_START_DATE>${req.body.req_sdate}</REQ_START_DATE>
        <!--Optional:-->
        <REQ_START_TIME>00:00:00</REQ_START_TIME>
     </urn:ZBAPIMAINNOTCR_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={RETURN:'//SOAP:Body//RETURN/TYPE',
NOTNO:'//SOAP:Body//NOT_NO'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MAINNOTCR&receiverParty=&receiverService=&interface=SI_MAINNOTCR&interfaceNamespace=http://bala.com';
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

router.post('/mainnotdet',(req,res)=>{
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIMAINNOTDET_FM>
        <NOT_NO>${req.body.notno}</NOT_NO>
     </urn:ZBAPIMAINNOTDET_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={
  NOTNO:'//SOAP:Body//NOT_HEADER/NOTIF_NO',
  EQUIPID:'//SOAP:Body//NOT_HEADER/EQUIPMENT',
  MALFUNC_DATE:'//SOAP:Body//NOT_HEADER/STRMLFNDATE',
  MALFUNC_TIME:'//SOAP:Body//NOT_HEADER/STRMLFNTIME',
  DESCRIPTION:'//SOAP:Body//NOT_HEADER/SHORT_TEXT',
  PRIORITY:'//SOAP:Body//NOT_HEADER/PRIORITY',
  SDATE:'//SOAP:Body//NOT_HEADER/DESSTDATE',
  EDATE:'//SOAP:Body//NOT_HEADER/DESENDDATE',
  REPORTED_BY:'//SOAP:Body//NOT_HEADER/REPORTEDBY',
  FUNC_LOC:'//SOAP:Body//NOT_HEADER/FUNCT_LOC',
RETURN:'//SOAP:Body//RETURN/TYPE'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MAINNOTDET&receiverParty=&receiverService=&interface=SI_MAINNOTDET&interfaceNamespace=http://bala.com';
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

router.post('/mainnotget',(req,res)=>{
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIMAINNOTGET_FM>
        <!--You may enter the following 7 items in any order-->
        <NOT_DATE>2021-07-26</NOT_DATE>
        <PLAN_GROUP>${req.body.plangroup}</PLAN_GROUP>
        <PLAN_PLANT>${req.body.planplant}</PLAN_PLANT>
       
     </urn:ZBAPIMAINNOTGET_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={NOT_OUTSTANDING:['//SOAP:Body//NOT_OUTSTANDING/item',{col1:'NOTIFICAT',col2:'DESCRIPT',col3:'PRIORITY'}],
NOT_CREATED:['//SOAP:Body//NOT_LIST/item',{col1:'NOTIFICAT',col2:'DESCRIPT',col3:'PRIORITY'}],
NOT_COMPLETED:['//SOAP:Body//NOT_COMPLETED/item',{col1:'NOTIFICAT',col2:'DESCRIPT',col3:'PRIORITY'}],
RETURN:'//SOAP:Body//RETURN/TYPE'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MAINNOTGET&receiverParty=&receiverService=&interface=SI_MAINNOTGET&interfaceNamespace=http://bala.com';
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

router.post('/mainnotup',(req,res)=>{
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIMAINNOTUP_FM>
        <!--You may enter the following 14 items in any order-->
        <!--Optional:-->
        <DESCRIPTION>${req.body.description}</DESCRIPTION>
        <!--Optional:-->
        <EQUIP_ID>${req.body.equipid}</EQUIP_ID>
        <!--Optional:-->
        <FUNC_LOCATION>${req.body.func_loc}</FUNC_LOCATION>
        <!--Optional:-->
        <MALFUNC_DATE>${req.body.malfunc_date}</MALFUNC_DATE>
        <!--Optional:-->
        <MALFUNC_TIME>${req.body.malfunc_time}</MALFUNC_TIME>
        <NOT_NUMBER>${req.body.notno}</NOT_NUMBER>
        <!--Optional:-->
        <PLAN_GROUP>${req.body.plangroup}</PLAN_GROUP>
        <!--Optional:-->
        <PLAN_PLANT>${req.body.planplant}</PLAN_PLANT>
        <!--Optional:-->
        <PRIORITY>${req.body.priority}</PRIORITY>
        <!--Optional:-->
        <REPORTED_BY>${req.body.reported_by}</REPORTED_BY>
        <!--Optional:-->
        <REQ_END_DATE>${req.body.req_edate}</REQ_END_DATE>
        <!--Optional:-->
        <REQ_END_TIME>00:00:00</REQ_END_TIME>
        <!--Optional:-->
        <REQ_START_DATE>${req.body.req_sdate}</REQ_START_DATE>
        <!--Optional:-->
        <REQ_START_TIME>00:00:00</REQ_START_TIME>
     </urn:ZBAPIMAINNOTUP_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={
RETURN:'//SOAP:Body//RETURN/TYPE'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MAINNOTUP&receiverParty=&receiverService=&interface=SI_MAINNOTUP&interfaceNamespace=http://bala.com';
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

router.post('/mainwocr',(req,res)=>{
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIMAINWOCR_FM>
        <!--You may enter the following 13 items in any order-->
        <!--Optional:-->
        <DESCRIPTION>${req.body.description}</DESCRIPTION>
        <!--Optional:-->
        <EQUIP_NO>${req.body.equipid}</EQUIP_NO>
        <!--Optional:-->
        <MAT_NO>?</MAT_NO>
        <!--Optional:-->
        <NORMAL_DURATION>?</NORMAL_DURATION>
        <NOT_NO>${req.body.notno}</NOT_NO>
        <!--Optional:-->
        <NOT_TYPE>${req.body.nottype}</NOT_TYPE>
        <!--Optional:-->
        <OP_DESC>${req.body.op_desc}</OP_DESC>
        <!--Optional:-->
        <ORDER_TYPE>${req.body.wo_type}</ORDER_TYPE>
        <!--Optional:-->
        <PERSONNEL_NO></PERSONNEL_NO>
        <!--Optional:-->
        <PRIORITY>${req.body.priority}</PRIORITY>
        <!--Optional:-->
        <REQ_QUANTITY>${req.body.quantity}</REQ_QUANTITY>
        <!--Optional:-->
        <WORK_ACTIVITY>?</WORK_ACTIVITY>
        
     </urn:ZBAPIMAINWOCR_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={
RETURN:'//SOAP:Body//RETURN/TYPE'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPWO_CREATED:['//SOAP:Body//WO_CREATED/item',{col1:'ORDERID',col2:'DESCRIPTION',col3:'ORDERTYPE',col4:'PRIORITY',col5:'PLANT'}Adapter/MessageServlet?senderParty=&senderService=BC_MAINWOCR&receiverParty=&receiverService=&interface=SI_MAINWOCR&interfaceNamespace=http://bala.com';
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

router.post('/mainwodet',(req,res)=>{
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIMAINWODET_FM>
        <!--You may enter the following 4 items in any order-->
        <WO_NO>${req.body.wono}</WO_NO>
                
     </urn:ZBAPIMAINWODET_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={
  NOTNO:'//SOAP:Body//NOT_DETAILS/item/NOTIF_NO',
  DESCRIPTION:'//SOAP:Body//WO_DETAILS/SHORT_TEXT',
  WONO:'//SOAP:Body//WO_DETAILS/ORDERID',
  WOTYPE:'//SOAP:Body//WO_DETAILS/ORDER_TYPE',
  EQUIPID:'//SOAP:Body//WO_DETAILS/EQUIPMENT',
  PERSONNO:'//SOAP:Body//WO_OPERATIONS/item/PERS_NO',
  OP_DESC: '//SOAP:Body//WO_OPERATIONS/item/DESCRIPTION',
RETURN:'//SOAP:Body//RETURN/TYPE'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MAINWODET&receiverParty=&receiverService=&interface=SI_MAINWODET&interfaceNamespace=http://bala.com';
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


router.post('/mainwoget',(req,res)=>{
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIMAINWOGET_FM>
        <!--You may enter the following 6 items in any order-->
        <PLAN_GROUP>${req.body.plangroup}</PLAN_GROUP>
        <PLAN_PLANT>${req.body.planplant}</PLAN_PLANT>
        
     </urn:ZBAPIMAINWOGET_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={WO_CREATED:['//SOAP:Body//WO_CREATED/item',{col1:'ORDERID',col2:'DESCRIPTION',col3:'ORDERTYPE',col4:'PRIORITY',col5:'PLANT'}],
WO_RELEASED:['//SOAP:Body//WO_RELEASED/item',{col1:'ORDERID',col2:'DESCRIPTION',col3:'ORDERTYPE',col4:'PRIORITY',col5:'PLANT'}],
WO_COMPLETED:['//SOAP:Body//WO_TECHCOMPLETED/item',{col1:'ORDERID',col2:'DESCRIPTION',col3:'ORDERTYPE',col4:'PRIORITY',col5:'PLANT'}],
RETURN:['//SOAP:Body//RETURN',{TYPE:'TYPE'}]
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MAINWOGET&receiverParty=&receiverService=&interface=SI_MAINWOGET&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 100000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   console.log(result);
   res.status(200).send(result);
 })();

});

router.post('/mainwoup',(req,res)=>{
  console.log(req.body);
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIMAINWOUP_FM>
        <!--You may enter the following 12 items in any order-->
        <!--Optional:-->
        <DESCRIPTION>${req.body.description}</DESCRIPTION>
        <!--Optional:-->
        <DURATION>${req.body.duration}</DURATION>
        <!--Optional:-->
        <EQUIP_NO>${req.body.equipid}</EQUIP_NO>
        <!--Optional:-->
        <NOT_NO>?</NOT_NO>
        <!--Optional:-->
        <NOT_TYPE>${req.body.nottype}</NOT_TYPE>
        <!--Optional:-->
        <OP_DESC>${req.body.op_desc}</OP_DESC>
        <!--Optional:-->
        <PERSONNEL_NO>0</PERSONNEL_NO>
        <!--Optional:-->
        <PRIORITY>${req.body.priority}</PRIORITY>
        <!--Optional:-->
        <REQ_QUANTITY>${req.body.quantity}</REQ_QUANTITY>
        <!--Optional:-->
        <RESERVATION>?</RESERVATION>
        <WO_NO>${req.body.wono}</WO_NO>
        <!--Optional:-->
        <WO_TYPE>${req.body.wotype}</WO_TYPE>
     </urn:ZBAPIMAINWOUP_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={
RETURN:'//SOAP:Body//RETURN/TYPE'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MAINWOUP&receiverParty=&receiverService=&interface=SI_MAINWOUP&interfaceNamespace=http://bala.com';
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


});
router.get('/special',verifyToken,(req,res)=>{
  let events =[]
  res.json(events);
});

module.exports = router;