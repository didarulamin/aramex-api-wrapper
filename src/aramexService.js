const { getAramexConfig } = require('./aramexConfig');
const soap = require('strong-soap').soap;
const moment = require('moment');
const path = require('path');
const xml2js = require('xml2js'); // XML to JSON parser
const { getCountryCodeByCurrency } = require('./utils/countryCodeFinder');

// Utility to create SOAP client
const createSoapClient = (wsdlPath) => {
    return new Promise((resolve, reject) => {
        soap.createClient(wsdlPath, async (err, client) => {
            if (err) {
                console.error('Error creating SOAP client:', err);
                reject(err);
            } else {
                resolve(client);
            }
        });
    });
};



const dispatchSoapRequest = async (wsdlPath, operation, args) => {
    try {
        const client = await createSoapClient(wsdlPath);
        return new Promise((resolve, reject) => {
            client[operation](args, (err, result, envelope, soapHeader) => {
                if (err) {
                    console.error(`SOAP Error [${operation}]:`, err);
                    reject(err);
                } else {
                    console.log(`SOAP Envelope for [${operation}]:`, envelope);

                    // Parse the envelope if result is empty
                    if (result) {
                        resolve(result);
                    } else if (envelope) {
                        // Parse the envelope manually
                        const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
                        parser.parseString(envelope, (parseErr, parsedEnvelope) => {
                            if (parseErr) {
                                console.error('Error parsing SOAP envelope:', parseErr);
                                reject(parseErr);
                            } else {
                                const body = parsedEnvelope['s:Envelope']['s:Body'];
                                console.log('Parsed SOAP Body:', body);
                                resolve(body); // Return parsed body content
                            }
                        });
                    } else {
                        console.error(`No result found in SOAP response for operation [${operation}].`);
                        reject(new Error('Empty result in SOAP response.'));
                    }
                }
            });
        });
    } catch (error) {
        console.error('SOAP Client Error:', error);
        throw error;
    }
};



// Generate consignee dynamically
const generateConsignee = (order) => ({
    Reference1: `${order?.id || ''}`,
    Reference2: '',
    AccountNumber: '',
    PartyAddress: {
        Line1: order?.shipping?.address?.street || '',
        Line2: order?.shipping?.address?.district || '',
        Line3: order?.shipping?.address?.formatted_address,
        City: order?.shipping?.address?.city?.name || '',
        StateOrProvinceCode: order?.shipping?.address?.state || '', // Ensure state is populated if available
        PostCode: order?.shipping?.address?.postal_code || '', // Use a default valid value if missing
        CountryCode: getCountryCodeByCurrency(order?.currency_code) || 'SA' // Default to 'SA' if no currency code
    },
    Contact: {
        Department: '',
        PersonName: order?.customer?.name || '',
        Title: '',
        CompanyName: order?.customer?.name,
        PhoneNumber1: order?.customer?.mobile, // Provide a default valid phone number
        PhoneNumber1Ext: '',
        PhoneNumber2: '',
        PhoneNumber2Ext: '',
        FaxNumber: '',
        CellPhone: order?.customer?.mobile || '', // Provide a default valid phone number
        EmailAddress: order?.customer?.email || '', // Provide a default email if missing
        Type: order?.customer?.type || 'Individual' // Default to a valid value like 'Individual'
    }
});



// Generate consignee dynamically
const generateThirdParty = (order) => ({
    Reference1: ``,
    Reference2: '',
    Reference3: '',
    AccountNumber: '',
    PartyAddress: {
        Line1: '',
        Line2: '',
        Line3: '',
        City: '',
        StateOrProvinceCode: '', // Ensure state is populated if available
        PostCode: '', // Use a default valid value if missing
        CountryCode: '' // Default to 'SA' if no currency code
    },
    Contact: {
        Department: '',
        PersonName: '',
        Title: '',
        CompanyName: '',
        PhoneNumber1: '', // Provide a default valid phone number
        PhoneNumber1Ext: '',
        PhoneNumber2: '',
        PhoneNumber2Ext: '',
        FaxNumber: '',
        CellPhone: '', // Provide a default valid phone number
        EmailAddress: '', // Provide a default email if missing
        Type: '' // Default to a valid value like 'Individual'
    }
});


