import traceback
from flask import Flask, jsonify, request
from app import app, db
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os

from app.models.Outword.SugarSaleReturnSale.SugarSaleReturnSaleModel import SugarSaleReturnSaleHead,SugarSaleReturnSaleDetail
from app.models.Outword.SugarSaleReturnSale.SugarSaleReturnSaleSchema import SugarSaleReturnSaleHeadSchema, SugarSaleReturnSaleDetailSchema

API_URL = os.getenv('API_URL')

from app.utils.CommonGLedgerFunctions import fetch_company_parameters,get_accoid,getSaleAc
import requests

SUGAR_SALE_RETURN_DETAILS_QUERY = '''
SELECT accode.Ac_Name_E AS partyname, mill.Ac_Name_E AS millname, unit.Ac_Name_E AS unitname, broker.Ac_Name_E AS brokername, item.System_Name_E AS itemname, transport.Ac_Name_E AS transportname, 
                  billto.Ac_Name_E AS billtoname, fromac.Ac_Name_E AS fromacname, dbo.nt_1_gstratemaster.GST_Name,  item.System_Code AS item_code
FROM     dbo.nt_1_accountmaster AS accode RIGHT OUTER JOIN
                  dbo.nt_1_accountmaster AS unit RIGHT OUTER JOIN
                  dbo.nt_1_accountmaster AS fromac RIGHT OUTER JOIN
                  dbo.nt_1_accountmaster AS transport RIGHT OUTER JOIN
                  dbo.nt_1_sugarsalereturn ON transport.accoid = dbo.nt_1_sugarsalereturn.tc ON fromac.accoid = dbo.nt_1_sugarsalereturn.fa LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS billto ON dbo.nt_1_sugarsalereturn.bt = billto.accoid LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS broker ON dbo.nt_1_sugarsalereturn.bc = broker.accoid LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS mill ON dbo.nt_1_sugarsalereturn.mc = mill.accoid ON unit.accoid = dbo.nt_1_sugarsalereturn.uc ON accode.accoid = dbo.nt_1_sugarsalereturn.ac LEFT OUTER JOIN
                  dbo.nt_1_sugarsaledetailsreturn LEFT OUTER JOIN
                  dbo.nt_1_systemmaster AS item ON dbo.nt_1_sugarsaledetailsreturn.ic = item.systemid ON dbo.nt_1_sugarsalereturn.srid = dbo.nt_1_sugarsaledetailsreturn.srid LEFT OUTER JOIN
                  dbo.nt_1_gstratemaster ON dbo.nt_1_sugarsalereturn.gstid = dbo.nt_1_gstratemaster.gstid
WHERE  (item.System_Type = 'I') and dbo.nt_1_sugarsalereturn.srid = :srid


'''

sugar_sale_return_head_schema = SugarSaleReturnSaleHeadSchema()
sugar_sale_return_head_schemas = SugarSaleReturnSaleHeadSchema(many=True)

sugar_sale_return_detail_schema = SugarSaleReturnSaleDetailSchema()
sugar_sale_return_detail_schemas = SugarSaleReturnSaleDetailSchema(many=True)

def format_dates(task):
    return {
        "doc_date": task.doc_date.strftime('%Y-%m-%d') if task.doc_date else None,
    }

