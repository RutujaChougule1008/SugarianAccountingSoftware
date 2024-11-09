import traceback
from flask import Flask, jsonify, request
from app import app, db
from app.models.BusinessReleted.DeliveryOrder.DeliveryOrderModels import DeliveryOrderHead,DeliveryOrderDetail
from app.models.Reports.GLedeger.GLedgerModels import Gledger
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError 
from sqlalchemy import func
import os
import requests
import logging
from app.utils.CommonGLedgerFunctions import fetch_company_parameters,get_accoid,getSaleAc,get_acShort_Name
from app.models.BusinessReleted.TenderPurchase.TenderPurchaseModels import TenderHead,TenderDetails
import asyncio
import aiohttp

API_URL= os.getenv('API_URL')

from app.models.BusinessReleted.DeliveryOrder.DeliveryOrderSchema import DeliveryOrderHeadSchema, DeliveryOrderDetailSchema

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
async def async_post(url, params=None, json=None):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, params=params, json=json) as response:
            return await response.json(), response.status

async def async_put(url, params=None, json=None):
    async with aiohttp.ClientSession() as session:
        async with session.put(url, params=params, json=json) as response:
            return await response.json(), response.status

TASK_DETAILS_QUERY = '''
SELECT        dbo.nt_1_deliveryorder.mill_code, dbo.nt_1_deliveryorder.transport, dbo.nt_1_deliveryorder.GETPASSCODE, dbo.nt_1_deliveryorder.SaleBillTo, dbo.nt_1_deliveryorder.mc, dbo.nt_1_deliveryorder.gp, 
                         dbo.nt_1_deliveryorder.st, dbo.nt_1_deliveryorder.sb, dbo.nt_1_deliveryorder.tc, mill.Ac_Code AS millacode, mill.Ac_Name_E AS millname, mill.accoid AS millacid, shipto.accoid AS shiptoacid, shipto.Ac_Code AS shiptoaccode, 
                         salebillto.accoid AS salebillacid, salebillto.Ac_Code AS salebillaccode, salebillto.Ac_Name_E AS salebillname, transport.accoid AS transportacid, transport.Ac_Code AS transportaccode, transport.Ac_Name_E AS transportname, 
                         getpass.accoid AS getpassacid, getpass.Ac_Code AS getpassAccode, getpass.Ac_Name_E AS getpassname, dbo.nt_1_systemmaster.System_Code AS Item_Code, dbo.nt_1_systemmaster.System_Name_E AS itemname, 
                         dbo.nt_1_deliveryorder.ic, dbo.nt_1_deliveryorder.itemcode, dbo.nt_1_systemmaster.systemid, dbo.nt_1_deliveryorder.gstid, gstrate.gstid AS gst_Id, dbo.nt_1_deliveryorder.GstRateCode, gstrate.Doc_no AS gstdocno, 
                         gstrate.Rate AS Gstrate, dbo.nt_1_deliveryorder.TDSAc, dbo.nt_1_deliveryorder.TDSAcId, tdsac.accoid, tdsac.Ac_Code AS tdsaccode, tdsac.Ac_Name_E AS tdsacname, dbo.nt_1_deliveryorder.bk, dbo.nt_1_deliveryorder.broker, 
                         broker.accoid AS brokerid, broker.Ac_Code AS brokeraccode, broker.Ac_Name_E AS brokername, dbo.nt_1_deliveryorder.CashDiffAc, dbo.nt_1_deliveryorder.CashDiffAcId, cashdiffac.Ac_Code AS cashdiffaccode, 
                         cashdiffac.Ac_Name_E AS cashdiffacname, cashdiffac.accoid AS Expr1, dbo.nt_1_deliveryorder.brandcode, dbo.Brand_Master.Code, dbo.Brand_Master.Marka AS brandname, dbo.nt_1_dodetails.Bank_Code, 
                         bank.accoid AS bankacid, bank.Ac_Code AS bankaccode, bank.Ac_Name_E AS bankname, dbo.nt_1_dodetails.detail_Id, dbo.nt_1_dodetails.ddType, dbo.nt_1_dodetails.Narration, dbo.nt_1_dodetails.Amount, 
                         dbo.nt_1_dodetails.UTR_NO, dbo.nt_1_dodetails.DO_No, dbo.nt_1_dodetails.UtrYearCode, dbo.nt_1_dodetails.LTNo, dbo.nt_1_dodetails.doid, dbo.nt_1_dodetails.dodetailid, dbo.nt_1_dodetails.bc, 
                         dbo.nt_1_dodetails.utrdetailid, dbo.nt_1_dodetails.UtrCompanyCode, dbo.nt_1_deliveryorder.Vasuli_Ac, dbo.nt_1_deliveryorder.va, vasuliac.accoid AS vasuliacid, vasuliac.Ac_Code AS vasuliaccode, 
                         vasuliac.Ac_Name_E AS vasuliacname, dbo.nt_1_deliveryorder.MillGSTStateCode, millstatecode.State_Name AS millstatename, millstatecode.State_Code AS millstatecode, dbo.nt_1_deliveryorder.VoucherbyGstStateCode, 
                         voucherbystatecode.State_Code AS voucherbystatecode, voucherbystatecode.State_Name AS vaoucherbystatename, dbo.nt_1_deliveryorder.SalebilltoGstStateCode, salebillstatecode.State_Code AS salebilltostatecode, 
                         salebillstatecode.State_Name AS salebilltostatename, dbo.nt_1_deliveryorder.TransportGSTStateCode, transportstatecode.State_Code AS transportstatecode, transportstatecode.State_Name AS transportstatename, 
                         dbo.nt_1_deliveryorder.GetpassGstStateCode, getpassstatename.State_Code AS getpassstatecode, getpassstatename.State_Name AS getpassstatename, voucherby.Ac_Code AS voucherbyaccode, 
                         voucherby.Ac_Name_E AS voucherbyname, dbo.nt_1_deliveryorder.vb, dbo.nt_1_deliveryorder.voucher_by, voucherby.accoid AS voucherbyacic, dbo.nt_1_deliveryorder.docd, DO.accoid AS DOaccodeid, 
                         DO.Ac_Code AS DOacCode, DO.Ac_Name_E AS DOName, dbo.nt_1_deliveryorder.DO, dbo.nt_1_deliveryorder.MemoGSTRate, memogstrate.Doc_no AS memogstdocno, memogstrate.Rate AS memorategst, 
                         gstrate.GST_Name AS gstratename, dbo.nt_1_tender.AutoPurchaseBill
FROM            dbo.Brand_Master RIGHT OUTER JOIN
                         dbo.nt_1_accountmaster AS vasuliac RIGHT OUTER JOIN
                         dbo.nt_1_accountmaster AS salebillto RIGHT OUTER JOIN
                         dbo.nt_1_deliveryorder ON salebillto.accoid = dbo.nt_1_deliveryorder.sb LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS transport ON dbo.nt_1_deliveryorder.tc = transport.accoid LEFT OUTER JOIN
                         dbo.nt_1_tender ON dbo.nt_1_deliveryorder.company_code = dbo.nt_1_tender.Company_Code AND dbo.nt_1_deliveryorder.purc_no = dbo.nt_1_tender.Tender_No LEFT OUTER JOIN
                         dbo.nt_1_gstratemaster AS gstrate ON dbo.nt_1_deliveryorder.company_code = gstrate.Company_Code AND dbo.nt_1_deliveryorder.GstRateCode = gstrate.Doc_no LEFT OUTER JOIN
                         dbo.nt_1_gstratemaster AS memogstrate ON dbo.nt_1_deliveryorder.company_code = memogstrate.Company_Code AND dbo.nt_1_deliveryorder.MemoGSTRate = memogstrate.Doc_no LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS DO ON dbo.nt_1_deliveryorder.docd = DO.accoid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS voucherby ON dbo.nt_1_deliveryorder.vb = voucherby.accoid LEFT OUTER JOIN
                         dbo.gststatemaster AS getpassstatename ON dbo.nt_1_deliveryorder.GetpassGstStateCode = getpassstatename.State_Code LEFT OUTER JOIN
                         dbo.gststatemaster AS transportstatecode ON dbo.nt_1_deliveryorder.TransportGSTStateCode = transportstatecode.State_Code LEFT OUTER JOIN
                         dbo.gststatemaster AS salebillstatecode ON dbo.nt_1_deliveryorder.SalebilltoGstStateCode = salebillstatecode.State_Code LEFT OUTER JOIN
                         dbo.gststatemaster AS voucherbystatecode ON dbo.nt_1_deliveryorder.VoucherbyGstStateCode = voucherbystatecode.State_Code LEFT OUTER JOIN
                         dbo.gststatemaster AS millstatecode ON dbo.nt_1_deliveryorder.MillGSTStateCode = millstatecode.State_Code ON vasuliac.accoid = dbo.nt_1_deliveryorder.va LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS bank RIGHT OUTER JOIN
                         dbo.nt_1_dodetails ON bank.accoid = dbo.nt_1_dodetails.bc ON dbo.nt_1_deliveryorder.doid = dbo.nt_1_dodetails.doid ON dbo.Brand_Master.Code = dbo.nt_1_deliveryorder.brandcode LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS cashdiffac ON dbo.nt_1_deliveryorder.CashDiffAcId = cashdiffac.accoid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS broker ON dbo.nt_1_deliveryorder.bk = broker.accoid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS tdsac ON dbo.nt_1_deliveryorder.TDSAcId = tdsac.accoid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS mill ON dbo.nt_1_deliveryorder.mc = mill.accoid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS shipto ON dbo.nt_1_deliveryorder.st = shipto.accoid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS getpass ON dbo.nt_1_deliveryorder.gp = getpass.accoid LEFT OUTER JOIN
                         dbo.nt_1_systemmaster ON dbo.nt_1_deliveryorder.ic = dbo.nt_1_systemmaster.systemid 
                         WHERE        (dbo.nt_1_systemmaster.System_Type = 'I') and dbo.nt_1_deliveryorder.doid=:doid
'''

def format_dates(task):
    return {
        
        "doc_date": task.doc_date.strftime('%Y-%m-%d') if task.doc_date else None,
        "Purchase_Date": task.Purchase_Date.strftime('%Y-%m-%d') if task.Purchase_Date else None,
        "mill_inv_date": task.mill_inv_date.strftime('%Y-%m-%d') if task.mill_inv_date else None,
        "newsbdate": task.newsbdate.strftime('%Y-%m-%d') if task.newsbdate else None,
        "EwayBillValidDate": task.EwayBillValidDate.strftime('%Y-%m-%d') if task.EwayBillValidDate else None,
        "Do_DATE": task.Do_DATE.strftime('%Y-%m-%d') if task.Do_DATE else None,
        "reached_date": task.reached_date.strftime('%Y-%m-%d') if task.reached_date else None,
        "reached_date": task.reached_date.strftime('%Y-%m-%d') if task.reached_date else None,

    }

# Define schemas
task_head_schema = DeliveryOrderHeadSchema()
task_head_schemas = DeliveryOrderHeadSchema(many=True)

task_detail_schema = DeliveryOrderDetailSchema()
task_detail_schemas = DeliveryOrderDetailSchema(many=True)

# Get data from both tables SaleBill and SaleBilllDetail
@app.route(API_URL+"/getdata-DO", methods=["GET"])
def getdata_DO():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400

        query = ('''SELECT        dbo.nt_1_deliveryorder.doc_no, dbo.nt_1_deliveryorder.doc_date, dbo.nt_1_deliveryorder.purc_no, dbo.nt_1_deliveryorder.tenderdetailid, dbo.nt_1_deliveryorder.quantal, dbo.nt_1_deliveryorder.sale_rate, 
                         dbo.nt_1_deliveryorder.Tender_Commission, dbo.nt_1_deliveryorder.tran_type, dbo.nt_1_deliveryorder.truck_no, dbo.nt_1_deliveryorder.SB_No, dbo.nt_1_deliveryorder.EWay_Bill_No, dbo.nt_1_deliveryorder.doid, 
                         mill.Short_Name AS millName, transport.Short_Name AS transportName, saleBillTo.Short_Name AS saleBillName, shipTo.Short_Name AS shipToName, dbo.nt_1_deliveryorder.Delivery_Type, 
                         shipTo.cityname AS shipToCityName, saleBillTo.cityname AS sbCityName, dbo.nt_1_deliveryorder.MM_Rate
FROM            dbo.nt_1_deliveryorder INNER JOIN
                         dbo.nt_1_accountmaster AS mill ON dbo.nt_1_deliveryorder.mc = mill.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS saleBillTo ON dbo.nt_1_deliveryorder.sb = saleBillTo.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS shipTo ON dbo.nt_1_deliveryorder.st = shipTo.accoid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS transport ON dbo.nt_1_deliveryorder.tc = transport.accoid
                 where dbo.nt_1_deliveryorder.company_code = :company_code and dbo.nt_1_deliveryorder.Year_Code = :year_code
                                 '''
            )
        additional_data = db.session.execute(text(query), {"company_code": company_code, "year_code": year_code})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
        
        
    

        # Convert additional_data_rows to a list of dictionaries
        all_data = [dict(row._mapping) for row in additional_data_rows]

        for data in all_data:
            if 'doc_date' in data:
                data['doc_date'] = data['doc_date'].strftime('%Y-%m-%d') if data['doc_date'] else None

        # Prepare response data 
        response = {
            "all_data": all_data
        }
        # If record found, return it
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# # We have to get the data By the Particular doc_no AND tran_type
@app.route(API_URL+"/DOByid", methods=["GET"])
def getDOByid():
    try:
        # Extract taskNo from request query parameters
        doc_no = request.args.get('doc_no')
        
        # Extract company_code from query parameters
        company_code = request.args.get('company_code')
        Year_Code = request.args.get('Year_Code')
        if company_code is None or Year_Code is None or doc_no is None:
            return jsonify({'error': 'Missing company_code Or Year_Code parameter'}), 400

        try:
            company_code = int(company_code)
            Year_Code = int(Year_Code)
        except ValueError:
            return jsonify({'error': 'Invalid company_code parameter'}), 400

        # Use SQLAlchemy to find the record by Task_No
        DO_head = DeliveryOrderHead.query.filter_by(doc_no=doc_no,company_code=company_code,Year_Code=Year_Code).first()

        newtaskid = DO_head.doid
        
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"doid": newtaskid})
       
        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
      
        # Extracting category name from additional_data
        last_head_data = {column.name: getattr(DO_head, column.name) for column in DO_head.__table__.columns}
        last_head_data.update(format_dates(DO_head))

       


        # Convert additional_data_rows to a list of dictionaries
        last_details_data = [dict(row._mapping) for row in additional_data_rows]
        
        # Prepare response data
        response = {
            "last_head_data": last_head_data,
            "last_details_data": last_details_data
        }
        # If record found, return it
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500