// Generate shipment details dynamically
const generateShipmentDetails = (order) => {


    return {
        Dimensions: {
            Length: order?.dimensions?.length || 10, // Default length in cm
            Width: order?.dimensions?.width || 10,  // Default width in cm
            Height: order?.dimensions?.height || 10, // Default height in cm
            Unit: 'CM'
        },
        ActualWeight: {
            Value: order?.weight || 0.5, // Default weight in Kg
            Unit: 'Kg'
        },
        ChargeableWeight: {
            Value: order?.chargeable_weight || 0.5, // Default value
            Unit: 'Kg'
        },
        NumberOfPieces: order?.products_count || 1,
        ProductGroup: order?.currency_code === "SAR" ? 'DOM' : 'EXP',
        ProductType: order?.currency_code === "SAR" ? 'CDS' : 'EPX',
        PaymentType: 'P',
        PaymentOptions: '',
        Services: '',
        DescriptionOfGoods: order?.products?.map((p) => p.name).join(', ') || 'Goods',
        GoodsOriginCountry: 'SA',
        CashOnDeliveryAmount: {
            Value: 0,
            CurrencyCode: order?.currency_code || 'SAR'
        },
        InsuranceAmount: {
            Value: 0,
            CurrencyCode: order?.currency_code || 'SAR'
        },
        CollectAmount: {
            Value: 0,
            CurrencyCode: order?.currency_code || 'SAR'
        },
        CashAdditionalAmount: {
            Value: 0,
            CurrencyCode: order?.currency_code || 'SAR'
        },
        CashAdditionalAmountDescription: '',
        CustomsValueAmount: {
            Value: order?.currency_code === "SAR" ? 0 : order?.order_total || 0,
            CurrencyCode: order?.currency_code || 'SAR'
        },
        Items: [
            {
                PackageType: 'Box',
                Quantity: order?.products_count,
                Weight: {
                    Value: 0.5,
                    Unit: 'Kg'
                },
                Comments: 'Healthcare Products',
                Reference: ''
            }
        ]
    };
};


// Create shipment
const createShipment = async (order) => {
    try {
        const { clientInfo, shipperDetails } = getAramexConfig();

        // Dynamically update Reference1 in shipperDetails
        const updatedShipperDetails = {
            ...shipperDetails,
            Reference1: `${order.id}` // Set Reference1 dynamically from order.id
        };


        // const wsdlPath = path.resolve(__dirname, 'wsdl/shipping.wsdl');
        const wsdlPath = 'https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc?wsdl'

        const consignee = generateConsignee(order);
        const shipmentDetails = generateShipmentDetails(order);
        const ThirdParty = generateThirdParty(order)



        const payload = {
            ShipmentCreationRequest: {
                ClientInfo: clientInfo,
                Shipments: {
                    Shipment: {
                        Shipper: updatedShipperDetails,
                        Consignee: consignee,
                        ThirdParty: ThirdParty,
                        Reference1: `${order.id}`,
                        Reference2: '',
                        Reference3: '',
                        ForeignHAWB: '',
                        TransportType: 0,
                        ShippingDateTime: moment().format(),
                        // DueDate: moment().format(),
                        PickupLocation: 'Reciption',
                        PickupGUID: '',
                        Comments: '',
                        AccountingInstrcutions: '',
                        OperationsInstructions: '',
                        Details: shipmentDetails

                    }
                },
                Transaction: null
            }
        };


        // console.log(JSON.stringify(payload))

        return await dispatchSoapRequest(wsdlPath, 'CreateShipments', payload);
    } catch (error) {
        console.error('Error creating shipment:', error);
        throw error;
    }
};

// Track shipments
const trackShipments = async (shipments) => {
    try {
        const { clientInfo } = getAramexConfig();
        // const wsdlPath = path.resolve(__dirname, 'wsdl/tracking.wsdl');
        const wsdlPath = 'https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc?wsdl'

        const payload = {
            ShipmentTrackingRequest: {
                ClientInfo: clientInfo,
                Shipments: { string: shipments },
            },
        };

        return await dispatchSoapRequest(wsdlPath, 'TrackShipments', payload);
    } catch (error) {
        console.error('Error tracking shipments:', error);
        throw error;
    }
};

// Print shipment label
const printShipmentLabel = async (shipmentNumber) => {
    try {
        const { clientInfo } = getAramexConfig();
        // const wsdlPath = path.resolve(__dirname, 'wsdl/shipping.wsdl');
        const wsdlPath = 'https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc?wsdl'

        const payload = {
            LabelPrintingRequest: {
                ClientInfo: clientInfo,
                ShipmentNumber: shipmentNumber,
                LabelInfo: {
                    ReportID: '9729',
                    ReportType: 'URL',
                },
            },
        };

        return await dispatchSoapRequest(wsdlPath, 'PrintLabel', payload);
    } catch (error) {
        console.error('Error printing shipment label:', error);
        throw error;
    }
};


// Validate Address
// const validateAddress = async (address) => {
//     try {
//         const { clientInfo } = getAramexConfig();
//         // const wsdlPath = path.resolve(__dirname, 'wsdl/location.wsdl');
//         const wsdlPath = 'https://ws.aramex.net/ShippingAPI/Location/Service_1_0.svc?wsdl'

