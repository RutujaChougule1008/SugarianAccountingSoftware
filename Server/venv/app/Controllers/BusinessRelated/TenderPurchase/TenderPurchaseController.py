# project_folder/app/routes/tender_routes.py
from datetime import datetime, timedelta, date
import traceback
from flask import Flask, jsonify, request
from app import app, db, socketio
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import socketio
from app.utils.CommonGLedgerFunctions import get_accoid
from app.models.BusinessReleted.TenderPurchase.TenderPurchaseModels import TenderHead, TenderDetails 
from sqlalchemy import func, text
from sqlalchemy.exc import SQLAlchemyError 
import os
import requests
API_URL = os.getenv('API_URL')
# Import schemas from the schemas module
from app.models.BusinessReleted.TenderPurchase.TenserPurchaseSchema import TenderHeadSchema, TenderDetailsSchema
from app.utils.CommonGLedgerFunctions import fetch_auto_voucher_value
from app.utils.CommonSugarPurchaseStatusCheck import get_match_status 
sio = socketio.Server()

app.config['SECRET_KEY'] = 'ABCDEFGHIJKLMNOPQRST'
CORS(app, cors_allowed_origins="*")

# Global SQL Query
TASK_DETAILS_QUERY = '''
  SELECT        Mill.Ac_Name_E AS MillName, dbo.nt_1_tender.Mill_Code, dbo.nt_1_tender.mc, dbo.nt_1_tender.ic, dbo.nt_1_tender.itemcode, dbo.qrymstitem.System_Name_E AS ItemName, dbo.nt_1_tender.Bp_Account, dbo.nt_1_tender.bp, 
                         BPAccount.Ac_Name_E AS BPAcName, dbo.nt_1_tender.Payment_To, dbo.nt_1_tender.pt, PaymentTo.Ac_Name_E AS PaymentToAcName, dbo.nt_1_tender.Tender_From, dbo.nt_1_tender.tf, 
                         TenderFrom.Ac_Name_E AS TenderFromAcName, dbo.nt_1_tender.Tender_DO, dbo.nt_1_tender.td, TenderDo.Ac_Name_E AS TenderDoAcName, dbo.nt_1_tender.Voucher_By, dbo.nt_1_tender.vb, 
                         VoucherBy.Ac_Name_E AS VoucherByAcName, dbo.nt_1_tender.Broker, dbo.nt_1_tender.bk, Broker.Ac_Name_E AS BrokerAcName, dbo.nt_1_tender.gstratecode, dbo.nt_1_gstratemaster.GST_Name, 
                         dbo.nt_1_gstratemaster.Rate AS GSTRate, dbo.qrytenderdetail.*
FROM            dbo.nt_1_tender LEFT OUTER JOIN
                         dbo.qrytenderdetail ON dbo.nt_1_tender.tenderid = dbo.qrytenderdetail.tenderid LEFT OUTER JOIN
                         dbo.nt_1_gstratemaster ON dbo.nt_1_tender.Company_Code = dbo.nt_1_gstratemaster.Company_Code AND dbo.nt_1_tender.gstratecode = dbo.nt_1_gstratemaster.Doc_no LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS Broker ON dbo.nt_1_tender.bk = Broker.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS VoucherBy ON dbo.nt_1_tender.vb = VoucherBy.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS TenderDo ON dbo.nt_1_tender.td = TenderDo.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS TenderFrom ON dbo.nt_1_tender.tf = TenderFrom.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS PaymentTo ON dbo.nt_1_tender.pt = PaymentTo.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS BPAccount ON dbo.nt_1_tender.bp = BPAccount.accoid LEFT OUTER JOIN
                         dbo.qrymstitem ON dbo.nt_1_tender.ic = dbo.qrymstitem.systemid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS Mill ON dbo.nt_1_tender.mc = Mill.accoid
						 where  dbo.nt_1_tender.tenderid=:tenderid
'''

#date Format Function
def format_dates(task):
    return {
        "Lifting_Date": task.Lifting_Date.strftime('%Y-%m-%d') if task.Lifting_Date else None,
         "Tender_Date": task.Tender_Date.strftime('%Y-%m-%d') if task.Tender_Date else None,
    }

