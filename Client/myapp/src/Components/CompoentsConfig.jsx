// routesConfig.js
import CompanyUtility from '../Components/Company/CreateCompany/CompanyUtility';
import CreateCompany from "../Components/Company/CreateCompany/CreateCompany";
import SelectCompany from './Company/CreateCompany/SelectCompany';
import CreateAccountYearData from './Company/AccountingYear/CreateAccountingYear';
import SelectAccoungYear from './Company/AccountingYear/SelectAccountingYear';
import FinicialGroupsUtility from "./Master/AccountInformation/FinicialMasters/FinicialMasterUtility"
import FinicialMaster from "./Master/AccountInformation/FinicialMasters/FinicialMaster"
import GstStateMasterUtility from "./Master//OtherMasters/GSTStateMaster/GstStateMasterUtility"
import GstStateMaster from "./Master/OtherMasters/GSTStateMaster/GstStateMaster"
import CityMasterUtility from "./Master/AccountInformation/CityMaster/CityMasterUtility";
import CityMaster from "./Master/AccountInformation/CityMaster/CityMaster"
import BrandMasterUtility from "./Master/OtherMasters/BrandMaster/BrandMasterUtility";
import BrandMaster from "./Master/OtherMasters/BrandMaster/BrandMaster"
import GSTRateMasterUtility from "./Master/OtherMasters/GSTRateMaster/GSTRateMasterUtility"
import GSTRateMaster from './Master/OtherMasters/GSTRateMaster/GSTRateMaster';
import OtherPurchase from './Transactions/OtherPurchase/OtherPurchase';
import DeliveryOrderUtility from './BusinessRelated/DeliveryOrder/DeliveryOrderUtility';
import DeliveryOrder from './BusinessRelated/DeliveryOrder/DeliveryOrder';
import SystemMasterUtility from './Master/OtherMasters/SystemMaster/SystemMasterUtility';
import SystemMaster from './Master/OtherMasters/SystemMaster/SystemMaster';
import OtherPurchaseUtility from './Transactions/OtherPurchase/OtherPurchaseUtility';
import TenderPurchaseUtility from './BusinessRelated/TenderPurchase/TenderPurchaseUtility';
import DebitCreditNoteUtility from './Transactions/DebitCreditNote/DebitCreditNoteUtility';
import DebitCreditNote from './Transactions/DebitCreditNote/DebitCreditNote';
import PurchaseBillUtility from './Inword/SugarPurchase/SugarPurchaseBillUtility';
import SugarPurchase from './Inword/SugarPurchase/SugarPurchase';
import SaleBillUtility from './Outward/SaleBill/SaleBillUtility';
import SaleBill from './Outward/SaleBill/SaleBill';
import CommissionBill from './Outward/CommissionBill/CommissionBill';
import CommissionBillUtility from './Outward/CommissionBill/CommissionBillUtility';
import OtherGSTInput from './Inword/OtherGSTInput/OtherGSTInput';
import OtherGSTInputUtility from './Inword/OtherGSTInput/OtherGSTInputUtility'
import PartyUnitMaster from './Master/AccountInformation/PartyUnitMaster/PartyUnitMaster'
import PartyUnitMasterUtility from './Master/AccountInformation/PartyUnitMaster/PartyUnitMasterUtility';
import PaymentNote from './Transactions/PaymentNote/PaymentNote';
import PaymentNoteUtility from './Transactions/PaymentNote/PaymentNoteUtility';
import WhatsAppURLManager from './Master/WhatsAppAPIIntegration/WhatsAppURLManager';
import CompanyPrintingInfo from './Utilities/CompanyPrintingInformation/CompanyPrintingInfo';
import PostDateManager from './Utilities/PostDate/PostDate';
import CompanyParameters from './Master/CompanyParamter/CompanyParameters';
import AccountMaster from './Master/AccountInformation/AccountMaster/AccountMaster';
import AccountMasterUtility from './Master/AccountInformation/AccountMaster/AccountMasterUtility';
import EBuySugarianUserUtility from './EBuySugarian/EBuySugarinUser/EBuySugarianUserUtility';
import EBuySugarAccountMasterUtility from './EBuySugarian/EBuySugarinUser/EBuySugarAccountMasterUtility';
import DeliveryOredrUtility from './BusinessRelated/DeliveryOrder/DeliveryOrderUtility';
import SugarSaleReturnPurchase from './Inword/SugarSaleReturnPurchase/SugarSaleReturnPurchase';
import SugarSaleReturnPurchaseUtility from './Inword/SugarSaleReturnPurchase/SugarSaleReturnPurchaseUtility';
import TenderPurchase from './BusinessRelated/TenderPurchase/TenderPurchase';
import SugarSaleReturnSale from './Outward/SugarSaleReturnSale/SugarSaleReturnSale';
import PendingDO from './BusinessRelated/DeliveryOrder/PendingDOUtility'
import ServiceBill from './Outward/ServiceBill/ServiceBill'
import ServiceBillUtility from './Outward/ServiceBill/ServiceBillUtility'
import UserCreationWithPermission from './Utilities/UserCreationWithPermission/UserCreationWithPermission.jsx';
import Letter from './BusinessRelated/Letter/Letter.jsx';
import LetterUtility from './BusinessRelated/Letter/LetterUtility.jsx';

