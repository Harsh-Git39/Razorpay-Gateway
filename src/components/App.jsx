import React,{useState, useEffect} from "react";
import Header from "./Header";
import Footer from "./Foot";
import Paypage from "./Paypage";
import Login from "./Login";
import axios from "axios";

function App()
{
   const [user ,setUser] = useState(null);
   const [loading, setLoading] = useState(true);


   useEffect(()=>
  {
        axios.get('http://localhost:3000/auth/user', { withCredentials: true })
        .then(res => 
          {
            setUser(res.data.user);
           setLoading(false); 
          })
          .catch(() =>
          {
             setUser(null);
            setLoading(false);
          }
          );
  }, []);

    if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px' }}>
        Loading...
      </div>
    );
  }

    if (!user) {
    return (
      <>
        <Header />
        <Login />  {/* Use the Login component */}
        <Footer />
      </>
    );
  }
    return (
      <>
        <Header />
        <main>
          <div className="payment-container">
            <div className="payment-info">
              <h2>Secure Payment Gateway</h2>
              <h3>Powered by HarLance Technologies</h3>
              <p>
                Experience seamless and secure payment processing with enterprise-grade 
                encryption. Built by Harsh Dalvi, a full-stack developer specializing in 
                fintech solutions and payment gateway integrations.
              </p>
              
              <div className="features">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span className="feature-text">Instant Payment Processing</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span className="feature-text">Bank-Grade Security (256-bit SSL)</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <span className="feature-text">Multi-Currency Support</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">PCI DSS Compliant</span>
                </div>
              </div>

              <div className="trust-badges">
                <span className="badge">Razorpay Certified</span>
                <span className="badge">Secure</span>
                <span className="badge">Fast</span>
                <span className="badge">Reliable</span>
              </div>
            </div>
            
            <Paypage user = {user} />
          </div>
        </main>
        <Footer />
      </>
    );
}

export default App;