def format_dates_details(row):
    if 'Sauda_Date' in row:
        row['Sauda_Date'] = row['Sauda_Date'].strftime('%Y-%m-%d') if row['Sauda_Date'] else None
    if 'payment_date' in row:
        row['payment_date'] = row['payment_date'].strftime('%Y-%m-%d') if row['payment_date'] else None
    return row

#Fetching Dates for TenderPurchase 
def get_millPayment_Date(company_code, year_code):
    result = db.session.execute(
        text("SELECT Mill_Payment_date FROM nt_1_companyparameters WHERE company_code = :company_code AND year_code = :year_code"),
        {'company_code': company_code, 'year_code': year_code}
    ).fetchone()
    return result.Mill_Payment_date if result else None

# Define a function to compute the new lifting date
def compute_lifting_date(lifting_date_str, mill_payment_days):
    try:
        # Convert lifting_date from string to date object
        lifting_date_obj = datetime.strptime(lifting_date_str, "%Y-%m-%d").date()
        new_lifting_date = lifting_date_obj + timedelta(days=mill_payment_days)
        return new_lifting_date
    except ValueError:
        return None

# Define schemas
tender_head_schema = TenderHeadSchema()
tender_head_schemas = TenderHeadSchema(many=True)

tender_detail_schema = TenderDetailsSchema()
tender_detail_schemas = TenderDetailsSchema(many=True)


#Get data for Utility
@app.route(API_URL+"/all_tender_data", methods=["GET"])
def all_tender_data():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Bad request", "message": "Missing company_code or year_code parameter"}), 400

        sql_query = """
            SELECT ROW_NUMBER() OVER (ORDER BY Tender_No DESC) AS RowNumber,
                   Tender_No,
                   Tender_DateConverted AS Tender_Date,
                   millshortname,
                   Quantal,
                   Grade,
                   Mill_Rate,
                   paymenttoname,
                   tenderdoname,
                   season,
                   brokershortname,
                   Lifting_DateConverted AS Lifting_Date,
                   tenderid,
                   Mill_Code
            FROM qrytenderhead
            WHERE Company_Code = :company_code AND Year_Code = :year_code
            ORDER BY Tender_No DESC
        """
        result = db.session.execute(text(sql_query), {'company_code': company_code, 'year_code': year_code})

        columns = result.keys()
        response = [dict(zip(columns, row)) for row in result]

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
# # We have to get the data By the Particular Task No...
@app.route(API_URL+'/getTenderByTenderNo', methods=["GET"])
def get_task_by_task_no():
    try:
        Tender_No = request.args.get('Tender_No')
        yearCode = request.args.get('Year_Code')
        companyCode = request.args.get('Company_Code')
        if not Tender_No:
            return jsonify({"error": "Task number not provided"}), 400

        task_head = TenderHead.query.filter_by(Tender_No=Tender_No, Year_Code = yearCode,Company_Code=companyCode).first()
        newtenderid = task_head.tenderid
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"tenderid": newtenderid})

        additional_data_rows = [row._asdict() for row in additional_data.fetchall()]

        formatted_additional_data_rows = [format_dates_details(row) for row in additional_data_rows]
   
        response = {
            "last_tender_head_data": {
                **{column.name: getattr(task_head, column.name) for column in task_head.__table__.columns},
                  **format_dates(task_head), 
            },
            "last_tender_details_data": formatted_additional_data_rows
        }
        return jsonify(response), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# #Insert the record in both the table also perform the oprtation add,update,delete..
