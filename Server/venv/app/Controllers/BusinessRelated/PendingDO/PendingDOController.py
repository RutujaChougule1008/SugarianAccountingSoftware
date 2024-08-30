import traceback
from flask import Flask, jsonify, request
from app import app, db
from app.models.BusinessReleted.PendingDO.PendingDOModels import PendingDO
import os


API_URL= os.getenv('API_URL')


@app.route(API_URL + "/getdata-Pending_DO", methods=["GET"])
def getdata_Pending_DO():
    try:
        # Query the database using SQLAlchemy ORM
        additional_data_rows = PendingDO.query.filter_by(doid=0).all()

        # Convert rows to dictionaries
        all_data = [row.to_dict() for row in additional_data_rows]  # Ensure to_dict method is defined in your model

        # Prepare the response
        response = {
            "all_data": all_data
        }

        # Return the JSON response with HTTP 200 status
        return jsonify(response), 200

    except Exception as e:
        # Print the exception for debugging
        print(e)

        # Return a JSON response with HTTP 500 status
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + "/getByPendingDOId", methods=["GET"])
def getByPendingDOId():
    try:
        # Extract tenderdetailid from request query parameters
        tenderdetailid = request.args.get('tenderdetailid')
        
        if tenderdetailid is None:
            return jsonify({'error': 'Missing tenderdetailid parameter'}), 400

        try:
            tenderdetailid = int(tenderdetailid)
        except ValueError:
            return jsonify({'error': 'Invalid tenderdetailid parameter'}), 400

        # Use SQLAlchemy to find the record by tenderdetailid
        pendingDO = PendingDO.query.filter_by(tenderdetailid=tenderdetailid).first()

        if pendingDO is None:
            return jsonify({'error': 'Record not found'}), 404

        # Extract data from the found record
        last_head_data = {column.name: getattr(pendingDO, column.name) for column in pendingDO.__table__.columns}

        # Prepare response data
        response = {
            "last_head_data": last_head_data,
        }
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