const routes = [
  {
    path: '/create-utility',
    element: CompanyUtility
  },
  {
    path: '/create-company',
    element: CreateCompany
  },
  {
    path: '/select-company',
    element: SelectCompany
  },
  {
    path: '/create-accounting-year',
    element: CreateAccountYearData
  },
  {
    path: '/select-accounting-year',
    element: SelectAccoungYear
  },
  {
    path: '/financial-groups-utility',
    element: FinicialGroupsUtility
  },
  {
    path: '/financial-groups',
    element: FinicialMaster
  },
  //GST StateMaster Routes
  {
    path: '/gst-state-master-utility',
    element: GstStateMasterUtility
  },
  {
    path: '/gst-state-master',
    element: GstStateMaster
  },
  {
    path: '/city-master-utility',
    element: CityMasterUtility
  },
  {
    path: '/city-master',
    element: CityMaster
  },
  {
    path: '/brand-master-utility',
    element: BrandMasterUtility
  },
  {
    path: '/brand-master',
    element: BrandMaster
  },
  {
    path: '/gst-rate-masterutility',
    element: GSTRateMasterUtility
  },
  {
    path: '/gst-ratemaster',
    element: GSTRateMaster
  },
  {
    
    path: '/other-purchaseutility',
    element: OtherPurchaseUtility
  },
  {
    
    path: '/other-purchase',
    element: OtherPurchase
  },
{
  path: '/delivery-order-utility',
  element: DeliveryOrderUtility
},
{
  path: '/delivery-order',
  element: DeliveryOrder
},
{
  path: '/syetem-masterutility',
  element: SystemMasterUtility 
},
{
  path: '/syetem-master',
  element: SystemMaster 
},
 //Tender Routes
{
  path: '/tender-purchaseutility',
  element: TenderPurchaseUtility 
},
{
  path: '/tender_head',
  element: TenderPurchase

},
 //Debit Credit Note Routes
{
  path: '/debitcreditnote-utility',
  element: DebitCreditNoteUtility 
},
{
  path: '/debitcreditnote',
  element: DebitCreditNote 
},
//purchase bill
{
  path: 'sugarpurchasebill-utility',
  element: PurchaseBillUtility 
},
{
  path: 'sugarpurchasebill',
  element: SugarPurchase 
},

//SaleBill
{
  path: '/sale-bill',
  element: SaleBill 
},
{
  path: '/SaleBill-utility',
  element: SaleBillUtility 
},

//CommissionBill
{
  path: '/commission-bill',
  element: CommissionBill 
},

{
  path: '/CommissionBill-utility',
  element: CommissionBillUtility
},

//ServiceBill
{
  path: '/service-bill',
  element: ServiceBill 
},

//OtherGSTInput
{
  path: '/other-gst-input',
  element: OtherGSTInput 
},
{
  path:'/OtherGSTInput-utility',
  element: OtherGSTInputUtility
},
//Party Unit Master
{
  path:'/corporate-customer-limit',
  element: PartyUnitMaster
},
{
  path:'/PartyUnitMaster-utility',
  element: PartyUnitMasterUtility
},
//PaymentNote
{
  path:'/payment-note',
  element: PaymentNote
},
{
  path: '/PaymentNote-utility',
  element: PaymentNoteUtility
},
//WhatsApp API Integration
{
  path:'/whatsapp-api',
  element: WhatsAppURLManager
},
//Our Office Address
{
  path:'/our-office-address',
  element: CompanyPrintingInfo
},
//Post Date
{
  path: '/post-date',
  element: PostDateManager
},

//Company Parameters
{
  path: '/company-parameter',
  element: CompanyParameters
},
//Account Master
{
  path: '/account-master',
  element: AccountMaster
},
{
  path: '/AccountMaster-utility',
  element: AccountMasterUtility
},
//Delivery Order
{
  path: '/delivery-order',
  element: DeliveryOrder
},
{
  path: '/delivery-order-utility',
  element: DeliveryOredrUtility
},

//Pending DO
{
  path: '/pending-do',
  element: PendingDO
},
{
  path: '/sugar-sale-return-purchase',
  element: SugarSaleReturnPurchase
},
{
  path: '/sugar-sale-return-purchase-utility',
  element: SugarSaleReturnPurchaseUtility
},

//SugarSaleReturnSale
{
  path: '/sugar-sale-return-sale',
  element: SugarSaleReturnSale
},

//ServiceBill Utility
{
  path:'/ServiceBill-utility',
  element: ServiceBillUtility
},

//ServiceBill
{
  path:'/service-bill',
  element: ServiceBill
},

//
{
  path:'/user-creation',
  element: UserCreationWithPermission
}
,
//Letter
{
  path:'/letter',
  element: LetterUtility
}
,

{
  path:'/letter-data',
  element: Letter
}
,
//eBuySugar
{
  path: '/eBuySugarian-user-utility',
  element: EBuySugarianUserUtility
},
{
  path: '/eBuySugarian-AcMaster-utility',
  element: EBuySugarAccountMasterUtility
}
];

export default routes;