@app.route(API_URL + "/getdata-sugarsalereturn", methods=["GET"])
def getdata_sugarsalereturn():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400
        
        records = SugarSaleReturnSaleHead.query.filter_by(Company_Code=company_code, Year_Code=year_code).all()

        if not records:
            return jsonify({"error": "No records found"}), 404

        all_records_data = []

        for record in records:
            returnPurchaseData = {column.name: getattr(record, column.name) for column in record.__table__.columns}
            returnPurchaseData.update(format_dates(record))

            additional_data = db.session.execute(text(SUGAR_SALE_RETURN_DETAILS_QUERY), {"srid": record.srid})
            additional_data_rows = additional_data.fetchall()

            returnPurchaseLabels = [dict(row._mapping) for row in additional_data_rows]

            record_response = {
                "returnPurchaseData": returnPurchaseData,
                "returnPurchaseLabels": returnPurchaseLabels
            }

            all_records_data.append(record_response)

        response = {
            "all_data_sugarReturnPurchase": all_records_data
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500
    

# Get data from both tables SaleBill and SaleBilllDetail
@app.route(API_URL+"/getdata-SugarSaleReturnSale", methods=["GET"])
def getdata_SugarSaleReturnSale():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400

        query = ('''SELECT dbo.nt_1_sugarsalereturn.doc_no, dbo.nt_1_sugarsalereturn.doc_date, accode.Ac_Name_E, dbo.nt_1_sugarsalereturn.NETQNTL, dbo.nt_1_sugarsalereturn.Bill_Amount, dbo.nt_1_sugarsalereturn.srid, 
                  dbo.nt_1_sugarsalereturn.ackno, dbo.nt_1_sugarsalereturn.Eway_Bill_No
FROM     dbo.nt_1_accountmaster AS accode RIGHT OUTER JOIN
                  dbo.nt_1_sugarsalereturn ON accode.accoid = dbo.nt_1_sugarsalereturn.ac LEFT OUTER JOIN
                  dbo.nt_1_sugarsaledetailsreturn ON dbo.nt_1_sugarsalereturn.srid = dbo.nt_1_sugarsaledetailsreturn.srid
                 where dbo.nt_1_sugarsalereturn.Company_Code = :company_code and dbo.nt_1_sugarsalereturn.Year_Code = :year_code
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

@app.route(API_URL + "/getsugarsalereturnByid", methods=["GET"])
def getsugarsalereturnByid():
    try:
        doc_no = request.args.get('doc_no')
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code or not doc_no:
            return jsonify({"error": "Missing 'Company_Code', 'Year_Code', or 'doc_no' parameter"}), 400

        sugar_sale_return_head = SugarSaleReturnSaleHead.query.filter_by(doc_no=doc_no, Company_Code=company_code, Year_Code=year_code).first()

        if not sugar_sale_return_head:
            return jsonify({"error": "No records found"}), 404

        newsugarSaleReturn_id = sugar_sale_return_head.srid

        additional_data = db.session.execute(text(SUGAR_SALE_RETURN_DETAILS_QUERY), {"srid": newsugarSaleReturn_id})
        additional_data_rows = additional_data.fetchall()

        last_head_data = {column.name: getattr(sugar_sale_return_head, column.name) for column in sugar_sale_return_head.__table__.columns}
        last_head_data.update(format_dates(sugar_sale_return_head))

        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarSaleReturnSaleDetail.query.filter_by(srid=newsugarSaleReturn_id).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "last_head_data": last_head_data,
            "last_labels_data": last_details_data,
            "detail_data": detail_data
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500

@app.route(API_URL + "/get-last-sugarsalereturn", methods=["GET"])
def get_last_sugarsalereturn():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing required parameters"}), 400

        last_sugarSaleReturn = SugarSaleReturnSaleHead.query.filter_by(Company_Code=company_code, Year_Code=year_code).order_by(SugarSaleReturnSaleHead.doc_no.desc()).first()

        if not last_sugarSaleReturn:
            return jsonify({"error": "No records found"}), 404

        last_srid = last_sugarSaleReturn.srid

        additional_data = db.session.execute(text(SUGAR_SALE_RETURN_DETAILS_QUERY), {"srid": last_srid})
        additional_data_rows = additional_data.fetchall()

        last_head_data = {column.name: getattr(last_sugarSaleReturn, column.name) for column in last_sugarSaleReturn.__table__.columns}
        last_head_data.update(format_dates(last_sugarSaleReturn))

        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarSaleReturnSaleDetail.query.filter_by(srid=last_srid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "last_head_data": last_head_data,
            "last_labels_data": last_details_data,
            "detail_data": detail_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500

@app.route(API_URL + "/get-first-sugarsalereturn", methods=["GET"])
def get_first_sugarsalereturn():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing required parameters"}), 400

        first_sugarSaleReturn = SugarSaleReturnSaleHead.query.filter_by(Company_Code=company_code, Year_Code=year_code).order_by(SugarSaleReturnSaleHead.doc_no.asc()).first()

        if not first_sugarSaleReturn:
            return jsonify({"error": "No records found"}), 404

        first_srid = first_sugarSaleReturn.srid

        additional_data = db.session.execute(text(SUGAR_SALE_RETURN_DETAILS_QUERY), {"srid": first_srid})
        additional_data_rows = additional_data.fetchall()

        first_head_data = {column.name: getattr(first_sugarSaleReturn, column.name) for column in first_sugarSaleReturn.__table__.columns}
        first_head_data.update(format_dates(first_sugarSaleReturn))

        first_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarSaleReturnSaleDetail.query.filter_by(srid=first_srid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "first_head_data": first_head_data,
            "first_labels_data": first_details_data,
            "detail_data": detail_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500

@app.route(API_URL + "/get-previous-sugarsalereturn", methods=["GET"])
def get_previous_sugarsalereturn():
    try:
        current_doc_no = request.args.get('doc_no')
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not current_doc_no or not company_code or not year_code:
            return jsonify({"error": "Missing required parameters"}), 400

        previous_sugarSaleReturn = SugarSaleReturnSaleHead.query.filter_by(Company_Code=company_code, Year_Code=year_code).filter(SugarSaleReturnSaleHead.doc_no < current_doc_no).order_by(SugarSaleReturnSaleHead.doc_no.desc()).first()

        if not previous_sugarSaleReturn:
            return jsonify({"error": "No previous records found"}), 404

        previous_srid = previous_sugarSaleReturn.srid

        additional_data = db.session.execute(text(SUGAR_SALE_RETURN_DETAILS_QUERY), {"srid": previous_srid})
        additional_data_rows = additional_data.fetchall()

        previous_head_data = {column.name: getattr(previous_sugarSaleReturn, column.name) for column in previous_sugarSaleReturn.__table__.columns}
        previous_head_data.update(format_dates(previous_sugarSaleReturn))

        previous_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarSaleReturnSaleDetail.query.filter_by(srid=previous_srid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "previous_head_data": previous_head_data,
            "previous_labels_data": previous_details_data,
            "detail_data": detail_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500

@app.route(API_URL + "/get-next-sugarsalereturn", methods=["GET"])
def get_next_sugarsalereturn():
    try:
        current_doc_no = request.args.get('doc_no')
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not current_doc_no or not company_code or not year_code:
            return jsonify({"error": "Missing required parameters"}), 400

        sugarSaleReturn = SugarSaleReturnSaleHead.query.filter(SugarSaleReturnSaleHead.doc_no > current_doc_no).filter_by(Company_Code=company_code, Year_Code=year_code).order_by(SugarSaleReturnSaleHead.doc_no.asc()).first()

        if not sugarSaleReturn:
            return jsonify({"error": "No next records found"}), 404

        next_srid = sugarSaleReturn.srid

        additional_data = db.session.execute(text(SUGAR_SALE_RETURN_DETAILS_QUERY), {"srid": next_srid})
        additional_data_rows = additional_data.fetchall()

        next_head_data = {column.name: getattr(sugarSaleReturn, column.name) for column in sugarSaleReturn.__table__.columns}
        next_head_data.update(format_dates(sugarSaleReturn))

        next_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarSaleReturnSaleDetail.query.filter_by(srid=next_srid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "next_head_data": next_head_data,
            "next_labels_data": next_details_data,
            "detail_data": detail_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500

@app.route(API_URL + "/create-sugarsalereturn", methods=["POST"])
def create_sugarsalereturn():
    def get_max_doc_no(company_code, year_code):
        return db.session.query(func.max(SugarSaleReturnSaleHead.doc_no)).filter(
            SugarSaleReturnSaleHead.Company_Code == company_code,
            SugarSaleReturnSaleHead.Year_Code == year_code
        ).scalar() or 0

    def create_gledger_entry(data, amount, drcr, ac_code, accoid):
        return {
            "TRAN_TYPE": data['Tran_Type'],
            "DOC_NO": new_doc_no,
            "DOC_DATE": data['doc_date'],
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['Company_Code'],
            "YEAR_CODE": data['Year_Code'],
            "ORDER_CODE": 12,
            "DRCR": drcr,
            "UNIT_Code": 0,
            "NARRATION": "As Per BillNo: " + str(data['doc_no']),
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 1,
            "SORT_TYPE": data['Tran_Type'],
            "SORT_NO": new_doc_no,
            "vc": 0,
            "progid": 0,
            "tranid": 0,
            "saleid": 0,
            "ac": accoid
        }

    def add_gledger_entry(entries, data, amount, drcr, ac_code, accoid):
        if amount > 0:
            entries.append(create_gledger_entry(data, amount, drcr, ac_code, accoid))

    try:
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']

        company_code = headData.get('Company_Code')
        year_code = headData.get('Year_Code')

        max_doc_no = get_max_doc_no(company_code, year_code)

        new_doc_no = max_doc_no + 1
        headData['doc_no'] = new_doc_no

        new_head = SugarSaleReturnSaleHead(**headData)
        db.session.add(new_head)

        created_details = []
        updated_details = []
        deleted_detail_ids = []

        for item in detailData:
            item['doc_no'] = new_doc_no
            item['Tran_Type'] = headData['Tran_Type']
            item['srid'] = new_head.srid
            if 'rowaction' in item and item['rowaction'] == "add":
                del item['rowaction']
                new_detail = SugarSaleReturnSaleDetail(**item)
                new_head.details.append(new_detail)
                created_details.append(new_detail)

            elif 'rowaction' in item and item['rowaction'] == "update":
                srdtid = item['srdtid']
                update_values = {k: v for k, v in item.items() if k not in ('srdtid', 'rowaction', 'srid')}
                db.session.query(SugarSaleReturnSaleDetail).filter(SugarSaleReturnSaleDetail.srdtid == srdtid).update(update_values)
                updated_details.append(srdtid)

            elif 'rowaction' in item and item['rowaction'] == "delete":
                srdtid = item['srdtid']
                detail_to_delete = db.session.query(SugarSaleReturnSaleDetail).filter(SugarSaleReturnSaleDetail.srdtid == srdtid).one_or_none()
                if detail_to_delete:
                    db.session.delete(detail_to_delete)
                    deleted_detail_ids.append(srdtid)

        db.session.commit()

        igst_amount = float(headData.get('IGSTAmount', 0) or 0)
        bill_amount = float(headData.get('Bill_Amount', 0) or 0)
        sgst_amount = float(headData.get('SGSTAmount', 0) or 0)
        cgst_amount = float(headData.get('CGSTAmount', 0) or 0)
        TCS_Amt = float(headData.get('TCS_Amt', 0) or 0)
        TDS_Amt = float(headData.get('TDS_Amt', 0) or 0)
        Other_Amt = float(headData.get('OTHER_Amt', 0) or 0)

        company_parameters = fetch_company_parameters(company_code, year_code)

        gledger_entries = []

        if igst_amount > 0:
            ac_code = company_parameters.IGSTAc
            accoid = get_accoid(company_parameters.IGSTAc, company_code)
            add_gledger_entry(gledger_entries, headData, igst_amount, "D", ac_code, accoid)

        if cgst_amount > 0:
            ac_code = company_parameters.CGSTAc
            accoid = get_accoid(company_parameters.CGSTAc, company_code)
            add_gledger_entry(gledger_entries, headData, cgst_amount, "D", ac_code, accoid)

        if sgst_amount > 0:
            ac_code = company_parameters.SGSTAc
            accoid = get_accoid(company_parameters.SGSTAc, company_code)
            add_gledger_entry(gledger_entries, headData, sgst_amount, "D", ac_code, accoid)

        if TCS_Amt > 0:
            ac_code = headData['Ac_Code']
            accoid = get_accoid(ac_code, company_code)
            add_gledger_entry(gledger_entries, headData, TCS_Amt, 'D', ac_code, accoid)
            ac_code = company_parameters.SaleTCSAc
            accoid = get_accoid(ac_code, company_code)
            add_gledger_entry(gledger_entries, headData, TCS_Amt, 'C', ac_code, accoid)

        if TDS_Amt > 0:
            ac_code = headData['Ac_Code']
            accoid = get_accoid(ac_code, company_code)
            add_gledger_entry(gledger_entries, headData, TDS_Amt, 'C', ac_code, accoid)
            ac_code = company_parameters.SaleTDSAc
            accoid = get_accoid(ac_code, company_code)
            add_gledger_entry(gledger_entries, headData, TDS_Amt, 'D', ac_code, accoid)

        if Other_Amt > 0:
            ac_code = company_parameters.OTHER_AMOUNT_AC
            accoid = get_accoid(ac_code, company_code)
            add_gledger_entry(gledger_entries, headData, Other_Amt, 'D', ac_code, accoid)
        else:
            ac_code = company_parameters.OTHER_AMOUNT_AC
            accoid = get_accoid(ac_code, company_code)
            add_gledger_entry(gledger_entries, headData, Other_Amt, 'C', ac_code, accoid)

        add_gledger_entry(gledger_entries, headData, bill_amount, "C", headData['Ac_Code'], get_accoid(headData['Ac_Code'], company_code))

        for item in detailData:
            Item_amount = float(item.get('item_Amount', 0) or 0)
            ic = item['ic']

            if Item_amount > 0:
                ac_code = getSaleAc(ic)
                add_gledger_entry(gledger_entries, headData, Item_amount, 'D', ac_code, get_accoid(ac_code, company_code))

        query_params = {
            'Company_Code': headData['Company_Code'],
            'DOC_NO': new_doc_no,
            'Year_Code': headData['Year_Code'],
            'TRAN_TYPE': headData['Tran_Type']
        }

        response = requests.post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)

        if response.status_code == 201:
            db.session.commit()
        else:
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response.json()}), response.status_code

        return jsonify({
            "message": "Data inserted successfully",
            "head": sugar_sale_return_head_schema.dump(new_head),
            "createdDetails": sugar_sale_return_detail_schemas.dump(created_details),
            "updatedDetails": updated_details,
            "deletedDetailIds": deleted_detail_ids
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500

@app.route(API_URL + "/update-sugarsalereturn", methods=["PUT"])
def update_sugarsalereturn():
    def create_gledger_entry(data, amount, drcr, ac_code, accoid):
        return {
            "TRAN_TYPE": tran_type,
            "DOC_NO": updated_head.doc_no,
            "DOC_DATE": data['doc_date'],
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['Company_Code'],
            "YEAR_CODE": data['Year_Code'],
            "ORDER_CODE": 12,
            "DRCR": drcr,
            "UNIT_Code": 0,
            "NARRATION": "As Per BillNo: " + str(data['doc_no']),
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 1,
            "SORT_TYPE": tran_type,
            "SORT_NO": updated_head.doc_no,
            "vc": 0,
            "progid": 0,
            "tranid": 0,
            "saleid": 0,
            "ac": accoid
        }

    def add_gledger_entry(entries, data, amount, drcr, ac_code, accoid):
        if amount > 0:
            entries.append(create_gledger_entry(data, amount, drcr, ac_code, accoid))

    try:
        srid = request.args.get('srid')
        if not srid:
            return jsonify({"error": "Missing 'srid' parameter"}), 400

        data = request.get_json()
        head_data = data['headData']
        detail_data = data['detailData']

        tran_type = head_data.get('Tran_Type')
        if not tran_type:
            return jsonify({"error": "Bad Request", "message": "tran_type is required"}), 400

        updated_head_count = db.session.query(SugarSaleReturnSaleHead).filter(SugarSaleReturnSaleHead.srid == srid).update(head_data)
        updated_head = SugarSaleReturnSaleHead.query.filter_by(srid=srid).first()

        created_details = []
        updated_details = []
        deleted_detail_ids = []

        for item in detail_data:
            item['srid'] = updated_head.srid
            item['Tran_Type'] = tran_type

            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item['doc_no'] = updated_head.doc_no
                    new_detail = SugarSaleReturnSaleDetail(**item)
                    db.session.add(new_detail)
                    created_details.append(new_detail)

                elif item['rowaction'] == "update":
                    srdtid = item['srdtid']
                    update_values = {k: v for k, v in item.items() if k not in ('srdtid', 'rowaction', 'srid')}
                    db.session.query(SugarSaleReturnSaleDetail).filter(SugarSaleReturnSaleDetail.srdtid == srdtid).update(update_values)
                    updated_details.append(srdtid)

                elif item['rowaction'] == "delete":
                    srdtid = item['srdtid']
                    detail_to_delete = db.session.query(SugarSaleReturnSaleDetail).filter(SugarSaleReturnSaleDetail.srdtid == srdtid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deleted_detail_ids.append(srdtid)

        db.session.commit()

        igst_amount = float(head_data.get('IGSTAmount', 0) or 0)
        bill_amount = float(head_data.get('Bill_Amount', 0) or 0)
        sgst_amount = float(head_data.get('SGSTAmount', 0) or 0)
        cgst_amount = float(head_data.get('CGSTAmount', 0) or 0)
        TCS_Amt = float(head_data.get('TCS_Amt', 0) or 0)
        TDS_Amt = float(head_data.get('TDS_Amt', 0) or 0)
        Other_Amt = float(head_data.get('OTHER_Amt', 0) or 0)

        company_parameters = fetch_company_parameters(head_data['Company_Code'], head_data['Year_Code'])

        gledger_entries = []

        if igst_amount > 0:
            ac_code = company_parameters.IGSTAc
            accoid = get_accoid(company_parameters.IGSTAc, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, igst_amount, "C", ac_code, accoid)

        if cgst_amount > 0:
            ac_code = company_parameters.CGSTAc
            accoid = get_accoid(company_parameters.CGSTAc, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, cgst_amount, "C", ac_code, accoid)

        if sgst_amount > 0:
            ac_code = company_parameters.SGSTAc
            accoid = get_accoid(company_parameters.SGSTAc, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, sgst_amount, "C", ac_code, accoid)

        if TCS_Amt > 0:
            ac_code = head_data['FromAc']
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TCS_Amt, 'C', ac_code, accoid)
            ac_code = company_parameters.SaleTCSAc
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TCS_Amt, 'D', ac_code, accoid)

        if TDS_Amt > 0:
            ac_code = head_data['FromAc']
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TDS_Amt, 'D', ac_code, accoid)
            ac_code = company_parameters.SaleTDSAc
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TDS_Amt, 'C', ac_code, accoid)

        if Other_Amt > 0:
            ac_code = company_parameters.OTHER_AMOUNT_AC
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, Other_Amt, 'C', ac_code, accoid)
        else:
            add_gledger_entry(gledger_entries, head_data, Other_Amt, 'D', ac_code, accoid)

        add_gledger_entry(gledger_entries, head_data, bill_amount, "D", head_data['FromAc'], get_accoid(head_data['FromAc'], head_data['Company_Code']))

        for item in detail_data:
            Item_amount = float(item.get('item_Amount', 0) or 0)
            ic = item['ic']

            if Item_amount > 0:
                ac_code = getSaleAc(ic)
                add_gledger_entry(gledger_entries, head_data, Item_amount, 'C', ac_code, get_accoid(ac_code, head_data['Company_Code']))

        query_params = {
            'Company_Code': head_data['Company_Code'],
            'DOC_NO': updated_head.doc_no,
            'Year_Code': head_data['Year_Code'],
            'TRAN_TYPE': tran_type
        }

        response = requests.post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)

        if response.status_code == 201:
            db.session.commit()
        else:
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response.json()}), response.status_code

        return jsonify({
            "message": "Data updated successfully",
            "head": sugar_sale_return_head_schema.dump(updated_head),
            "created_details": sugar_sale_return_detail_schemas.dump(created_details),
            "updated_details": updated_details,
            "deleted_detail_ids": deleted_detail_ids
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500

@app.route(API_URL + "/delete-sugarsalereturn", methods=["DELETE"])
def delete_sugarsalereturn():
    try:
        srid = request.args.get('srid')
        tran_type = request.args.get('tran_type')
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')
        doc_no = request.args.get('doc_no')

        if not all([srid, tran_type, company_code, year_code, doc_no]):
            return jsonify({"error": "Missing required parameters"}), 400

        with db.session.begin():
            deleted_detail_rows = SugarSaleReturnSaleDetail.query.filter_by(srid=srid).delete()
            deleted_head_rows = SugarSaleReturnSaleHead.query.filter_by(srid=srid).delete()

        if deleted_detail_rows > 0 and deleted_head_rows > 0:
            query_params = {
                'Company_Code': company_code,
                'DOC_NO': doc_no,
                'Year_Code': year_code,
                'TRAN_TYPE': tran_type,
            }

            response = requests.delete("http://localhost:8080/api/sugarian/delete-Record-gLedger", params=query_params)
            
            if response.status_code != 200:
                raise Exception("Failed to delete record in gLedger")

        db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_head_rows} head row(s) and {deleted_detail_rows} detail row(s) successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500
    

@app.route(API_URL + "/getNextDocNo_SugarSaleReturnSale", methods=["GET"])
def getNextDocNo_SugarSaleReturnSale():
    try:
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Fetch the maximum document number for the given Company_Code and Year_Code
        max_doc_no = db.session.query(func.max(SugarSaleReturnSaleHead.doc_no)).filter_by(Company_Code=Company_Code, Year_Code=Year_Code).scalar()

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
