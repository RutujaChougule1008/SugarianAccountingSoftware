import traceback
from flask import Flask, jsonify, request
from app import app, db
from app.models.Outword.SaleBill.SaleBillModels import SaleBillHead,SaleBillDetail
from app.models.Reports.GLedeger.GLedgerModels import Gledger
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError 
from sqlalchemy import func
import os
import requests
from app.utils.CommonGLedgerFunctions import fetch_company_parameters,get_accoid,getSaleAc,get_acShort_Name

# Get the base URL from environment variables
API_URL= os.getenv('API_URL')

from app.models.Outword.SaleBill.SaleBillSchema import SaleBillDetailSchema, SaleBillHeadSchema

TASK_DETAILS_QUERY = '''
SELECT accode.Ac_Code AS partyaccode, accode.Ac_Name_E AS partyname, accode.accoid AS partyacid, mill.Ac_Code AS millaccode, mill.Ac_Name_E AS millname, mill.accoid AS millacid, unit.Ac_Code AS unitaccode, 
                  unit.Ac_Name_E AS unitname, broker.Ac_Code AS brokeraccode, broker.Ac_Name_E AS brokername, unit.accoid AS unitacid, broker.accoid AS brokeracid, item.systemid, item.System_Code, item.System_Name_E AS itemname, 
                  dbo.nt_1_gstratemaster.Doc_no AS gstdocno, dbo.nt_1_gstratemaster.Rate AS gstrate, dbo.nt_1_gstratemaster.gstid AS gstdocid, dbo.Brand_Master.Code AS brandocno, dbo.Brand_Master.Marka AS brandname, 
                  dbo.nt_1_sugarsaledetails.doc_no, dbo.nt_1_sugarsaledetails.detail_id, dbo.nt_1_sugarsaledetails.item_code, dbo.nt_1_sugarsaledetails.narration, dbo.nt_1_sugarsaledetails.Quantal, dbo.nt_1_sugarsaledetails.packing, 
                  dbo.nt_1_sugarsaledetails.bags, dbo.nt_1_sugarsaledetails.rate, dbo.nt_1_sugarsaledetails.item_Amount, dbo.nt_1_sugarsaledetails.Company_Code, dbo.nt_1_sugarsaledetails.Year_Code, dbo.nt_1_sugarsaledetails.saledetailid, 
                  dbo.nt_1_sugarsaledetails.saleid, dbo.nt_1_sugarsaledetails.ic, dbo.nt_1_sugarsaledetails.Brand_Code, dbo.nt_1_sugarsale.ac, dbo.nt_1_sugarsale.uc, dbo.nt_1_sugarsale.mc, dbo.nt_1_sugarsale.bk, dbo.nt_1_sugarsale.tc, 
                  transport.Ac_Code AS transportaccode, transport.Ac_Name_E AS transportname, dbo.nt_1_sugarsale.Bill_To, dbo.nt_1_sugarsale.bt, billto.Ac_Code AS billtoaccode, billto.Ac_Name_E AS billtoname, billto.accoid AS billtoacid, 
                  transport.accoid AS transportacid, dbo.nt_1_gstratemaster.GST_Name AS GSTName, accode.Mobile_No AS PartyMobNo, unit.Mobile_No AS UnitMobNo, transport.Mobile_No AS TransportMobNo, mill.Gst_No AS MillGSTNo
FROM     dbo.nt_1_accountmaster AS accode RIGHT OUTER JOIN
                  dbo.nt_1_accountmaster AS billto RIGHT OUTER JOIN
                  dbo.nt_1_sugarsale ON billto.accoid = dbo.nt_1_sugarsale.bt LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS broker INNER JOIN
                  dbo.nt_1_accountmaster AS transport ON broker.Ac_Name_R = transport.Mobile_No ON dbo.nt_1_sugarsale.tc = transport.accoid AND dbo.nt_1_sugarsale.bk = broker.accoid ON accode.accoid = dbo.nt_1_sugarsale.ac LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS unit ON dbo.nt_1_sugarsale.uc = unit.accoid LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS mill ON dbo.nt_1_sugarsale.mc = mill.accoid LEFT OUTER JOIN
                  dbo.nt_1_gstratemaster ON dbo.nt_1_sugarsale.gstid = dbo.nt_1_gstratemaster.gstid LEFT OUTER JOIN
                  dbo.nt_1_systemmaster AS item RIGHT OUTER JOIN
                  dbo.nt_1_sugarsaledetails ON item.systemid = dbo.nt_1_sugarsaledetails.ic LEFT OUTER JOIN
                  dbo.Brand_Master ON dbo.nt_1_sugarsaledetails.Brand_Code = dbo.Brand_Master.Code ON dbo.nt_1_sugarsale.saleid = dbo.nt_1_sugarsaledetails.saleid
WHERE        (item.System_Type = 'I') and dbo.nt_1_sugarsale.saleid=:saleid
'''

def format_dates(task):
    return {
        
        "doc_date": task.doc_date.strftime('%Y-%m-%d') if task.doc_date else None,
        "newsbdate": task.newsbdate.strftime('%Y-%m-%d') if task.newsbdate else None,
        "EwayBillValidDate": task.EwayBillValidDate.strftime('%Y-%m-%d') if task.EwayBillValidDate else None,

    }


# Define schemas
saleBill_head_schema = SaleBillHeadSchema()
saleBill_head_schemas = SaleBillHeadSchema(many=True)