#Insert Record and Gldger Effects of DebitcreditNote and DebitcreditNoteDetail

@app.route(API_URL + "/insert-DeliveryOrder", methods=["POST"])
async def insert_DeliveryOrder():
    def get_max_doc_no():
        return db.session.query(func.max(DeliveryOrderHead.doc_no)).scalar() or 0
 
    def create_gledger_entry(data, amount, drcr, ac_code, accoid,narration,DRCR_HEAD,ordercode):
        return {
            "TRAN_TYPE": data['tran_type'],
            "DOC_NO": new_doc_no,
            "DOC_DATE": data['doc_date'],
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": headData['company_code'],
            "YEAR_CODE": data['Year_Code'],
            "ORDER_CODE": 12,
            "DRCR": drcr,
            "UNIT_Code": 0,
            "NARRATION": narration,
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 1,
            "SORT_TYPE": data['tran_type'],
            "SORT_NO": new_doc_no,
            "vc": 0,
            "progid": 0,
            "tranid": 0,
            "saleid":0,
            "ac": accoid
        }

    def add_gledger_entry(entries, data, amount, drcr, ac_code, accoid,narration,DRCR_HEAD,ordercode):
        if amount != 0:
            entries.append(create_gledger_entry(data, amount, drcr, ac_code, accoid,narration,DRCR_HEAD,ordercode))
            
    try:
        data = request.get_json()
        new_sale_data= data['headData']
        headData = new_sale_data.copy()
        detailData = data['detailData']

       
        logger.info("Fetched company parameters: %s", headData)
        max_doc_no = get_max_doc_no()

        if max_doc_no is None:
            max_doc_no = 1
        else:
            new_doc_no = max_doc_no + 1
        
        
        headData['doc_no'] = new_doc_no
        
        remove_sale_data = ['TaxableAmountForSB','cgstrate','sgstrate','igstrate','cgstamt',
                            'sgstamt','igstamt','SaleDetail_Rate','SB_freight','SB_SubTotal','SB_Less_Frt_Rate',
                            'TotalGstSaleBillAmount','Roundoff','SBTCSAmt','Net_Payble','SBTDSAmt','save' ,'sale',
                            'item_Amount','SB_Ac_Code','SB_Unit_Code','PS_CGSTAmount','PS_SGSTAmount','PS_IGSTAmount','PS_CGSTRATE',
                            'PS_SGSTRATE','PS_IGSTRATE','TOTALPurchase_Amount','PSTCS_Amt','PSTDS_Amt','PSNetPayble','PS_SelfBal','PS_amount','lblgetpasscodename',
                            'lblvoucherByname','Gst_Rate','AutopurchaseBill','LV_CGSTAmount','LV_SGSTAmount','LV_IGSTAmount','LV_TotalAmount',
                            'LV_TCSRate','LV_NETPayble','LV_TCSAmt','LV_TDSRate','LV_TDSAmt','LV_Igstrate','LV_Cgstrate','LV_taxableamount',
                            'LV_Sgstrate','LV_Commision_Amt','LV_tender_Commision_Amt','gstratename','Gstrate','lblitemname',
                            'newbroker','lblbrokername']
    

        for key in remove_sale_data:
            if key in headData:
                del headData[key]


        
        print('new_head',headData)
        print("Traceback",traceback.format_exc())
        new_head = DeliveryOrderHead(**headData)
        


        db.session.add(new_head)
        
        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []
      
        for item in detailData:
            item['doc_no'] = new_doc_no
            item['doid'] = new_head.doid
            
            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    new_detail = DeliveryOrderDetail(**item)
                    new_head.details.append(new_detail)
                    createdDetails.append(new_detail)
                    logger.info("Added new detail: %s", new_detail)

                elif item['rowaction'] == "update":
                    dodetailid = item['dodetailid']
                    update_values = {k: v for k, v in item.items() if k not in ('dodetailid', 'rowaction', 'doid')}
                    db.session.query(DeliveryOrderDetail).filter(DeliveryOrderDetail.dodetailid == dodetailid).update(update_values)
                    updatedDetails.append(dodetailid)
                    logger.info("Updated detail with ID %s: %s", dodetailid, update_values)

                elif item['rowaction'] == "delete":
                    dodetailid = item['dodetailid']
                    detail_to_delete = db.session.query(DeliveryOrderDetail).filter(DeliveryOrderDetail.dodetailid == dodetailid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deletedDetailIds.append(dodetailid)
                        logger.info("Deleted detail with ID %s", dodetailid)

         

        db.session.commit()
        logger.info("Head and details committed to the database")
              
     
       
        company_parameters = fetch_company_parameters(headData['company_code'], headData['Year_Code'])
        
        getpasscode=headData['GETPASSCODE']
        selfac= company_parameters.SELF_AC

        
        gledger_entries = []

        vasuli_amount1 = float(headData.get('amount', 0) or 0)
        vasuli_amount1=float(headData.get('vasuli_amount1', 0) or 0)
        vasuli_amount=float(headData.get('vasuli_amount', 0) or 0)
        TDSAc = headData['TDSAc']
        TDSAmt = float(headData.get('TDSAmt', 0) or 0)
        TDSCut = headData['TDSCut']
        transport = headData['transport']
        Memo_Advance =float(headData.get('Memo_Advance', 0) or 0)
        MemoGstRate =headData['MemoGSTRate']
        ordercode=0
        if TDSCut =="N" :
            transporttdsac=transport
        else:
            transporttdsac=company_parameters.TransportTDS_AcCut
        
        if getpasscode != selfac :
            if vasuli_amount1 != 0:
                ordercode=ordercode+1
                GETPASSCODE = headData['GETPASSCODE']
                accoid = get_accoid(GETPASSCODE,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount1, "D", GETPASSCODE, accoid,"",0,ordercode)
                logger.info("Added gledger entry for vasuli_amount1: %s", vasuli_amount1)

                ordercode=ordercode+1
                Vasuli_Ac = headData['Vasuli_Ac']
                accoid = get_accoid(Vasuli_Ac,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount1, "D", Vasuli_Ac, accoid,"",9999971,ordercode)
                logger.info("Added gledger entry for Vasuli_Ac: %s", Vasuli_Ac)

                
            if TDSAc != 0 :      
                if TDSAmt != 0 :
                    ordercode=ordercode+1
                    accoid = get_accoid(TDSAc,headData['company_code'])
                    add_gledger_entry(gledger_entries, headData, TDSAmt, "C", TDSAc, accoid,"",9999971,ordercode)
                    logger.info("Added gledger entry for TDSAc: %s", TDSAc)
                    ordercode=ordercode+1
                    accoid = get_accoid(transporttdsac,headData['company_code'])
                    add_gledger_entry(gledger_entries, headData, TDSAmt, "D", transporttdsac, accoid,"",transporttdsac,ordercode)
                    
                   
                 
            if Memo_Advance!=0 :
                 ordercode=ordercode+1
                 accoid = get_accoid(transport,headData['company_code'])
                 add_gledger_entry(gledger_entries, headData, Memo_Advance, "C", transport, accoid,"",transport,ordercode)
                 
                 
                 ordercode=ordercode+1
                 Freight_Ac=company_parameters.Freight_Ac
                 accoid = get_accoid(Freight_Ac,headData['company_code'])
                 add_gledger_entry(gledger_entries, headData, Memo_Advance, "D", Freight_Ac, accoid,"",Freight_Ac,ordercode)
                 
                 if MemoGstRate!=0:
                     RCMCGST=float(headData.get('RCMCGSTAmt', 0) or 0)
                     RCMSGST=float(headData.get('RCMSGSTAmt', 0) or 0)
                     RCMIGST=float(headData.get('RCMIGSTAmt', 0) or 0)

                     if RCMCGST >0:
                        ordercode=ordercode+1
                        CGST_RCM_Ac=company_parameters.CGST_RCM_Ac
                        accoid = get_accoid(CGST_RCM_Ac,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMCGST, "D", CGST_RCM_Ac, accoid,"",headData['transport'],ordercode)
                        
                        ordercode=ordercode+1
                        CCGSTAc=company_parameters.CGSTAc
                        accoid = get_accoid(CCGSTAc,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMCGST, "C", headData['transport'], accoid,"", headData['transport'],ordercode)
                        
                     if RCMSGST >0:
                        ordercode=ordercode+1
                        SGST_RCM_Ac=company_parameters.SGST_RCM_Ac
                        accoid = get_accoid(SGST_RCM_Ac,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMSGST, "D", SGST_RCM_Ac, accoid,"",headData['transport'],ordercode)
                        
                        ordercode=ordercode+1
                        CCGSTAc=company_parameters.SGSTAc
                        accoid = get_accoid(CCGSTAc,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMSGST, "C", headData['transport'], accoid,"", headData['transport'],ordercode)
                        
                     if RCMIGST >0:
                        ordercode=ordercode+1
                        IGST_RCM_Ac=company_parameters.IGST_RCM_Ac
                        accoid = get_accoid(IGST_RCM_Ac,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMIGST, "D", IGST_RCM_Ac, accoid,"",headData['transport'],ordercode)
                        
                        ordercode=ordercode+1
                        SCGSTAc=company_parameters.IGSTAc
                        accoid = get_accoid(SCGSTAc,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMIGST, "C", headData['transport'], accoid,"", headData['transport'],ordercode)
              
            if vasuli_amount!=0:
                ordercode=ordercode+1
                accoid = get_accoid(transport,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount, "D", transport, accoid,"",transport,ordercode)
                ordercode=ordercode+1
            
                accoid = get_accoid(1,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount, "C", transport, accoid,"",transport,ordercode)
            
        else:
            if TDSAc!=0 :      
                if TDSAmt!=0 :
                    ordercode=ordercode+1
                    accoid = get_accoid(TDSAc,headData['company_code'])
                    add_gledger_entry(gledger_entries, headData, TDSAmt, "C", TDSAc, accoid,"",9999971,ordercode)

                    ordercode=ordercode+1
                    accoid = get_accoid(transporttdsac,headData['company_code'])
                    add_gledger_entry(gledger_entries, headData, TDSAmt, "D", transporttdsac, accoid,"",transporttdsac,ordercode)
             
            if vasuli_amount!=0:
                ordercode=ordercode+1
                accoid = get_accoid(transport,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount, "D", transport, accoid,"",transport,ordercode)

                ordercode=ordercode+1
                accoid = get_accoid(1,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount, "C", 1, accoid,"",transport,ordercode)
            
            if Memo_Advance!=0 :
                 ordercode=ordercode+1
                 accoid = get_accoid(transport,headData['company_code'])
                 add_gledger_entry(gledger_entries, headData, Memo_Advance, "C", transport, accoid,"",transport,ordercode)

                 ordercode=ordercode+1
                 Freight_Ac=company_parameters.Freight_Ac
                 accoid = get_accoid(Freight_Ac,headData['company_code'])
                 add_gledger_entry(gledger_entries, headData, Memo_Advance, "D", Freight_Ac, accoid,"",Freight_Ac,ordercode)

                 if MemoGstRate!=0:
                     RCMCGST=float(headData.get('RCMCGSTAmt', 0) or 0)
                     RCMSGST=float(headData.get('RCMSGSTAmt', 0) or 0)
                     RCMIGST=float(headData.get('RCMIGSTAmt', 0) or 0)

                     if RCMCGST >0:
                        ordercode=ordercode+1
                        CGST_RCM_Ac=company_parameters.CGST_RCM_Ac
                        accoid = get_accoid(CGST_RCM_Ac,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMCGST, "D", CGST_RCM_Ac, accoid,"",headData['transport'],ordercode)
                        
                        ordercode=ordercode+1
                        CCGSTAc=company_parameters.CGSTAc
                        accoid = get_accoid(CCGSTAc,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMCGST, "C", headData['transport'], accoid,"",headData['transport'],ordercode)
                        
                     if RCMSGST >0:
                        ordercode=ordercode+1
                        SGST_RCM_Ac=company_parameters.SGST_RCM_Ac
                        accoid = get_accoid(SGST_RCM_Ac,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMSGST, "D", SGST_RCM_Ac, accoid,"",headData['transport'],ordercode)
                        
                        ordercode=ordercode+1
                        CCGSTAc=company_parameters.SGSTAc
                        accoid = get_accoid(CCGSTAc,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMSGST, "C", headData['transport'], accoid,"",headData['transport'],ordercode)
                        
                     if RCMIGST > 0:
                        ordercode=ordercode+1
                        IGST_RCM_Ac=company_parameters.IGST_RCM_Ac
                        accoid = get_accoid(IGST_RCM_Ac,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMIGST, "D", IGST_RCM_Ac, accoid,"",headData['transport'],ordercode)
                        
                        ordercode=ordercode+1
                        SCGSTAc=company_parameters.IGSTAc
                        accoid = get_accoid(SCGSTAc,headData['company_code'])
                        add_gledger_entry(gledger_entries, headData, RCMIGST, "C", headData['transport'], accoid,"",headData['transport'],ordercode)
                        

        query_params = {
            'Company_Code': headData['company_code'],
            'DOC_NO': new_doc_no,
            'Year_Code': headData['Year_Code'],
            'TRAN_TYPE' : headData['tran_type']
            
        }
       
        response, status_code = await async_post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)
        

        if status_code == 201:
            db.session.commit()
        else:
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response}), status_code


        

        
        desp_type=headData['desp_type']
        Autopurchase=new_sale_data['AutopurchaseBill']
        print('Autopurchase',Autopurchase),
        purchaseno=0
        detaildataappend=[]
        detailLedger_entry=[]
        if desp_type=="DI":
            if  Autopurchase=="Y":   
                for item in detailData:
                    detailLedger_entry = [({
                                    "rowaction":"add","detail_id":1,"Tran_Type":"PS","item_code":headData['itemcode'],
                                    "narration":"abc","Quantal":headData['quantal'],"packing":headData['packing'],"bags":headData['bags'],
                                    "rate":headData['mill_rate'],"item_Amount":new_sale_data['PS_amount'],"Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],
                                    "ic":headData['ic'],"Brand_Code":headData['brandcode']
                    })]

                
            
                detaildataappend.append(detailLedger_entry)
                
                create_PurchaseBill_entry= {
                        "detailData":detailLedger_entry,
                            
                            "headData":{ "doc_no":headData["voucher_no"],
                                    "Tran_Type":"PS","PURCNO":new_doc_no,"doc_date":headData["Purchase_Date"],"Ac_Code":item['Bank_Code'],
                                    "Unit_Code":0,"mill_code":headData["mill_code"],"FROM_STATION":"","TO_STATION":"",
                                    "LORRYNO":headData["truck_no"],"ac":item.get('bc'),"mc":headData['mc'],
                                    "Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],"BROKER":headData['broker'],
                                    "subTotal":0,"LESS_FRT_RATE":0,"freight":0,"cash_advance":0,"bank_commission":0,"OTHER_AMT":0,"Bill_Amount":new_sale_data['TOTALPurchase_Amount'],
                                    "Due_Days":1,"NETQNTL":headData['quantal'],"Created_By":headData['Created_By'],"Modified_By":headData['Modified_By'],
                                    "Bill_No":headData['MillInvoiceNo'],"GstRateCode":headData['GstRateCode'],"CGSTRate":new_sale_data['PS_CGSTRATE'],"CGSTAmount":new_sale_data['PS_CGSTAmount'],"SGSTRate":new_sale_data['PS_SGSTRATE'],
                                    "SGSTAmount":new_sale_data['PS_SGSTAmount'],"IGSTRate":new_sale_data['PS_IGSTRATE'],"IGSTAmount":new_sale_data['PS_IGSTAmount'],"EWay_Bill_No":headData['EWay_Bill_No'],"uc":0,"bk":headData['bk'],
                                    "grade":headData['grade'],"mill_inv_date":headData['mill_inv_date'],"Purcid":0,
                                    "SelfBal":'',"TCS_Rate":headData['TCS_Rate'],"TCS_Amt":0,"TCS_Net_Payable":0,"purchaseidnew":0,
                                    "TDS_Amt":0,"TDS_Rate":headData['PurchaseTDSRate'],"Retail_Stock":"N","gstid":headData['gstid']
                            },
                            
                        }
                # logger.info("Creating PurchaseBill entry: %s", create_PurchaseBill_entry)
            
                response, status_code = await async_post("http://localhost:8080/api/sugarian/insert_SugarPurchase",  json=create_PurchaseBill_entry)

                if status_code == 201:
                    data =response
                    added_details = data.get('addedDetails')
                    doc_nos = next((detail.get('doc_no') for detail in added_details if 'doc_no' in detail), None)
                    purchaseid=next((detail.get('purchase') for detail in added_details if 'purchase' in detail), None)
                    new_head.voucher_no=doc_nos
                    new_head.voucher_type="PS"
                    new_head.purchaseid=purchaseid
                    purchaseno=doc_nos
                    db.session.commit()
                else:
                    db.session.rollback()
                    return jsonify({"error": "Failed to create PurchaseBill record", "details": response}), status_code
                
            company_parameters = fetch_company_parameters(headData['company_code'], headData['Year_Code'])
            desp_type=headData["desp_type"]
            
            salebillto=headData["SaleBillTo"]
            SB_No=headData["SB_No"]
            SELFAC=company_parameters.SELF_AC
            autovaoucher=company_parameters.AutoVoucher
        
            SB_Ac_Codeaccoid = get_accoid(new_sale_data['SB_Ac_Code'], headData['company_code'])
            SB_Unit_Codeaccoid = get_accoid(new_sale_data['SB_Unit_Code'], headData['company_code'])
            

            if autovaoucher=="YES":
                if desp_type!="DO" and salebillto != "0" and salebillto != SELFAC and salebillto != "2":   
                    

                    create_SaleBill_entry= {
                                        "detailData":[{
                                                "rowaction":"add","detail_id":1,"Tran_Type":"SB","item_code":headData['itemcode'],
                                                "narration":"abc","Quantal":headData['quantal'],"packing":headData['packing'],"bags":headData['bags'],
                                                "rate":headData['mill_rate'],"item_Amount":new_sale_data['item_Amount'],"Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],
                                                "ic":headData['ic'],"Brand_Code":headData['brandcode']

                                        }],
                                        "headData":{ 
                                                "Tran_Type":"SB","PURCNO":purchaseno,"doc_date":headData["doc_date"],"Ac_Code":new_sale_data['SB_Ac_Code'],
                                                "Unit_Code":new_sale_data['SB_Unit_Code'],"mill_code":headData["mill_code"],"FROM_STATION":"","TO_STATION":"",
                                                "LORRYNO":headData["truck_no"],"ac":SB_Ac_Codeaccoid,"mc":headData['mc'],
                                                "Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],"BROKER":headData['broker'],
                                                "subTotal":new_sale_data['SB_SubTotal'],"LESS_FRT_RATE":new_sale_data['SB_Less_Frt_Rate'],"freight":new_sale_data['SB_freight'],"cash_advance":0,"bank_commission":0,"OTHER_AMT":new_sale_data['SB_Other_Amount'],"Bill_Amount":new_sale_data['TotalGstSaleBillAmount'],
                                                "Due_Days":1,"NETQNTL":headData['quantal'],"Modified_By":headData['Modified_By'],
                                                "GstRateCode":headData['GstRateCode'],"CGSTRate":new_sale_data['cgstrate'],"CGSTAmount":new_sale_data['cgstamt'],"SGSTRate":new_sale_data['sgstrate'],
                                                "SGSTAmount":new_sale_data['sgstamt'],"IGSTRate":new_sale_data['igstrate'],"IGSTAmount":new_sale_data['igstamt'],"EWay_Bill_No":headData['EWay_Bill_No'],"uc":SB_Unit_Codeaccoid,"bk":headData['bk'],
                                                "Purcid":0,"saleidnew":0,
                                                "TCS_Rate":headData['Sale_TCS_Rate'],"TCS_Amt":new_sale_data['SBTCSAmt'],"TCS_Net_Payable":0,"saleidnew":0,
                                                "TDS_Amt":new_sale_data['SBTDSAmt'],"TDS_Rate":headData['PurchaseTDSRate'],"gstid":headData['gstid'],"TaxableAmount":new_sale_data['TaxableAmountForSB'],
                                                "EWayBill_Chk":headData["EWayBillChk"],"MillInvoiceNo":headData["MillInvoiceNo"],"RoundOff":0,
                                                "Transport_Code":headData["transport"],"tc":headData["tc"],"DoNarrtion":headData["narration3"],"newsbno":0,
                                                "einvoiceno":headData["einvoiceno"],"ackno":headData['ackno'],"Delivery_type":headData["Delivery_Type"],
                                                "Bill_To":headData['carporate_ac'],"bt":headData['ca'],"EwayBillValidDate":headData['doc_date'],"IsDeleted":1,
                                                "SBNarration":headData["SBNarration"],"Insured":headData["Insured"],"DO_No":new_doc_no


                                        },
                                        
                                    
                            }
                    
                
                    response, status_code = await async_post("http://localhost:8080/api/sugarian/insert-SaleBill",  json=create_SaleBill_entry)
                    print('salebill', create_SaleBill_entry)
                    if status_code == 201:
                        data = response
                        added_detailssb = data.get('addedDetails')
                        doc_nos = next((detail.get('doc_no') for detail in added_detailssb if 'doc_no' in detail), None)
                        saleid=next((detail.get('Saleid') for detail in added_detailssb if 'Saleid' in detail), None)
                        new_head.SB_No=doc_nos
                        new_head.saleid=saleid
                        
                        db.session.commit()
                    else:
                        db.session.rollback()
                        return jsonify({"error": "Failed to create SaleBill record", "details": response}), status_code

        else:
            
            create_CommisionBill_entry= {
                
                                "Tran_Type":headData['voucher_type'],"doc_date":headData["doc_date"],"link_no":new_doc_no,"link_type":"","link_id":0,
                                "ac_code":headData['SaleBillTo'],"unit_code":headData['GETPASSCODE'],"broker_code":headData['broker'],
                                "qntl":headData['quantal'],"packing":headData["packing"],"bags":headData['bags'],"grade":headData['grade'],
                                "transport_code":headData["transport"],"mill_rate":headData["mill_rate"],"sale_rate":headData['sale_rate'],
                                "purc_rate":headData["PurchaseRate"],"commission_amount":new_sale_data['LV_Commision_Amt'],"resale_rate":headData["Tender_Commission"],"resale_commission":new_sale_data['LV_tender_Commision_Amt'],
                                "texable_amount":new_sale_data['LV_taxableamount'],"gst_code":headData["GstRateCode"],"cgst_rate":new_sale_data['LV_Cgstrate'],"cgst_amount":new_sale_data['LV_CGSTAmount'],"sgst_rate":new_sale_data['LV_Sgstrate'],"sgst_amount":new_sale_data['LV_SGSTAmount'],"igst_rate":new_sale_data['LV_Igstrate'],"igst_amount":new_sale_data['LV_IGSTAmount'],
                                "bill_amount":new_sale_data['LV_TotalAmount'],"Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],"Created_By":headData["Created_By"],
                                "ac":headData["sb"],"uc":headData["gp"],"bc":headData["bk"],"tc":headData["tc"],"mill_code":headData["mill_code"],"mc":headData["mc"],
                                "narration1":"","narration2":"","narration3":"","narration4":"","TCS_Rate":headData["Sale_TCS_Rate"],"TCS_Amt":new_sale_data['LV_TCSAmt'],"TCS_Net_Payable":new_sale_data['LV_NETPayble'],
                                "Tran_Type":"","HSN":"","item_code":headData["itemcode"],"ic":headData["ic"],"Frieght_Rate":headData["MM_Rate"],"Frieght_amt":headData["Memo_Advance"],
                                "subtotal":headData["diff_amount"],"IsTDS":headData["TDSCut"],"TDS_Ac":headData["TDSAc"],"TDS_Per":headData["TDSRate"],
                                "TDSAmount":new_sale_data["LV_TDSAmt"],"TDS":headData["TDSRate"],"ta":headData["TDSAcId"],'Branch_Code':0,'Created_By':''
                 
            }

            query_params = {
            'Company_Code': headData['company_code'],
            'Year_Code': headData['Year_Code'],
            'Tran_Type': "LV"
                        }

            print('create_CommisionBill_entry',create_CommisionBill_entry)
            response, status_code = await async_post("http://localhost:8080/api/sugarian/create-RecordCommissionBill",params=query_params,json=create_CommisionBill_entry)
           
            if status_code == 201:
                # Parse the JSON data from the response
                data = response
                
                # Extract the 'record' dictionary
                record = data.get('record', {})
                
                # Extract 'new_Record_data' from 'record'
                new_record_data = record.get('new_Record_data', {})
                
                # Extract 'doc_no' from 'new_Record_data'
                voucher_no = new_record_data.get('doc_no')
                voucher_type = new_record_data.get('Tran_Type')
                # Extract 'commissionid' directly from 'record'
                commissionid = record.get('commissionid')
                
                # Print extracted values for debugging
                print('commissionid:', commissionid)
                print('voucher_no:', voucher_no)
                
                # Example of assigning these values to a model instance and committing to the database
                new_head.voucher_no = voucher_no
                new_head.commisionid = commissionid
                new_head.voucher_type = voucher_type
                
                # Commit changes to the database
                db.session.commit()
                            
            else:
                db.session.rollback()
                return jsonify({"error": "Failed to create CommisionBill record", "details": response}), status_code
            

    ####creation of stock entry
        tender_no=headData["purc_no"]
        tender_head = TenderHead.query.filter_by(Tender_No=tender_no).first()
        if not tender_head:
            return jsonify({"error": "Tender not found"}), 404

        tenderid = tender_head.tenderid

        print("tenderid", tenderid)

        # Generate new ID for the detail entry
        max_detail_id = db.session.query(func.max(TenderDetails.ID)).filter_by(tenderid=tenderid).scalar() or 0
        new_detail_id = max_detail_id + 1

        detail_record = db.session.execute(text("select * from nt_1_tenderdetails where ID=:id and tenderid=:tenderid" ),{'id':1,'tenderid':tenderid})
        
        detail_record = detail_record.fetchall()


        result = [dict(row._mapping) for row in detail_record]

        print("result", result)

        buyer_quantal = result[0].get('Buyer_Quantal')
        selfquantalid=result[0].get('tenderdetailid')
       
        selfstock=float(buyer_quantal)
        SaleQuantal=headData["quantal"]
        TenderStockQty= selfstock-float(SaleQuantal)

       
        
        purcorder=headData["purc_order"]
        if purcorder==1:
                create_TenderStock_entry= {
                "detailData":[{
                            "rowaction":"add","Tender_No":headData["purc_no"],"Buyer":headData['SaleBillTo'],"Buyer_Quantal":headData["quantal"],
                            "Sale_Rate":headData["sale_rate"],"Commission_Rate":headData["Tender_Commission"],"Sauda_Date":headData["doc_date"],
                            "Lifting_Date":headData["doc_date"],"ID":new_detail_id,"Buyer_Party":headData["broker"],"Delivery_Type":headData["Delivery_Type"],
                            "tenderid":tenderid,"buyerid":headData["sb"],"buyerpartyid":headData["bk"],"sub_broker":headData["broker"],
                            "sbr":headData["bk"],"ShipTo":headData["voucher_by"],"shiptoid":headData["vb"],"Company_Code":headData["company_code"],
                            "year_code":headData["Year_Code"]

                },
                {
                            "rowaction":"update","Tender_No":headData["purc_no"],"Buyer_Quantal":TenderStockQty,
                            "ID":1,"tenderid":tenderid,"tenderdetailid":selfquantalid,
                            
                }],
               
        
                }
                
                Stock_query_params = {
                        'tenderid':tenderid,
                        'Tender_No': headData["purc_no"],
                        
                        }

                response = requests.put("http://localhost:8080/api/sugarian/Stock_Entry_tender_purchase",params=Stock_query_params,json=create_TenderStock_entry)
        

        if status_code == 200:
            data=response
            
            added_detailssb = data.get('addedDetails')
            
            first_dict = added_detailssb[0]
            tenderdetailid = first_dict['tenderdetailid']
            
            new_head.tenderdetailid=tenderdetailid
            db.session.commit()
                
        else:
            db.session.rollback()
            return jsonify({"error": "Failed to create Tender record", "details": response}), status_code
                


        return jsonify({
            "message": "Data Inserted successfully",
            "head": task_head_schema.dump(new_head),
            "addedDetails": task_detail_schemas.dump(createdDetails),
            "updatedDetails": updatedDetails,
            "deletedDetailIds": deletedDetailIds
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error("An error occurred: %s", str(e))
        logger.error("Traceback: %s", traceback.format_exc())
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
    #Update Record and Gldger Effects of SaleBill and SaleBill
@app.route(API_URL + "/update-DeliveryOrder", methods=["PUT"])
async def update_DeliveryOrder():

    def create_gledger_entry(data, amount, drcr, ac_code, accoid,narration,DRCR_HEAD,ordercode):
        return {
            "TRAN_TYPE": 'DO',
            "DOC_NO": updateddoc_no,
            "DOC_DATE": data['doc_date'],
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['company_code'],
            "YEAR_CODE": data['Year_Code'],
            "ORDER_CODE": 12,
            "DRCR": drcr,
            "UNIT_Code": 0,
            "NARRATION": narration,
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 1,
            "SORT_TYPE": 'DO',
            "SORT_NO": updateddoc_no,
            "vc": 0,
            "progid": 0,
            "tranid": 0,
            "saleid": 0,
            "ac": accoid
        }

    def add_gledger_entry(entries, data, amount, drcr, ac_code, accoid,narration,DRCR_HEAD,ordercode):
        if amount != 0:
            entries.append(create_gledger_entry(data, amount, drcr, ac_code, accoid,narration,DRCR_HEAD,ordercode))
            
    try:
        doid = request.args.get('doid')
        if doid is None:
            return jsonify({"error": "Missing 'doid' parameter"}), 400
        
        data = request.get_json()
        new_sale_data= data['headData']
        headData = new_sale_data.copy()
        print('headdata',headData)
        # headData = data['headData']
        detailData = data['detailData']

        remove_sale_data = ['TaxableAmountForSB','cgstrate','sgstrate','igstrate','cgstamt',
                            'sgstamt','igstamt','SaleDetail_Rate','SB_freight','SB_SubTotal','SB_Less_Frt_Rate',
                            'TotalGstSaleBillAmount','Roundoff','SBTCSAmt','Net_Payble','SBTDSAmt','save' ,'sale',
                            'item_Amount','SB_Ac_Code','SB_Unit_Code','PS_CGSTAmount','PS_SGSTAmount','PS_IGSTAmount','PS_CGSTRATE',
                            'PS_SGSTRATE','PS_IGSTRATE','TOTALPurchase_Amount','PSTCS_Amt','PSTDS_Amt','PSNetPayble','PS_SelfBal','PS_amount','lblgetpasscodename',
                            'lblvoucherByname','Gst_Rate','AutopurchaseBill','LV_CGSTAmount','LV_SGSTAmount','LV_IGSTAmount','LV_TotalAmount',
                            'LV_TCSRate','LV_NETPayble','LV_TCSAmt','LV_TDSRate','LV_TDSAmt','LV_Igstrate','LV_Cgstrate','LV_taxableamount',
                            'LV_Sgstrate','LV_Commision_Amt','LV_tender_Commision_Amt','gstratename','Gstrate','lblitemname',
                            'newbroker','lblbrokername']
    
        
        for key in remove_sale_data:
            if key in headData:
                del headData[key]

        tran_type = headData.get('tran_type')
        if tran_type is None:
             return jsonify({"error": "Bad Request", "message": "tran_type and bill_type is required"}), 400


        company_code=headData['company_code']
        doc_no=headData['doc_no']
        Year_Code=headData['Year_Code']

      #  DO_head = DeliveryOrderHead.query.filter_by(doc_no=doc_no,company_code=company_code,Year_Code=Year_Code).first()

        
        # Extracting category name from additional_data
        # last_head_data = {column.name: getattr(DO_head, column.name) for column in DO_head.__table__.columns}
        # last_head_data.update(format_dates(DO_head))

        

        #print("last_head_data",last_head_data)
        # Update the head data
        updatedHeadCount = db.session.query(DeliveryOrderHead).filter(DeliveryOrderHead.doid == doid).update(headData)
        updated_DO_head = db.session.query(DeliveryOrderHead).filter(DeliveryOrderHead.doid == doid).one()
        updateddoc_no = updated_DO_head.doc_no
        #print("updated_DO_head",updated_DO_head)

        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []
        
        for item in detailData:
            item['doid'] = updated_DO_head.doid

            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item['doc_no'] = updateddoc_no
                    new_detail = DeliveryOrderDetail(**item)
                    updated_DO_head.details.append(new_detail)
                    createdDetails.append(new_detail)

                elif item['rowaction'] == "update":
                    dodetailid = item['dodetailid']
                    update_values = {k: v for k, v in item.items() if k not in ('dodetailid', 'rowaction', 'doid')}
                    db.session.query(DeliveryOrderDetail).filter(DeliveryOrderDetail.dodetailid == dodetailid).update(update_values)
                    updatedDetails.append(dodetailid)

                elif item['rowaction'] == "delete":
                    dodetailid = item['dodetailid']
                    detail_to_delete = db.session.query(DeliveryOrderDetail).filter(DeliveryOrderDetail.dodetailid == dodetailid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deletedDetailIds.append(dodetailid)
                        

        db.session.commit()

        company_parameters = fetch_company_parameters(headData['company_code'], headData['Year_Code'])

        getpasscode=headData['GETPASSCODE']
        selfac= company_parameters.SELF_AC
        
        vasuli_amount1=headData['vasuli_amount1']
        vasuli_amount=headData['vasuli_amount']
        TDSAc = headData['TDSAc']
        TDSAmt = headData['TDSAmt']
        TDSCut = headData['TDSCut']
        transport = headData['transport']
        Memo_Advance = headData['Memo_Advance']
        ordercode=0
        if TDSCut =='N' :
            transporttdsac=transport
        else:
            transporttdsac=company_parameters.TransportTDS_AcCut
         

      
        gledger_entries = []

        if getpasscode != selfac :
            if vasuli_amount1 != 0:
                ordercode=ordercode+1
                GETPASSCODE = headData['GETPASSCODE']
                accoid = get_accoid(GETPASSCODE,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount1, 'D', GETPASSCODE, accoid,'',0,ordercode)

                ordercode=ordercode+1
                Vasuli_Ac = headData['Vasuli_Ac']
                accoid = get_accoid(Vasuli_Ac,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount1, 'D', Vasuli_Ac, accoid,'',9999971,ordercode)
                
            if TDSAc != 0 :      
                if TDSAmt != 0 :
                    ordercode=ordercode+1
                    accoid = get_accoid(TDSAc,headData['company_code'])
                    add_gledger_entry(gledger_entries, headData, TDSAmt, 'C', TDSAc, accoid,'',9999971,ordercode)

                    ordercode=ordercode+1
                    accoid = get_accoid(transporttdsac,headData['company_code'])
                    add_gledger_entry(gledger_entries, headData, TDSAmt, 'D', transporttdsac, accoid,'',transporttdsac,ordercode)
                 
            if Memo_Advance!=0 :
                 ordercode=ordercode+1
                 accoid = get_accoid(transport,headData['company_code'])
                 add_gledger_entry(gledger_entries, headData, Memo_Advance, 'C', transport, accoid,'',transport,ordercode)

                 ordercode=ordercode+1
                 Freight_Ac=company_parameters.Freight_Ac
                 accoid = get_accoid(Vasuli_Ac,headData['company_code'])
                 add_gledger_entry(gledger_entries, headData, Memo_Advance, 'D', Freight_Ac, accoid,'',Freight_Ac,ordercode)
         
            if vasuli_amount!=0:
                ordercode=ordercode+1
                accoid = get_accoid(transport,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount, 'D', transport, accoid,'',transport,ordercode)

                ordercode=ordercode+1
                accoid = get_accoid(1,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount, 'C', transport, accoid,'',transport,ordercode)
            
        else:
            if TDSAc!=0 :      
                if TDSAmt!=0 :
                    ordercode=ordercode+1
                    accoid = get_accoid(TDSAc,headData['company_code'])
                    add_gledger_entry(gledger_entries, headData, TDSAmt, 'C', TDSAc, accoid,'',9999971,ordercode)

                    ordercode=ordercode+1
                    accoid = get_accoid(transporttdsac,headData['company_code'])
                    add_gledger_entry(gledger_entries, headData, TDSAmt, 'D', transporttdsac, accoid,'',transporttdsac,ordercode)
             
            if vasuli_amount!=0:
                ordercode=ordercode+1
                accoid = get_accoid(transport,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount, 'D', transport, accoid,'',transport,ordercode)

                ordercode=ordercode+1
                accoid = get_accoid(1,headData['company_code'])
                add_gledger_entry(gledger_entries, headData, vasuli_amount, 'C', 1, accoid,'',transport,ordercode)
              
            if Memo_Advance!=0 :
                 ordercode=ordercode+1
                 accoid = get_accoid(transport,headData['company_code'])
                 add_gledger_entry(gledger_entries, headData, Memo_Advance, 'C', transport, accoid,'',transport,ordercode)
                
                 ordercode=ordercode+1
                 Freight_Ac=company_parameters.Freight_Ac
                 accoid = get_accoid(Freight_Ac,headData['company_code'])
                 add_gledger_entry(gledger_entries, headData, Memo_Advance, 'D', Freight_Ac, accoid,'',Freight_Ac,ordercode)
         
       
        query_params = {
            'Company_Code': headData['company_code'],
            'DOC_NO': updateddoc_no,
            'Year_Code': headData['Year_Code'],
            'TRAN_TYPE': headData['tran_type']
        }
        #  response, status_code = await async_post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)
        
    
        response, status_code  = await async_post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)

        if status_code == 201:
            db.session.commit()
        else:
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response}), status_code
        
        desp_type=headData['desp_type']
        detaildataappend=[]
        detailLedger_entry=[]
        purchaseno=0
        print('Voucherno',headData['voucher_no'])
        if desp_type=='DI':
            for item in detailData:
                detailLedger_entry = [({
                                "rowaction":"update","detail_id":1,"Tran_Type":"PS","item_code":headData['itemcode'],
                                "narration":"abc","Quantal":headData['quantal'],"packing":headData['packing'],"bags":headData['bags'],
                                "rate":headData['mill_rate'],"item_Amount":new_sale_data['PS_amount'],"Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],
                                "ic":headData['ic'],"Brand_Code":headData['brandcode'],"doc_no":headData['voucher_no'],
                                "purchaseid":headData["purchaseid"],"purchasedetailid":0
                })]

            
            detaildataappend.append(detailLedger_entry)

            update_PurchaseBill_entry= {
                        
                      "detailData":detailLedger_entry,
                        # "detailData":[{
                        #         "rowaction":"update","detail_id":1,"Tran_Type":"PS","item_code":headData['itemcode'],
                        #         "narration":"abc","Quantal":headData['quantal'],"packing":headData['packing'],"bags":headData['bags'],
                        #         "rate":headData['mill_rate'],"item_Amount":0,"Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],
                        #         "ic":headData['ic'],"Brand_Code":headData['brandcode'],"purchasedetailid":0,"doc_no":headData['voucher_no'],
                        #         "purchaseid":headData["purchaseid"]

                        # }],
                       "headData":{ "doc_no":headData["voucher_no"],
                                "Tran_Type":"PS","PURCNO":headData['doc_no'],"doc_date":headData["Purchase_Date"],"Ac_Code":item['Bank_Code'],
                                "Unit_Code":0,"mill_code":headData["mill_code"],"FROM_STATION":"","TO_STATION":"",
                                "LORRYNO":headData["truck_no"],"ac":item.get('bc'),"mc":headData['mc'],
                                "Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],"BROKER":headData['broker'],
                                "subTotal":0,"LESS_FRT_RATE":0,"freight":0,"cash_advance":0,"bank_commission":0,"OTHER_AMT":0,"Bill_Amount":new_sale_data['TOTALPurchase_Amount'],
                                "Due_Days":1,"NETQNTL":headData['quantal'],"Created_By":headData['Created_By'],"Modified_By":headData['Modified_By'],
                                "Bill_No":headData['MillInvoiceNo'],"GstRateCode":headData['GstRateCode'],"CGSTRate":new_sale_data['PS_CGSTRATE'],"CGSTAmount":new_sale_data['PS_CGSTAmount'],"SGSTRate":new_sale_data['PS_SGSTRATE'],
                                "SGSTAmount":new_sale_data['PS_SGSTAmount'],"IGSTRate":new_sale_data['PS_IGSTRATE'],"IGSTAmount":new_sale_data['PS_IGSTAmount'],"EWay_Bill_No":headData['EWay_Bill_No'],"uc":0,"bk":headData['bk'],
                                "grade":headData['grade'],"mill_inv_date":headData['mill_inv_date'],"Purcid":0,
                                "SelfBal":'',"TCS_Rate":headData['TCS_Rate'],"TCS_Amt":0,"TCS_Net_Payable":0,"purchaseidnew":0,
                                "TDS_Amt":0,"TDS_Rate":headData['PurchaseTDSRate'],"Retail_Stock":"N","gstid":headData['gstid']
                        },
                        
                    }
            purch_param={
                 'purchaseid': headData['purchaseid']
                 
            }
            print("headData['purchaseid']",headData['purchaseid'])
            print('purchase',update_PurchaseBill_entry)
            response, status_code  = await async_put("http://localhost:8080/api/sugarian/update-SugarPurchase", params=purch_param ,json=update_PurchaseBill_entry)
           
            if status_code == 200:
                data =response
                print('data',response)
                added_details = data.get('addedDetails')
                doc_nos = next((detail.get('doc_no') for detail in added_details if 'doc_no' in detail), None)
                purchaseid=next((detail.get('purchase') for detail in added_details if 'purchase' in detail), None)
                headData['voucher_no']=doc_nos
                headData['voucher_type']="PS"
                headData['purchaseid']=purchaseid
                purchaseno=doc_nos
                db.session.commit()
            else:
                db.session.rollback()
                return jsonify({"error": "Failed to update PurchaseBill record", "details": response}), status_code


            
            company_parameters = fetch_company_parameters(headData['company_code'], headData['Year_Code'])
            desp_type=headData["desp_type"]
            salebillto=headData["SaleBillTo"]
            print('salebillto',salebillto)
            SB_No=headData["SB_No"]
            SELFAC=company_parameters.SELF_AC
            autovaoucher=company_parameters.AutoVoucher
            SB_Ac_Codeaccoid = get_accoid(new_sale_data['SB_Ac_Code'], headData['company_code'])
            SB_Unit_Codeaccoid = get_accoid(new_sale_data['SB_Unit_Code'], headData['company_code'])
            
            print('voucherno',headData['voucher_no'])
            if autovaoucher=="YES":
                    if desp_type!="DO" and salebillto != "0" and salebillto != SELFAC and salebillto != "2":
                            update_SaleBill_entry= {
                                    "detailData":[{
                                                "rowaction":"update","detail_id":1,"Tran_Type":"SB","item_code":headData['itemcode'],
                                                "narration":"abc","Quantal":headData['quantal'],"packing":headData['packing'],"bags":headData['bags'],
                                                "rate":headData['mill_rate'],"item_Amount":new_sale_data['item_Amount'],"Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],
                                                "ic":headData['ic'],"Brand_Code":headData['brandcode'],"saledetailid":0

                                        }],
                                        "headData":{ "doc_no":headData["SB_No"],
                                                "Tran_Type":"SB","PURCNO":new_sale_data["voucher_no"],"doc_date":headData["doc_date"],"Ac_Code":new_sale_data['SB_Ac_Code'],
                                                "Unit_Code":new_sale_data['SB_Unit_Code'],"mill_code":headData["mill_code"],"FROM_STATION":"","TO_STATION":"",
                                                "LORRYNO":headData["truck_no"],"ac":SB_Ac_Codeaccoid,"mc":headData['mc'],
                                                "Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],"BROKER":headData['broker'],
                                                "subTotal":new_sale_data['SB_SubTotal'],"LESS_FRT_RATE":new_sale_data['SB_Less_Frt_Rate'],"freight":new_sale_data['SB_freight'],"cash_advance":0,"bank_commission":0,"OTHER_AMT":new_sale_data['SB_Other_Amount'],"Bill_Amount":new_sale_data['TotalGstSaleBillAmount'],
                                                "Due_Days":1,"NETQNTL":headData['quantal'],"Modified_By":headData['Modified_By'],
                                                "GstRateCode":headData['GstRateCode'],"CGSTRate":new_sale_data['cgstrate'],"CGSTAmount":new_sale_data['cgstamt'],"SGSTRate":new_sale_data['sgstrate'],
                                                "SGSTAmount":new_sale_data['sgstamt'],"IGSTRate":new_sale_data['igstrate'],"IGSTAmount":new_sale_data['igstamt'],"EWay_Bill_No":headData['EWay_Bill_No'],"uc":SB_Unit_Codeaccoid,"bk":headData['bk'],
                                                "Purcid":0,"saleidnew":0,
                                                "TCS_Rate":headData['Sale_TCS_Rate'],"TCS_Amt":new_sale_data['SBTCSAmt'],"TCS_Net_Payable":0,"saleidnew":0,
                                                "TDS_Amt":new_sale_data['SBTDSAmt'],"TDS_Rate":headData['PurchaseTDSRate'],"gstid":headData['gstid'],"TaxableAmount":new_sale_data['TaxableAmountForSB'],
                                                "EWayBill_Chk":headData["EWayBillChk"],"MillInvoiceNo":headData["MillInvoiceNo"],"RoundOff":0,
                                                "Transport_Code":headData["transport"],"tc":headData["tc"],"DoNarrtion":headData["narration3"],"newsbno":0,
                                                "einvoiceno":headData["einvoiceno"],"ackno":headData['ackno'],"Delivery_type":headData["Delivery_Type"],
                                                "Bill_To":headData['carporate_ac'],"bt":headData['ca'],"EwayBillValidDate":headData['doc_date'],"IsDeleted":1,
                                                "SBNarration":headData["SBNarration"],"Insured":headData["Insured"],"DO_No":headData['doc_no']


                                        },
                                        
                                    
                            }
                            sale_param={
                                "saleid":headData['saleid']
                            }
                            print('Saleill',update_SaleBill_entry)
                            response, status_code = await async_put("http://localhost:8080/api/sugarian/update-SaleBill",  params=sale_param,json=update_SaleBill_entry)

                    if status_code == 201:
                        data = response
                        added_detailssb = data.get('addedDetails')
                        doc_nos = next((detail.get('doc_no') for detail in added_detailssb if 'doc_no' in detail), None)
                        saleid=next((detail.get('Saleid') for detail in added_detailssb if 'Saleid' in detail), None)
                        headData["SB_No"]=doc_nos,
                        headData["saleid"]=saleid   
                        db.session.commit()
                    else:
                        db.session.rollback()
                        return jsonify({"error": "Failed to update SaleBill record", "details": response}), status_code
       
                     
        else:
            
             
            update_CommisionBill_entry= {
                        
                               "doc_no":headData["voucher_no"],"commissionid":headData['commisionid'],
                               "doc_date":headData["doc_date"],"link_no":updateddoc_no,"link_type":"","link_id":0,
                                "ac_code":headData['SaleBillTo'],"unit_code":headData['GETPASSCODE'],"broker_code":headData['broker'],
                                "qntl":headData['quantal'],"packing":headData["packing"],"bags":headData['bags'],"grade":headData['grade'],
                                "transport_code":headData["transport"],"mill_rate":headData["mill_rate"],"sale_rate":headData['sale_rate'],
                                "purc_rate":headData["PurchaseRate"],"commission_amount":new_sale_data['LV_Commision_Amt'],"resale_rate":headData["Tender_Commission"],"resale_commission":new_sale_data['LV_tender_Commision_Amt'],
                                "texable_amount":new_sale_data['LV_taxableamount'],"gst_code":headData["GstRateCode"],"cgst_rate":new_sale_data['LV_Cgstrate'],"cgst_amount":new_sale_data['LV_CGSTAmount'],"sgst_rate":new_sale_data['LV_Sgstrate'],"sgst_amount":new_sale_data['LV_SGSTAmount'],"igst_rate":new_sale_data['LV_Igstrate'],"igst_amount":new_sale_data['LV_IGSTAmount'],
                                "bill_amount":new_sale_data['LV_TotalAmount'],"Company_Code":headData["company_code"],"Year_Code":headData["Year_Code"],"Created_By":headData["Created_By"],
                                "ac":headData["sb"],"uc":headData["gp"],"bc":headData["bk"],"tc":headData["tc"],"mill_code":headData["mill_code"],"mc":headData["mc"],
                                "narration1":"","narration2":"","narration3":"","narration4":"","TCS_Rate":headData["Sale_TCS_Rate"],"TCS_Amt":new_sale_data['LV_TCSAmt'],"TCS_Net_Payable":new_sale_data['LV_NETPayble'],
                                "Tran_Type":headData['voucher_type'],"HSN":"","item_code":headData["itemcode"],"ic":headData["ic"],"Frieght_Rate":headData["MM_Rate"],"Frieght_amt":headData["Memo_Advance"],
                                "subtotal":headData["diff_amount"],"IsTDS":headData["TDSCut"],"TDS_Ac":headData["TDSAc"],"TDS_Per":headData["TDSRate"],
                                "TDSAmount":new_sale_data["LV_TDSAmt"],"TDS":headData["TDSRate"],"ta":headData["TDSAcId"],'Branch_Code':0,'Created_By':''
                 
            }
            print('commision',update_CommisionBill_entry)
            query_params = {
                            'Company_Code': headData['company_code'],
                            'Year_Code': headData['Year_Code'],
                            'Tran_Type': new_sale_data['voucher_type'],
                            'doc_no':headData['voucher_no']
                                        }

           
            response, status_code = await async_put("http://localhost:8080/api/sugarian/update-CommissionBill",params=query_params,json=update_CommisionBill_entry)

            if status_code == 201:
                db.session.commit()
            else:
                db.session.rollback()
                return jsonify({"error": "Failed to update CommisionBill record", "details": response}),status_code
            



         ####creation of stock entry
        tender_no=headData["purc_no"]
        tender_head = TenderHead.query.filter_by(Tender_No=tender_no).first()
        if not tender_head:
            return jsonify({"error": "Tender not found"}), 404

        tenderid = tender_head.tenderid

        # Generate new ID for the detail entry
        max_detail_id = db.session.query(func.max(TenderDetails.ID)).filter_by(tenderid=tenderid).scalar() or 0
        new_detail_id = max_detail_id + 1

        detail_record = db.session.execute(text("select * from nt_1_tenderdetails where ID=:id and tenderid=:tenderid" ),{'id':1,'tenderid':tenderid})
        
        detail_record = detail_record.fetchall()

        result = [dict(row._mapping) for row in detail_record]

        

        buyer_quantal = result[0].get('Buyer_Quantal')
        selfquantalid=result[0].get('tenderdetailid')
       
        selfstock=float(buyer_quantal)
        SaleQuantal=headData["quantal"]
        TenderStockQty= selfstock-float(SaleQuantal)

       
        
        purcorder=headData["purc_order"]
        if purcorder==1:
            create_TenderStock_entry= {
                "detailData":[{
                            "rowaction":"add","Tender_No":headData["purc_no"],"Buyer":headData['SaleBillTo'],"Buyer_Quantal":headData["quantal"],
                            "Sale_Rate":headData["sale_rate"],"Commission_Rate":headData["Tender_Commission"],"Sauda_Date":headData["doc_date"],
                            "Lifting_Date":headData["doc_date"],"ID":new_detail_id,"Buyer_Party":headData["broker"],"Delivery_Type":headData["Delivery_Type"],
                            "tenderid":tenderid,"buyerid":headData["sb"],"buyerpartyid":headData["bk"],"sub_broker":headData["broker"],
                            "sbr":headData["bk"],"ShipTo":headData["voucher_by"],"shiptoid":headData["vb"],"Company_Code":headData["company_code"],
                            "year_code":headData["Year_Code"]

                },
                {
                            "rowaction":"update","Tender_No":headData["purc_no"],"Buyer_Quantal":TenderStockQty,
                            "ID":1,"tenderid":tenderid,"tenderdetailid":selfquantalid,
                            
                }],
               
        
                }
                
            Stock_query_params = {
                        'tenderid':tenderid,
                        'Tender_No': headData["purc_no"],
                        
                        }

            response, status_code = await async_put("http://localhost:8080/api/sugarian/Stock_Entry_tender_purchase",params=Stock_query_params,json=create_TenderStock_entry)
        

            if status_code == 200:
                data=response
                
                added_detailssb = data.get('addedDetails')
                
                first_dict = added_detailssb[0]
                tenderdetailid = first_dict['tenderdetailid']
                
                headData['tenderdetailid']=tenderdetailid
                db.session.commit()
                    
            else:
                db.session.rollback()
                return jsonify({"error": "Failed to create Tender record", "details": response}), status_code
        
    
        

        return jsonify({
            "message": "Data Inserted successfully",
            "head": updatedHeadCount,
            "addedDetails": task_detail_schemas.dump(createdDetails),
            "updatedDetails": updatedDetails,
            "deletedDetailIds": deletedDetailIds
        }), 201

    except Exception as e:
        print("Traceback",traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

#Delete record from datatabse based doid and also delete that record GLeder Effects.  
@app.route(API_URL + "/delete_data_by_doid", methods=["DELETE"])
def delete_data_by_doid():
    doid = request.args.get('doid')
    Company_Code = request.args.get('company_code')
    doc_no = request.args.get('doc_no')
    Year_Code = request.args.get('Year_Code')
    
    if not all([doid, Company_Code, doc_no, Year_Code]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        with db.session.begin():
            # Fetch the data to be deleted for logging or confirmation before deleting
            do_head = db.session.query(DeliveryOrderHead).filter_by(doid=doid).one()
            do_detail_count = db.session.query(DeliveryOrderDetail).filter_by(doid=doid).count()
            sale_id=do_head.saleid
            purch_id=do_head.purchaseid
            SaleDocNo=do_head.SB_No
            Purchdocno=do_head.voucher_no
           
            
            # Now perform deletions
            deleted_DOHead_rows = DeliveryOrderHead.query.filter_by(doid=doid).delete()
            deleted_DODetail_rows = DeliveryOrderDetail.query.filter_by(doid=doid).delete()

            if deleted_DOHead_rows > 0 and deleted_DODetail_rows > 0:
                # All internal deletions are successful, now make external API call
                query_params = {
                    'Company_Code': Company_Code,
                    'DOC_NO': doc_no,
                    'Year_Code': Year_Code,
                    'TRAN_TYPE': "DO",
                }
                response = requests.delete("http://localhost:8080/api/sugarian/delete-Record-gLedger", params=query_params)
                
                if response.status_code != 200:
                    # If external request fails, raise an exception to trigger rollback
                    raise Exception("Failed to delete record in gLedger")
                
                ##delete purchase Record
                purchase_param={
                    'Company_Code': Company_Code,
                    'doc_no': Purchdocno,
                    'Year_Code': Year_Code,
                    'purchaseid': purch_id,
                    'tran_type':"PS"

                }
                
                response = requests.delete("http://localhost:8080/api/sugarian/delete_data_SugarPurchase", params=purchase_param)
                
                if response.status_code != 200:
                    # If external request fails, raise an exception to trigger rollback
                    raise Exception("Failed to delete Purchase record in gLedger")
                ##delete purchase Record
                sale_param={
                    'Company_Code': Company_Code,
                    'doc_no': SaleDocNo,
                    'Year_Code': Year_Code,
                    'saleid': sale_id,
                    'Tran_Type':"SB"

                }
                
                response = requests.delete("http://localhost:8080/api/sugarian/delete_data_by_saleid", params=sale_param)

                
                if response.status_code != 200:
                    # If external request fails, raise an exception to trigger rollback
                    raise Exception("Failed to delete SaleBill record in gLedger")


            # If there were no rows to delete, return an appropriate message
            if deleted_DOHead_rows == 0 and deleted_DODetail_rows == 0:
                return jsonify({"message": "No records found to delete"}), 404

        # Successful deletion
        return jsonify({
            "message": f"Deleted {deleted_DOHead_rows} DOHead row(s) and {deleted_DODetail_rows} DODetail row(s) successfully",
            "detailCount": do_detail_count
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500



#Navigations API    
#Get First record from database 
@app.route(API_URL+"/get-firstDO-navigation", methods=["GET"])
def get_firstDO_navigation():
    try:

        Company_Code = request.args.get('company_code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        
        # Use SQLAlchemy to get the first record from the Task table
        first_DO = DeliveryOrderHead.query.filter_by(company_code=Company_Code,Year_Code=Year_Code).order_by(DeliveryOrderHead.doid.asc()).first()

        if not first_DO:
            return jsonify({"error": "No records found in Task_Entry table"}), 404

        # Get the Taskid of the first record
        first_doid = first_DO.doid

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"doid": first_doid})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
      
        # Extracting category name from additional_data
        last_head_data = {column.name: getattr(first_DO, column.name) for column in first_DO.__table__.columns}
        last_head_data.update(format_dates(first_DO))

        # Convert additional_data_rows to a list of dictionaries
        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        # Prepare response data
        response = {
            "last_head_data": last_head_data,
            "last_details_data": last_details_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


#Get last Record from Database
@app.route(API_URL+"/get-lastDO-navigation", methods=["GET"])
def get_lastDO_navigation():
    try:

        Company_Code = request.args.get('company_code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Use SQLAlchemy to get the last record from the Task table
        last_DO = DeliveryOrderHead.query.filter_by(company_code=Company_Code,Year_Code=Year_Code).order_by(DeliveryOrderHead.doid.desc()).first()
        
        if not last_DO:
            return jsonify({"error": "No records found in Task_Entry table"}), 404

        # Get the Taskid of the last record
        last_Doid = last_DO.doid

        # Additional SQL query execution
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"doid": last_Doid})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
        
        # Extracting category name from additional_data
        last_head_data = {column.name: getattr(last_DO, column.name) for column in last_DO.__table__.columns}
        last_head_data.update(format_dates(last_DO))

        # Convert additional_data_rows to a list of dictionaries
        last_details_data = [dict(row._mapping) for row in additional_data_rows]
        print('last_details_data',last_details_data)
        # Prepare response data
        response = {
            "last_head_data": last_head_data,
            "last_details_data": last_details_data
        }


        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + "/getNextDocNo_DeliveryOrder", methods=["GET"])
def getNextDocNo_DeliveryOrder():
    try:
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Fetch the maximum document number for the given Company_Code and Year_Code
        max_doc_no = db.session.query(func.max(DeliveryOrderHead.doc_no)).filter_by(company_code=Company_Code, Year_Code=Year_Code).scalar()

        if max_doc_no is None:
            next_doc_no = 1  
        else:
            next_doc_no = max_doc_no + 1  



        response = {
            "next_doc_no": next_doc_no,
        }
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
#Get Previous record by database 
@app.route(API_URL+"/get-previousDO-navigation", methods=["GET"])
def get_previousDO_navigation():
    try:
       
        current_doc_no = request.args.get('currentDocNo')
        Company_Code = request.args.get('company_code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code, current_doc_no]):
            return jsonify({"error": "Missing required parameters"}), 400


        # Use SQLAlchemy to get the previous record from the Task table
        previous_DO = DeliveryOrderHead.query.filter(DeliveryOrderHead.doc_no < current_doc_no).filter_by(company_code=Company_Code,Year_Code=Year_Code).order_by(DeliveryOrderHead.doc_no.desc()).first()
    
        
        if not previous_DO:
            return jsonify({"error": "No previous records found"}), 404

        # Get the Task_No of the previous record
        previous_do_id = previous_DO.doid
        
        # Additional SQL query execution
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"doid": previous_do_id})
        
        # Fetch all rows from additional data
        additional_data_rows = additional_data.fetchall()
        
        # Extracting category name from additional_data
        last_head_data = {column.name: getattr(previous_DO, column.name) for column in previous_DO.__table__.columns}
        last_head_data.update(format_dates(previous_DO))

        # Convert additional_data_rows to a list of dictionaries
        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        # Prepare response data
        response = {
            "last_head_data": last_head_data,
            "last_details_data": last_details_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
#Get Next record by database 
@app.route(API_URL+"/get-nextDO-navigation", methods=["GET"])
def get_nextDO_navigation():
    try:
        current_doc_no = request.args.get('currentDocNo')
        Company_Code = request.args.get('company_code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code, current_doc_no]):
            return jsonify({"error": "Missing required parameters"}), 400

        
        

        # Use SQLAlchemy to get the next record from the Task table
        next_DO = DeliveryOrderHead.query.filter(DeliveryOrderHead.doc_no > current_doc_no).filter_by(company_code=Company_Code,Year_Code=Year_Code).order_by(DeliveryOrderHead.doc_no.asc()).first()

        if not next_DO:
            return jsonify({"error": "No next records found"}), 404

        # Get the Task_No of the next record
        next_DO_id = next_DO.doid

        # Query to fetch System_Name_E from nt_1_systemmaster
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"doid": next_DO_id})
        
        # Fetch all rows from additional data
        additional_data_rows = additional_data.fetchall()
        
        last_head_data = {column.name: getattr(next_DO, column.name) for column in next_DO.__table__.columns}
        last_head_data.update(format_dates(next_DO))

        # Convert additional_data_rows to a list of dictionaries
        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        # Prepare response data
        response = {
            "last_head_data": last_head_data,
            "last_details_data": last_details_data
        }

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + "/getAmountcalculationData", methods=["GET"])
def getAmountcalculationData():
    try:
        # Retrieve query parameters
        Company_Code = request.args.get('CompanyCode')
        SalebilltoAc = request.args.get('SalebilltoAc')
        Year_Code = request.args.get('Year_Code')
        purcno = request.args.get('purcno')

        # Validate required parameters
        if not all([Company_Code, SalebilltoAc, Year_Code, purcno]):
            return jsonify({"error": "Missing required parameters"}), 400

        PSAmt = 0.00
        SBAmt=0.00

        with db.session.begin_nested():
            # Check if TDS is applicable for Sale
            SaleTDSApplicable = db.session.execute(
                text('''
                    SELECT TDSApplicable
                    FROM nt_1_accountmaster
                    WHERE Company_Code = :Company_Code AND Ac_Code = :SalebilltoAc
                '''),
                {'Company_Code': Company_Code, 'SalebilltoAc': SalebilltoAc}
            )
            SaleTDSApplicable_Data = SaleTDSApplicable.fetchone()
            print('saletds',SaleTDSApplicable_Data)
            if not SaleTDSApplicable_Data:
                return jsonify({"error": "Sale TDS applicability not found"}), 404

            # Retrieve Payment To from purcno
            PaymentTo = db.session.execute(
                text('''
                    SELECT Payment_To
                    FROM qrytenderheaddetail
                    WHERE Company_Code = :Company_Code AND Tender_No = :purcno
                '''),
                {'Company_Code': Company_Code, 'purcno': purcno}
            )
            PaymentTo_Data = PaymentTo.fetchone()
            print('PaymentTo_Data',PaymentTo_Data)
            if not PaymentTo_Data:
                return jsonify({"error": "Payment To not found"}), 404

            Payment_AC = PaymentTo_Data.Payment_To

            # Retrieve PAN for Payment To
            PaymentToCompanyPan = db.session.execute(
                text('''
                    SELECT CompanyPan
                    FROM nt_1_accountmaster
                    WHERE Company_Code = :Company_Code AND Ac_Code = :Payment_AC
                '''),
                {'Company_Code': Company_Code, 'Payment_AC': Payment_AC}
            )
            PaymentToCompanyPan_Data = PaymentToCompanyPan.fetchone()
            if not PaymentToCompanyPan_Data:
                return jsonify({"error": "Payment To Company PAN not found"}), 404
            
            print("PaymentToCompanyPan_Data:", PaymentToCompanyPan_Data)

            CompanyPan = PaymentToCompanyPan_Data.CompanyPan
           
            # Retrieve Ac_Code associated with CompanyPan
            PaymentToCompanyPan = db.session.execute(
                text('''
                    SELECT Ac_Code
                    FROM nt_1_accountmaster
                    WHERE Company_Code = :Company_Code AND CompanyPan = :CompanyPan
                '''),
                {'Company_Code': Company_Code, 'CompanyPan': CompanyPan}
            )
            PaymentToCompanyPan_Data = PaymentToCompanyPan.fetchall()
            print('PAN',PaymentToCompanyPan_Data)
            if not PaymentToCompanyPan_Data:
                return jsonify({"error": "No accounts found for Company PAN"}), 404

            # Check if Purchase TDS is applicable
            PurchaseTDSApplicable = db.session.execute(
                text('''
                    SELECT TDSApplicable
                    FROM qrymstaccountmaster
                    WHERE Company_Code = :Company_Code AND Ac_Code = :Payment_AC
                '''),
                {'Company_Code': Company_Code, 'Payment_AC': Payment_AC}
            )
            PurchaseTDSApplicable_Data = PurchaseTDSApplicable.fetchone()
            if not PurchaseTDSApplicable_Data:
                return jsonify({"error": "Purchase TDS applicability not found"}), 404

            # Calculate PSAmt
            for item in PaymentToCompanyPan_Data:
                Ac_Code = item.Ac_Code
                PurchaseLegder = db.session.execute(
                    text('''
                        SELECT SUM(AMOUNT) AS AMOUNT
                        FROM NT_1_GLEDGER
                        WHERE COMPANY_CODE = :Company_Code
                        AND DRCR = 'C'
                        AND TRAN_TYPE IN ('PS', 'PR', 'RP')
                        AND Ac_Code = :Ac_Code
                        AND YEAR_CODE = :YEAR_CODE
                    '''),
                    {'Company_Code': Company_Code, 'Ac_Code': Ac_Code, 'YEAR_CODE': Year_Code}
                )
                PurchaseLegder_Data = PurchaseLegder.fetchone()
                # print('PurchaseLegder_Data',float(PurchaseLegder_Data))
                if PurchaseLegder_Data and PurchaseLegder_Data[0] is not None:
            
                    PSAmt += float(PurchaseLegder_Data[0] if PurchaseLegder_Data else 0)

            SaleBillToCompanyPan = db.session.execute(
                text('''
                    SELECT CompanyPan
                    FROM nt_1_accountmaster
                    WHERE Company_Code = :Company_Code AND Ac_Code = :Payment_AC
                '''),
                {'Company_Code': Company_Code, 'Payment_AC': SalebilltoAc}
            )
            SaleBilltoCompanyPan_Data = SaleBillToCompanyPan.fetchone()
            SaleBilltoPANNo=SaleBilltoCompanyPan_Data.CompanyPan

            SaleLegderamt = db.session.execute(
                    text('''
                        SELECT SUM(AMOUNT) AS AMOUNT
                        FROM qrygledger
                        WHERE COMPANY_CODE = :Company_Code
                        AND DRCR = 'D'
                        AND TRAN_TYPE IN ('SB','LV','CV','RR','RS','RB','CB''GI')
                        AND Ac_Code = :SalebilltoAc
                        AND YEAR_CODE = :YEAR_CODE
                         and companypan =:SaleBilltoPANNo
                    '''),
                    {'Company_Code': Company_Code, 'SalebilltoAc': SalebilltoAc, 'YEAR_CODE': Year_Code,'SaleBilltoPANNo':SaleBilltoPANNo}
                )
            SaleLegder_Data = SaleLegderamt.fetchone()
            print('SaleBilltoPANNo',SaleBilltoPANNo)
            print('SaleLegder_Data:', SaleLegder_Data.AMOUNT)
            SBAmt = SaleLegder_Data[0] if SaleLegder_Data and SaleLegder_Data[0] is not None else 0
        

        # Fetch company parameters
        company_parameters = fetch_company_parameters(Company_Code, Year_Code)
        Balancelimt = company_parameters.BalanceLimit
        PurchaseTDSRate=company_parameters.PurchaseTDSRate
        TCSRate=company_parameters.TCSRate
        SaleTDSRate=company_parameters.SaleTDSRate

        
        # Prepare response
        response = {
            "Balancelimt": Balancelimt,
             "PSAmt": PSAmt,
             "PurchaseTDSApplicable":PurchaseTDSApplicable_Data.TDSApplicable,
             "SaleTDSApplicable_Data":SaleTDSApplicable_Data.TDSApplicable,
             "SBAmt":SBAmt,
             "PurchaseTDSRate":PurchaseTDSRate,
             "TCSRate":TCSRate,
             "SaleTDSRate":SaleTDSRate,
        }

        return jsonify(response), 200

    except Exception as e:
        logger.error("Traceback: %s", traceback.format_exc())
        # Log the exception here if needed
        return jsonify({"error": "Internal server error", "message": str(e)}), 500  

  

 
    

