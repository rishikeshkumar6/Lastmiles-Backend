import axios from "axios";
const DHL_API_KEY = process.env.DHL_API_KEY;

// Use a sample tracking number from DHL's API documentation
const testTrackingNumber = "00340434161012345678";

const trackShipment = async (trackingNumber) => {
  try {
    const response = await axios.get(
      `https://api.dhl.com/tracking/v1/shipments/${trackingNumber}`,
      {
        headers: {
          Authorization: `Bearer ${DHL_API_KEY}`,
        },
      }
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching tracking information:", error);
  }
};

trackShipment(testTrackingNumber);
