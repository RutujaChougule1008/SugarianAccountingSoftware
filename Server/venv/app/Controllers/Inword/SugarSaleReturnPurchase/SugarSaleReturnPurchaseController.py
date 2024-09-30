
import traceback
from flask import Flask, jsonify, request
from app import app, db
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
from app.models.Inword.SugarSaleReturnPurchase.SugarSaleReturnPurchaseModels import SugarPurchaseReturnHead,SugarPurchaseReturnDetail
from app.models.Inword.SugarSaleReturnPurchase.SugarSaleReturnPurchaseSchema import SugarPurchaseReturnHeadSchema,SugarPurchaseReturnDetailSchema
import os
import requests
from app.utils.CommonGLedgerFunctions import fetch_company_parameters,get_accoid,getSaleAc

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# Global SQL Query for nt_1_sugarpurchasereturn
PURCHASE_RETURN_QUERY = '''
SELECT        accode.Ac_Name_E AS partyname, mill.Ac_Name_E AS millname, unit.Ac_Name_E AS unitname, broker.Ac_Name_E AS brokername, item.System_Name_E AS itemname, billto.Ac_Name_E AS billtoname, 
                         dbo.nt_1_gstratemaster.GST_Name, item.System_Code AS item_code
FROM            dbo.nt_1_systemmaster AS item RIGHT OUTER JOIN
                         dbo.nt_1_sugarpurchasedetailsreturn ON item.systemid = dbo.nt_1_sugarpurchasedetailsreturn.ic RIGHT OUTER JOIN
                         dbo.nt_1_accountmaster AS accode RIGHT OUTER JOIN
                         dbo.nt_1_accountmaster AS mill RIGHT OUTER JOIN
                         dbo.nt_1_gstratemaster RIGHT OUTER JOIN
                         dbo.nt_1_sugarpurchasereturn ON dbo.nt_1_gstratemaster.gstid = dbo.nt_1_sugarpurchasereturn.gstid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS billto ON dbo.nt_1_sugarpurchasereturn.bt = billto.accoid ON mill.accoid = dbo.nt_1_sugarpurchasereturn.mc LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS broker ON dbo.nt_1_sugarpurchasereturn.bc = broker.accoid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS unit ON dbo.nt_1_sugarpurchasereturn.uc = unit.accoid ON accode.accoid = dbo.nt_1_sugarpurchasereturn.ac ON dbo.nt_1_sugarpurchasedetailsreturn.prid = dbo.nt_1_sugarpurchasereturn.prid
WHERE item.System_Type = 'I' AND dbo.nt_1_sugarpurchasereturn.prid = :prid
'''

sugar_sale_return_purchase_head_schema = SugarPurchaseReturnHeadSchema()
sugar_sale_return_purchase_head_schemas = SugarPurchaseReturnHeadSchema(many=True)

sugar_sale_return_purchase_detail_schema = SugarPurchaseReturnDetailSchema()
sugar_sale_return_purchase_detail_schemas = SugarPurchaseReturnDetailSchema(many=True)

def format_dates(Data):
    return {
        "doc_date": Data.doc_date.strftime('%Y-%m-%d') if Data.doc_date else None,
    }

