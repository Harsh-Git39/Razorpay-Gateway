import React, {useState, useEffect} from "react";
import axios from "axios";

function Paypage()
{
   const [currAmount, setAmount] = useState("");
   const [currency, setCurrency] = useState("INR");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState(false);
   const [user, setUser] = useState(null);
   const [phone, setPhone] = useState(""); 


   function handleChange(event)
   {
      const valAmount = event.target.value;
      setAmount(valAmount);
      setError("");
   }

   function handleCurrencyChange(event)
   {
      setCurrency(event.target.value);
   }

   function handlePhoneChange(event)
   {
     setPhone(event.target.value);
   }

   async function pay(event)
   {
     event.preventDefault();

     if(!currAmount || currAmount <= 0)
     {
        setError("Please enter a valid amount");
        return;
     }
    if(!phone || phone.length < 10)
     {  
        setError("Please enter a valid phone number");
        return;
     }


     setLoading(true);
     setError("");
     setSuccess(false);

     try
     {
        const response = await axios.post("/api/create-order", 
            {
              amount : parseFloat(currAmount),
              currency : currency,
              phone : phone
            },
             { withCredentials: true });


        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.data.amount,
          currency: response.data.currency,
          name: "HarrLance",
          description: "Payment Transaction",
          order_id: response.data.orderId,
          handler: function (razorpayResponse) {
            verifyPayment(razorpayResponse);
          },
          prefill: {
            name: user?.name || "Your Name",
            email: user?.email || "your@example.com",
            contact: phone || "Enter your phone number for UPI"
          },
          theme: {
            color: "#528FF0"
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
        
        setLoading(false);
     }
     catch(err)
     {
       setError(err.response?.data?.message || err.message || "Something went wrong.");
       console.log(err);
       setLoading(false);
     }
   }

   async function verifyPayment(razorpayResponse)
   {
    try
    {
      const response = await axios.post("/api/verify-payment", 
        {
         razorpay_order_id: razorpayResponse.razorpay_order_id,
         razorpay_payment_id: razorpayResponse.razorpay_payment_id,
         razorpay_signature: razorpayResponse.razorpay_signature
       },
           { withCredentials: true });

       setSuccess(true);
       setAmount("");
       setPhone("");
       console.log("Payment verified:", response.data);
    }
    catch(err)
    {
        setError("Payment verification failed");
        console.log(err);
    }
   }
   
    return (
      <form onSubmit={pay}>
        <h3>Complete Your Payment</h3>
        <p>Enter the amount and select your preferred currency</p>


       <div className="input-group">
        <label className="input-label">Phone Number</label>
        <input
          type="tel"
          placeholder="Enter 10-digit phone number"
          value={phone}
          onChange={handlePhoneChange}
          disabled={loading}
          pattern="[0-9]{10}"
          required
        />
       </div>


        <div className="input-group">
          <label className="input-label">Amount</label>
          <input
            type="number"
            name="amount"
            placeholder="Enter Amount"
            value={currAmount}
            onChange={handleChange}
            disabled={loading}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Currency</label>
          <select
            value={currency}
            onChange={handleCurrencyChange}
            disabled={loading}
          >
            <option value="INR">INR - Indian Rupee (₹)</option>
            <option value="USD">USD - US Dollar ($)</option>
            <option value="EUR">EUR - Euro (€)</option>
            <option value="GBP">GBP - British Pound (£)</option>
            <option value="AUD">AUD - Australian Dollar (A$)</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
            {loading ? "Processing" : "Proceed to Pay"}
        </button>

        <div className="security-note">
          Your payment is secured with 256-bit encryption
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">Payment verified successfully!</div>}
      </form>
  );
}

export default Paypage;