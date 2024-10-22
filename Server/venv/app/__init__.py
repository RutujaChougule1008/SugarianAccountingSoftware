# app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Set the database URI using environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pymssql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure email settings
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME') 
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD') 
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER') 

db = SQLAlchemy(app)

# Initialize JWTManager with your app 
app.config['JWT_SECRET_KEY'] = 'ABCEFGHIJKLMNOPQRSTUVWXYZ'
jwt = JWTManager(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER')

# Ensure the upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# The rest of your application configuration and routes

# Import controllers and helpers
from app.Controllers.Company.CompanyCreation.CompanyCreation import *
from app.Controllers.LoginAndCompanyList.Login.LoginController import *
from app.Controllers.LoginAndCompanyList.CompanyList.CompanyList import *
from app.Controllers.Company.AccountingYear.AccountingYear import *
from app.Controllers.LoginAndCompanyList.UserLogin.UserLoginController import *
from app.Controllers.Masters.AccountInformation.FinicialMastersController import *
from app.Controllers.Masters.OtherMasters.GstStateMasterController import *
from app.Controllers.Masters.AccountInformation.CityMasterController import *
from app.Controllers.Masters.OtherMasters.BrandMasterController import *
from app.Controllers.Masters.OtherMasters.GstRateMasterController import *
from app.Controllers.Transactions.OtherPurchaseController import *
from app.Controllers.BusinessRelated.DeliveryOrder.DeliveryOrderController import *
from app.Controllers.Masters.OtherMasters.SysytemMasterController import *
from app.Controllers.BusinessRelated.TenderPurchase.TenderPurchaseController import *
from app.Controllers.Transactions.DebitCreditNote.DebitCreditNoteController import *
from app.Controllers.Reports.GLedger.GLedgerController import *
from app.Controllers.Inword.PurchaseBill.PurchaseBillController import *
from app.Controllers.Outword.SaleBill.SaleBillController import *
from app.Controllers.Outword.CommissionBill.CommissionBillController import *
from app.Controllers.Inword.OtherGSTInput.OtherGSTInputController import *
from app.Controllers.Masters.CompanyParameters.CompanyParameterController import *
from app.Controllers.Masters.WhatsAppURL.WhatsAppURLController import *
from app.Controllers.Transactions.PaymentNote.PaymentNoteController import *
from app.Controllers.BusinessRelated.Letter.LetterController import *
from app.Controllers.Outword.UnregisterBill.UnregisterBillController import *
from app.Controllers.Utilities.PostDate.PostDateController import *
from app.Controllers.Masters.AccountInformation.PartyUnitMaster.PartyUnitMasterController import *
from app.Controllers.Utilities.CompanyPrintingInfo.CompanyPrintingInfoController import *
from app.Controllers.Inword.SugarSaleReturnPurchase.SugarSaleReturnPurchaseController import *
from app.Controllers.Outword.SugarSaleReturnSale.SugarSaleReturnSaleController import *
from app.Controllers.Outword.ServiceBill.ServiceBillController import *
from app.Controllers.Transactions.ReceiptPayment.ReceiptPaymentController import *
from app.Controllers.Transactions.UTR.UTREntryController import *
from app.Controllers.BusinessRelated.DeliveryOrder.DeliveryOrderController import *
from app.Controllers.BusinessRelated.PendingDO.PendingDOController import *
from app.Controllers.Utilities.UserCreationWithPermission.UserCreationwithPermissionController import *

from app.Helpers.AccountMasterHelp import *
from app.Helpers.CityMasterHelp import *
from app.Helpers.GroupMasterHelp import *
from app.Helpers.GstRateMasterHelp import *
from app.Helpers.SystemMasterHelp import *
# from app.Helpers.GstStateMasterHelp import *
from app.Helpers.BrandMasterHelp import *
# from app.Helpers.TenderUtilityHelp import *
from app.Helpers.CarporateHelp import *
from app.Helpers.purcnohelp import *
from app.Helpers.PurcNoFromReturnPurchaseHelp import *
from app.Helpers.PurcNoFromReturnSale import *

#common API Routes
from app.Common.CommonSugarPurchaseStatusCheck import *


# other routes
from app.Controllers.BusinessRelated.CorporateSale.CorporateSaleController import *
from app.Controllers.Masters.AccountInformation.AccountMaster.AccountMasterController import *


#EBuySugar Routes
from app.Controllers.EBuySugarian.EBuySugarUser.EBuySugarUserControllers import *

#Pending Reports Routes
from app.Reports.PendingReports.TenderWiseSauda import *

upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

# Ensure the upload folder exists
if not os.path.exists(upload_folder):
    os.makedirs(upload_folder)


if __name__ == '__main__':
    socketio.run(app, host='localhost', port=8080, debug=True)
