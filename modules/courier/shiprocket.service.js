import axios from "axios";

async function getShiprocketToken() {
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: "rishikeshkumarsingh438@gmail.com",
      password: "j5JiX!Knqe!bdPhB",
    }
  );
  return response.data.token;
}

const demoPayload = {
  length: 33,
  breadth: 25,
  height: 6,
  weight: 0.8,
  payment_mode: "COD",
  shipping_charges: 0,
  cod_charges: 0,
  discount: 0,
  gift_wrap_charges: 0,
  other_charges: 0,
  total_amount: 13918,
  order_value: 13918,
  tax_amount: 0,
  pickup_location_code: "0314",
  billing_is_same_as_consignee: true,
  billing_full_name: "Ameya Jain",
  billing_phone: "9371711078",
  billing_email: "ameya@kumarworld.com",
  billing_address: "Kumar capital 2413 East street",
  billing_landmark: "",
  billing_pincode: "411001",
  billing_city: "Pune",
  billing_state: "Maharashtra",
  billing_country: "India",
  consignee_full_name: "Ameya Jain",
  consignee_phone: "9371711078",
  consignee_email: "ameya@kumarworld.com",
  consignee_alternate_phone: "",
  consignee_company: "",
  consignee_gstin: "",
  consignee_address: "Kumar capital 2413 East street",
  consignee_landmark: "",
  consignee_pincode: "411001",
  consignee_city: "Pune",
  consignee_state: "Maharashtra",
  consignee_country: "India",
  order_id: "#$%^&*-GSFAFSDJFSDf-1289",
  order_date: "2025-04-16T18:30:00Z",
  channel: "Zippyy",
  products: [
    {
      name: "SDWR-PN1-MIT-240089|Jetstream X Karimoku - Pen with Mechanical",
      unit_price: 3520,
      quantity: 1,
      sku_code: "SDWR-PN1-MIT-240089",
    },
    {
      name: "SDWR-PLBD-TOM-240107|Tombow Green Monograph Grip Mechanical Pe",
      unit_price: 2200,
      quantity: 1,
      sku_code: "SDWR-PLBD-TOM-240107",
    },
    {
      name: "SDWR-HLST-PIL-240006|Pilot Frixion Light Erasable Highlighters",
      unit_price: 760,
      quantity: 1,
      sku_code: "SDWR-HLST-PIL-240006",
    },
    {
      name: "SDWR-PN-PIL-240097|Pilot Juice Up Gel Ink Pens - Set of 6 Lim",
      unit_price: 4500,
      quantity: 1,
      sku_code: "SDWR-PN-PIL-240097",
    },
    {
      name: "SDWR-PNST-PIL-240118|Pilot Frixion Synergy Knock Erasable Pen ",
      unit_price: 1890,
      quantity: 1,
      sku_code: "SDWR-PNST-PIL-240118",
    },
    {
      name: "Pentel Multi - 8 - Pencil  Lead Set  Multi",
      unit_price: 2550,
      quantity: 1,
      sku_code: "SKU-778478",
    },
  ],
  courier: null,
  order_type: "B2C",
  courier_partner: null,
  shipment_mode: null,
  awb_number: null,
  applicable_weight: 0.99,
  volumetric_weight: 0.99,
  manifest_url: null,
  label_url: null,
  invoice_url: null,
  tracking_id: null,
  status: "new",
  sub_status: "new",
  shipment_booking_error: null,
  booking_date: null,
  pickup_completion_date: null,
  first_ofp_date: null,
  shipped_date: null,
  edd: null,
  first_ofd_date: null,
  delivered_date: null,
  rto_initiated_date: null,
  rto_delivered_date: null,
  pickup_failed_reason: null,
  rto_reason: null,
  product_quantity: 6,
  is_label_generated: false,
  order_tags: [],
  pickup_location: {
    location_name: "537c7ed34ae49bf8644f63a17e8e06",
    contact_person_name: "Snigdha",
    contact_person_phone: 9999979805,
    contact_person_email: "sozodoristore@gmail.com",
    alternate_phone: "",
    address: "E404, Greater Kailash Part 1 ",
    landmark: "",
    pincode: 110048,
    city: "South Delhi",
    state: "Delhi",
    country: "India",
    location_type: "WAREHOUSE",
    location_code: "0314",
    active: true,
    is_default: false,
  },
  forward_freight: null,
  forward_cod_charge: null,
  forward_tax: null,
  rto_freight: null,
  rto_tax: null,
  zone: "D",
};
async function createOrder() {
  const token = await getShiprocketToken();
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    demoPayload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("response", response);
  return response;
}

let res = await createOrder();
console.log("post order response", res);
