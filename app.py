import requests
import json

# --- Configuration ---
# IMPORTANT: Replace with your actual Razorpay Key ID and Key Secret
# You can generate these from your Razorpay dashboard (Test mode for testing)
RAZORPAY_KEY_ID = "YOUR_KEY_ID"
RAZORPAY_KEY_SECRET = "YOUR_KEY_SECRET"

# Razorpay API base URL
# The documentation states 'api.rzp.<bank>.com', which usually means
# you'll use 'api.razorpay.com' for general use, or a bank-specific URL if provided.
# For sandbox testing, 'api.razorpay.com' is typically used unless specific bank sandbox is mentioned.
API_BASE_URL = "https://api.razorpay.com"
PAYMENT_ENDPOINT = "/v1/payments/pay"
API_URL = f"{API_BASE_URL}{PAYMENT_ENDPOINT}"

# --- Request Headers ---
# As per the documentation, these headers are required.
# x-device-fingerprint and x-device-fingerprint-timestamp are often used
# for security/fraud detection by payment gateways. You might need to generate
# these dynamically based on your client-side environment or integrate with a library
# that provides them. For this example, we'll use static values from the documentation.
HEADERS = {
    "Content-Type": "application/json",
    "x-device-fingerprint": "<device_fingerprint>", # Replace with a real device fingerprint if required
    "x-device-fingerprint-timestamp": "1496918882000", # Example timestamp
    "x-customer-reference": "customer-id-from-customer" # Example customer reference
}

# --- Request Body (Payload) ---
# This dictionary represents the JSON payload that will be sent in the POST request.
# The values are based on the example provided in the Razorpay documentation.
# IMPORTANT: Adjust these values as per your actual payment scenario.
PAYMENT_PAYLOAD = {
    "upi_transaction_id": "RZP1KuSUGrp2l6MmPuT0163789452QPAY02", # Must be unique for each transaction
    "reference_id": "RSKwpINfSkdEvtdxf",
    "upi_initiation_mode": "00", # 00 = Default, see docs for other values
    "upi_purpose_code": "00",     # 00 = Default, see docs for other values
    "upi_reference_url": "https://www.test.com/bill-details", # A URL for customer to get transaction details
    "upi_reference_category": "00", # 00 = NULL, 01 = Advertisement, 02 = Invoice
    "device": {
        "geocode": "1234.1213", # Geographic coordinates
        "ip": "198.1.1.1"       # IP address of the device initiating the payment
    },
    "currency": "INR",
    "amount": 100, # Amount in paise (e.g., 100 for INR 1.00)
    "description": "Sample UPI transaction for API test",
    "payer": {
        "fundsource_id": "fs_Mock14charID" # A unique ID for the payer's fund source
    },
    "upi_credentials": {}, # This typically holds encrypted UPI PIN, handled by SDK/mobile app
    "payees": [
        {
            "vpa": "9560137963.stage@rzp" # Virtual Payment Address of the payee
        }
    ]
}

# --- Function to make the API call ---
def make_upi_payment():
    print(f"Attempting to make a UPI payment to {PAYMENT_PAYLOAD['payees'][0]['vpa']}...")
    print(f"URL: {API_URL}")
    print(f"Payload: {json.dumps(PAYMENT_PAYLOAD, indent=2)}")

    try:
        # Make the POST request
        # auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) handles Basic Authentication
        response = requests.post(
            API_URL,
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            headers=HEADERS,
            json=PAYMENT_PAYLOAD # Use json parameter for automatic JSON serialization
        )

        # Check if the request was successful (HTTP status code 2xx)
        response.raise_for_status()

        # Parse and print the JSON response
        response_data = response.json()
        print("\n--- Payment API Response ---")
        print(json.dumps(response_data, indent=2))

        # You can add further logic here based on the 'status' in the response_data
        if response_data.get("status") == "success":
            print("\nPayment initiated successfully!")
        elif response_data.get("status") == "failed":
            print("\nPayment failed. Check response details for reasons.")
        else:
            print(f"\nPayment status: {response_data.get('status', 'Unknown')}")

    except requests.exceptions.HTTPError as http_err:
        print(f"\nHTTP error occurred: {http_err}")
        print(f"Response content: {response.text}")
    except requests.exceptions.ConnectionError as conn_err:
        print(f"\nConnection error occurred: {conn_err}")
    except requests.exceptions.Timeout as timeout_err:
        print(f"\nTimeout error occurred: {timeout_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"\nAn unexpected error occurred: {req_err}")
    except json.JSONDecodeError as json_err:
        print(f"\nFailed to decode JSON response: {json_err}")
        print(f"Raw response content: {response.text}")

# --- Execute the function ---
if __name__ == "__main__":
    # Before running, ensure you have the 'requests' library installed:
    # pip install requests

    # REMEMBER TO REPLACE 'YOUR_KEY_ID' AND 'YOUR_KEY_SECRET'
    # AND REVIEW THE PAYMENT_PAYLOAD VALUES!
    make_upi_payment()