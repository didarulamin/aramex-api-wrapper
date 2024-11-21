# Aramex API Wrapper

A lightweight Node.js wrapper for Aramex's SOAP API to manage shipments, tracking, and label printing for Zid platform order management.

---

[Project github](https://github.com/didarulamin/aramex-api-wrapper)

## Features

- Easy configuration of Aramex client and shipper details.
- Create shipments dynamically based on order data.
- Track shipments by Airway Bill (AWB) numbers.
- Generate and print shipment labels.

---

## Installation

```bash
npm install aramex-api-wrapper



Setup
Configure Aramex
Before using the API, configure your Aramex clientInfo and shipperDetails. You only need to do this once during your application setup.

javascript
Copy code
import { configureAramex } from 'aramex-api-wrapper';

// Set up Aramex client and shipper details
configureAramex(
  {
    UserName: 'your_username',
    Password: 'your_password',
    Version: 'v1.0',
    AccountNumber: 'your_account_number',
    AccountPin: 'your_account_pin',
    AccountEntity: 'RUH', // Example: RUH for Riyadh
    AccountCountryCode: 'SA', // Example: SA for Saudi Arabia
  },
  {
    Reference1: 'Ref123',
    PartyAddress: {
      Line1: 'Shipper Address Line 1',
      City: 'Riyadh',
      CountryCode: 'SA',
    },
    Contact: {
      PersonName: 'Shipper Name',
      PhoneNumber1: '123456789',
      EmailAddress: 'shipper@example.com',
    },
  }
);
Example Usage
1. Create Shipment
Use the createShipment function to generate a shipment based on an order object.

Input:
An order object should include the following properties:

id: Unique order ID.
order_total: Total order value.
shipping.address: Shipping address including street, city, and country.
customer: Customer details including name, mobile, and email.
currency.order_currency.code: Currency code (e.g., "AED").
products: Array of product names in the order.
Code Example:
javascript
Copy code
import { createShipment } from 'aramex-api-wrapper';

const order = {
  id: 12345,
  order_total: "100.00",
  shipping: {
    address: {
      street: "Customer Street",
      city: { name: "Dubai" },
      country: { name: "الإمارات العربية المتحدة" },
    },
  },
  customer: {
    name: "Customer Name",
    mobile: "971500000000",
    email: "customer@example.com",
  },
  currency: { order_currency: { code: "AED" } },
  products: [{ name: "Product 1" }, { name: "Product 2" }],
};

(async () => {
  try {
    const shipmentResponse = await createShipment(order);
    console.log('Shipment Created:', shipmentResponse);
  } catch (error) {
    console.error('Error Creating Shipment:', error);
  }
})();
2. Track Shipments
Use the trackShipments function to track shipments by their Airway Bill (AWB) numbers.

Input:
An array of AWB numbers to track.

Code Example:
javascript
Copy code
import { trackShipments } from 'aramex-api-wrapper';

(async () => {
  try {
    const trackingResponse = await trackShipments(['AWB123456789', 'AWB987654321']);
    console.log('Tracking Info:', trackingResponse);
  } catch (error) {
    console.error('Error Tracking Shipments:', error);
  }
})();
3. Print Shipment Label
Use the printShipmentLabel function to generate a shipment label for a given Airway Bill (AWB) number.

Input:
A single AWB number.

Code Example:
javascript
Copy code
import { printShipmentLabel } from 'aramex-api-wrapper';

(async () => {
  try {
    const labelResponse = await printShipmentLabel('AWB123456789');
    console.log('Label Info:', labelResponse);
  } catch (error) {
    console.error('Error Printing Label:', error);
  }
})();
Full Example Workflow
Here’s a complete example demonstrating the entire workflow:

Configure Aramex client and shipper details.
Create a shipment.
Track the shipment.
Print the shipment label.
Full Code Example:
javascript
Copy code
import { configureAramex, createShipment, trackShipments, printShipmentLabel } from 'aramex-api-wrapper';

// Step 1: Configure Aramex
configureAramex(
  {
    UserName: 'your_username',
    Password: 'your_password',
    Version: 'v1.0',
    AccountNumber: 'your_account_number',
    AccountPin: 'your_account_pin',
    AccountEntity: 'RUH',
    AccountCountryCode: 'SA',
  },
  {
    Reference1: 'Ref123',
    PartyAddress: {
      Line1: 'Shipper Address Line 1',
      City: 'Riyadh',
      CountryCode: 'SA',
    },
    Contact: {
      PersonName: 'Shipper Name',
      PhoneNumber1: '123456789',
      EmailAddress: 'shipper@example.com',
    },
  }
);

// Step 2: Create Shipment
const order = {
  id: 12345,
  order_total: "100.00",
  shipping: {
    address: {
      street: "Customer Street",
      city: { name: "Dubai" },
      country: { name: "الإمارات العربية المتحدة" },
    },
  },
  customer: {
    name: "Customer Name",
    mobile: "971500000000",
    email: "customer@example.com",
  },
  currency: { order_currency: { code: "AED" } },
  products: [{ name: "Product 1" }, { name: "Product 2" }],
};

(async () => {
  try {
    // Create the shipment
    const shipmentResponse = await createShipment(order);
    console.log('Shipment Created:', shipmentResponse);

    const awbNumber = shipmentResponse.Shipments.Shipment.AWBNumber;

    // Step 3: Track the shipment
    const trackingResponse = await trackShipments([awbNumber]);
    console.log('Tracking Info:', trackingResponse);

    // Step 4: Print the shipment label
    const labelResponse = await printShipmentLabel(awbNumber);
    console.log('Label Info:', labelResponse);
  } catch (error) {
    console.error('Error:', error);
  }
})();
API Reference
1. configureAramex(clientInfo, shipperDetails)
Configures global Aramex client and shipper details.

Parameters:

clientInfo (Object): Aramex client credentials.
UserName, Password, Version, AccountNumber, AccountPin, AccountEntity, AccountCountryCode.
shipperDetails (Object): Shipper information.
Includes Reference1, PartyAddress, and Contact fields.
2. createShipment(order)
Creates a shipment for an order.

Parameters:

order (Object): Contains details about the order, customer, and shipping.
Returns:

A Promise resolving to the shipment creation response.
3. trackShipments(awbNumbers)
Tracks shipments by their Airway Bill (AWB) numbers.

Parameters:

awbNumbers (Array): List of AWB numbers.
Returns:

A Promise resolving to the tracking details.
4. printShipmentLabel(awbNumber)
Generates a shipment label for the given Airway Bill (AWB) number.

Parameters:

awbNumber (String): The AWB number for the shipment.
Returns:

A Promise resolving to the label information.
License
This project is licensed under the MIT License.

Contributing
Feel free to open issues or submit pull requests for bug fixes and new features. Contributions are welcome!
```
