import './styles.css';
import options from './810Nordstrom.json';

document.getElementById("app810").innerHTML = '810 Nordstom Script';
/*
Everything Below this Comment is for Celigo.  There is a marker below to
Say where to stop.  The content above is for testing purposes.
*/
// BEGIN CELIGO CODE
// We get the first record so we can use it to modify the header data BEFORE
// going into the detail level issues.
const data = [];
const mainBody = options.data[0];
const firstNode = mainBody[0];
console.log('initiating 810 script...');
//  We're going to load the addresses as the array is so many levels deep that
//  Building it as a function is untenebale.
//
const addr = [];
addr.push(firstNode.N101);
const N1_loop = [];
const addressInformation = [];
const addressInformationObject = {};
const partyIdentificationObject ={};
console.log('build addresses');
for (let i=0; i < firstNode.N101.length; i++) {
    addressInformationObject.entityIdentifierCode = firstNode.N101[i];
    addressInformationObject.name = firstNode.N102[i];
    addressInformationObject.identificationCodeQualifier = firstNode.N103[i];
    addressInformationObject.identificationCode = firstNode.N104[i];
    addressInformation.push(addressInformationObject);
    partyIdentificationObject.partyIdentification = [addressInformationObject];
    N1_loop.push(partyIdentificationObject);
  }
