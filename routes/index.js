var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  const soapRequest = require('easy-soap-request');
const { transform} = require('camaro')
const template = {
    O_MATNR: '//SOAP:Body//O_MATNR',
    O_SPRAS: '//SOAP:Body//O_SPRAS',
    O_MAKTX: '//SOAP:Body//O_MAKTX',
    O_MAKTG: '//SOAP:Body//O_MAKTG',
}

const url = 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_PI311&receiverParty=&receiverService=&interface=SI_PI311&interfaceNamespace=http://pi311.com/soap_to_rfc';
const sampleHeaders = {
  'user-agent': 'sampleTest',
  'Content-Type': 'text/xml;charset=UTF-8',
  'Authorization': 'Basic UE9VU0VSOlRlY2hAMjAyMQ=='
};
var val = 22;
const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://pi311.com/soap_to_rfc">
   <soapenv:Header/>
   <soapenv:Body>
      <soap:MT_PI311_REQUEST>
         <I_MATNR>${val}</I_MATNR>
      </soap:MT_PI311_REQUEST>
   </soapenv:Body>
</soapenv:Envelope>`;

var xmlData;
(async () => {
  const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 10000 }); // Optional timeout parameter(milliseconds)
  const { headers, body, statusCode } = response;
  console.log(headers);
  console.log(body);
  console.log(statusCode);

  xmlData = body;
  const result = await transform(xmlData, template);
  console.log(result);
})();


});

module.exports = router;