@app.route(API_URL+"/insert_tender_head_detail", methods=["POST"])
def insert_tender_head_detail():
    try:
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']
        try:
            maxTender_No = db.session.query(db.func.max(TenderHead.Tender_No)).filter_by(Company_Code=headData['Company_Code'],Year_Code=headData['Year_Code']).scalar() or 0
            newTenderNo = maxTender_No + 1
            headData['Tender_No'] = newTenderNo
            new_head = TenderHead(**headData)
            new_head
            db.session.add(new_head)

            createdDetails = []
            updatedDetails = []
            deletedDetailIds = []

            max_detail_id = db.session.query(db.func.max(TenderDetails.ID)).filter_by(tenderid=newTenderNo).scalar() or 0

            dispatchType = get_dispatch_type(headData['Company_Code'])

            for index, item in enumerate(detailData, start=1):
    
               if 'rowaction' in item:
                    if item['rowaction'] == "add":
                        item['ID'] = max_detail_id + index
                        item['Tender_No'] = newTenderNo
                        del item['rowaction']
                        new_detail = TenderDetails(**item)
                        new_head.details.append(new_detail)
                        createdDetails.append(new_detail)

                    elif item['rowaction'] == "update":
                        tenderdetailid = item['tenderdetailid']
                        print('tenderdetailid',tenderdetailid)
                        update_values = {k: v for k, v in item.items() if k not in ('tenderdetailid', 'tenderid')}
                        del update_values['rowaction']  
                        db.session.query(TenderDetails).filter(TenderDetails.tenderdetailid == tenderdetailid).update(update_values)
                        updatedDetails.append(tenderdetailid)

                    elif item['rowaction'] == "delete":
                        tenderdetailid = item['tenderdetailid']
                        detail_to_delete = db.session.query(TenderDetails).filter(TenderDetails.tenderdetailid == tenderdetailid).one_or_none()
        
                        if detail_to_delete:
                            db.session.delete(detail_to_delete)
                            deletedDetailIds.append(tenderdetailid)

            db.session.commit()

            head_data = tender_head_schema.dump(new_head)
            added_details = [tender_detail_schema.dump(detail) for detail in createdDetails]

        # Emit the new tender head data and details to all connected clients
            sio.emit('addTender', {
            'head': head_data,
            'addedDetails': added_details,
            'updatedDetails': updatedDetails,
            'deletedDetailIds': deletedDetailIds
        })

            cash_diff = headData.get('CashDiff', 0)
            tran_type = "CV" if cash_diff < 0 else "LV"

            qntl = headData['Quantal'] 
            drpType = headData['type']
            millRate = float(headData.get('Mill_Rate', 0))  
            purchaseRate = float(headData.get('Purc_Rate', 0))  
            
            diffAmt = float(headData.get('CashDiff',0))  

            autoVoucher = fetch_auto_voucher_value(headData['Company_Code'], headData['Year_Code'])
            narration = ""
            if autoVoucher == "Yes" and (drpType == "R" or drpType == "W"):
                if purchaseRate > 0:
                    narration = f"Quintal: {qntl} Mill: {millRate} Purchase Rate: {purchaseRate}"

            taxMillAmt = float(qntl) * diffAmt  

            isGstCodematched = get_match_status(headData['Voucher_By'], headData['Company_Code'], headData['Year_Code'])

            cgstAmt = 0.00
            sgstAmt = 0.00
            igstAmt = 0.00

            cgstRate = 0.00
            sgstRate = 0.00
            igstRate = 0.00

            if isGstCodematched == "TRUE":
                cgstRate = 2.5
                sgstRate = 2.5
                igstRate = 0.00
                cgstAmt = taxMillAmt * cgstRate / 100 or 0.00
                sgstAmt = taxMillAmt * sgstRate / 100 or 0.00
            else:
                cgstRate = 0.00
                sgstRate = 0.00
                igstRate = 5.00
                igstAmt = taxMillAmt * igstRate / 100 or 0.00

            voucherAmt = cgstAmt + sgstAmt + igstAmt + taxMillAmt

            print("VoucherAmt", voucherAmt)

            commissionAmt = diffAmt * float(qntl)

            lvTcsRate = float(headData['TCS_Rate'])  
            lvTdsRate = float(headData['TDS_Rate'])  
            lvTcsAmt = lvTcsRate * voucherAmt /100 
            lvTdsAmt = lvTdsRate * voucherAmt /100

            lvTcsNetPayable = voucherAmt + lvTcsAmt 

            lvNetPayable = 0
            lvNetPayable = lvNetPayable - lvTdsAmt

            commission_data = {
                "Company_Code": headData['Company_Code'],
                "Tran_Type": tran_type,  
                "Year_Code": headData['Year_Code'],
                "doc_date": headData['Tender_Date'],  
                "bill_amount": voucherAmt,  
                "narration1": narration, 
                "item_code": headData['itemcode'],
                "ic": headData['ic'],
                "ac_code": headData['Voucher_By'],
                "ac": headData['vb'],
                "bags": headData['Bags'],
                "mill_code": headData['Mill_Code'],
                "mc": headData['mc'],
                "qntl": int(headData['Quantal']),
                "packing": headData['Packing'],
                "mill_rate": headData['Mill_Rate'],
                "sale_rate": 0.00,
                "purc_rate": headData['Purc_Rate'],
                "link_no": newTenderNo,
                "link_type": drpType,
                "link_id": newTenderNo,
                "unit_code": 0,
                "broker_code": headData['Broker'],
                "grade": headData['Grade'],
                "transport_code": 0,
                "commission_amount": commissionAmt,
                "resale_rate": 0.00,
                "resale_commission": 0.00,
                "misc_amount": 0.00,
                "texable_amount": taxMillAmt,
                "gst_code": 1,
                "cgst_rate": cgstRate,
                "cgst_amount": cgstAmt,
                "sgst_rate": sgstRate,
                "sgst_amount": sgstAmt,
                "igst_rate": igstRate,
                "igst_amount": igstAmt,
                "bill_amount": voucherAmt,
                "uc": 0,
                "bc": headData['bk'],
                "TCS_Rate": lvTcsRate,
                "TCS_Amt": lvTcsAmt,
                "TCS_Net_Payable": lvTcsNetPayable,
                "TDS": lvTdsRate,
                "TDS_Per": lvTdsRate,
                "Tran_Type": tran_type,
                "TDSAmount": lvTdsAmt,
                "TDS_Ac": headData['Payment_To'],
                "ta": headData['pt'],
                "Frieght_Rate":0,
                "Frieght_amt":0,
                "subtotal":taxMillAmt,
                "BANK_COMMISSION":0.0
            }

            commission_response = requests.post(
                (
    f"http://localhost:8080/api/sugarian/create-RecordCommissionBill"
    f"?Company_Code={headData['Company_Code']}&Tran_Type={tran_type}&Year_Code={headData['Year_Code']}"
),
                json=commission_data
            )
            if commission_response.status_code == 201:
                commission_response_data = commission_response.json()
                commissionId = commission_response_data.get("record", {}).get("commissionid")
                docNo =  commission_response_data.get("record", {}).get("new_Record_data", {}).get("doc_no") 
                tranType = commission_response_data.get("record", {}).get("new_Record_data", {}).get("Tran_Type")

                db.session.query(TenderHead).filter_by(Tender_No=newTenderNo, Company_Code=headData['Company_Code'], Year_Code=headData['Year_Code']).update({"Voucher_No": docNo,"commissionid": commissionId, "Voucher_Type": tranType})
                db.session.commit()
            else:
                return jsonify({"error": "Failed to create Commission Bill", "message": commission_response.json()}), 500
                        

            return jsonify({
                "message": "Data Inserted successfully",
                "head": tender_head_schema.dump(new_head),
                "addedDetails": [tender_detail_schema.dump(detail) for detail in createdDetails],
                "updatedDetails": updatedDetails,
                "deletedDetailIds": deletedDetailIds
            }), 201  
        
        except Exception as e:
            print("Traceback",traceback.format_exc())
            db.session.rollback()
            print(e)
            return jsonify({"error": "Internal server error", "message": str(e)}), 500  

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500  
    