#Our DO Report
@app.route(API_URL+"/generating_ourDO_report", methods=["GET"])
def generating_ourDO_report():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')
        doc_no = request.args.get('doc_no')

        if not company_code or not year_code or not doc_no:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400

        query = ('''SELECT dbo.nt_1_deliveryorder.tran_type, dbo.nt_1_deliveryorder.doc_no, dbo.nt_1_deliveryorder.desp_type, dbo.nt_1_deliveryorder.doc_date, CONVERT(varchar(10), dbo.nt_1_deliveryorder.doc_date, 103) AS doc_dateConverted, 
                  dbo.nt_1_deliveryorder.mill_code, dbo.nt_1_deliveryorder.grade, dbo.nt_1_deliveryorder.quantal, dbo.nt_1_deliveryorder.packing, dbo.nt_1_deliveryorder.bags, dbo.nt_1_deliveryorder.mill_rate, dbo.nt_1_deliveryorder.sale_rate, 
                  dbo.nt_1_deliveryorder.Tender_Commission, dbo.nt_1_deliveryorder.diff_rate, dbo.nt_1_deliveryorder.diff_amount, dbo.nt_1_deliveryorder.amount, dbo.nt_1_deliveryorder.DO, dbo.nt_1_deliveryorder.voucher_by, 
                  dbo.nt_1_deliveryorder.broker, dbo.nt_1_deliveryorder.company_code, dbo.nt_1_deliveryorder.Year_Code, dbo.nt_1_deliveryorder.Branch_Code, dbo.nt_1_deliveryorder.purc_no, dbo.nt_1_deliveryorder.purc, 
                  dbo.nt_1_deliveryorder.purc_order, dbo.nt_1_deliveryorder.purc_type, dbo.nt_1_deliveryorder.truck_no, dbo.nt_1_deliveryorder.transport, dbo.nt_1_deliveryorder.less, dbo.nt_1_deliveryorder.less_amount, 
                  dbo.nt_1_deliveryorder.final_amout, dbo.nt_1_deliveryorder.vasuli, dbo.nt_1_deliveryorder.narration1, dbo.nt_1_deliveryorder.narration2, dbo.nt_1_deliveryorder.narration3, dbo.nt_1_deliveryorder.narration4, 
                  dbo.nt_1_deliveryorder.narration5, dbo.nt_1_deliveryorder.excise_rate, dbo.nt_1_deliveryorder.memo_no, dbo.nt_1_deliveryorder.freight, dbo.nt_1_deliveryorder.adv_freight1, dbo.nt_1_deliveryorder.driver_no, 
                  dbo.nt_1_deliveryorder.driver_Name, dbo.nt_1_deliveryorder.voucher_no, dbo.nt_1_deliveryorder.voucher_type, dbo.nt_1_deliveryorder.GETPASSCODE, dbo.nt_1_deliveryorder.tender_Remark, dbo.nt_1_deliveryorder.vasuli_rate, 
                  dbo.nt_1_deliveryorder.vasuli_amount, dbo.nt_1_deliveryorder.to_vasuli, dbo.nt_1_deliveryorder.naka_delivery, dbo.nt_1_deliveryorder.send_sms, dbo.nt_1_deliveryorder.Itag, dbo.nt_1_deliveryorder.Ac_Code, 
                  dbo.nt_1_deliveryorder.FreightPerQtl, dbo.nt_1_deliveryorder.Freight_Amount, dbo.nt_1_deliveryorder.Freight_RateMM, dbo.nt_1_deliveryorder.Freight_AmountMM, dbo.nt_1_deliveryorder.Memo_Advance, 
                  dbo.nt_1_deliveryorder.Paid_Rate1, dbo.nt_1_deliveryorder.Paid_Amount1, dbo.nt_1_deliveryorder.Paid_Narration1, dbo.nt_1_deliveryorder.Paid_Rate2, dbo.nt_1_deliveryorder.Paid_Amount2, dbo.nt_1_deliveryorder.Paid_Narration2, 
                  dbo.nt_1_deliveryorder.Paid_Rate3, dbo.nt_1_deliveryorder.Paid_Amount3, dbo.nt_1_deliveryorder.Paid_Narration3, dbo.nt_1_deliveryorder.MobileNo, dbo.nt_1_deliveryorder.Created_By, dbo.nt_1_deliveryorder.Modified_By, 
                  dbo.nt_1_deliveryorder.UTR_No, dbo.nt_1_deliveryorder.UTR_Year_Code, dbo.nt_1_deliveryorder.Carporate_Sale_No, dbo.nt_1_deliveryorder.Carporate_Sale_Year_Code, dbo.nt_1_deliveryorder.Delivery_Type, 
                  dbo.nt_1_deliveryorder.WhoseFrieght, dbo.nt_1_deliveryorder.SB_No, dbo.nt_1_deliveryorder.Invoice_No, dbo.nt_1_deliveryorder.vasuli_rate1, dbo.nt_1_deliveryorder.vasuli_amount1, dbo.nt_1_deliveryorder.Party_Commission_Rate, 
                  dbo.nt_1_deliveryorder.MM_CC, dbo.nt_1_deliveryorder.MM_Rate, dbo.nt_1_deliveryorder.Voucher_Brokrage, dbo.nt_1_deliveryorder.Voucher_Service_Charge, dbo.nt_1_deliveryorder.Voucher_RateDiffRate, 
                  dbo.nt_1_deliveryorder.Voucher_RateDiffAmt, dbo.nt_1_deliveryorder.Voucher_BankCommRate, dbo.nt_1_deliveryorder.Voucher_BankCommAmt, dbo.nt_1_deliveryorder.Voucher_Interest, 
                  dbo.nt_1_deliveryorder.Voucher_TransportAmt, dbo.nt_1_deliveryorder.Voucher_OtherExpenses, dbo.nt_1_deliveryorder.CheckPost, dbo.nt_1_deliveryorder.SaleBillTo, dbo.nt_1_deliveryorder.Pan_No, dbo.nt_1_deliveryorder.Vasuli_Ac, 
                  dbo.nt_1_deliveryorder.LoadingSms, dbo.nt_1_deliveryorder.GstRateCode, dbo.nt_1_deliveryorder.GetpassGstStateCode, dbo.nt_1_deliveryorder.VoucherbyGstStateCode, dbo.nt_1_deliveryorder.SalebilltoGstStateCode, 
                  dbo.nt_1_deliveryorder.GstAmtOnMR, dbo.nt_1_deliveryorder.GstAmtOnSR, dbo.nt_1_deliveryorder.GstExlSR, dbo.nt_1_deliveryorder.GstExlMR, dbo.nt_1_deliveryorder.MillGSTStateCode, 
                  dbo.nt_1_deliveryorder.TransportGSTStateCode, dbo.nt_1_deliveryorder.EWay_Bill_No, dbo.nt_1_deliveryorder.Distance, dbo.nt_1_deliveryorder.EWayBillChk, dbo.nt_1_deliveryorder.MillInvoiceNo, 
                  dbo.nt_1_deliveryorder.Purchase_Date, CONVERT(varchar(10), dbo.nt_1_deliveryorder.Purchase_Date, 103) AS Purchase_DateConverted, dbo.nt_1_deliveryorder.doid, dbo.nt_1_deliveryorder.mc, dbo.nt_1_deliveryorder.gp, 
                  dbo.nt_1_deliveryorder.st, dbo.nt_1_deliveryorder.sb, dbo.nt_1_deliveryorder.tc, dbo.nt_1_deliveryorder.itemcode, dbo.nt_1_deliveryorder.cs, dbo.nt_1_deliveryorder.ic, dbo.nt_1_deliveryorder.tenderdetailid, dbo.nt_1_deliveryorder.bk, 
                  dbo.nt_1_deliveryorder.docd, qrymstmillcode.Ac_Name_E AS millname, qrymstmillcode.Address_E AS milladress, qrymstmillcode.Gst_No AS millgstno, qrymstmillcode.Email_Id AS millemailid, qrymstmillcode.CompanyPan AS millpanno, 
                  qrymstmillcode.cityname AS millcityname, qrymstmillcode.citypincode AS millcitypincode, qrymstmillcode.citystate AS millcitystate, qrymstmillcode.citygststatecode AS millgststatecodemster, qrymstgetpass.Ac_Name_E AS getpassname, 
                  qrymstgetpass.Address_E AS getpassaddress, qrymstgetpass.Gst_No AS getpassgstno, qrymstgetpass.Email_Id AS getpassemailid, qrymstgetpass.CompanyPan AS getpasspanno, qrymstgetpass.cityname AS getpasscityname, 
                  qrymstgetpass.citypincode AS getpasscitypincode, qrymstgetpass.citystate AS getpasscitystate, qrymstgetpass.citygststatecode AS getpasscitygststatecode, qrymstshipto.Ac_Name_E AS shiptoname, 
                  qrymstshipto.Address_E AS shiptoaddress, qrymstshipto.Gst_No AS shiptogstno, qrymstshipto.Email_Id AS shiptoemail, qrymstshipto.CompanyPan AS shiptopanno, qrymstshipto.cityname AS shiptocityname, 
                  qrymstshipto.citypincode AS shiptocitypincode, qrymstshipto.citystate AS shiptocitystate, qrymstshipto.citygststatecode AS shiptogststatecode, qrymstsalebill.Ac_Name_E AS salebillname, qrymstsalebill.Address_E AS salebilladdress, 
                  qrymstsalebill.Gst_No AS salebillgstno, qrymstsalebill.Email_Id AS salebillemail, qrymstsalebill.CompanyPan AS salebillpanno, qrymstsalebill.cityname AS salebillcityname, qrymstsalebill.citypincode AS salebillcitypincode, 
                  qrymstsalebill.citystate AS salebillcitystate, qrymstsalebill.citygststatecode AS salebillcitygststatecode, qrymsttransportcode.Ac_Name_E AS transportname, qrymsttransportcode.Address_E AS transportaddress, 
                  qrymsttransportcode.CompanyPan AS transportpanno, qrymstbrokercode.Ac_Name_E AS brokername, qrymstdo.Ac_Name_E AS doname, qrymstbrokercode.Address_E AS doaddress, qrymsttransportcode.Gst_No AS transportgstno, 
                  qrymsttransportcode.Email_Id AS transportemail, qrymstdo.Gst_No AS dogstno, qrymstdo.Email_Id AS doemail, qrymstdo.CompanyPan AS dopanno, qrymstdo.cityname AS docityname, qrymstdo.citypincode AS docitypincode, 
                  qrymstdo.citystate AS docitystate, qrymstdo.citygststatecode AS docitygststatecode, dbo.qrymstitem.System_Name_E AS itemname, dbo.qrymstitem.HSN, qrymstmillcode.Short_Name AS millshortname, 
                  qrygetpassstatemaster.State_Name AS getpassstatename, qryshiptostatemaster.State_Name AS shiptostatename, gstmstmill.State_Name AS gstmillstatename, gstmstsellbill.State_Name AS gststatesellbillname, 
                  gstmsttransport.State_Name AS gststatetransportname, dbo.nt_1_gstratemaster.GST_Name, dbo.nt_1_deliveryorder.vb, dbo.nt_1_deliveryorder.va, qrymstvoucherby.Ac_Name_E AS voucherbyname, 
                  qrymstvasuliacc.Ac_Name_E AS vasuliacname, qrymstshipto.Mobile_No AS shiptomobno, qrymstshipto.FSSAI AS shiptofssai, qrymstshipto.ECC_No AS shiptoeccno, qrymsttransportcode.Mobile_No AS transportmobno, 
                  qrymstgetpass.Mobile_No AS getpassmobno, qrymstgetpass.Cst_no AS getpasscstno, qrymstgetpass.FSSAI AS getpassfssai, qrymstvoucherby.Address_E AS vouvherbyaddress, qrymstvoucherby.cityname AS voucherbycityname, 
                  qrymstvoucherby.citystate AS voucherbycitystate, qrymstvoucherby.Cst_no AS voucherbycstno, qrymstvoucherby.Gst_No AS voucherbygstno, qrymstvoucherby.CompanyPan AS voucherbypan, 
                  qrymstvoucherby.Mobile_No AS voucherbymobno, qrymstmillcode.Mobile_No AS millmobno, qrymstsalebill.Mobile_No AS salebillmobno, qrymstbrokercode.Mobile_No AS brokermobno, dbo.nt_1_deliveryorder.carporate_ac, 
                  dbo.nt_1_deliveryorder.ca, qrycarporateac.Ac_Name_E AS carporateacname, qrycarporateac.Gst_No AS carporateacgstno, qrycarporateac.citygststatecode AS carporateacstatecode, 
                  qrymstvoucherby.citygststatecode AS voucherbystatecode, qrymsttransportcode.citygststatecode AS transportstatecode, dbo.nt_1_deliveryorder.mill_inv_date, CONVERT(varchar(10), dbo.nt_1_deliveryorder.mill_inv_date, 103) 
                  AS mill_inv_dateConverted, dbo.nt_1_deliveryorder.mill_rcv, qrymstsalebill.Short_Name AS billtoshortname, qrymstshipto.Short_Name AS shiptoshortname, qrymsttransportcode.Short_Name AS transportshortname, 
                  qrymstdo.Short_Name AS doshortname, qrymstvoucherby.Short_Name AS voucherbyshortname, qrymstgetpass.Short_Name AS getpassshortname, dbo.nt_1_deliveryorder.MillEwayBill, dbo.nt_1_deliveryorder.TCS_Rate, 
                  dbo.nt_1_deliveryorder.Sale_TCS_Rate, dbo.nt_1_deliveryorder.Mill_AmtWO_TCS, dbo.nt_1_deliveryorder.newsbno, CONVERT(varchar(10), dbo.nt_1_deliveryorder.newsbdate, 103) AS newsbdate, dbo.nt_1_deliveryorder.einvoiceno, 
                  dbo.nt_1_deliveryorder.ackno, dbo.nt_1_deliveryorder.brandcode, dbo.Brand_Master.Marka, dbo.nt_1_deliveryorder.Cash_diff, dbo.nt_1_deliveryorder.CashDiffAc, dbo.nt_1_deliveryorder.TDSAc, dbo.nt_1_deliveryorder.CashDiffAcId, 
                  dbo.nt_1_deliveryorder.TDSAcId, dbo.nt_1_deliveryorder.TDSRate, dbo.nt_1_deliveryorder.TDSAmt, qryTDS.Ac_Name_E AS TDSName, qrycashdiif.Ac_Name_E AS CAshdiffName, dbo.nt_1_deliveryorder.TDSCut, 
                  dbo.nt_1_deliveryorder.tenderid, dbo.nt_1_tender.Payment_To, dbo.nt_1_deliveryorder.MemoGSTRate, qrymstshipto.Pincode, dbo.nt_1_deliveryorder.RCMCGSTAmt, dbo.nt_1_deliveryorder.RCMSGSTAmt, 
                  dbo.nt_1_deliveryorder.RCMIGSTAmt, dbo.nt_1_deliveryorder.saleid, qrymstgetpass.Pincode AS getpasspin, dbo.nt_1_tender.season, dbo.nt_1_accountmaster.Short_Name AS paymentshortname, dbo.nt_1_deliveryorder.RCMNumber, 
                  CONVERT(varchar(10), dbo.nt_1_deliveryorder.EwayBillValidDate, 103) AS EwayBillValidDate, dbo.nt_1_deliveryorder.SaleTDSRate, dbo.nt_1_deliveryorder.PurchaseTDSRate, dbo.nt_1_deliveryorder.PurchaseRate, 
                  dbo.nt_1_deliveryorder.SBNarration, ' ' AS WordinAmount, dbo.nt_1_tender.Tender_Date, ' ' AS utrnarration, qrymstdo.Address_E AS DoAdd, qrymstgetpass.Tan_no AS getpasstan_no, qrymstshipto.Tan_no AS shiptotan_no, 
                  qrymstdo.FSSAI AS dofssaino, qrycashdiif.cityname AS cashdiifcity, qrycashdiif.Mobile_No AS cashdiifmobno, dbo.nt_1_deliveryorder.MailSend, dbo.nt_1_deliveryorder.ISEInvoice, dbo.nt_1_deliveryorder.IsPayment, 
                  CONVERT(varchar(10), dbo.nt_1_deliveryorder.Do_DATE, 103) AS Do_Date_Conv, dbo.nt_1_sugarsale.saleid AS saleidtable, dbo.qrymstaccountmaster.Ac_Name_E AS saleBillToName, 
                  dbo.qrymstaccountmaster.Pincode AS saleBillToPinCode, dbo.qrymstaccountmaster.Gst_No AS saleBillToGSTNo, dbo.qrymstaccountmaster.FSSAI AS saleBillToFSSAI, dbo.qrymstaccountmaster.GSTStateCode, 
                  dbo.qrymstaccountmaster.cityname AS saleBillToCityName, dbo.qrymstaccountmaster.CompanyPan AS saleBillToPan, dbo.qrymstaccountmaster.State_Name AS saleBillToStateName, 
                  dbo.qrymstaccountmaster.Address_E AS saleBillToAddress, dbo.qrydodetail.Narration, dbo.qrydodetail.Amount AS UTRAmount, dbo.qrydodetail.UTRDate, dbo.qrydodetail.totUTRAmt
FROM     dbo.nt_1_deliveryorder INNER JOIN
                  dbo.qrymstaccountmaster ON dbo.nt_1_deliveryorder.sb = dbo.qrymstaccountmaster.accoid LEFT OUTER JOIN
                  dbo.qrydodetail ON dbo.nt_1_deliveryorder.doid = dbo.qrydodetail.doid LEFT OUTER JOIN
                  dbo.nt_1_sugarsale ON dbo.nt_1_deliveryorder.Year_Code = dbo.nt_1_sugarsale.Year_Code AND dbo.nt_1_deliveryorder.company_code = dbo.nt_1_sugarsale.Company_Code AND 
                  dbo.nt_1_deliveryorder.doc_no = dbo.nt_1_sugarsale.DO_No LEFT OUTER JOIN
                  dbo.nt_1_accountmaster RIGHT OUTER JOIN
                  dbo.nt_1_tender ON dbo.nt_1_accountmaster.accoid = dbo.nt_1_tender.pt ON dbo.nt_1_deliveryorder.purc_no = dbo.nt_1_tender.Tender_No AND 
                  dbo.nt_1_deliveryorder.company_code = dbo.nt_1_tender.Company_Code LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qryTDS ON dbo.nt_1_deliveryorder.TDSAcId = qryTDS.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrycashdiif ON dbo.nt_1_deliveryorder.CashDiffAcId = qrycashdiif.accoid LEFT OUTER JOIN
                  dbo.Brand_Master ON dbo.nt_1_deliveryorder.company_code = dbo.Brand_Master.Company_Code AND dbo.nt_1_deliveryorder.brandcode = dbo.Brand_Master.Code LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymsttransportcode ON dbo.nt_1_deliveryorder.tc = qrymsttransportcode.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrycarporateac ON dbo.nt_1_deliveryorder.ca = qrycarporateac.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstvasuliacc ON dbo.nt_1_deliveryorder.va = qrymstvasuliacc.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstvoucherby ON dbo.nt_1_deliveryorder.vb = qrymstvoucherby.accoid LEFT OUTER JOIN
                  dbo.nt_1_gstratemaster ON dbo.nt_1_deliveryorder.GstRateCode = dbo.nt_1_gstratemaster.Doc_no AND dbo.nt_1_deliveryorder.company_code = dbo.nt_1_gstratemaster.Company_Code LEFT OUTER JOIN
                  dbo.qrymstitem ON dbo.nt_1_deliveryorder.ic = dbo.qrymstitem.systemid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstdo ON dbo.nt_1_deliveryorder.docd = qrymstdo.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstbrokercode ON qrymstbrokercode.accoid = dbo.nt_1_deliveryorder.bk LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstsalebill ON dbo.nt_1_deliveryorder.sb = qrymstsalebill.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstshipto LEFT OUTER JOIN
                  dbo.gststatemaster AS qryshiptostatemaster ON qryshiptostatemaster.State_Code = qrymstshipto.GSTStateCode ON dbo.nt_1_deliveryorder.st = qrymstshipto.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstgetpass LEFT OUTER JOIN
                  dbo.gststatemaster AS qrygetpassstatemaster ON qrygetpassstatemaster.State_Code = qrymstgetpass.GSTStateCode ON dbo.nt_1_deliveryorder.gp = qrymstgetpass.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstmillcode LEFT OUTER JOIN
                  dbo.gststatemaster AS gstmstmill ON qrymstmillcode.GSTStateCode = gstmstmill.State_Code ON qrymstmillcode.accoid = dbo.nt_1_deliveryorder.mc LEFT OUTER JOIN
                  dbo.gststatemaster AS gstmstsellbill ON qrymstsalebill.GSTStateCode = gstmstsellbill.State_Code LEFT OUTER JOIN
                  dbo.gststatemaster AS gstmsttransport ON qrymsttransportcode.GSTStateCode = gstmsttransport.State_Code
                 where dbo.nt_1_deliveryorder.Company_Code = :company_code and dbo.nt_1_deliveryorder.Year_Code = :year_code and dbo.nt_1_deliveryorder.doc_no = :doc_no
                                 '''
            )
        additional_data = db.session.execute(text(query), {"company_code": company_code, "year_code": year_code, "doc_no": doc_no})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
        

        # Convert additional_data_rows to a list of dictionaries
        all_data = [dict(row._mapping) for row in additional_data_rows]

        for data in all_data:
            if 'doc_date' in data and data['doc_date'] is not None:
                data['doc_date'] = data['doc_date'].strftime('%Y-%m-%d')
            else:
                data['doc_date'] = None

            if 'Purchase_Date' in data and data['Purchase_Date'] is not None:
                data['Purchase_Date'] = data['Purchase_Date'].strftime('%Y-%m-%d')
            else:
                data['Purchase_Date'] = None

            if 'mill_inv_date' in data and data['mill_inv_date'] is not None:
                data['mill_inv_date'] = data['mill_inv_date'].strftime('%Y-%m-%d')
            else:
                data['mill_inv_date'] = None

            if 'Tender_Date' in data and data['Tender_Date'] is not None:
                data['Tender_Date'] = data['Tender_Date'].strftime('%Y-%m-%d')
            else:
                data['Tender_Date'] = None

            if 'UTRDate' in data and data['UTRDate'] is not None:
                data['UTRDate'] = data['UTRDate'].strftime('%Y-%m-%d')
            else:
                data['UTRDate'] = None


        # Prepare response data 
        response = {
            "all_data": all_data
        }
        # If record found, return it
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

