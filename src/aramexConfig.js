//aramexConfig.js
let aramexConfig = {
    clientInfo: null,
    shipperDetails: null,
};

// Configure Aramex client and shipper
const configureAramex = (client, shipper) => {
    aramexConfig.clientInfo = client;
    aramexConfig.shipperDetails = shipper;
};

// Get the configured client info and shipper
const getAramexConfig = () => {
    if (!aramexConfig.clientInfo || !aramexConfig.shipperDetails) {
        throw new Error('Aramex is not configured. Please call `configureAramex` first.');
    }
    return aramexConfig;
};

// Export functions
module.exports = {
    configureAramex,
    getAramexConfig,
};