# #Update the record in both the table also perform the oprtation add,update,delete in detail section..
@app.route(API_URL+"/update_tender_purchase", methods=["PUT"])
def update_tender_purchase():
    try:
        tenderid = request.args.get('tenderid')
        if tenderid is None:
            return jsonify({"error": "Missing 'tenderid' parameter"}), 400  
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']

        try:
            transaction = db.session.begin_nested()
            updatedHeadCount = db.session.query(TenderHead).filter(TenderHead.tenderid == tenderid).update(headData)
            
            createdDetails = []
            updatedDetails = []
            deletedDetailIds = []

            updated_tender_head = db.session.query(TenderHead).filter(TenderHead.tenderid == tenderid).one()
            tender_no = updated_tender_head.Tender_No

            for item in detailData:
                if item['rowaction'] == "add":
                    item['Tender_No'] = tender_no
                    item['tenderid'] = tenderid
                    if 'ID' not in item:
                        max_detail_id = db.session.query(db.func.max(TenderDetails.ID)).filter_by(tenderid=tenderid).scalar() or 0
                        new_detail_id = max_detail_id + 1
                        item['ID'] = new_detail_id
                    del item['rowaction'] 
                    new_detail = TenderDetails(**item)
                    db.session.add(new_detail) 
                    createdDetails.append(item)

                elif item['rowaction'] == "update":
                    item['Tender_No'] = tender_no
                    item['tenderid'] = tenderid
                    tenderdetailid = item['tenderdetailid']
                    update_values = {k: v for k, v in item.items() if k not in ('tenderdetailid', 'tenderid')}
                    del update_values['rowaction'] 
                    db.session.query(TenderDetails).filter(TenderDetails.tenderdetailid == tenderdetailid).update(update_values)
                    updatedDetails.append(tenderdetailid)

                elif item['rowaction'] == "delete":
                    tenderdetailid = item['tenderdetailid']
                    detail_to_delete = db.session.query(TenderDetails).filter(TenderDetails.tenderdetailid == tenderdetailid).one_or_none()
    
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deletedDetailIds.append(tenderdetailid)

            db.session.commit()


            qntl = float(headData['Quantal'])
            millRate = float(headData['Mill_Rate'])
            purchaseRate = float(headData['Purc_Rate'])
            cash_diff = headData.get('CashDiff', 0)

            diffAmt = float(cash_diff)
            taxMillAmt = qntl * diffAmt
            isGstCodematched = get_match_status(headData['Voucher_By'], headData['Company_Code'], headData['Year_Code'])

            cgstRate = 2.5 if isGstCodematched == "TRUE" else 0.0
            sgstRate = 2.5 if isGstCodematched == "TRUE" else 0.0
            igstRate = 5.0 if isGstCodematched != "TRUE" else 0.0

            cgstAmt = taxMillAmt * cgstRate / 100
            sgstAmt = taxMillAmt * sgstRate / 100
            igstAmt = taxMillAmt * igstRate / 100

            voucherAmt = cgstAmt + sgstAmt + igstAmt + taxMillAmt

            commissionAmt = diffAmt * qntl
            lvTcsRate = float(headData['TCS_Rate'])
            lvTdsRate = float(headData['TDS_Rate'])
            lvTcsAmt = lvTcsRate * voucherAmt /100
            lvTdsAmt = lvTdsRate * voucherAmt /100

            lvTcsNetPayable = voucherAmt + lvTcsAmt
            lvNetPayable = lvTcsNetPayable - lvTdsAmt

            commission_data = {
                "Company_Code": headData['Company_Code'],
                "Tran_Type": headData['Voucher_Type'], 
                "Year_Code": headData['Year_Code'],
                "doc_date": headData['Tender_Date'],
                "bill_amount": voucherAmt,
                "narration1": f"Qntl: {qntl}, Mill: {millRate}, Purc Rate: {purchaseRate}",
                "item_code": headData['itemcode'],
                "ac_code": headData['Voucher_By'],
                "ac": headData['vb'],
                "bags": headData['Bags'],
                "mill_code": headData['Mill_Code'],
                "mc": headData['mc'],
                "qntl": headData['Quantal'],
                "packing": headData['Packing'],
                "mill_rate": millRate,
                "purc_rate": purchaseRate,
                "link_no": tender_no,
                "link_type": headData['type'],
                "broker_code": headData['Broker'],
                "commission_amount": commissionAmt,
                "texable_amount": taxMillAmt,
                "cgst_rate": cgstRate,
                "cgst_amount": cgstAmt,
                "sgst_rate": sgstRate,
                "sgst_amount": sgstAmt,
                "igst_rate": igstRate,
                "igst_amount": igstAmt,
                "bill_amount": voucherAmt,
                "TCS_Rate": lvTcsRate,
                "TCS_Amt": lvTcsAmt,
                "TCS_Net_Payable": lvTcsNetPayable,
                "TDS_Ac": headData['Payment_To'],
                "TDSAmount": lvTdsAmt,
                "TDS_Rate": lvTdsRate,
                "BANK_COMMISSION":0.0
            }

            commission_response = requests.put(
                f"http://localhost:8080/api/sugarian/update-CommissionBill?Company_Code={headData['Company_Code']}&Tran_Type={headData['Voucher_Type']}&Year_Code={headData['Year_Code']}&doc_no={updated_tender_head.Voucher_No}",
                json=commission_data
            )

            if commission_response.status_code != 200:
                return jsonify({"error": "Failed to update Commission Bill", "message": commission_response.json()}), 500

            db.session.commit()
            serialized_created_details = createdDetails 

            return jsonify({
                "message": "Data Updated successfully",
                "updatedHeadCount": updatedHeadCount,
                "addedDetails": serialized_created_details,
                "updatedDetails": updatedDetails,
                "deletedDetailIds": deletedDetailIds
            }), 200 

        except Exception as e:
            print("Traceback",traceback.format_exc())
            db.session.rollback()
            return jsonify({"error": "Internal server error", "message": str(e)}), 500 

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500  