//         // Construct address payload from the order
//         const payload = {
//             AddressValidationRequest: {
//                 ClientInfo: clientInfo,
//                 Address: address,
//                 Transaction: null
//             },
//         };

//         // Dispatch the SOAP request
//         return await dispatchSoapRequest(wsdlPath, 'ValidateAddress', payload);
//     } catch (error) {
//         console.error('Error validating address:', error);
//         throw error;
//     }
// };



const validateAddress = async (order) => {

    const address = {
        Line1: order?.shipping?.address?.street || '',
        Line2: order?.shipping?.address?.district || '',
        Line3: order?.shipping?.address?.formatted_address || '',
        City: order?.shipping?.address?.city?.name || '',
        StateOrProvinceCode: order?.shipping?.address?.state || '',
        PostCode: order?.shipping?.address?.postal_code || '00000',
        CountryCode: getCountryCodeByCurrency(order?.currency_code) || 'SA' // Default to 'SA'
    };

    try {
        const { clientInfo } = getAramexConfig();
        // const wsdlPath = path.resolve(__dirname, 'wsdl/location.wsdl');
        const wsdlPath = 'https://ws.aramex.net/ShippingAPI/Location/Service_1_0.svc?wsdl'

        // Construct address payload from the order
        const payload = {
            AddressValidationRequest: {
                ClientInfo: clientInfo,
                Address: address,
                Transaction: null
            },
        };

        // Dispatch the SOAP request
        return await dispatchSoapRequest(wsdlPath, 'ValidateAddress', payload);
    } catch (error) {
        console.error('Error validating address:', error);
        throw error;
    }
};



const fetchAllCountries = async () => {
    try {
        const { clientInfo } = getAramexConfig();
        // const wsdlPath = path.resolve(__dirname, 'wsdl/location.wsdl');

        const wsdlPath = 'https://ws.aramex.net/ShippingAPI/Location/Service_1_0.svc?wsdl'

        const payload = {
            CountriesFetchingRequest: {
                ClientInfo: clientInfo,
                Transaction: {
                    Reference1: 'FetchCountries',
                    Reference2: '',
                    Reference3: '',
                    Reference4: '',
                    Reference5: '',
                },
            },
        };

        return await dispatchSoapRequest(wsdlPath, 'FetchCountries', payload);
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw error;
    }
};


const fetchCitiesByCountry = async (countryCode) => {
    try {
        const { clientInfo } = getAramexConfig();
        // const wsdlPath = path.resolve(__dirname, 'wsdl/location.wsdl');
        const wsdlPath = 'https://ws.aramex.net/ShippingAPI/Location/Service_1_0.svc?wsdl'

        const payload = {
            CitiesFetchingRequest: {
                ClientInfo: clientInfo,
                Transaction: {
                    Reference1: 'FetchCities',
                    Reference2: '',
                    Reference3: '',
                    Reference4: '',
                    Reference5: '',
                },
                CountryCode: countryCode,
                State: '', // Optional if you need to fetch cities for a specific state
                NameStartsWith: '', // Optional: filter cities starting with specific characters
            },
        };

        return await dispatchSoapRequest(wsdlPath, 'FetchCities', payload);
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
    }
};


const fetchOfficesByCountry = async (countryCode) => {
    try {
        const { clientInfo } = getAramexConfig();
        // const wsdlPath = path.resolve(__dirname, 'wsdl/location.wsdl');
        const wsdlPath = 'https://ws.aramex.net/ShippingAPI/Location/Service_1_0.svc?wsdl'

        const payload = {
            OfficesFetchingRequest: {
                ClientInfo: clientInfo,
                Transaction: {
                    Reference1: 'FetchOffices',
                    Reference2: '',
                    Reference3: '',
                    Reference4: '',
                    Reference5: '',
                },
                CountryCode: countryCode,
            },
        };

        return await dispatchSoapRequest(wsdlPath, 'FetchOffices', payload);
    } catch (error) {
        console.error('Error fetching offices:', error);
        throw error;
    }
};


module.exports = { createShipment, trackShipments, printShipmentLabel, validateAddress, fetchAllCountries, fetchCitiesByCountry, fetchOfficesByCountry };



// (async () => {
//     try {
//         // Fetch all countries
//         const countriesResponse = await fetchAllCountries();
//         console.log('Countries:', countriesResponse);

//         // Example: Fetch cities for a specific country (e.g., UAE)
//         const citiesResponse = await fetchCitiesByCountry('AE');
//         console.log('Cities in UAE:', citiesResponse);

//         // Example: Fetch offices for a specific country (e.g., UAE)
//         const officesResponse = await fetchOfficesByCountry('AE');
//         console.log('Offices in UAE:', officesResponse);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// })();
