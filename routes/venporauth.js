var express = require('express');
var router = express.Router();
var jwt=require('jsonwebtoken');
var soapRequest = require('easy-soap-request');
var { transform} = require('camaro');
var multer=require('multer');
var path= require('path');
var reader= require('xlsx')
const { post } = require('.');
const { FailedDependency } = require('http-errors');
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
console.log(req.body.venid);
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
  console.log(statusCode);

  xmlData = body;
  const result = await transform(xmlData, template);
  //const result=parser.xml2json(xmlData, {compact: true, spaces: 4});
  if(result.RETURN.MESSAGE== 'true')
  {
      let tok=jwt.sign(payload,'Bala');
      console.log(tok);
      res.status(200).json({tok: tok,name:result.RETURN.MESSAGE_V1});
  }
  else{
    res.status(401).send('unauthorized');
  }
  //flag=1;
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
  console.log(statusCode);

  xmlData = body;
  const result = await transform(xmlData, temp);
  console.log(result);
  res.status(200).send(result);
})();
});
router.post('/vensave',(req,res)=>{
  //var cusid=req.body.cusid;
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
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   console.log(result);
   res.status(200).send(result);
 })();

});
router.post('/vencredit',(req,res)=>{
  //var cusid=req.body.cusid;
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIVENCRED_FM>
        <!--You may enter the following 3 items in any order-->
        <VEN_ID>${req.body.venid}</VEN_ID>
      
     </urn:ZBAPIVENCRED_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={CREDIT:['//SOAP:Body//IT_CRED/item',{COMP_CODE:'BUKRS',ITEM_NUM:'BUZEI',FISC_YEAR:'GJAHR',DOC_NO:'BELNR',LC_AMOUNT:'DMBTR',CURRENCY:'PSWSL',PD_NO:'EBELN',MAT_NUM:'MATNR',QUANTITY:'MENGE',ORDER_UNIT:'MEINS'}],
DEBIT:['//SOAP:Body//IT_DEB/item',{COMP_CODE:'BUKRS',ITEM_NUM:'BUZEI',FISC_YEAR:'GJAHR',DOC_NO:'BELNR',LC_AMOUNT:'DMBTR',CURRENCY:'PSWSL',PD_NO:'EBELN',MAT_NUM:'MATNR',QUANTITY:'MENGE',ORDER_UNIT:'MEINS'}],
RETURN:'//SOAP:Body//RETURN/TYPE'
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENCRED&receiverParty=&receiverService=&interface=SI_VENCRED&interfaceNamespace=http://bala.com';
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

router.post('/venpayage',(req,res)=>{
 //var cusid=req.body.cusid;
 //var cusid=11;
 var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
 <soapenv:Header/>
 <soapenv:Body>
    <urn:ZBAPIVENPAYAGE_FM>
       <!--You may enter the following 3 items in any order-->
       <VEN_ID>${req.body.venid}</VEN_ID>
       <IT_PAYAGE/>
       <RETURN/>
    </urn:ZBAPIVENPAYAGE_FM>
 </soapenv:Body>
</soapenv:Envelope>`
const temp={PAYAGE:['//SOAP:Body//IT_PAYAGE/item',{COMP_CODE:'COMP_CODE',ITEM_NUM:'ITEM_NUM',BLINE_DATE:'BLINE_DATE',FISC_YEAR:'FISC_YEAR',DOC_NO:'DOC_NO',DOC_DATE:'DOC_DATE',LC_AMOUNT:'LC_AMOUNT',CURRENCY:'CURRENCY',PSTNG_DATE:'PSTNG_DATE',AGE:'CLR_DOC_NO'}]
};
 const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENPAYAGE&receiverParty=&receiverService=&interface=SI_VENPAYAGE&interfaceNamespace=http://bala.com';
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

router.post('/venrfq',(req,res)=>{
  //var cusid=req.body.cusid;
  //cusid=179999;
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIVENRFQ_FM>
        <!--You may enter the following 4 items in any order-->
        <VEN_ID>${req.body.venid}</VEN_ID>
        
     </urn:ZBAPIVENRFQ_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={HEADER:['//SOAP:Body//IT_HEAD/item',{DOC_NO:'DOC_NUMBER',CO_CODE:'CO_CODE',PUR_ORG:'PURCH_ORG',PUR_GRP:'PUR_GROUP',CURRENCY:'CURRENCY',EXCHG_RATE:'EXCH_RATE',DOC_DATE:'DOC_DATE',PROCEDURE:'PROCEDURE',CREATED_ON:'CREATED_ON',CREATED_BY:'CREATED_BY'}],
LINE:['//SOAP:Body//IT_ITEM/item',{DOC_NO:'DOC_NUMBER',DOC_ITEM:'DOC_ITEM',DESCRIPTION:'SHORT_TEXT',MATERIAL:'MATERIAL',PUR_MAT:'PUR_MAT',CO_CODE:'CO_CODE',PLANT:'PLANT',MAT_GRP:'MAT_GRP',QUANTITY:'QUANTITY',UNIT:'UNIT'}],
RETURN:['//SOAP:Body//RETURN',{TYPE:'TYPE'}]
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENRFQ&receiverParty=&receiverService=&interface=SI_VENRFQ&interfaceNamespace=http://bala.com';
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

router.post('/vengr',(req,res)=>{
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIVENGR_FM>
        <!--You may enter the following 4 items in any order-->
        <VEN_ID>${req.body.venid}</VEN_ID>
        <IT_HEAD/>
        <IT_ITEM/>
        <RETURN/>
     </urn:ZBAPIVENGR_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={HEADER:['//SOAP:Body//IT_HEAD/item',{DOC_NO:'MAT_DOC',DOC_YEAR:'DOC_YEAR',DOC_DATE:'DOC_DATE',PSTNG_DATE:'PSTNG_DATE',ENTRY_DATE:'ENTRY_DATE',USERNAME:'USERNAME',TR_EV_TYPE:'TR_EV_TYPE',VERSION:'VER_GR_GI_SLIP',REF_NO:'REF_DOC_NO',REF:'REF_DOC_NO_LONG'}],
LINE:['//SOAP:Body//IT_ITEM/item',{DOC_NO:'MAT_DOC',DOC_ITEM:'DOC_YEAR',DESCRIPTION:'MATDOC_ITM',MATERIAL:'MATERIAL',PUR_MAT:'PO_NUMBER',CO_CODE:'PO_ITEM',PLANT:'PLANT',MAT_GRP:'ENTRY_QNT',QUANTITY:'MOVE_TYPE',UNIT:'STGE_LOC'}],
RETURN:['//SOAP:Body//RETURN',{TYPE:'TYPE'}]
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENGR&receiverParty=&receiverService=&interface=SI_VENGR&interfaceNamespace=http://bala.com';
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

router.post('/venpo',(req,res)=>{
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIVENPO_FM>
        <!--You may enter the following 4 items in any order-->
        <VEN_ID>${req.body.venid}</VEN_ID>
        
     </urn:ZBAPIVENPO_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={HEADER:['//SOAP:Body//IT_HEAD/item',{col1:'PO_NUMBER',col2:'CO_CODE',col3:'LAST_ITEM',col4:'EXCH_RATE',col5:'DOC_DATE',col6:'PURCH_ORG',col7:'PUR_GROUP',col8:'CURRENCY',col9:'CREATED_ON',col10:'CREATED_BY'}],
LINE:['//SOAP:Body//IT_ITEM/item',{col1:'PO_NUMBER',col2:'CO_CODE',col3:'PO_ITEM',col4:'PUR_MAT',col5:'MATERIAL',col6:'SHORT_TEXT',col7:'QUANTITY',col8:'NET_PRICE',col9:'GROS_VALUE',col10:'CHANGED_ON'}],
RETURN:['//SOAP:Body//RETURN',{TYPE:'TYPE'}]
};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENPO&receiverParty=&receiverService=&interface=SI_VENPO&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   res.status(200).send(result);
 })();

});

router.post('/veninv',(req,res)=>{
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIVENINV_FM>
        <!--You may enter the following 3 items in any order-->
        <FIN_YR>${req.body.fin_yr}</FIN_YR>
        <INV_NO>${req.body.inv_no}</INV_NO>
        <VEN_ID>${req.body.venid}</VEN_ID>
     </urn:ZBAPIVENINV_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={pdf:'//SOAP:Body//ENINV_PDF/item'};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENINV&receiverParty=&receiverService=&interface=SI_VENINV&interfaceNamespace=http://bala.com';
 var xmlData;
 (async () => {
   const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 50000 });
   const { headers, body, statusCode } = response;
   console.log(statusCode);
 
   xmlData = body;
   const result = await transform(xmlData, temp);
   res.status(200).send({pdf:'data:application/pdf;base64,'+result.pdf});
 })();
});

router.post('/veninvdis',(req,res)=>{
  var xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
     <urn:ZBAPIVENINVDIS_FM>
        <!--You may enter the following 3 items in any order-->
        <VEN_ID>${req.body.venid}</VEN_ID>
    
     </urn:ZBAPIVENINVDIS_FM>
  </soapenv:Body>
</soapenv:Envelope>`
const temp={invoice:['//SOAP:Body//IT_INVHEAD/item',{INV_NO:'INV_DOC_NO',FISC_YEAR:'FISC_YEAR',PSTNG_DATE:'PSTNG_DATE',DOC_DATE:'DOC_DATE',ENTRY_DATE:'ENTRY_DATE',ENTRY_TIME:'ENTRY_TIME',COMP_CODE:'COMP_CODE',GROSS_AMNT:'GROSS_AMNT',CURRENCY:'CURRENCY',INVOICE_STATUS:'INVOICE_STATUS'}]};
  const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VENINVDIS&receiverParty=&receiverService=&interface=SI_VENINVDIS&interfaceNamespace=http://bala.com';
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