@app.route(API_URL + "/getdata-sugarpurchasereturn", methods=["GET"])
def getdata_sugarpurchasereturn():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400
        
        records = SugarPurchaseReturnHead.query.filter_by(Company_Code=company_code, Year_Code=year_code).all()

        if not records:
            return jsonify({"error": "No records found"}), 404

        all_records_data = []

        for record in records:
            returnPurchaseData = {column.name: getattr(record, column.name) for column in record.__table__.columns}
            returnPurchaseData.update(format_dates(record))

            additional_data = db.session.execute(text(PURCHASE_RETURN_QUERY), {"prid": record.prid})
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
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-sugarpurchasereturn-by-id", methods=["GET"])
def get_sugarpurchasereturn_by_id():
    try:
        doc_no = request.args.get('doc_no')
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code or not doc_no:
            return jsonify({"error": "Missing 'Company_Code', 'Year_Code', or 'doc_no' parameter"}), 400

        sugarPurchaseReturn_head = SugarPurchaseReturnHead.query.filter_by(doc_no=doc_no, Company_Code=company_code, Year_Code=year_code).first()

        if not sugarPurchaseReturn_head:
            return jsonify({"error": "No records found"}), 404

        newsugarPurchaseReturn_id = sugarPurchaseReturn_head.prid

        additional_data = db.session.execute(text(PURCHASE_RETURN_QUERY), {"prid": newsugarPurchaseReturn_id})
        additional_data_rows = additional_data.fetchall()

        last_head_data = {column.name: getattr(sugarPurchaseReturn_head, column.name) for column in sugarPurchaseReturn_head.__table__.columns}
        last_head_data.update(format_dates(sugarPurchaseReturn_head))

        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarPurchaseReturnDetail.query.filter_by(prid=newsugarPurchaseReturn_id).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "last_head_data": last_head_data,
            "last_labels_data": last_details_data,
            "detail_data": detail_data
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-last-sugarpurchasereturn", methods=["GET"])
def get_last_sugarpurchasereturn():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing required parameters"}), 400

        last_sugarPurchaseReturn = SugarPurchaseReturnHead.query.filter_by(Company_Code=company_code, Year_Code=year_code).order_by(SugarPurchaseReturnHead.doc_no.desc()).first()

        if not last_sugarPurchaseReturn:
            return jsonify({"error": "No records found"}), 404

        last_prid = last_sugarPurchaseReturn.prid

        additional_data = db.session.execute(text(PURCHASE_RETURN_QUERY), {"prid": last_prid})
        additional_data_rows = additional_data.fetchall()

        last_head_data = {column.name: getattr(last_sugarPurchaseReturn, column.name) for column in last_sugarPurchaseReturn.__table__.columns}
        last_head_data.update(format_dates(last_sugarPurchaseReturn))

        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarPurchaseReturnDetail.query.filter_by(prid=last_prid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "last_head_data": last_head_data,
            "last_labels_data": last_details_data,
            "detail_data": detail_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-first-sugarpurchasereturn", methods=["GET"])
def get_first_sugarpurchasereturn():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not company_code or not year_code:
            return jsonify({"error": "Missing required parameters"}), 400

        first_sugarPurchaseReturnPurchase = SugarPurchaseReturnHead.query.filter_by(Company_Code=company_code, Year_Code=year_code).order_by(SugarPurchaseReturnHead.doc_no.asc()).first()

        if not first_sugarPurchaseReturnPurchase:
            return jsonify({"error": "No records found"}), 404

        first_prid = first_sugarPurchaseReturnPurchase.prid

        additional_data = db.session.execute(text(PURCHASE_RETURN_QUERY), {"prid": first_prid})
        additional_data_rows = additional_data.fetchall()

        last_head_data = {column.name: getattr(first_sugarPurchaseReturnPurchase, column.name) for column in first_sugarPurchaseReturnPurchase.__table__.columns}
        last_head_data.update(format_dates(first_sugarPurchaseReturnPurchase))

        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarPurchaseReturnDetail.query.filter_by(prid=first_prid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "last_head_data": last_head_data,
            "last_labels_data": last_details_data,
            "detail_data": detail_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-previous-sugarpurchasereturn", methods=["GET"])
def get_previous_sugarpurchasereturn():
    try:
        current_doc_no = request.args.get('doc_no')
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not current_doc_no or not company_code or not year_code:
            return jsonify({"error": "Missing required parameters"}), 400

        previous_sugarpurchasereturn = SugarPurchaseReturnHead.query.filter_by(Company_Code=company_code, Year_Code=year_code).filter(SugarPurchaseReturnHead.doc_no < current_doc_no).order_by(SugarPurchaseReturnHead.doc_no.desc()).first()

        if not previous_sugarpurchasereturn:
            return jsonify({"error": "No previous records found"}), 404

        previous_prid = previous_sugarpurchasereturn.prid

        additional_data = db.session.execute(text(PURCHASE_RETURN_QUERY), {"prid": previous_prid})
        additional_data_rows = additional_data.fetchall()

        last_head_data = {column.name: getattr(previous_sugarpurchasereturn, column.name) for column in previous_sugarpurchasereturn.__table__.columns}
        last_head_data.update(format_dates(previous_sugarpurchasereturn))

        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarPurchaseReturnDetail.query.filter_by(prid=previous_prid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "last_head_data": last_head_data,
            "last_labels_data": last_details_data,
            "detail_data": detail_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-next-sugarpurchasereturn", methods=["GET"])
def get_next_sugarpurchasereturn():
    try:
        current_doc_no = request.args.get('doc_no')
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if not current_doc_no or not company_code or not year_code:
            return jsonify({"error": "Missing required parameters"}), 400

        sugarpurchasereturn = SugarPurchaseReturnHead.query.filter(SugarPurchaseReturnHead.doc_no > current_doc_no).filter_by(Company_Code=company_code, Year_Code=year_code).order_by(SugarPurchaseReturnHead.doc_no.asc()).first()

        if not sugarpurchasereturn:
            return jsonify({"error": "No next records found"}), 404

        next_prid = sugarpurchasereturn.prid

        additional_data = db.session.execute(text(PURCHASE_RETURN_QUERY), {"prid": next_prid})
        additional_data_rows = additional_data.fetchall()

        last_head_data = {column.name: getattr(sugarpurchasereturn, column.name) for column in sugarpurchasereturn.__table__.columns}
        last_head_data.update(format_dates(sugarpurchasereturn))

        last_details_data = [dict(row._mapping) for row in additional_data_rows]

        detail_records = SugarPurchaseReturnDetail.query.filter_by(prid=next_prid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "last_head_data": last_head_data,
            "last_labels_data": last_details_data,
            "detail_data": detail_data
        } 

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/create-sugarpurchasereturn", methods=["POST"])
def create_sugarpurchasereturn():
    def get_max_doc_no(company_code, year_code):
        return db.session.query(func.max(SugarPurchaseReturnHead.doc_no)).filter(
            SugarPurchaseReturnHead.Company_Code == company_code,
            SugarPurchaseReturnHead.Year_Code == year_code
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

        # Increment the doc_no for the new entry
        new_doc_no = max_doc_no + 1
        headData['doc_no'] = new_doc_no

        new_head = SugarPurchaseReturnHead(**headData)
        db.session.add(new_head)

        created_details = []
        updated_details = []
        deleted_detail_ids = []

        for item in detailData:
            item['doc_no'] = new_doc_no
            item['Tran_Type'] = headData.get('Tran_Type', "PR")
            item['prid'] = new_head.prid
            if 'rowaction' in item and item['rowaction'] == "add":
                del item['rowaction']
                new_detail = SugarPurchaseReturnDetail(**item)
                new_head.details.append(new_detail)
                created_details.append(new_detail)

            elif 'rowaction' in item and item['rowaction'] == "update":
                prdid = item['prdid']
                update_values = {k: v for k, v in item.items() if k not in ('prdid', 'rowaction', 'prid')}
                db.session.query(SugarPurchaseReturnDetail).filter(SugarPurchaseReturnDetail.prdid == prdid).update(update_values)
                updated_details.append(prdid)

            elif 'rowaction' in item and item['rowaction'] == "delete":
                prdid = item['prdid']
                detail_to_delete = db.session.query(SugarPurchaseReturnDetail).filter(SugarPurchaseReturnDetail.prdid == prdid).one_or_none()
                if detail_to_delete:
                    db.session.delete(detail_to_delete)
                    deleted_detail_ids.append(prdid)

        db.session.commit()

        igst_amount = float(headData.get('IGSTAmount', 0) or 0)
        bill_amount = float(headData.get('Bill_Amount', 0) or 0)
        sgst_amount = float(headData.get('SGSTAmount', 0) or 0)
        cgst_amount = float(headData.get('CGSTAmount', 0) or 0)
        TCS_Amt = float(headData.get('TCS_Amt', 0) or 0)
        TDS_Amt = float(headData.get('TDS_Amt', 0) or 0)
        Other_Amt = float(headData.get('OTHER_Amt', 0) or 0)

        print(company_code)

        company_parameters = fetch_company_parameters(company_code, year_code)

        print("company_parameters",company_parameters)

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
            "head": sugar_sale_return_purchase_head_schema.dump(new_head),
            "createdDetails": sugar_sale_return_purchase_detail_schemas.dump(created_details),
            "updatedDetails": updated_details,
            "deletedDetailIds": deleted_detail_ids
        }), 201

    except Exception as e:
        print("Traceback",traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500


@app.route(API_URL + "/update-sugarpurchasereturn", methods=["PUT"])
def update_sugarpurchasereturn():
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
        prid = request.args.get('prid')
        if not prid:
            return jsonify({"error": "Missing 'prid' parameter"}), 400

        data = request.get_json()
        head_data = data['headData']
        detail_data = data['detailData']

        tran_type = head_data.get('Tran_Type')
        if not tran_type:
            return jsonify({"error": "Bad Request", "message": "tran_type is required"}), 400

        # Update the head data
        updated_head_count = db.session.query(SugarPurchaseReturnHead).filter(SugarPurchaseReturnHead.prid == prid).update(head_data)
        updated_head = SugarPurchaseReturnHead.query.filter_by(prid=prid).first()

        created_details = []
        updated_details = []
        deleted_detail_ids = []

        for item in detail_data:
            item['prid'] = updated_head.prid
            item['Tran_Type'] = tran_type

            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item['doc_no'] = updated_head.doc_no
                    new_detail = SugarPurchaseReturnDetail(**item)
                    db.session.add(new_detail)
                    created_details.append(new_detail)

                elif item['rowaction'] == "update":
                    prdid = item['prdid']
                    update_values = {k: v for k, v in item.items() if k not in ('prdid', 'rowaction', 'prid')}
                    db.session.query(SugarPurchaseReturnDetail).filter(SugarPurchaseReturnDetail.prdid == prdid).update(update_values)
                    updated_details.append(prdid)

                elif item['rowaction'] == "delete":
                    prdid = item['prdid']
                    detail_to_delete = db.session.query(SugarPurchaseReturnDetail).filter(SugarPurchaseReturnDetail.prdid == prdid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deleted_detail_ids.append(prdid)

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
            add_gledger_entry(gledger_entries, head_data, igst_amount, "D", ac_code, accoid)

        if cgst_amount > 0:
            ac_code = company_parameters.CGSTAc
            accoid = get_accoid(company_parameters.CGSTAc, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, cgst_amount, "D", ac_code, accoid)

        if sgst_amount > 0:
            ac_code = company_parameters.SGSTAc
            accoid = get_accoid(company_parameters.SGSTAc, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, sgst_amount, "D", ac_code, accoid)

        if TCS_Amt > 0:
            ac_code = head_data['Ac_Code']
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TCS_Amt, 'D', ac_code, accoid)
            ac_code = company_parameters.SaleTCSAc
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TCS_Amt, 'C', ac_code, accoid)

        if TDS_Amt > 0:
            ac_code = head_data['Ac_Code']
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TDS_Amt, 'C', ac_code, accoid)
            ac_code = company_parameters.SaleTDSAc
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TDS_Amt, 'D', ac_code, accoid)

        if Other_Amt > 0:
            ac_code = company_parameters.OTHER_AMOUNT_AC
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, Other_Amt, 'D', ac_code, accoid)
        else:
            ac_code = company_parameters.OTHER_AMOUNT_AC
            accoid = get_accoid(ac_code, head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, Other_Amt, 'C', ac_code, accoid)

        add_gledger_entry(gledger_entries, head_data, bill_amount, "C", head_data['Ac_Code'], get_accoid(head_data['Ac_Code'], head_data['Company_Code']))

        for item in detail_data:
            Item_amount = float(item.get('item_Amount', 0) or 0)
            ic = item.get('ic')

            if Item_amount > 0:
                ac_code = getSaleAc(ic)
                add_gledger_entry(gledger_entries, head_data, Item_amount, 'D', ac_code, get_accoid(ac_code, head_data['Company_Code']))

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
            "head": sugar_sale_return_purchase_head_schema.dump(updated_head),
            "created_details": sugar_sale_return_purchase_detail_schemas.dump(created_details),
            "updated_details": updated_details,
            "deleted_detail_ids": deleted_detail_ids
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500


