import traceback
from flask import Flask, jsonify, request
from app import app, db
from app.models.Transactions.OtherPurchaseModels import OtherPurchase
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError 
from sqlalchemy import func
import os
import requests


# Get the base URL from environment variables
API_URL = os.getenv('API_URL')


TASK_DETAILS_QUERY = '''
SELECT dbo.nt_1_gstratemaster.GST_Name, qrymsttdaccode.Ac_Name_E AS tdsacname,  
       qrymsttdscutaccode.Ac_Name_E AS TDSCutAcName, qrymstexp.Ac_Name_E AS ExpAcName, qrymstsuppiler.Ac_Name_E AS SupplierName
FROM dbo.nt_1_other_purchase 
LEFT OUTER JOIN dbo.nt_1_gstratemaster ON dbo.nt_1_other_purchase.Company_Code = dbo.nt_1_gstratemaster.Company_Code AND dbo.nt_1_other_purchase.GST_RateCode = dbo.nt_1_gstratemaster.Doc_no 
LEFT OUTER JOIN dbo.qrymstaccountmaster AS qrymsttdaccode ON dbo.nt_1_other_purchase.tac = qrymsttdaccode.accoid 
LEFT OUTER JOIN dbo.qrymstaccountmaster AS qrymsttdscutaccode ON dbo.nt_1_other_purchase.tca = qrymsttdscutaccode.accoid 
LEFT OUTER JOIN dbo.qrymstaccountmaster AS qrymstexp ON dbo.nt_1_other_purchase.ea = qrymstexp.accoid 
LEFT OUTER JOIN dbo.qrymstaccountmaster AS qrymstsuppiler ON dbo.nt_1_other_purchase.sc = qrymstsuppiler.accoid
WHERE dbo.nt_1_other_purchase.opid=:opid
'''

def format_dates(task):
    return {
        "Doc_Date": task.Doc_Date.strftime('%Y-%m-%d') if task.Doc_Date else None,
    }

@app.route(API_URL + "/getall-OtherPurchase", methods=["GET"])
def get_OtherPurchase():
    try:
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        records = OtherPurchase.query.filter_by(Company_Code=Company_Code, Year_Code=Year_Code).all()

        if not records:
            return jsonify({"error": "No records found"}), 404

        all_records_data = []

        for record in records:
            other_purchase_data = {column.name: getattr(record, column.name) for column in record.__table__.columns}
            other_purchase_data.update(format_dates(record))

            opid = record.opid
            additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"opid": opid})
            additional_data_row = additional_data.fetchone()

            labels = dict(additional_data_row._mapping) if additional_data_row else {}

            record_response = {
                "other_purchase_data": other_purchase_data,
                "labels": labels
            }

            all_records_data.append(record_response)

        response = {
            "all_other_purchase_data": all_records_data
        }
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + "/get-next-doc-no-OtherPurchase", methods=["GET"])
def get_next_doc_no_OtherPurchase():
    try:
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        try:
            Company_Code = int(Company_Code)
            Year_Code = int(Year_Code)
        except ValueError:
            return jsonify({'error': 'Invalid Company_Code or Year_Code parameter'}), 400

        # Fetch the maximum Doc_No for the given Company_Code and Year_Code
        max_doc_no = db.session.query(func.max(OtherPurchase.Doc_No)).filter_by(Company_Code=Company_Code, Year_Code=Year_Code).scalar()

        # If no records exist, set Doc_No to 1
        if max_doc_no is None:
            next_doc_no = 1
        else:
            # Increment the Doc_No by 1
            next_doc_no = max_doc_no + 1

        # Return the new Doc_No
        return jsonify({"next_doc_no": next_doc_no}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-OtherPurchase-lastRecord", methods=["GET"])
def get_OtherPurchase_lastRecord():
    try:
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        last_Record = OtherPurchase.query.filter_by(Company_Code=Company_Code, Year_Code=Year_Code).order_by(OtherPurchase.Doc_No.desc()).first()

        if not last_Record:
            return jsonify({"error": "No record found for the provided Company_Code and Year_Code"}), 404

        last_Record_data = {column.name: getattr(last_Record, column.name) for column in last_Record.__table__.columns}
        last_Record_data.update(format_dates(last_Record))

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"opid": last_Record.opid})
        additional_data_row = additional_data.fetchone()

        labels = dict(additional_data_row._mapping) if additional_data_row else {}

        response = {
            "last_OtherPurchase_data": last_Record_data,
            "labels": labels
        }

        return jsonify(response), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-OtherPurchaseSelectedRecord", methods=["GET"])