saleBill_detail_schema = SaleBillDetailSchema()
saleBill_detail_schemas = SaleBillDetailSchema(many=True)



@app.route(API_URL + "/get-next-doc-no", methods=["GET"])
def get_next_doc_no():
    try:
        # Get the company_code and year_code from the request parameters
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        # Validate required parameters
        if not company_code or not year_code:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400

        # Query the database for the maximum doc_no in the specified company and year
        max_doc_no = db.session.query(func.max(SaleBillHead.doc_no)).filter_by(Company_Code=company_code, Year_Code=year_code).scalar()

        # If no records found, set doc_no to 1
        next_doc_no = max_doc_no + 1 if max_doc_no else 1

        # Prepare the response data
        response = {
            "next_doc_no": next_doc_no
        }

        # Return the next doc_no
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500



# Get data from both tables SaleBill and SaleBilllDetail
@app.route(API_URL+"/getdata-SaleBill", methods=["GET"])
def getdata_SaleBill():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400

        query = ('''SELECT mill.accoid AS millacid, accode.Gst_No AS BillFromGSTNo, dbo.nt_1_sugarsale.doc_no, dbo.nt_1_sugarsale.doc_date, dbo.nt_1_sugarsale.Bill_Amount, dbo.nt_1_sugarsale.NETQNTL, dbo.nt_1_sugarsale.DO_No, 
                  dbo.nt_1_sugarsale.EWay_Bill_No, dbo.nt_1_sugarsale.ackno, dbo.nt_1_sugarsale.IsDeleted, dbo.nt_1_sugarsale.saleid, mill.Short_Name AS MillName, shipTo.Short_Name AS ShipToName, accode.Short_Name AS billFromName
FROM     dbo.nt_1_accountmaster AS shipTo RIGHT OUTER JOIN
                  dbo.nt_1_sugarsale ON shipTo.accoid = dbo.nt_1_sugarsale.uc AND shipTo.company_code = dbo.nt_1_sugarsale.Company_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS accode ON dbo.nt_1_sugarsale.Company_Code = accode.company_code AND dbo.nt_1_sugarsale.ac = accode.accoid LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS mill ON dbo.nt_1_sugarsale.mc = mill.accoid
                 where dbo.nt_1_sugarsale.Company_Code = :company_code and dbo.nt_1_sugarsale.Year_Code = :year_code order by dbo.nt_1_sugarsale.doc_no desc
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
@app.route(API_URL+"/SaleBillByid", methods=["GET"])
def getSaleBillByid():
    try:
        doc_no = request.args.get('doc_no')
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code, doc_no]):
            return jsonify({"error": "Missing required parameters"}), 400


        # Use SQLAlchemy to find the record by Task_No
        saleBill_head = SaleBillHead.query.filter_by(doc_no=doc_no,Company_Code=Company_Code,Year_Code=Year_Code).first()

        newsaleid = saleBill_head.saleid

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"saleid": newsaleid})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
      
        # Extracting category name from additional_data
        row = additional_data_rows[0] if additional_data_rows else None
        last_head_data = {column.name: getattr(saleBill_head, column.name) for column in saleBill_head.__table__.columns}
        last_head_data.update(format_dates(saleBill_head))

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
@app.route(API_URL + "/insert-SaleBill", methods=["POST"])
def insert_SaleBill():
    def get_max_doc_no():
        return db.session.query(func.max(SaleBillHead.doc_no)).scalar() or 1

    def create_gledger_entry(data, amount, drcr, ac_code, accoid, narration):
        return {
            "TRAN_TYPE": "SB",
            "DOC_NO": new_doc_no,
            "DOC_DATE": data['doc_date'],
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['Company_Code'],
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
            "SORT_TYPE": "SB",
            "SORT_NO": new_doc_no,
            "vc": 0,
            "progid": 0,
            "tranid": 0,
            "saleid": new_head.saleid,
            "ac": accoid
        }

    def add_gledger_entry(entries, data, amount, drcr, ac_code, accoid, narration):
        if amount > 0:
            entries.append(create_gledger_entry(data, amount, drcr, ac_code, accoid, narration))

    try:
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']

        dono=headData['DO_No']
        print('dono',dono)
        if    dono is None or dono!=0:
            new_doc_no=0
        else :
            max_doc_no = get_max_doc_no()
            new_doc_no = max_doc_no + 1
            headData['doc_no'] = new_doc_no

        new_head = SaleBillHead(**headData)
        db.session.add(new_head)
        print("newHead", new_head)

        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []

        for item in detailData:
            item['doc_no'] = new_doc_no
            item['saleid'] = new_head.saleid

            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    new_detail = SaleBillDetail(**item)
                    new_head.details.append(new_detail)
                    createdDetails.append(new_detail)
                    

                elif item['rowaction'] == "update":
                    saledetailid = item['saledetailid']
                    update_values = {k: v for k, v in item.items() if k not in ('saledetailid', 'rowaction', 'saleid')}
                    db.session.query(SaleBillDetail).filter(SaleBillDetail.saledetailid == saledetailid).update(update_values)
                    updatedDetails.append(saledetailid)
                    

                elif item['rowaction'] == "delete":
                    saledetailid = item['saledetailid']
                    detail_to_delete = db.session.query(SaleBillDetail).filter(SaleBillDetail.saledetailid == saledetailid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deletedDetailIds.append(saledetailid)
                        

        db.session.commit()

        CGSTAmount = float(headData.get('CGSTAmount', 0) or 0)
        Bill_Amount = float(headData.get('Bill_Amount', 0) or 0)
        SGSTAmount = float(headData.get('SGSTAmount', 0) or 0)
        IGSTAmount = float(headData.get('IGSTAmount', 0) or 0)
        TDS_Amt = float(headData.get('TDS_Amt', 0) or 0)
        TCS_Amt = float(headData.get('TCS_Amt', 0) or 0)
        cash_advance = float(headData.get('cash_advance', 0) or 0)
        RoundOff = float(headData.get('RoundOff', 0) or 0)
        TaxableAmount = float(headData.get('TaxableAmount', 0) or 0)
        ordercode = 0

        
        sale_ac = getSaleAc(item.get('ic'))
        unitcode = headData['Unit_Code']
        accode = headData['Ac_Code']

        company_parameters = fetch_company_parameters(headData['Company_Code'], headData['Year_Code'])
        
        gledger_entries = []
       
        
        saleacnarration = (
            str(get_acShort_Name(headData.get('mill_code', '') or '', headData.get('Company_Code', '') or '') or '') + 
            ' Qntl: ' + str(headData.get('NETQNTL', '') or '') + 
            ' L: ' + str(headData.get('LORRYNO', '') or '') + 
            ' SB: ' + str(get_acShort_Name(headData.get('Ac_Code', '') or '', headData.get('Company_Code', '') or '') or '')
)
       
        Transportnarration = (
            'Qntl: ' + str(headData.get('NETQNTL', '') or '') + ' ' + str(headData.get('cash_advance', '') or '') +
                str(get_acShort_Name(headData.get('mill_code', '') or '', headData.get('Company_Code', '') or '') or '') +
                str(get_acShort_Name(headData.get('Transport_Code', '') or '', headData.get('Company_Code', '') or '') or '') +
                ' L: ' + str(headData.get('LORRYNO', '') or '')
            )

        if accode == unitcode:
            creditnarration = (
                str(get_acShort_Name(headData.get('mill_code', '') or '', headData.get('Company_Code', '') or '') or '') +
                str(headData.get('NETQNTL', '') or '') + 
                ' L: ' + str(headData.get('LORRYNO', '') or '') + 
                ' PB' + str(headData.get('PURCNO', '') or '') + 
                ' R: ' + str(headData.get('LESS_FRT_RATE', '') or '')
            )
        else:
            creditnarration = (
                str(get_acShort_Name(headData.get('mill_code', '') or '', headData.get('Company_Code', '') or '') or '') +
                str(headData.get('NETQNTL', '') or '') + 
                ' L: ' + str(headData.get('LORRYNO', '') or '') + 
                ' PB' + str(headData.get('PURCNO', '') or '') + 
                ' R: ' + str(headData.get('LESS_FRT_RATE', '') or '') +
                ' Shiptoname: ' + str(get_acShort_Name(headData.get('Unit_Code', '') or '', headData.get('Company_Code', '') or '') or '')
            )
        print('creditnarration',creditnarration)
        if CGSTAmount > 0:
            ordercode=ordercode+1
            ac_code = company_parameters.CGSTAc
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, CGSTAmount, 'C', ac_code, accoid, creditnarration)

        if SGSTAmount > 0:
            ordercode=ordercode+1
            ac_code = company_parameters.SGSTAc
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, SGSTAmount, 'C', ac_code, accoid, creditnarration)

        if IGSTAmount > 0:
            ordercode=ordercode+1
            ac_code = company_parameters.IGSTAc
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, IGSTAmount, 'C', ac_code, accoid, creditnarration)

        if TCS_Amt > 0:
            ac_code = headData['Ac_Code']
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TCS_Amt, 'D', ac_code, accoid, creditnarration)
            ac_code = company_parameters.SaleTCSAc
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TCS_Amt, 'C', ac_code, accoid, creditnarration)

        if TDS_Amt > 0:
            ac_code = headData['Ac_Code']
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TDS_Amt, 'C', ac_code, accoid, creditnarration)
            ac_code = company_parameters.SaleTDSAc
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TDS_Amt, 'D', ac_code, accoid, creditnarration)

        if Bill_Amount > 0:
            ac_code = headData['Ac_Code']
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, Bill_Amount, 'D', ac_code, accoid, creditnarration)
            ac_code = sale_ac
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TaxableAmount, 'C', ac_code, accoid, saleacnarration)

        if cash_advance > 0:
            ac_code = headData['Transport_Code']
            accoid = get_accoid(ac_code, headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, cash_advance, 'C', ac_code, accoid, Transportnarration)

        if RoundOff != 0:
            if RoundOff > 0:
                ac_code = company_parameters.RoundOff
                accoid = get_accoid(ac_code, headData['Company_Code'])
                add_gledger_entry(gledger_entries, headData, RoundOff, 'C', ac_code, accoid, creditnarration)
            elif RoundOff < 0:
                ac_code = company_parameters.RoundOff
                accoid = get_accoid(ac_code, headData['Company_Code'])
                add_gledger_entry(gledger_entries, headData, RoundOff, 'D', ac_code, accoid, creditnarration)

        query_params = {
            'Company_Code': headData['Company_Code'],
            'DOC_NO': new_doc_no,
            'Year_Code': headData['Year_Code'],
            'TRAN_TYPE': "SB"
        }

        response = requests.post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)

        if response.status_code == 201:
            db.session.commit()
        else:
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response.json()}), response.status_code

        return jsonify({
            "message": "Data Inserted successfully",
            "head": saleBill_head_schema.dump(new_head),
            "addedDetails": saleBill_detail_schemas.dump(createdDetails),
            "updatedDetails": updatedDetails,
            "deletedDetailIds": deletedDetailIds
        }), 201

    except Exception as e:
        db.session.rollback()
        print("Exception occurred:", e)  # Debug statement
        return jsonify({"error": "Internal server error", "message": str(e)}), 500





#Update Record and Gldger Effects of SaleBill and SaleBill
#Update Record and Gldger Effects of SaleBill and SaleBill
@app.route(API_URL + "/update-SaleBill", methods=["PUT"])
def update_SaleBill():
    def get_max_doc_no():
        return db.session.query(func.max(SaleBillHead.doc_no)).scalar() or 0

    def create_gledger_entry(data, amount, drcr, ac_code, accoid,narration,ordercode):
        return {
            "TRAN_TYPE": 'SB',
            "DOC_NO": updateddoc_no,
            "DOC_DATE": data['doc_date'],
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['Company_Code'],
            "YEAR_CODE": data['Year_Code'],
            "ORDER_CODE": ordercode,
            "DRCR": drcr,
            "UNIT_Code": 0,
            "NARRATION": narration,
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 1,
            "SORT_TYPE": 'SB',
            "SORT_NO": updateddoc_no,
            "vc": 0,
            "progid": 0,
            "tranid": 0,
            "saleid": saleid,
            "ac": accoid
        }

    def add_gledger_entry(entries, data, amount, drcr, ac_code, accoid,narration,ordercode):
        if amount > 0:
            entries.append(create_gledger_entry(data, amount, drcr, ac_code, accoid,narration,ordercode))
            
    try:
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']
        dono=headData['DO_No']
        doc_no=headData['doc_no']
        print("dono", dono)
        if dono!=0  :
            if doc_no == 0 :
                headData['doc_no'] = 0
                updateddoc_no = 0

        saleid = request.args.get('saleid')
        if saleid is None:
            return jsonify({"error": "Missing 'saleid' parameter"}), 400
        
        # data = request.get_json()
        # headData = data['headData']
        # detailData = data['detailData']

        tran_type = headData.get('Tran_Type')
        if tran_type is None:
             return jsonify({"error": "Bad Request", "message": "tran_type and bill_type is required"}), 400

    
        # Update the head data
        updatedHeadCount = db.session.query(SaleBillHead).filter(SaleBillHead.saleid == saleid).update(headData)
        updated_debit_head = db.session.query(SaleBillHead).filter(SaleBillHead.saleid == saleid).one()
        updateddoc_no = updated_debit_head.doc_no
        print("updateddoc_no",updateddoc_no)

        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []
        dono=headData['DO_No']
        for item in detailData:
            item['saleid'] = updated_debit_head.saleid

            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item['doc_no'] = updateddoc_no
                    new_detail = SaleBillDetail(**item)
                    updated_debit_head.details.append(new_detail)
                    createdDetails.append(new_detail)

                elif item['rowaction'] == "update":
                    if dono=="" and dono==0:
                        dcdetailid = item['saledetailid']                  
                        update_values = {k: v for k, v in item.items() if k not in ('saledetailid', 'rowaction', 'saleid')}
                        db.session.query(SaleBillDetail).filter(SaleBillDetail.saledetailid == dcdetailid).update(update_values)
                        updatedDetails.append(dcdetailid)
                    else:
                        dcdetailid = item['saledetailid']                  
                        update_values = {k: v for k, v in item.items() if k not in ('saledetailid', 'rowaction', 'saleid')}
                        db.session.query(SaleBillDetail).filter(SaleBillDetail.saleid == saleid).update(update_values)
                        updatedDetails.append(dcdetailid)   

                elif item['rowaction'] == "delete":
                    dcdetailid = item['saledetailid']
                    detail_to_delete = db.session.query(SaleBillDetail).filter(SaleBillDetail.saledetailid == dcdetailid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deletedDetailIds.append(dcdetailid)
                        

        db.session.commit()

        CGSTAmount = float(headData.get('CGSTAmount', 0) or 0)
        Bill_Amount = float(headData.get('Bill_Amount', 0) or 0)
        SGSTAmount = float(headData.get('SGSTAmount', 0) or 0)
        IGSTAmount = float(headData.get('IGSTAmount', 0) or 0)
        TDS_Amt = float(headData.get('TDS_Amt', 0) or 0)
        TCS_Amt = float(headData.get('TCS_Amt', 0) or 0)
        cash_advance= float(headData.get(' cash_advance', 0) or 0)
        RoundOff= float(headData.get(' RoundOff', 0) or 0)
        TaxableAmount = float(headData.get('TaxableAmount', 0) or 0)

        sale_ac = getSaleAc(item.get('ic'))     
        unitcode=headData['Unit_Code']
        accode=headData['Ac_Code']  

        company_parameters = fetch_company_parameters(headData['Company_Code'], headData['Year_Code'])

        gledger_entries = []

        saleacnarration = (
    f"{get_acShort_Name(headData['mill_code'], headData['Company_Code'])} "
    f"Qntl: {headData['NETQNTL']} "
    f"L: {headData['LORRYNO']} "
    f"SB: {get_acShort_Name(headData['Ac_Code'], headData['Company_Code'])}"
)

        Transportnarration = (
            'Qntl: ' + str(headData.get('NETQNTL', '') or '') + ' ' + str(headData.get('cash_advance', '') or '') +
                str(get_acShort_Name(headData.get('mill_code', '') or '', headData.get('Company_Code', '') or '') or '') +
                str(get_acShort_Name(headData.get('Transport_Code', '') or '', headData.get('Company_Code', '') or '') or '') +
                ' L: ' + str(headData.get('LORRYNO', '') or '')
            )

        if accode==unitcode :
             creditnarration = (
                str(get_acShort_Name(headData.get('mill_code', '') or '', headData.get('Company_Code', '') or '') or '') +
                str(headData.get('NETQNTL', '') or '') + 
                ' L: ' + str(headData.get('LORRYNO', '') or '') + 
                ' PB' + str(headData.get('PURCNO', '') or '') + 
                ' R: ' + str(headData.get('LESS_FRT_RATE', '') or '')
            )
               
        elif accode!=unitcode :

            creditnarration = (
                str(get_acShort_Name(headData.get('mill_code', '') or '', headData.get('Company_Code', '') or '') or '') +
                str(headData.get('NETQNTL', '') or '') + 
                ' L: ' + str(headData.get('LORRYNO', '') or '') + 
                ' PB' + str(headData.get('PURCNO', '') or '') + 
                ' R: ' + str(headData.get('LESS_FRT_RATE', '') or '') +
                ' Shiptoname: ' + str(get_acShort_Name(headData.get('Unit_Code', '') or '', headData.get('Company_Code', '') or '') or '')
            )

        ordercode=0
        if CGSTAmount > 0:
              ordercode=ordercode+1
              ac_code = company_parameters.CGSTAc
              accoid = get_accoid(ac_code,headData['Company_Code'])
              add_gledger_entry(gledger_entries, headData, CGSTAmount, 'C', ac_code, accoid,creditnarration,ordercode)

             
        if SGSTAmount > 0:
                    ordercode=ordercode+1
                    ac_code = company_parameters.SGSTAc
                    accoid = get_accoid(ac_code,headData['Company_Code'])
                    add_gledger_entry(gledger_entries, headData, SGSTAmount, 'C', ac_code, accoid,creditnarration,ordercode)

        if IGSTAmount > 0:
              ordercode=ordercode+1
              ac_code = company_parameters.IGSTAc
              accoid = get_accoid(ac_code,headData['Company_Code'])
              add_gledger_entry(gledger_entries, headData, IGSTAmount, 'C', ac_code, accoid,creditnarration,ordercode)

        if TCS_Amt > 0:
            ordercode=ordercode+1
            ac_code = headData['Ac_Code']
            accoid = get_accoid(ac_code,headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TCS_Amt, 'D', ac_code, accoid,creditnarration,ordercode)

            ordercode=ordercode+1
            ac_code = company_parameters.SaleTCSAc
            accoid = get_accoid(ac_code,headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TCS_Amt, 'C', ac_code, accoid,creditnarration,ordercode)

        if TDS_Amt > 0:
            ordercode=ordercode+1
            ac_code = headData['Ac_Code']
            accoid = get_accoid(ac_code,headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TDS_Amt, 'C', ac_code, accoid,creditnarration,ordercode)

            ordercode=ordercode+1
            ac_code = company_parameters.SaleTDSAc
            accoid = get_accoid(ac_code,headData['Company_Code'])
            add_gledger_entry(gledger_entries, headData, TDS_Amt, 'D', ac_code, accoid,creditnarration,ordercode)

        if Bill_Amount > 0:
                    ordercode=ordercode+1
                    ac_code = headData['Ac_Code']
                    accoid = get_accoid(ac_code,headData['Company_Code'])
                    add_gledger_entry(gledger_entries, headData, Bill_Amount, 'D', ac_code, accoid,creditnarration,ordercode)

                    ordercode=ordercode+1
                   
                    ac_code = sale_ac
                    accoid = get_accoid(ac_code,headData['Company_Code'])
                    add_gledger_entry(gledger_entries, headData, TaxableAmount, 'C', ac_code, accoid,saleacnarration,ordercode)
                   
        if cash_advance>0 :
              ordercode=ordercode+1
              ac_code = headData['Transport_Code']
              accoid = get_accoid(ac_code,headData['Company_Code'])
              add_gledger_entry(gledger_entries, headData, Bill_Amount, 'C', ac_code, accoid,Transportnarration,ordercode)
                   

        if RoundOff!=0 :
          if RoundOff>0:
              ordercode=ordercode+1
              ac_code = headData['Transport_Code']
              accoid = get_accoid(ac_code,headData['Company_Code'])
              add_gledger_entry(gledger_entries, headData, Bill_Amount, 'C', ac_code, accoid,creditnarration,ordercode)

          elif RoundOff<0:
             ordercode=ordercode+1
             ac_code = company_parameters.RoundOff
             accoid = get_accoid(company_parameters.RoundOff)
             add_gledger_entry(gledger_entries, headData, Bill_Amount, 'D', ac_code, accoid,creditnarration,ordercode)

        query_params = {
            'Company_Code': headData['Company_Code'],
            'DOC_NO': updateddoc_no,
            'Year_Code': headData['Year_Code'],
            'TRAN_TYPE': "SB",
        }

        response = requests.post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)

        if response.status_code == 201:
            db.session.commit()
        else:
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response.json()}), response.status_code

        return jsonify({
            "message": "Data Inserted successfully",
            "head": updatedHeadCount,
            "addedDetails": saleBill_detail_schemas.dump(createdDetails),
            "updatedDetails": updatedDetails,
            "deletedDetailIds": deletedDetailIds
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500





#Delete record from datatabse based Dcid and also delete that record GLeder Effects.  
@app.route(API_URL + "/delete_data_by_saleid", methods=["DELETE"])
def delete_data_by_saleid():
    try:
        saleid = request.args.get('saleid')
        Company_Code = request.args.get('Company_Code')
        doc_no = request.args.get('doc_no')
        Year_Code = request.args.get('Year_Code')

        # Check if the required parameters are provided
        if not all([saleid, Company_Code, doc_no, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Start a transaction
        with db.session.begin():
            # Delete records from DebitCreditNoteDetail table
            deleted_saleBillHead_rows = SaleBillDetail.query.filter_by(saleid=saleid).delete()

            # Delete record from DebitCreditNoteHead table
            deleted_saleBillDetail_rows = SaleBillHead.query.filter_by(saleid=saleid).delete()

        # If both deletions were successful, proceed with the external request
        if deleted_saleBillHead_rows > 0 and deleted_saleBillDetail_rows > 0:
            query_params = {
                'Company_Code': Company_Code,
                'DOC_NO': doc_no,
                'Year_Code': Year_Code,
                'TRAN_TYPE': "SB",
            }

            # Make the external request
            response = requests.delete("http://localhost:8080/api/sugarian/delete-Record-gLedger", params=query_params)
            
            if response.status_code != 200:
                raise Exception("Failed to create record in gLedger")

        # Commit the transaction
            db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_saleBillHead_rows} saleBillHead_row(s) and {deleted_saleBillDetail_rows} saleBillDetail row(s) successfully"
        }), 200

    except Exception as e:
        # Roll back the transaction if any error occurs
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500




#Navigations API    
#Get First record from database 
@app.route(API_URL+"/get-firstSaleBill-navigation", methods=["GET"])
def get_firstSaleBill_navigation():
    try:

        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        
        # Use SQLAlchemy to get the first record from the Task table
        first_saleBill = SaleBillHead.query.filter_by(Company_Code=Company_Code,Year_Code=Year_Code).order_by(SaleBillHead.saleid.asc()).first()

        if not first_saleBill:
            return jsonify({"error": "No records found in Task_Entry table"}), 404

        # Get the Taskid of the first record
        first_saleid = first_saleBill.saleid

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"saleid": first_saleid})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
      
        # Extracting category name from additional_data
        row = additional_data_rows[0] if additional_data_rows else None
        # Convert last_dcid_Head to a dictionary
        first_head_data = {column.name: getattr(first_saleBill, column.name) for column in first_saleBill.__table__.columns}
        first_head_data.update(format_dates(first_saleBill))


        # Convert additional_data_rows to a list of dictionaries
        first_details_data = [dict(row._mapping) for row in additional_data_rows]

        # Prepare response data
        response = {
            "first_head_data": first_head_data,
            "first_details_data": first_details_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


#Get last Record from Database
@app.route(API_URL+"/get-lastSaleBill-navigation", methods=["GET"])
def get_lastSaleBill_navigation():
    try:

        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Use SQLAlchemy to get the last record from the Task table
        last_saleBill = SaleBillHead.query.filter_by(Company_Code=Company_Code,Year_Code=Year_Code).order_by(SaleBillHead.saleid.desc()).first()

        if not last_saleBill:
            return jsonify({"error": "No records found in Task_Entry table"}), 404

        # Get the Taskid of the last record
        last_saleid = last_saleBill.saleid

        # Additional SQL query execution
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"saleid": last_saleid})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
      
        # Extracting category name from additional_data
        row = additional_data_rows[0] if additional_data_rows else None
        last_head_data = {column.name: getattr(last_saleBill, column.name) for column in last_saleBill.__table__.columns}
        last_head_data.update(format_dates(last_saleBill))


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
    
#Get Previous record by database 
@app.route(API_URL+"/get-previousSaleBill-navigation", methods=["GET"])
def get_previousSaleBill_navigation():
    try:
       
        current_doc_no = request.args.get('currentDocNo')
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code, current_doc_no]):
            return jsonify({"error": "Missing required parameters"}), 400


        # Use SQLAlchemy to get the previous record from the Task table
        previous_saleBill = SaleBillHead.query.filter(SaleBillHead.doc_no < current_doc_no).filter_by(Company_Code=Company_Code,Year_Code=Year_Code).order_by(SaleBillHead.doc_no.desc()).first()
    
        
        if not previous_saleBill:
            return jsonify({"error": "No previous records found"}), 404

        # Get the Task_No of the previous record
        previous_sale_id = previous_saleBill.saleid
        
        # Additional SQL query execution
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"saleid": previous_sale_id})
        
        # Fetch all rows from additional data
        additional_data_rows = additional_data.fetchall()
        
        # Extracting category name from additional_data
        row = additional_data_rows[0] if additional_data_rows else None
        previous_head_data = {column.name: getattr(previous_saleBill, column.name) for column in previous_saleBill.__table__.columns}
        previous_head_data.update(format_dates(previous_saleBill))


        # Convert additional_data_rows to a list of dictionaries
        previous_details_data = [dict(row._mapping) for row in additional_data_rows]

        # Prepare response data
        response = {
            "previous_head_data": previous_head_data,
            "previous_details_data": previous_details_data
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
#Get Next record by database 
@app.route(API_URL+"/get-nextSaleBill-navigation", methods=["GET"])
def get_nextSaleBill_navigation():
    try:
        current_doc_no = request.args.get('currentDocNo')
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code, current_doc_no]):
            return jsonify({"error": "Missing required parameters"}), 400

        
        

        # Use SQLAlchemy to get the next record from the Task table
        next_saleBill = SaleBillHead.query.filter(SaleBillHead.doc_no > current_doc_no).filter_by(Company_Code=Company_Code,Year_Code=Year_Code).order_by(SaleBillHead.doc_no.asc()).first()

        if not next_saleBill:
            return jsonify({"error": "No next records found"}), 404

        # Get the Task_No of the next record
        next_sale_id = next_saleBill.saleid

        # Query to fetch System_Name_E from nt_1_systemmaster
        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"saleid": next_sale_id})
        
        # Fetch all rows from additional data
        additional_data_rows = additional_data.fetchall()
        
        # Extracting category name from additional_data
        row = additional_data_rows[0] if additional_data_rows else None
        next_head_data = {column.name: getattr(next_saleBill, column.name) for column in next_saleBill.__table__.columns}
        next_head_data.update(format_dates(next_saleBill))


        # Convert additional_data_rows to a list of dictionaries
        next_details_data = [dict(row._mapping) for row in additional_data_rows]

        # Prepare response data
        response = {
            "next_head_data": next_head_data,
            "next_details_data": next_details_data
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/Generate_SaleBill", methods=["PUT"])
def Generate_SaleBill():
    def get_max_doc_no():
        return db.session.query(func.max(SaleBillHead.doc_no)).scalar() or 0

    try:
        max_doc_no = get_max_doc_no()
        updated_doc_no = max_doc_no + 1
        print("New Update Document Number:", updated_doc_no)

        saleid = request.args.get('saleid')
        Company_Code = request.args.get('CompanyCode')
        Year_Code = request.args.get('Year_Code')
        Do_no = request.args.get('DoNo')
        
        if not saleid:
            return jsonify({"error": "Missing 'saleid' parameter"}), 400

        with db.session.begin_nested():
            # Update Doc No to saleBill
            db.session.execute(
                text('''UPDATE nt_1_sugarsale 
                        SET doc_no = :doc_no
                        WHERE Year_Code = :Year_Code 
                        AND Company_Code = :Company_Code 
                        AND saleid = :saleid'''),
                {'Year_Code': Year_Code, 'Company_Code': Company_Code,
                 'doc_no': updated_doc_no, 'saleid': saleid}
            )
            #update saleBilldetail
            db.session.execute(
                text('''UPDATE nt_1_sugarsaledetails 
                        SET doc_no = :doc_no
                        WHERE Year_Code = :Year_Code 
                        AND Company_Code = :Company_Code 
                        AND saleid = :saleid'''),
                {'Year_Code': Year_Code, 'Company_Code': Company_Code,
                 'doc_no': updated_doc_no, 'saleid': saleid}
            )

            
            # Update SaleBill No. to DO
            db.session.execute(
                text('''UPDATE nt_1_deliveryorder 
                        SET SB_No = :SB_No
                        WHERE Year_Code = :Year_Code 
                        AND company_code = :Company_Code 
                        AND doc_no = :Do_no'''),
                {'Year_Code': Year_Code, 'Company_Code': Company_Code,
                 'SB_No': updated_doc_no, 'Do_no': Do_no}
            )
            
            # Update saleBill Docno to gledger
            db.session.execute(
                text('''UPDATE nt_1_gledger 
                        SET DOC_NO = :DOC_NO
                        WHERE Year_Code = :Year_Code 
                        AND COMPANY_CODE = :Company_Code 
                        AND saleid = :saleid
                        AND TRAN_TYPE = 'SB' '''),
                {'Year_Code': Year_Code, 'Company_Code': Company_Code,
                 'DOC_NO': updated_doc_no, 'saleid': saleid}
            )

        db.session.commit()    
        
        return jsonify({'Successfully Updated': updated_doc_no}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500   



@app.route(API_URL+"/generating_saleBill_report", methods=["GET"])
def generating_saleBill_report():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')
        doc_no = request.args.get('doc_no')

        if not company_code or not year_code or not doc_no:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400

        query = ('''SELECT dbo.qrysalehead.doc_no, dbo.qrysalehead.PURCNO, dbo.qrysalehead.doc_date, dbo.qrysalehead.Ac_Code, dbo.qrysalehead.Unit_Code, dbo.qrysalehead.mill_code, dbo.qrysalehead.FROM_STATION, dbo.qrysalehead.TO_STATION, 
                  dbo.qrysalehead.LORRYNO, dbo.qrysalehead.BROKER, dbo.qrysalehead.wearhouse, dbo.qrysalehead.subTotal, dbo.qrysalehead.LESS_FRT_RATE, dbo.qrysalehead.freight, dbo.qrysalehead.cash_advance, 
                  dbo.qrysalehead.bank_commission, dbo.qrysalehead.OTHER_AMT, dbo.qrysalehead.Bill_Amount, dbo.qrysalehead.Due_Days, dbo.qrysalehead.NETQNTL, dbo.qrysalehead.Company_Code, dbo.qrysalehead.Year_Code, 
                  dbo.qrysalehead.Branch_Code, dbo.qrysalehead.Created_By, dbo.qrysalehead.Modified_By, dbo.qrysalehead.Tran_Type, dbo.qrysalehead.DO_No, dbo.qrysalehead.Transport_Code, dbo.qrysalehead.RateDiff, dbo.qrysalehead.ASN_No, 
                  dbo.qrysalehead.GstRateCode, dbo.qrysalehead.CGSTRate, dbo.qrysalehead.CGSTAmount, dbo.qrysalehead.SGSTRate, dbo.qrysalehead.SGSTAmount, dbo.qrysalehead.IGSTRate, dbo.qrysalehead.IGSTAmount, 
                  dbo.qrysalehead.TaxableAmount, dbo.qrysalehead.EWay_Bill_No, dbo.qrysalehead.EWayBill_Chk, dbo.qrysalehead.MillInvoiceNo, dbo.qrysalehead.RoundOff, dbo.qrysalehead.saleid, dbo.qrysalehead.ac, dbo.qrysalehead.uc, 
                  dbo.qrysalehead.mc, dbo.qrysalehead.bk, dbo.qrysalehead.billtoname, dbo.qrysalehead.billtoaddress, dbo.qrysalehead.billtogstno, dbo.qrysalehead.billtopanno, dbo.qrysalehead.billtopin, dbo.qrysalehead.billtopincode, 
                  dbo.qrysalehead.billtocitystate, dbo.qrysalehead.billtogststatecode, dbo.qrysalehead.shiptoname, dbo.qrysalehead.shiptoaddress, dbo.qrysalehead.shiptogstno, dbo.qrysalehead.shiptopanno, dbo.qrysalehead.shiptocityname, 
                  dbo.qrysalehead.shiptocitypincode, dbo.qrysalehead.shiptocitystate, dbo.qrysalehead.shiptogststatecode, dbo.qrysalehead.billtoemail, dbo.qrysalehead.shiptoemail, dbo.qrysalehead.millname, dbo.qrysalehead.brokername, 
                  dbo.qrysalehead.GST_Name, dbo.qrysalehead.gstrate, dbo.qrysaledetail.detail_id AS itemcode, dbo.qrysaledetail.item_code, dbo.qrysaledetail.narration, dbo.qrysaledetail.Quantal, dbo.qrysaledetail.packing, dbo.qrysaledetail.bags, 
                  dbo.qrysaledetail.rate AS salerate, dbo.qrysaledetail.item_Amount, dbo.qrysaledetail.ic, dbo.qrysaledetail.saledetailid, dbo.qrysaledetail.itemname, dbo.qrysaledetail.HSN, dbo.qrysalehead.doc_dateConverted, dbo.qrysalehead.tc, 
                  dbo.qrysalehead.transportname, dbo.qrysalehead.transportmobile, dbo.qrysalehead.billtomobileto, dbo.qrysalehead.GSTStateCode AS partygststatecode, dbo.qrysalehead.shiptostatecode, dbo.qrysalehead.DoNarrtion, 
                  dbo.qrysalehead.TCS_Rate, dbo.qrysalehead.TCS_Amt, dbo.qrysalehead.TCS_Net_Payable, dbo.qrysalehead.newsbno, dbo.qrysalehead.newsbdate, dbo.qrysalehead.einvoiceno, dbo.qrysalehead.ackno, dbo.qrysalehead.Delivery_type, 
                  dbo.qrysalehead.millshortname, dbo.qrysalehead.billtostatename, dbo.qrysalehead.shiptoshortname, dbo.qrysalehead.shiptomobileno, dbo.qrysalehead.shiptotinno, dbo.qrysalehead.shiptolocallicno, dbo.qrysaledetail.Brand_Code, 
                  dbo.qrysalehead.EwayBillValidDate, dbo.qrysalehead.FSSAI_BillTo, dbo.qrysalehead.FSSAI_ShipTo, dbo.qrysalehead.BillToTanNo, dbo.qrysalehead.ShipToTanNo, dbo.qrysalehead.TDS_Rate, dbo.qrysalehead.TDS_Amt, 
                  dbo.qrysalehead.IsDeleted, dbo.qrysalehead.SBNarration, dbo.qrysalehead.QRCode, dbo.qrysalehead.MillFSSAI_No, dbo.qrysaledetail.Brand_Name, dbo.qrysalehead.Insured, '' AS FreightPerQtl, dbo.qrysalehead.millcityname
FROM     dbo.qrysalehead LEFT OUTER JOIN
                  dbo.qrysaledetail ON dbo.qrysalehead.saleid = dbo.qrysaledetail.saleid
                 where dbo.qrysalehead.Company_Code = :company_code and dbo.qrysalehead.Year_Code = :year_code and dbo.qrysalehead.doc_no = :doc_no
                                 '''
            )
        additional_data = db.session.execute(text(query), {"company_code": company_code, "year_code": year_code, "doc_no": doc_no})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
        

        # Convert additional_data_rows to a list of dictionaries
        all_data = [dict(row._mapping) for row in additional_data_rows]

        for data in all_data:
            if 'doc_date' or 'EwayBillValidDate' in data:
                data['doc_date'] = data['doc_date'].strftime('%Y-%m-%d') if data['doc_date'] else None
                data['EwayBillValidDate'] = data['EwayBillValidDate'].strftime('%Y-%m-%d') if data['EwayBillValidDate'] else None

        # Prepare response data 
        response = {
            "all_data": all_data
        }
        # If record found, return it
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500