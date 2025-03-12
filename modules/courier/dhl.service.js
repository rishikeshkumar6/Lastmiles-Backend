import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Generic function to call DHL APIs
const getDhlToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.DHL_BASE_URL}/oauth2/token`,
      `grant_type=client_credentials&client_id=${process.env.DHL_API_KEY}&client_secret=${process.env.DHL_SECRET_KEY}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("DHL Auth Error:", error.response?.data || error.message);
    throw error;
  }
};

const callDhlApi = async (endpoint, method = "GET", data = null) => {
  const token = await getDhlToken(); // Get token first
  try {
    const response = await axios({
      method,
      url: `${process.env.DHL_BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`, // Use token here
        "Content-Type": "application/json",
      },
      data,
    });
    return response.data;
  } catch (error) {
    console.error("DHL API Error:", error.response?.data || error.message);
    throw error;
  }
};

const createShipment = async (shipmentData) => {
  const endpoint = "/shipping/v2/shipments";
  return callDhlApi(endpoint, "POST", shipmentData);
};

export const createTestShipment = async (req, res) => {
  try {
    // Test shipment payload (modify as needed)
    const shipmentData = {
      plannedShippingDateAndTime: new Date().toISOString(),
      productCode: "P", // "P" for Express Worldwide
      accounts: [
        { typeCode: "shipper", number: process.env.DHL_ACCOUNT_NUMBER },
      ],
      customerReferences: [{ typeCode: "CU", value: "Test123" }],
      content: "DOCUMENTS",
      shipper: {
        name: "Test Shipper",
        address: {
          countryCode: "IN",
          postalCode: "400001",
          city: "Mumbai",
          streetLines: ["123 Test Street"],
        },
      },
      receiver: {
        name: "Test Receiver",
        address: {
          countryCode: "IN",
          postalCode: "110001",
          city: "Delhi",
          streetLines: ["456 Buyer Lane"],
        },
      },
      packages: [
        {
          weight: 1.5,
          dimensions: { length: 20, width: 10, height: 5 },
        },
      ],
    };

    const shipment = await createShipment(shipmentData);
    res.json({
      trackingId: shipment.shipmentTrackingNumber,
      labelUrl: shipment.documents[0].url, // PDF label URL
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