def get_OtherPurchaseSelectedRecord():
    try:
        Doc_No = request.args.get('Doc_No')
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Doc_No, Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        try:
            Doc_No = int(Doc_No)
            Company_Code = int(Company_Code)
            Year_Code = int(Year_Code)
        except ValueError:
            return jsonify({"error": "Invalid Doc_No, Company_Code, or Year_Code parameter"}), 400

        Record = OtherPurchase.query.filter_by(Doc_No=Doc_No, Company_Code=Company_Code, Year_Code=Year_Code).first()

        if not Record:
            return jsonify({"error": "Selected Record not found"}), 404

        Record_data = {column.name: getattr(Record, column.name) for column in Record.__table__.columns}
        Record_data.update(format_dates(Record))

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"opid": Record.opid})
        additional_data_row = additional_data.fetchone()

        labels = dict(additional_data_row._mapping) if additional_data_row else {}

        response = {
            "selected_Record_data": Record_data,
            "labels": labels
        }

        return jsonify(response), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/create-Record-OtherPurchase", methods=["POST"])
def create_OtherPurchase():
    try:
        Company_Code = request.json.get('Company_Code')
        Year_Code = request.json.get('Year_Code')
        
        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing Company_Code or Year_Code parameter"}), 400

        try:
            Company_Code = int(Company_Code)
            Year_Code = int(Year_Code)
        except ValueError:
            return jsonify({"error": "Invalid Company_Code or Year_Code parameter"}), 400

        max_doc_no = db.session.query(func.max(OtherPurchase.Doc_No)).filter_by(Company_Code=Company_Code, Year_Code=Year_Code).scalar() or 0

        new_record_data = request.json
        new_record_data['Doc_No'] = max_doc_no + 1
        new_record_data['Company_Code'] = Company_Code
        new_record_data['Year_Code'] = Year_Code

        new_record = OtherPurchase(**new_record_data)
        db.session.add(new_record)
        db.session.commit()

        return jsonify({
            "message": "Record created successfully",
            "record": new_record_data
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route(API_URL + "/update-OtherPurchase", methods=["PUT"])
def update_OtherPurchase():
    try:
        Company_Code = request.json.get('Company_Code')
        Doc_No = request.json.get('Doc_No')
        Year_Code = request.json.get('Year_Code')
        
        if not all([Company_Code, Doc_No, Year_Code]):
            return jsonify({"error": "Missing Company_Code, Doc_No, or Year_Code parameter"}), 400

        try:
            Company_Code = int(Company_Code)
            Doc_No = int(Doc_No)
            Year_Code = int(Year_Code)
        except ValueError:
            return jsonify({"error": "Invalid Company_Code, Doc_No, or Year_Code parameter"}), 400

        existing_record = OtherPurchase.query.filter_by(Doc_No=Doc_No, Company_Code=Company_Code, Year_Code=Year_Code).first()
        if not existing_record:
            return jsonify({"error": "Record not found"}), 404

        update_data = request.json
        for key, value in update_data.items():
            setattr(existing_record, key, value)

        db.session.commit()

        return jsonify({
            "message": "Record updated successfully",
            "record": update_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route(API_URL + "/delete-OtherPurchase", methods=["DELETE"])
def delete_OtherPurchase():
    try:
        Doc_No = request.args.get('Doc_No')
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Doc_No, Company_Code, Year_Code]):
            return jsonify({"error": "Missing Doc_No, Company_Code, or Year_Code parameter"}), 400

        try:
            Doc_No = int(Doc_No)
            Company_Code = int(Company_Code)
            Year_Code = int(Year_Code)
        except ValueError:
            return jsonify({"error": "Invalid Doc_No, Company_Code, or Year_Code parameter"}), 400

        existing_record = OtherPurchase.query.filter_by(Doc_No=Doc_No, Company_Code=Company_Code, Year_Code=Year_Code).first()
        if not existing_record:
            return jsonify({"error": "Record not found"}), 404

        db.session.delete(existing_record)
        db.session.commit()

        return jsonify({"message": "Record deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route(API_URL + "/get-first-OtherPurchase", methods=["GET"])
def get_first_OtherPurchase():
    try:
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        if not all([Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        first_Record = OtherPurchase.query.filter_by(Company_Code=Company_Code, Year_Code=Year_Code).order_by(OtherPurchase.Doc_No.asc()).first()
        
        if not first_Record:
            return jsonify({"error": "No records found for the provided Company_Code and Year_Code"}), 404

        first_Record_data = {column.name: getattr(first_Record, column.name) for column in first_Record.__table__.columns}
        first_Record_data.update(format_dates(first_Record))

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"opid": first_Record.opid})
        additional_data_row = additional_data.fetchone()

        labels = dict(additional_data_row._mapping) if additional_data_row else {}

        response = {
            "first_OtherPurchase_data": first_Record_data,
            "labels": labels
        }

        return jsonify(response), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500



@app.route(API_URL + "/get-previous-OtherPurchase", methods=["GET"])
def get_previous_OtherPurchase():
    try:
        Doc_No = request.args.get('Doc_No')
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Doc_No, Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        try:
            Doc_No = int(Doc_No)
            Company_Code = int(Company_Code)
            Year_Code = int(Year_Code)
        except ValueError:
            return jsonify({"error": "Invalid Doc_No, Company_Code, or Year_Code parameter"}), 400

        previous_Record = OtherPurchase.query.filter(
            OtherPurchase.Doc_No < Doc_No,
            OtherPurchase.Company_Code == Company_Code,
            OtherPurchase.Year_Code == Year_Code
        ).order_by(OtherPurchase.Doc_No.desc()).first()

        if not previous_Record:
            return jsonify({"error": "No previous record found"}), 404

        previous_Record_data = {column.name: getattr(previous_Record, column.name) for column in previous_Record.__table__.columns}
        previous_Record_data.update(format_dates(previous_Record))

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"opid": previous_Record.opid})
        additional_data_row = additional_data.fetchone()

        labels = dict(additional_data_row._mapping) if additional_data_row else {}

        response = {
            "previous_OtherPurchase_data": previous_Record_data,
            "labels": labels
        }

        return jsonify(response), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-next-OtherPurchase", methods=["GET"])
def get_next_OtherPurchase():
    try:
        Doc_No = request.args.get('Doc_No')
        Company_Code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')

        if not all([Doc_No, Company_Code, Year_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        try:
            Doc_No = int(Doc_No)
            Company_Code = int(Company_Code)
            Year_Code = int(Year_Code)
        except ValueError:
            return jsonify({"error": "Invalid Doc_No, Company_Code, or Year_Code parameter"}), 400

        next_Record = OtherPurchase.query.filter(
            OtherPurchase.Doc_No > Doc_No,
            OtherPurchase.Company_Code == Company_Code,
            OtherPurchase.Year_Code == Year_Code
        ).order_by(OtherPurchase.Doc_No.asc()).first()

        if not next_Record:
            return jsonify({"error": "No next record found"}), 404

        next_Record_data = {column.name: getattr(next_Record, column.name) for column in next_Record.__table__.columns}
        next_Record_data.update(format_dates(next_Record))

        additional_data = db.session.execute(text(TASK_DETAILS_QUERY), {"opid": next_Record.opid})
        additional_data_row = additional_data.fetchone()

        labels = dict(additional_data_row._mapping) if additional_data_row else {}

        response = {
            "next_OtherPurchase_data": next_Record_data,
            "labels": labels
        }

        return jsonify(response), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
