//index.js
const { configureAramex, getAramexConfig } = require('./aramexConfig');
const { initializeAramex } = require('./aramexSetup');
const { createShipment, trackShipments, printShipmentLabel, validateAddress, fetchAllCountries, fetchCitiesByCountry, fetchOfficesByCountry } = require('./aramexService');

module.exports = {
    configureAramex,
    getAramexConfig,
    initializeAramex,
    createShipment,
    trackShipments,
    printShipmentLabel,
    validateAddress,
    fetchAllCountries,
    fetchCitiesByCountry,
    fetchOfficesByCountry
};
