import traceback
from flask import jsonify, request
from app import app, db
from app.models.eBuySugarian.Users.EBuy_UserModel import EBuyUsers
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

@app.route(API_URL + "/getAll_UserAccoidNullWise", methods=["GET"])
def getAll_UserAccoidNullWise():
    try:
        records = EBuyUsers.query.filter(EBuyUsers.accoid.is_(None)).all()

        if not records:
            return jsonify({"error": "No records found"}), 404

        # Initialize a list to hold all record data
        records_list = []

        # Loop through all records and accumulate the data in the list
        for record in records:
            record_data = {column.name: getattr(record, column.name) for column in record.__table__.columns}
            records_list.append(record_data)

        # Prepare the response dictionary
        response = {
            "records": records_list
        }
            
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


