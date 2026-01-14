import express from "express";
import bodyParser from "body-parser";
import Razorpay from "razorpay";
import crypto, { setEngine } from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import { passport, db } from "./auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}));

app.use(bodyParser.urlencoded({extended : true}));

app.use(bodyParser.json());

app.use(session(
  {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie : {maxAge : 30 * 24 * 60 * 60 * 1000}
  }
));

app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/google", passport.authenticate('google' , {scope : ['profile', 'email']}));

app.get("/auth/google/callback" , 
          passport.authenticate('google', {failureRedirect : "http://localhost:5173"}),

          (req, res) =>
          {
            res.redirect("http://localhost:5173");
          });


app.get("/auth/user" , (req , res)=>
{
  if(req.isAuthenticated())
  {
    res.json({user : req.user});
  }
  else{
    res.status(404).json({message : "Not logged In"});
  }
});

app.get("/auth/logout" , (req, res) =>
{ 
   req.logout(() =>
  {
        res.json({ message: 'Logged out' });
  });
});

const isAuthenticated = (req, res, next) =>
{
  if(req.isAuthenticated())
  {
    return next();
  }
  else{
     res.status(401).json({ message: 'Please login first' });
  }
}


app.post("/api/update-phone", (req, res) => 
  {
  if (!req.isAuthenticated()) 
    {
    return res.status(401).json({ message: 'Not logged in' });
    }

  const { phone } = req.body;
  
  db.query(
    'UPDATE users SET phone = $1 WHERE id = $2',
    [phone, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update phone' });
      }
      res.json({ message: 'Phone updated successfully' });
    }
  );
});


const razorpay = new Razorpay(
    {
        key_id : process.env.RAZORPAY_KEY_ID,    
        key_secret : process.env.RAZORPAY_KEY_SECRET
    }
);

app.post("/api/create-order" ,isAuthenticated, async (req, res) =>
{ 
   try
   {
     const {amount , currency} = req.body;

     if(!amount || amount <= 0)
     {
       return res.status(400).json({message : "Invalid amount"});
     }

     const options =
     {
        amount : amount * 100,
        currency : currency || "INR",
        receipt : "receipt_" + Date.now()
     }

     const order = await razorpay.orders.create(options);

     await db.query("INSERT INTO payments (user_id,  razorpay_order_id, amount, currency) VALUES ($1, $2, $3, $4)" , 
       [req.user.id, order.id, amount, currency] 
     );

     res.json(
        {
            orderId : order.id,
            amount : order.amount,
            currency : order.currency
        }
     );

   }catch(err)
   {
     console.error("Error creating order:", err);

     res.status(500).json({message : "Failed to create order" , error : err.message});
   }
});

app.post("/api/verify-payment" , isAuthenticated, async (req, res) =>
{
    try
    {
      const { razorpay_order_id , razorpay_payment_id, razorpay_signature} = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

      if(razorpay_signature === expectedSign)
        {
            await db.query("UPDATE payments SET razorpay_payment_id = $1, razorpay_signature = $2, status = $3 WHERE razorpay_order_id = $4",
              [razorpay_payment_id, razorpay_signature, 'success', razorpay_order_id]
            )
            
            res.json(
                {
                    message: "Payment verified successfully",
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id
                }
            );
        }
        else{

            await db.query("UPDATE payments SET status = $1 WHERE razorpay_order_id = $2",
              ['failed' , razorpay_order_id]
             )
            res.status(400).json({message : "Invalid signature"});
        }      
    }catch(err)
    {
            console.error("Payment verification error:", err);
            res.status(500).json({ 
            message: "Payment verification failed",
            error: err.message 
        });
    }

});

app.listen(PORT, () =>
{
  console.log(`Server listening on  http://localhost:${PORT}`);

});
