from flask import Flask, jsonify, request
from app import app, db
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# Import schemas from the schemas module
from app.models.BusinessReleted.CorporateSale.CorporateSaleModel import CorporateSaleHead, CorporateSaleDetail
from app.models.BusinessReleted.CorporateSale.CorporateSaleSchema import CorporateSaleHeadSchema, CorporateSaleDetailSchema

# Global SQL Query
CORPORATE_DETAILS_QUERY = '''
    SELECT accode.Ac_Name_E AS partyname,  unit.Ac_Name_E AS unitname,  broker.Ac_Name_E AS brokername, 
                   billto.Ac_Name_E AS billtoname
FROM     dbo.nt_1_accountmaster AS broker RIGHT OUTER JOIN
                  dbo.carporatedetail INNER JOIN
                  dbo.carporatehead ON dbo.carporatedetail.carpid = dbo.carporatehead.carpid ON broker.accoid = dbo.carporatehead.br LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS billto ON dbo.carporatehead.bt = billto.accoid LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS unit ON dbo.carporatehead.ac = unit.accoid LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS accode ON dbo.carporatehead.ac = accode.accoid
    WHERE dbo.carporatehead.carpid = :carpid
'''

# Define schemas
corporate_head_schema = CorporateSaleHeadSchema()
corporate_head_schemas = CorporateSaleHeadSchema(many=True)

corporate_detail_schema = CorporateSaleDetailSchema()
corporate_detail_schemas = CorporateSaleDetailSchema(many=True)

def format_dates(task):
    return {
        "doc_date": task.doc_date.strftime('%Y-%m-%d') if task.doc_date else None,
    }