@app.route(API_URL + "/delete-sugarpurchasereturn", methods=["DELETE"])
def delete_sugarpurchasereturn():
    try:
        prid = request.args.get('prid')
        tran_type = request.args.get('tran_type')
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')
        doc_no = request.args.get('doc_no')

        # Check if the required parameters are provided
        if not all([prid, tran_type, company_code, year_code, doc_no]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Start a transaction
        with db.session.begin():
            # Delete records from SugarPurchaseReturnDetail table
            deleted_detail_rows = SugarPurchaseReturnDetail.query.filter_by(
                prid=prid
            ).delete()

            # Delete record from SugarPurchaseReturnHead table
            deleted_head_rows = SugarPurchaseReturnHead.query.filter_by(
                prid=prid
            ).delete()

        if deleted_detail_rows > 0 and deleted_head_rows > 0:
            query_params = {
                'Company_Code': company_code,
                'DOC_NO': doc_no,
                'Year_Code': year_code,
                'TRAN_TYPE': tran_type,
            }

            # Make the external request
            response = requests.delete("http://localhost:8080/api/sugarian/delete-Record-gLedger", params=query_params)
            
            if response.status_code != 200:
                raise Exception("Failed to delete record in gLedger")

        db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_head_rows} head row(s) and {deleted_detail_rows} detail row(s) successfully"
        }), 200

    except Exception as e:
        # Roll back the transaction if any error occurs
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e), "trace": traceback.format_exc()}), 500
    
@app.route(API_URL + "/getNextDocNo_SugarPurchaseReturnHead", methods=["GET"])
def getNextDocNo_SugarPurchaseReturnHead():
    try:
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Fetch the maximum document number for the given Company_Code and Year_Code
        max_doc_no = db.session.query(func.max(SugarPurchaseReturnHead.doc_no)).filter_by(Company_Code=Company_Code, Year_Code=Year_Code).scalar()

        if max_doc_no is None:
            next_doc_no = 1  
        else:
            next_doc_no = max_doc_no + 1  

        response = {
            "next_doc_no": next_doc_no
        }
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