# #Delete record from datatabse based tenderid  
@app.route(API_URL+"/delete_TenderBytenderid", methods=["DELETE"])
def delete_TenderBytenderid():
    try:
        tenderid = request.args.get('tenderid')
        with db.session.begin():
            deleted_user_rows = TenderDetails.query.filter_by(tenderid=tenderid).delete()
            deleted_task_rows = TenderHead.query.filter_by(tenderid=tenderid).delete()
        db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_task_rows} Task row(s) and {deleted_user_rows} User row(s) successfully"
        }), 200

    except Exception as e:
        
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


# #Fetch the last Record on database by Tender No
@app.route(API_URL+"/get_last_tender_no_data", methods=["GET"])
def get_last_tender_no_data():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code:
            return jsonify({"error": "Company_Code and Year_Code query parameter is required"}), 400
        
        last_tender_head = TenderHead.query.filter_by(Company_Code=company_code,Year_Code=year_code).order_by(TenderHead.tenderid.desc()).first()

        if not last_tender_head:
            return jsonify({"error": "No records found in last_tender_head table"}), 404

        last_tenderid = last_tender_head.tenderid

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"tenderid": last_tenderid})
     
        additional_data_rows = [row._asdict() for row in additional_data.fetchall()]
    
        last_tender_head_data = {
            **{column.name: getattr(last_tender_head, column.name) for column in last_tender_head.__table__.columns},
            **format_dates(last_tender_head), 
        }

        last_tender_details_data = additional_data_rows
        response = {
            "last_tender_head_data": last_tender_head_data,
            "last_tender_details_data": last_tender_details_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
# #Get First record from database in navigation...
@app.route(API_URL+"/getfirsttender_record_navigation", methods=["GET"])
def get_first_record_navigation():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code:
            return jsonify({"error": "Company_Code and Year_Code query parameter is required"}), 400
        
        first_task = TenderHead.query.filter_by(Company_Code=company_code,Year_Code=year_code).order_by(TenderHead.tenderid.asc()).first()

        if not first_task:
            return jsonify({"error": "No records found in Task_Entry table"}), 404

        first_taskid = first_task.tenderid

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"tenderid": first_taskid})

        additional_data_rows = [row._asdict() for row in additional_data.fetchall()]

        formatted_additional_data_rows = [format_dates_details(row) for row in additional_data_rows]
       
        response = {
            "first_tender_head_data": {
                **{column.name: getattr(first_task, column.name) for column in first_task.__table__.columns},
                **format_dates(first_task), 
            },
            "first_tender_details_data": formatted_additional_data_rows
        }

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