# Get data from both tables CorporateHead and CorporateDetail
@app.route(API_URL + "/getdata-corporate", methods=["GET"])
def getdata_corporate():
    try:
        company_code = request.args.get('company_code')

        if not company_code:
            return jsonify({"error": "Missing 'company_code' parameter"}), 400
        
        records = CorporateSaleHead.query.filter_by(company_code=company_code).all()

        if not records:
            return jsonify({"error": "No records found"}), 404

        all_records_data = []

        for record in records:
            corporate_head_data = {column.name: getattr(record, column.name) for column in record.__table__.columns}
            corporate_head_data.update(format_dates(record))

            additional_data = db.session.execute(text(CORPORATE_DETAILS_QUERY), {"carpid": record.carpid})
            additional_data_rows = additional_data.fetchall()

            corporate_labels = [dict(row._mapping) for row in additional_data_rows]

            record_response = {
                "corporate_head_data": corporate_head_data,
                "corporate_labels": corporate_labels
            }

            all_records_data.append(record_response)

        response = {
            "all_data_corporate": all_records_data
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Get data by the particular doc_no
@app.route(API_URL + "/getcorporateSaleByid", methods=["GET"])
def getcorporateByid():
    try:
        # Extract doc_no and company_code from request query parameters
        doc_no = request.args.get('doc_no')
        company_code = request.args.get('company_code')
    

        if not all([doc_no, company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        corporate_head = CorporateSaleHead.query.filter_by(doc_no=doc_no, company_code=company_code).first()

        if not corporate_head:
            return jsonify({"error": "No records found"}), 404

        carpid = corporate_head.carpid
        additional_data = db.session.execute(text(CORPORATE_DETAILS_QUERY), {"carpid": carpid})
        additional_data_rows = additional_data.fetchall()

        corporate_head_data = {column.name: getattr(corporate_head, column.name) for column in corporate_head.__table__.columns}
        corporate_head_data.update(format_dates(corporate_head))

        corporate_labels = [dict(row._mapping) for row in additional_data_rows]

        detail_records = CorporateSaleDetail.query.filter_by(carpid=carpid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "corporate_head_data": corporate_head_data,
            "corporate_detail_data": detail_data,
            "corporate_labels": corporate_labels
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Fetch the last record from the database by carpid
@app.route(API_URL + "/get-lastcorporatedata", methods=["GET"])
def get_lastcorporatedata():
    try:
        company_code = request.args.get('company_code')

        if not all([company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        last_corporate_head = CorporateSaleHead.query.filter_by(company_code=company_code).order_by(CorporateSaleHead.doc_no.desc()).first()

        if not last_corporate_head:
            return jsonify({"error": "No records found"}), 404

        carpid = last_corporate_head.carpid
        additional_data = db.session.execute(text(CORPORATE_DETAILS_QUERY), {"carpid": carpid})
        additional_data_rows = additional_data.fetchall()

        corporate_head_data = {column.name: getattr(last_corporate_head, column.name) for column in last_corporate_head.__table__.columns}
        corporate_head_data.update(format_dates(last_corporate_head))

        corporate_labels = [dict(row._mapping) for row in additional_data_rows]

        detail_records = CorporateSaleDetail.query.filter_by(carpid=carpid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "corporate_head_data": corporate_head_data,
            "corporate_detail_data": detail_data,
            "corporate_labels": corporate_labels
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Get first record from the database
@app.route(API_URL + "/get-firstcorporate-navigation", methods=["GET"])
def get_firstcorporate_navigation():
    try:
        company_code = request.args.get('company_code')
    
        if not all([company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        first_corporate_head = CorporateSaleHead.query.filter_by(company_code=company_code).order_by(CorporateSaleHead.doc_no.asc()).first()

        if not first_corporate_head:
            return jsonify({"error": "No records found"}), 404

        carpid = first_corporate_head.carpid
        additional_data = db.session.execute(text(CORPORATE_DETAILS_QUERY), {"carpid": carpid})
        additional_data_rows = additional_data.fetchall()

        corporate_head_data = {column.name: getattr(first_corporate_head, column.name) for column in first_corporate_head.__table__.columns}
        corporate_head_data.update(format_dates(first_corporate_head))

        corporate_labels = [dict(row._mapping) for row in additional_data_rows]

        detail_records = CorporateSaleDetail.query.filter_by(carpid=carpid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "corporate_head_data": corporate_head_data,
            "corporate_detail_data": detail_data,
            "corporate_labels": corporate_labels
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Get previous record from the database
@app.route(API_URL + "/get-previouscorporate-navigation", methods=["GET"])
def get_previouscorporate_navigation():
    try:
        current_doc_no = request.args.get('current_doc_no')
        company_code = request.args.get('company_code')
        

        if not all([current_doc_no, company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        previous_corporate_head = CorporateSaleHead.query.filter(CorporateSaleHead.doc_no < current_doc_no).filter_by(company_code=company_code).order_by(CorporateSaleHead.doc_no.desc()).first()

        if not previous_corporate_head:
            return jsonify({"error": "No previous records found"}), 404

        carpid = previous_corporate_head.carpid
        additional_data = db.session.execute(text(CORPORATE_DETAILS_QUERY), {"carpid": carpid})
        additional_data_rows = additional_data.fetchall()

        corporate_head_data = {column.name: getattr(previous_corporate_head, column.name) for column in previous_corporate_head.__table__.columns}
        corporate_head_data.update(format_dates(previous_corporate_head))

        corporate_labels = [dict(row._mapping) for row in additional_data_rows]

        detail_records = CorporateSaleDetail.query.filter_by(carpid=carpid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "corporate_head_data": corporate_head_data,
            "corporate_detail_data": detail_data,
            "corporate_labels": corporate_labels
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Get next record from the database
@app.route(API_URL + "/get-nextcorporate-navigation", methods=["GET"])
def get_nextcorporate_navigation():
    try:
        current_doc_no = request.args.get('current_doc_no')
        company_code = request.args.get('company_code')
        

        if not all([current_doc_no, company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        next_corporate_head = CorporateSaleHead.query.filter(CorporateSaleHead.doc_no > current_doc_no).filter_by(company_code=company_code).order_by(CorporateSaleHead.doc_no.asc()).first()

        if not next_corporate_head:
            return jsonify({"error": "No next records found"}), 404

        carpid = next_corporate_head.carpid
        additional_data = db.session.execute(text(CORPORATE_DETAILS_QUERY), {"carpid": carpid})
        additional_data_rows = additional_data.fetchall()

        corporate_head_data = {column.name: getattr(next_corporate_head, column.name) for column in next_corporate_head.__table__.columns}
        corporate_head_data.update(format_dates(next_corporate_head))

        corporate_labels = [dict(row._mapping) for row in additional_data_rows]

        detail_records = CorporateSaleDetail.query.filter_by(carpid=carpid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "corporate_head_data": corporate_head_data,
            "corporate_detail_data": detail_data,
            "corporate_labels": corporate_labels
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


# Insert record for CorporateHead and CorporateDetail
@app.route(API_URL + "/insert-corporate", methods=["POST"])
def insert_corporate():
    def get_max_doc_no():
        return db.session.query(func.max(CorporateSaleHead.doc_no)).scalar() or 0
    try:


        data = request.get_json()
        head_data = data['head_data']
        detail_data = data['detail_data']


        max_doc_no = get_max_doc_no()
        new_doc_no = max_doc_no + 1
        head_data['doc_no'] = new_doc_no

        new_head = CorporateSaleHead(**head_data)
        db.session.add(new_head)

        created_details = []
        updated_details = []
        deleted_detail_ids = []
        
        for item in detail_data:
            item['doc_no'] = new_doc_no
            item['carpid'] = new_head.carpid
            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    new_detail = CorporateSaleDetail(**item)
                    new_head.details.append(new_detail)
                    created_details.append(new_detail)


                elif item['rowaction'] == "update":
                    carpdetailid = item['carpdetailid']
                    update_values = {k: v for k, v in item.items() if k not in ('carpdetailid', 'rowaction', 'carpid')}
                    db.session.query(CorporateSaleDetail).filter(CorporateSaleDetail.carpdetailid == carpdetailid).update(update_values)
                    updated_details.append(carpdetailid)

                elif item['rowaction'] == "delete":
                    carpdetailid = item['carpdetailid']
                    detail_to_delete = db.session.query(CorporateSaleDetail).filter(CorporateSaleDetail.carpdetailid == carpdetailid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deleted_detail_ids.append(carpdetailid)

        

        db.session.commit()

        corporate_head_schema = CorporateSaleHeadSchema()
        corporate_detail_schema = CorporateSaleDetailSchema(many=True)
            
        return jsonify({
            "message": "Data Inserted successfully",
            "head": corporate_head_schema.dump(new_head),
            "added_details": corporate_detail_schema.dump(created_details),
            "updatedDetails": updated_details,
            "deletedDetailIds": deleted_detail_ids
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Update record for CorporateHead and CorporateDetail
@app.route(API_URL + "/update-corporate", methods=["PUT"])
def update_corporate():
    try:
        carpid = request.args.get('carpid')
        if not carpid:
            return jsonify({"error": "Missing 'carpid' parameter"}), 400

        data = request.get_json()
        head_data = data['head_data']
        detail_data = data['detail_data']

        # Update the head data
        db.session.query(CorporateSaleHead).filter(CorporateSaleHead.carpid == carpid).update(head_data)
        updated_head = CorporateSaleHead.query.filter_by(carpid=carpid).first()
        updated_head_doc_no = updated_head.doc_no

        created_details = []
        updated_details = []
        deleted_detail_ids = []

        for item in detail_data:
            item['carpid'] = updated_head.carpid

            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item['doc_no'] = updated_head_doc_no
                    new_detail = CorporateSaleDetail(**item)
                    db.session.add(new_detail)
                    created_details.append(new_detail)

                elif item['rowaction'] == "update":
                    carpdetailid = item['carpdetailid']
                    update_values = {k: v for k, v in item.items() if k not in ('carpdetailid', 'rowaction', 'carpid')}
                    db.session.query(CorporateSaleDetail).filter(CorporateSaleDetail.carpdetailid == carpdetailid).update(update_values)
                    updated_details.append(carpdetailid)

                elif item['rowaction'] == "delete":
                    carpdetailid = item['carpdetailid']
                    detail_to_delete = db.session.query(CorporateSaleDetail).filter(CorporateSaleDetail.carpdetailid == carpdetailid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deleted_detail_ids.append(carpdetailid)

        db.session.commit()

        return jsonify({
            "message": "Data updated successfully",
            "head": corporate_head_schema.dump(updated_head),
            "created_details": corporate_detail_schemas.dump(created_details),
            "updated_details": updated_details,
            "deleted_detail_ids": deleted_detail_ids
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Delete record from database based on carpid
@app.route(API_URL + "/delete_data_by_carpid", methods=["DELETE"])
def delete_data_by_carpid():
    try:
        carpid = request.args.get('carpid')
        company_code = request.args.get('company_code')
    

        if not all([carpid, company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Start a transaction
        with db.session.begin():
            # Delete records from CorporateDetail table
            deleted_detail_rows = CorporateSaleDetail.query.filter_by(carpid=carpid).delete()

            # Delete record from CorporateHead table
            deleted_head_rows = CorporateSaleHead.query.filter_by(carpid=carpid).delete()

        # Commit the transaction 
        db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_head_rows} head row(s) and {deleted_detail_rows} detail row(s) successfully"
        }), 200

    except Exception as e:
        # Roll back the transaction if any error occurs
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

    


