import React from "react";

function Foot()
{
    return (
      <div className="Footer-nav">
        <div>
          <h1 className="footer">HarrLance</h1>
          <p className="footer-description">
            Professional payment gateway solutions built with cutting-edge technology. 
            Developed by Harsh Dalvi - Full Stack Developer specializing in secure 
            fintech applications and seamless payment integrations.
          </p>
          <footer className="footerPolicy">
            <a href="https://merchant.razorpay.com/policy/RloUbZnQpiBsJS/shipping">
              Shipping Policy
            </a>
            <a href="https://merchant.razorpay.com/policy/RloUbZnQpiBsJS/terms">
              Terms & Conditions
            </a>
            <a href="https://merchant.razorpay.com/policy/RloUbZnQpiBsJS/refund">
              Cancellation & Refunds
            </a>
            <a href="https://merchant.razorpay.com/policy/RloUbZnQpiBsJS/privacy">
              Privacy Policy
            </a>
          </footer>
          <div className="footer-copyright">
            © 2024 HarrLance Technologies. All rights reserved. | Powered by Razorpay
          </div>
        </div>
      </div>
    );
}

export default Foot;