// Now, we place the functions to the top so we can begug them properly
// inserting the returns into the JSON itself to maintain integrity of 
// the loops and braces.
//
// REFERENCE INFORMATION FUNCTION
const getReferenceInformation = node => {
  const referenceInformation = [];
// Make sure it is an array.  Then loop through it. If not
// write the single records and move on.
  if (Array.isArray(node.REF01)) {
    node.REF01.forEach((ref01, index) => {
      // For each value in node.REF01, we're going to create a new... OBJECT
      console.log('multiple reference array');
      const referenceInformationObject = {};
      referenceInformationObject.referenceIdentificationQualifier = ref01;
      if (node.REF02.length >= index) {
        // If there's a corresponding value in node.REF02, we're going to add that data
        // to the OBJECT
        referenceInformationObject.referenceIdentification = node.REF02[index];
      }
      if (node.REF03 && node.REF03.length >= index) {
        // If there's a corresponding value in node.REF03, we're going to add that data
        // to the OBJECT
        referenceInformationObject.description = node.REF03[index];
      }
      // Then we're going to push the OBJECT onto the referenceInformation ARRAY
      referenceInformation.push(referenceInformationObject);
    })
  } else {
    console.log('single reference object');
    const referenceInformationObject = {};
    referenceInformationObject.referenceIdentificationQualifier = node.REF01;
    referenceInformationObject.referenceIdentification = node.REF02;
    referenceInformationObject.description = node.REF03;
    referenceInformation.push(referenceInformationObject);   
  }
  return referenceInformation;
}
// We will add a function to loop through the addresses the same way we 
// looped through the reference Identification information.
//DATETIME INFORMATION FUNCTION
const getDateInformation = node => {
  const dateInformation = [];
// Make sure it is an array.  Then loop through it. If not
// write the single records and move on.
  if (Array.isArray(node.DTM01)) {
    node.DTM01.forEach((DTM01, index) => {
      // For each value in node.DTM01, we're going to create a new... OBJECT
      const dateInformationObject = {};
      console.log('multiple date array');
      dateInformationObject.dateTimeQualifier = DTM01;
      if (node.DTM02.length >= index) {
        // If there's a corresponding value in node.DTM02, we're going to add that data
        // to the OBJECT
        dateInformationObject.date = node.DTM02[index];
      }
      if (node.DTM03 && node.DTM03.length >= index) {
        // If there's a corresponding value in node.DTM03, we're going to add that data
        // to the OBJECT
        dateInformationObject.description = node.DTM03[index];
      }
      // Then we're going to push the OBJECT onto the dateInformation ARRAY
      dateInformation.push(dateInformationObject);
    })
  } else {
    console.log('single date object');
    const dateInformationObject = {};
    dateInformationObject.dateTimeQualifier = node.DTM01;
    dateInformationObject.dateTime = node.DTM02;
    dateInformationObject.description = node.DTM03;
    dateInformation.push(dateInformationObject);   
  }
  return dateInformation;
}
//
// ADDRESS INFORMATION FUNCTION
const getAddressInformation = node => {
  const addressInformation = [];
  const partyIdentification =[];
  node.N101.forEach((n101, index) => {
    const addressInformationObject = {};
    const partyIdentificationObject ={};
    addressInformationObject.entityIdentifierCode = n101;
    addressInformationObject.name = node.N102[index];
    addressInformationObject.identificationCodeQualifier = node.N103[index];
    addressInformationObject.identificationCode = node.N104[index];
    addressInformation.push(addressInformationObject);
    partyIdentificationObject.partyIdentification = [addressInformationObject];
    N1_loop.push(partyIdentificationObject);
  })
  return {
    N1_loop
  };
}
// This is where the items finally come in.  For this we bring in all the records.
// Looping through these requires returning to the full data feed
// itself and getting the products
//
//  ITEM LOOP
const getItems = node => {
  const itemInformation =[];
  var productItemDesc = {productItemDescription:[]};
  node.forEach((record, index) => {
    // create the objects to load the data into
    const itemInformationObject = {};
    const proddescobj ={};
    // the item loop for the baseline Item Data Invoice
    itemInformationObject.assignedIdentification = record.IT101;
    itemInformationObject.quantityInvoiced = record.IT102;
    itemInformationObject.unitOrBasisForMeasurementCode = record.IT103;
    itemInformationObject.unitPrice = record.IT104; 
    itemInformationObject.basisOfUnitPriceCode = record.IT105;
    itemInformationObject.productServiceIDQualifier = record.IT106;
    itemInformationObject.productServiceID= record.IT107;
    itemInformation.push(itemInformationObject);
    // the description loop for the baseline Item Description
    proddescobj.itemDescriptionTypeCode = record.PID01;
    proddescobj.description = record.PID05;
    productItemDesc.productItemDescription.push(proddescobj)
  })
  return {
    baselineItemDataInvoice: itemInformation, 
    PID_loop: [productItemDesc]
  };
}
// Main Response, the content is built here.  This is what will be sent
// to Orderful for processing.  All of the previous lines are functions
// that inform this constant.
//
const response = [{
  sender: {
    isaId: firstNode.ISA06
  },
  receiver: {
    isaId: firstNode.ISA08
  },
  type: {
    name: firstNode.typeName
  },
  stream: firstNode.stream,
  message: {
    transactionSets: [
      {
        transactionSetHeader: [
          {
            transactionSetIdentifierCode: '810',
            transactionSetControlNumber: '0001'
          }
        ],
        beginningSegmentForInvoice: [
          {
            date: firstNode.BIG01,
            invoiceNumber: firstNode.BIG02,
            date1: firstNode.BIG03,
            purchaseOrderNumber: firstNode.BIG04,
            releaseNumber: firstNode.BIG05,
            changeOrderSequenceNumber: firstNode.BIG06,
            transactionTypeCode: firstNode.BIG07
          }
        ],
        referenceInformation: getReferenceInformation(firstNode), 
        N1_loop,
        termsOfSaleDeferredTermsOfSale: [
                {
                  termsTypeCode: firstNode.ITD01,
                  termsBasisDateCode: firstNode.ITD02
                }
              ],
        dateTimeReference: getDateInformation(firstNode),
        IT1_loop: [getItems(mainBody)],     
        totalMonetaryValueSummary: [
                {
                  amount: firstNode.TDS01
                }
              ],
        carrierDetails: [
                {
                  transportationMethodTypeCode: firstNode.CAD01,
                  standardCarrierAlphaCode: firstNode.CAD04,
                  referenceIdentificationQualifier: firstNode.CAD07,
                  referenceIdentification: firstNode.CAD08
                }
              ],      
        transactionTotals: [
                {
                        numberOfLineItems: firstNode.CTT01
                }
              ]
      }
    ]
  }
}];
response[0].updaterec = firstNode.id;
data.push(response);
///////// END CELIGO CODE ///////////////////////////////////

/*
Everything Above this is Celigo Ready.  Nothing Below this
Does anything for you in Celigo, it is for testing only
*/

console.log('response', response);
document.getElementById("response").innerHTML = JSON.stringify(response,null,2);