# #Get last Record from Database in navigation 
@app.route(API_URL+"/getlasttender_record_navigation", methods=["GET"])
def get_last_record_navigation():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code:
            return jsonify({"error": "Company_Code and Year_Code query parameter is required"}), 400
        
        last_task = TenderHead.query.filter_by(Company_Code=company_code,Year_Code=year_code).order_by(TenderHead.tenderid.desc()).first()

        if not last_task:
            return jsonify({"error": "No records found in Task_Entry table"}), 404

        last_taskid = last_task.tenderid

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"tenderid": last_taskid})

        additional_data_rows = [row._asdict() for row in additional_data.fetchall()]

        formatted_additional_data_rows = [format_dates_details(row) for row in additional_data_rows]
      
        response = {
            "last_tender_head_data": {
                **{column.name: getattr(last_task, column.name) for column in last_task.__table__.columns},
                **format_dates(last_task),
                
            },
            "last_tender_details_data": 
                formatted_additional_data_rows,  
        }

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
# #Get Previous record by database 
@app.route(API_URL+"/getprevioustender_navigation", methods=["GET"])
def get_previous_task_navigation():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')
        current_task_no = request.args.get('CurrenttenderNo')

        if not company_code:
            return jsonify({"error": "Company_Code and Year_Code query parameter is required"}), 400
        
        if not current_task_no:
            return jsonify({"error": "Current Task No is required"}), 400

        previous_task = TenderHead.query.filter(
            TenderHead.Tender_No < current_task_no,
            TenderHead.Company_Code == company_code,
            TenderHead.Year_Code == year_code
        ).order_by(TenderHead.Tender_No.desc()).first()
    
        if not previous_task:
            return jsonify({"error": "No previous records found"}), 404

        previous_task_id = previous_task.tenderid
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"tenderid": previous_task_id})
        additional_data_rows = [row._asdict() for row in additional_data.fetchall()]

        formatted_additional_data_rows = [format_dates_details(row) for row in additional_data_rows]

        response = {
            "previous_tender_head_data": {
                **{column.name: getattr(previous_task, column.name) for column in previous_task.__table__.columns},
                **format_dates(previous_task), 
            },
            "previous_tender_details_data":formatted_additional_data_rows
        }

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
# #Get Next record by database 
@app.route(API_URL+"/getnexttender_navigation", methods=["GET"])
def get_next_task_navigation():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')
        current_task_no = request.args.get('CurrenttenderNo')

        if not company_code:
            return jsonify({"error": "Company_Code and Year_Code query parameter is required"}), 400
        
        if not current_task_no:
            return jsonify({"error": "Current Tender No required"}), 400

        next_task = TenderHead.query.filter(TenderHead.Tender_No > current_task_no,TenderHead.Company_Code == company_code,
            TenderHead.Year_Code == year_code).order_by(TenderHead.Tender_No.asc()).first()

        if not next_task:
            return jsonify({"error": "No next records found"}), 404

        next_task_id = next_task.tenderid

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"tenderid": next_task_id})
        
        additional_data_rows = [row._asdict() for row in additional_data.fetchall()]

        formatted_additional_data_rows = [format_dates_details(row) for row in additional_data_rows]
        
        response = {
            "next_tender_head_data": {
                **{column.name: getattr(next_task, column.name) for column in next_task.__table__.columns},
                **format_dates(next_task)
            },
            "next_tender_details_data": formatted_additional_data_rows
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
#Sauda Book Entry
# Add detail entry to a particular tender by Tender_No
@app.route(API_URL + "/add_tender_detail", methods=["POST"])
def add_detail_to_tender():
    try:
        data = request.get_json()
        detail_data = data.get('detailData')
        tender_no = detail_data.get('Tender_No')

        if not tender_no or not detail_data:
            return jsonify({"error": "Missing Tender_No or detailData parameter"}), 400

        tender_head = TenderHead.query.filter_by(Tender_No=tender_no).first()
        if not tender_head:
            return jsonify({"error": "Tender not found"}), 404

        tenderid = tender_head.tenderid

        max_detail_id = db.session.query(func.max(TenderDetails.ID)).filter_by(tenderid=tenderid).scalar() or 0
        new_detail_id = max_detail_id + 1

        detail_data['ID'] = new_detail_id
        detail_data['Tender_No'] = tender_no
        detail_data['tenderid'] = tenderid

        new_detail = TenderDetails(**detail_data)
        db.session.add(new_detail)
        db.session.commit()

        return jsonify({
            "message": "Detail entry added successfully",
            "detail": tender_detail_schema.dump(new_detail)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


#Stock Entry Tender Purchase DeliveryOrder
@app.route(API_URL + "/Stock_Entry_tender_purchase", methods=["PUT"])
def Stock_Entry_tender_purchase():
    try:
        tenderid = request.args.get('tenderid')
        tender_no = request.args.get('Tender_No')
        if not tenderid:
            return jsonify({"error": "Missing 'tenderid' parameter"}), 400
        
        data = request.get_json()
        detailData = data['detailData']
        createdDetails, updatedDetails, deletedDetailIds = [], [], []

        for item in detailData:
            try:
                if 'Sauda_Date' in item:
                    item['Sauda_Date'] = datetime.strptime(item['Sauda_Date'], '%Y-%m-%d').date()
                if 'Lifting_Date' in item:
                    item['Lifting_Date'] = datetime.strptime(item['Lifting_Date'], '%Y-%m-%d').date()
                
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item.update({'Tender_No': tender_no, 'tenderid': tenderid})
                    if 'ID' not in item:
                        item['ID'] = (db.session.query(db.func.max(TenderDetails.ID)).filter_by(tenderid=tenderid).scalar() or 0) + 1
                    new_detail = TenderDetails(**item)
                    db.session.add(new_detail)
                    db.session.flush()  
                    createdDetails.append(new_detail)

                elif item['rowaction'] == "update":
                    del item['rowaction']
                    db.session.query(TenderDetails).filter_by(tenderdetailid=item['tenderdetailid']).update({k: v for k, v in item.items() if k != 'tenderdetailid'})
                    updatedDetails.append(item['tenderdetailid'])

                elif item['rowaction'] == "delete":
                    detail_to_delete = db.session.query(TenderDetails).filter_by(tenderdetailid=item['tenderdetailid']).one()
                    db.session.delete(detail_to_delete)
                    deletedDetailIds.append(item['tenderdetailid'])

            except Exception as e:
                db.session.rollback()
                return jsonify({"error": "Error processing item", "message": str(e)}), 500

        db.session.commit()
        return jsonify({
            "Message": "Data Inserted Successfully...",
            "addedDetails": tender_detail_schemas.dump(createdDetails),
            "updatedDetails": updatedDetails,
            "deletedDetails": deletedDetailIds
        })

    except Exception as e:
        
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

#Fetching NextTender No
@app.route(API_URL + "/getNextTenderNo_SugarTenderPurchase", methods=["GET"])
def getNextTenderNo_SugarTenderPurchase():
    try:
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        max_doc_no = db.session.query(func.max(TenderHead.Tender_No)).filter_by(Company_Code=Company_Code, Year_Code=Year_Code).scalar()

        if max_doc_no is None:
            next_doc_no = 1  
        else:
            next_doc_no = max_doc_no + 1  

        mill_payment_days = get_millPayment_Date(Company_Code, Year_Code)

        lifting_date = compute_lifting_date(datetime.utcnow().date().isoformat(), mill_payment_days) if mill_payment_days else None


        response = {
            "next_doc_no": next_doc_no,
            "lifting_date": lifting_date.isoformat() if lifting_date else None  # Return date in ISO format
        }
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

#Fetching Self Account    
@app.route(API_URL +"/get_SelfAc", methods=['GET'])
def get_SelfAc():
    company_code = request.args.get('Company_Code')

    if not company_code:
        return jsonify({'error': 'Both Company_Code is required'}), 400
    try:
        company_code = int(company_code)
        
    except ValueError:
        return jsonify({'error': 'Company_Code  must be integer'}), 400

    query = text("select Ac_Name_E, Ac_Code, accoid from nt_1_accountmaster where Ac_Code = 2 and company_code = :company_code")
    result = db.session.execute(query, {'company_code': company_code}).fetchone()

    if result is None:
        return jsonify({'error': 'No data found for the given Company_Code'}), 404

    self_ac = result.Ac_Code
    Self_acName = result.Ac_Name_E

    accoid = get_accoid(self_ac,company_code)

    return jsonify({
        'SELF_AC': self_ac,
        'Self_acid':accoid,
        'Self_acName': Self_acName
        }), 200

#Fetching DispatchType From CompanyParameter
@app.route(API_URL+"/get_dispatch_type/<company_code>", methods=['GET'])
def get_dispatch_type(company_code):
    result = db.session.execute(
        text("SELECT dispatchType FROM nt_1_companyparameters WHERE company_code = :company_code"),
        {'company_code': company_code}
    ).fetchone()
    dispatch_type = result.dispatchType if result else None
    return jsonify({'dispatchType': dispatch_type})

