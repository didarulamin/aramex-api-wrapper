declare module 'aramex-api-wrapper' {
    const initializeAramex: (config: any) => void;
    const createShipment: (order: any) => Promise<any>;
    const trackShipments: (shipments: string[]) => Promise<any>;
    const printShipmentLabel: (shipmentNumber: string) => Promise<any>;
    export { initializeAramex, createShipment, trackShipments, printShipmentLabel };
}

