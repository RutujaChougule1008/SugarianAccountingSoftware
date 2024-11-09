import React, { useState, useEffect, useRef } from "react";
import "../Navbar/Navbar.css";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [clickedMenu, setClickedMenu] = useState("");
  const [hoveredSubMenuItem, setHoveredSubMenuItem] = useState("");
  const navbarRef = useRef(null); 

  const handleMouseEnter = (menuName) => {
    setActiveMenu(menuName);
    if (!clickedMenu) {
      setActiveSubMenu("");
    }
  };

  const handleSubMouseEnter = (subMenuName) => {
    setActiveSubMenu(subMenuName);
  };

  const handleMouseLeave = (event) => {
    if (navbarRef.current && !navbarRef.current.contains(event.target)) {
      setActiveMenu("");
      setActiveSubMenu("");
      setHoveredSubMenuItem("");
    }
  };

  const handleClick = (menuName) => {
    if (clickedMenu === menuName) {
      setClickedMenu("");
      setActiveMenu("");
      setActiveSubMenu("");
    } else {
      setClickedMenu(menuName);
      setActiveMenu(menuName);
      setActiveSubMenu(menuName);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setActiveMenu("");
        setActiveSubMenu("");
        setClickedMenu("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogOut = () => {
    sessionStorage.clear();
    const cookies = Object.keys(Cookies.get());
    cookies.forEach(cookie => {
      Cookies.remove(cookie);
    });
  };

  return (
    <div ref={navbarRef} className="navbar" onMouseLeave={handleMouseLeave}>
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("home")}
        onClick={() => handleClick("home")}
      >
        Home
      </div>
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("company")}
        onClick={() => handleClick("company")}
      >
        Company
        {activeMenu === "company" && (
          <div className="submenu">
            <div className="submenu-item">
              <a className="submenu-item"><Link to="/create-utility">Create Company</Link></a>
            </div>
            <div className="submenu-item">
              <a className="submenu-item"><Link to="/select-company">Select Company</Link></a>
            </div>
            <div className="submenu-item">
              <a><Link to="/create-accounting-year">Create Accounting Year</Link></a>
            </div>
            <div className="submenu-item">
              <a><Link to="/select-accounting-year">Select Accounting Year</Link></a>
            </div>
          </div>
        )}
      </div>
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("master")}
        onClick={() => handleClick("master")}
      >
        Master
        {activeMenu === "master" && (
          <div className="submenu">
            <div
              className="submenu-item"
              onMouseEnter={() => handleSubMouseEnter("accountInfo")}
              onClick={() => handleClick("accountInfo")}
            >
              Account Information &nbsp; &nbsp; &#62;
              {activeSubMenu === "accountInfo" && (
                <div className="submenu1">
                  <div className="submenu-item1">
                    <a><Link to="/AccountMaster-utility">Account Master</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/customer-limits">Customer Limits</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/financial-groups-utility">Financial Groups</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a ><Link to="/city-master-utility">City Master</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/PartyUnitMaster-utility">
                      Corporate Customer Unit/Godown Declaration
                      </Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/ac-master-declaration">
                      Account Master Declaration
                      </Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/bank-details">Bank Details</Link></a>
                  </div>
                </div>
              )}
            </div>
            <div
              className="submenu-item"
              onMouseEnter={() => handleSubMouseEnter("Other_Master")}
            >
              Other Master &nbsp; &nbsp; &#62;
              {activeSubMenu === "Other_Master" && (
                <div className="submenu1">
                  <div className="submenu-item1">
                    <a><Link to="/syetem-masterutility">System Master</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/brand-master-utility">Brand Master</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/gst-rate-masterutility">GST Rate Master</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/gst-state-master-utility">GST State Master</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/hsn-asc-master">HSN or ASC Code Master</Link></a>
                  </div>
                  <div className="submenu-item1">
                    <a><Link to="/company-related-accounting-Parameter">
                      Company Related Accounting Parameter
                      </Link></a>
                  </div>
                </div>
              )}
            </div>

            <div className="submenu-item">
              <a><Link to="/eway-bill-setting">E-Way Bill Setting</Link></a>
            </div>
            <div className="submenu-item">
              <a><Link to="/company-parameter">Company Parameter</Link></a>
            </div>
            <div className="submenu-item">
              <a><Link to="/jaggery-company-parameter">Jaggery Company Parameter</Link></a>
            </div>
            <div className="submenu-item">
              <a><Link to="/whatsapp-api">WhatsApp API Integration</Link></a>
            </div>
          </div>
        )}
      </div>

      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("inward")}
        onClick={() => handleClick("inward")}
      >
        Inward
        {activeMenu === "inward" && (
          <div className="submenu">
            <div className="submenu-item">
              <a ><Link to="/sugarpurchasebill-utility">Purchase Bill</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/OtherGSTInput-utility"><Link to="/OtherGSTInput-utility">Other GST Input</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/reverse-charge"><Link to="/reverse-charge">Reverse Charge</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/cold-storage-inward"><Link to="/cold-storage-inward">Cold Storage Inward</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/sugar-sale-return-purchase-utility"><Link to="/sugar-sale-return-purchase-utility">
                Sugar Sale Return Purchase
                </Link></a>
            </div>
            <div className="submenu-item">
              <a href="/rawangi-book"><Link to="/rawangi-book">Rawangi Book</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/retail-purchase"><Link to="/retail-purchase">Retail Purchase</Link></a>
            </div>
          </div>
        )}
      </div>
      
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("transactions")}
        onClick={() => handleClick("transactions")}
      >
        Transactions
        {activeMenu === "transactions" && (
          <div className="submenu">
            <div className="submenu-item">
              <a href="/RecieptPaymentUtility"><Link to="/RecieptPaymentUtility">Receipt/Payment</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/JournalVoucher_Utility">J<Link to="/JournalVoucher_Utility">ournal Vouchar</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/utrentry-Utility"><Link to="/utrentry-Utility">UTR Entry</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/debitcreditnote-utility"><Link to="/debitcreditnote-utility">Debit/Credit Note</Link></a>
            </div>
            <div className="submenu-item">
              <a href="/multiple-sale-bill-against-single-payment">
                Multiple Sale Bill Against Single Payment
              </a>
            </div>
            <div className="submenu-item">
              <a href="/other-purchaseutility"><Link to="/other-purchaseutility">
                Other Purchase
                </Link></a>
            </div>
            <div className="submenu-item">
              <a href="/gst3b">GST3B</a>
            </div>
            <div className="submenu-item">
              <a href="/general-transaction">General Transaction</a>
            </div>
            <div className="submenu-item">
              <a href="/PaymentNote-utility">Payment Note</a>
            </div>
          </div>
        )}
      </div>
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("business-related")}
      >
        Business Related
        {activeMenu === "business-related" && (
          <div className="submenu">
            <div className="submenu-item">
              <a href="/tender-purchaseutility">Tender Purchase(Sauda Booking)</a>
            </div>
            <div className="submenu-item">
              <a href="/sauda-book-utility">Sauda Book Utility</a>
            </div>
            <div className="submenu-item">
              <a href="/delivery-order-utility">Delivery Order</a>
            </div>
            <div className="submenu-item">
              <a href="/do-information">DO Information</a>
            </div>
            <div className="submenu-item">
              <a href="/motor-memo">Motor Memo</a>
            </div>
            <div
              className="submenu-item"
              onMouseEnter={() => handleSubMouseEnter("stock_report")}
              onClick={() => {
                handleClick("stock_report");
              }}
            >
              Stock Report &nbsp; &nbsp; &#62;
              {activeSubMenu === "stock_report" && (
                <div className="submenu1">
                  <div className="submenu-item1">
                    <a href="/balance-stock">
                      Balance Stock(Millwise/Partywise)
                    </a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/register">Register</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/balance-reminder">Balance Reminder</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/gst-state-master">GST State Master</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/transport-sms">Transport SMS</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/multiple-do-print">Multiple DO Print</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/profit-loss">Profit Loss</a>
                  </div>
                </div>
              )}
            </div>
            <div className="submenu-item">
              <a href="/letter">Letter</a>
            </div>
          </div>
        )}
      </div>
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("outward")}
        onClick={() => handleClick("outward")}
      >
        Outward
        {activeMenu === "outward" && (
          <div className="submenu">
            <div className="submenu-item">
              <a href="/SaleBill-utility">Sale Bill</a>
            </div>
            <div className="submenu-item">
              <a href="/CommissionBill-utility">Commission Bill</a>
            </div>
            <div className="submenu-item">
              <a href="/retail-sale-bill">Retail Sale Bill</a>
            </div>
            <div className="submenu-item">
              <a href="/sugar-sale-return-sale-utility">Sugar Sale Return Sale</a>
            </div>
            <div className="submenu-item">
              <a href="/ServiceBill-utility">Service Bill</a>
            </div>
            <div className="submenu-item">
              <a href="/cold-storage-outward">Cold Storage Outward</a>
            </div>
            <div className="submenu-item">
              <a href="/unregister-bill">Unregister Bill</a>
            </div>
          </div>
        )}
      </div>
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("reports")}
        onClick={() => handleClick("reports")}
      >
        Reports
        {activeMenu === "reports" && (
          <div className="submenu">
            <div
              className="submenu-item"
              onMouseEnter={() => handleSubMouseEnter("ledger")}
            >
              Stock Report &nbsp; &nbsp; &#62;
              {activeSubMenu === "ledger" && (
                <div className="submenu1">
                  <div className="submenu-item1">
                    <a href="/ledger">Ledger</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/bank-book">Bank Book</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/account-master-print">Account Master Print</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/group-ledger">Group Ledger</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/broker-report">Broker Report</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/interset-statement">Interest Statement</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/day-book">Day Book (Kird)</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/cold-storage-register">Cold Storage Register</a>
                  </div>
                </div>
              )}
            </div>
            <div className="submenu-item">
              <a href="/trial-balance">Trial Balance</a>
            </div>
            <div className="submenu-item">
              <a href="/profit-loss-balance-sheet">
                Profit and Loss/ Balance Sheet
              </a>
            </div>
            <div className="submenu-item">
              <a href="/stock-book">Stock Book</a>
            </div>
            <div className="submenu-item">
              <a href="/trail-balance-screen">Trail Balance Screen</a>
            </div>
            <div className="submenu-item">
              <a href="/pending-reports">Pending Reports</a>
            </div>
            <div className="submenu-item">
              <a href="/retail-sale-register-report">
                Retail Sale Register Report
              </a>
            </div>
            <div className="submenu-item">
              <a href="/freight-register-reports">Freight Register Reports</a>
            </div>
            <div className="submenu-item">
              <a href="/partiwise-sale-bill-detail-reports">
                PartyWise Sale Bill Detail Reports
              </a>
            </div>
            <div className="submenu-item">
              <a href="/retail-sale-balance-reports">
                RetailSale Balance Reports
              </a>
            </div>
            <div className="submenu-item">
              <a href="/purchase-sale-registers">Purchase Sale Registers</a>
            </div>
            <div className="submenu-item">
              <a href="/retail-sale-reports">Retail Sale Reports</a>
            </div>
            <div className="submenu-item">
              <a href="/retail-sale-stock-book">Retail Sale Stock Book</a>
            </div>
            <div className="submenu-item">
              <a href="/multiple-sale-bill-print">Multiple Sale Bill Print</a>
            </div>
            <div className="submenu-item">
              <a href="/partywise-sale-bill-print">Partywise Sale Bill Print</a>
            </div>
            <div className="submenu-item">
              <a href="/gst-returns">GST Returns</a>
            </div>
          </div>
        )}
      </div>





      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("utilities")}
        onClick={() => handleClick("utilities")}
      >
        Utilities
        {activeMenu === "utilities" && (
          <div className="submenu">
            <div className="submenu-item">
              <a href="/departmentwise-form-selection">
                DepartmentWise Form Selection
              </a>
            </div>
            <div className="submenu-item">
              <a href="/general-info-sms">General Info Throghout SMS</a>
            </div>
            <div className="submenu-item">
              <a href="/user-creation">User Creation</a>
            </div>
            <div className="submenu-item">
              <a href="/group-user-creation">Group User Creation</a>
            </div>
            <div className="submenu-item">
              <a href="/generate-customer-login">Generate Customer Login</a>
            </div>
            <div className="submenu-item">
              <a href="/club-account">Club Account</a>
            </div>
            <div className="submenu-item">
              <a href="/upload-signature">Upload Signature</a>
            </div>
            <div className="submenu-item">
              <a href="/upload-logo">Upload Logo</a>
            </div>
            <div className="submenu-item">
              <a href="/our-office-address">Our Office Address</a>
            </div>
            <div className="submenu-item">
              <a href="/migration">Migration</a>
            </div>
            <div className="submenu-item">
              <a href="/post-date">Post Date</a>
            </div>
            <div className="submenu-item">
              <a href="/other-utility">Other Utility</a>
            </div>
          </div>
        )}
      </div>
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("gst-utilities")}
      >
        GST Utilities
      </div>
      <div
        className="nav-item"
        onMouseEnter={() => handleMouseEnter("share")}
        onClick={() => handleClick("share")}
      >
        Share
        {activeMenu === "share" && (
          <div className="submenu">
            <div
              className="submenu-item"
              onMouseEnter={() => handleSubMouseEnter("Master2")}
            >
              Master &nbsp; &nbsp; &#62;
              {activeSubMenu === "Master2" && (
                <div className="submenu1">
                  <div className="submenu-item1">
                    <a href="/script-master">Script Master</a>
                  </div>
                  <div className="submenu-item1">
                    <a href="/expiry-master">Expiry Master</a>
                  </div>
                </div>
              )}
            </div>
            <div className="submenu-item">
              <a href="/equity-purchase-sale">Equity Purchase/Sale</a>
            </div>
            <div className="submenu-item">
              <a href="/equity-register">Equity Register</a>
            </div>
            <div className="submenu-item">
              <a href="/fno-purchase-sale">FNO Purchase/Sale</a>
            </div>
            <div className="submenu-item">
              <a href="/fno-register">FNO Regisetr</a>
            </div>
            <div className="submenu-item">
              <a href="/company-parameter">Company Parameter</a>
            </div>
          </div>
        )}
      </div>
      <div className="nav-item" onMouseEnter={() => handleMouseEnter('eTender')}>
        <Link to="/eBuySugarian-user-utility" className="nav-link">eTender</Link>
      </div>
      <div className="nav-item" onClick={handleLogOut} onMouseEnter={() => handleMouseEnter('log-out')}>
        <Link to="/" className="nav-link">Log Out</Link>
      </div>
    </div>
  );
};

export default Navbar;