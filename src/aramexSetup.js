const { configureAramex } = require('./aramexConfig');

/**
 * Initializes the Aramex configuration with client credentials and shipper details.
 * @param {Object} params - The parameters for initialization.
 * @param {string} params.username - Aramex API username.
 * @param {string} params.password - Aramex API password.
 * @param {string} params.accountNumber - Aramex account number.
 * @param {string} params.accountPin - Aramex account PIN.
 * @param {Object} params.shipper - Shipper details.
 * @param {string} params.shipper.Reference1 - Reference for the shipment.
 * @param {Object} params.shipper.PartyAddress - Address details of the shipper.
 * @param {string} params.shipper.PartyAddress.Line1 - Shipper address line 1.
 * @param {string} params.shipper.PartyAddress.City - Shipper city.
 * @param {string} params.shipper.PartyAddress.CountryCode - Shipper country code.
 * @param {Object} params.shipper.Contact - Contact details of the shipper.
 * @param {string} params.shipper.Contact.PersonName - Shipper contact name.
 * @param {string} params.shipper.Contact.PhoneNumber1 - Shipper phone number.
 * @param {string} params.shipper.Contact.EmailAddress - Shipper email address.
 */
const initializeAramex = ({
    username,
    password,
    accountNumber,
    accountPin,
    accountEntity,
    accountCountryCode,
    shipper,
}) => {
    // Configure Aramex with client credentials and shipper details
    configureAramex(
        {
            UserName: username,
            Password: password,
            Version: 'v1.0',
            AccountNumber: accountNumber,
            AccountPin: accountPin,
            AccountEntity: accountEntity, // Default entity, can be parameterized if needed
            AccountCountryCode: accountCountryCode, // Default country code, can be parameterized if needed
        },
        shipper
    );
};

module.exports = { initializeAramex };
