import traceback
from flask import Flask, jsonify, request
from app import app, db
from app.models.BusinessReleted.PendingDO.PendingDOModels import PendingDO
import os
from sqlalchemy import text


API_URL= os.getenv('API_URL')


@app.route(API_URL + "/getdata-Pending_DO", methods=["GET"])
def getdata_Pending_DO():
    try:
    

        query = ('''SELECT        billTo.Ac_Name_E AS billToName, shipTo.Ac_Name_E AS shipToName, dbo.eBuySugar_Pending_DO.doid, dbo.eBuySugar_Pending_DO.user_id, dbo.eBuySugar_Pending_DO.do_qntl, 
                         dbo.eBuySugar_Pending_DO.adjust_do_qntl, dbo.eBuySugar_Pending_DO.truck_no, dbo.eBuySugar_Pending_DO.bill_to_ac_code, dbo.eBuySugar_Pending_DO.tenderdetailid, dbo.eBuySugar_Pending_DO.orderid, 
                         dbo.eBuySugar_Pending_DO.ship_to_ac_code, dbo.eBuySugar_Pending_DO.bill_to_gst_no, dbo.eBuySugar_Pending_DO.ship_to_gst_no, dbo.eBuySugar_Pending_DO.payment_detail, 
                         dbo.eBuySugar_OrderList.Buy_Rate AS saleRate, dbo.eBuySugar_Pending_DO.orderid
FROM            dbo.eBuySugar_Pending_DO LEFT OUTER JOIN
                         dbo.eBuySugar_OrderList ON dbo.eBuySugar_Pending_DO.orderid = dbo.eBuySugar_OrderList.orderid LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS shipTo ON dbo.eBuySugar_Pending_DO.ship_to_ac_code = shipTo.Ac_Code LEFT OUTER JOIN
                         dbo.nt_1_accountmaster AS billTo ON dbo.eBuySugar_Pending_DO.bill_to_ac_code = billTo.Ac_Code
                
                                 '''
            )
        additional_data = db.session.execute(text(query))

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
        
        
    

        # Convert additional_data_rows to a list of dictionaries
        all_data = [dict(row._mapping) for row in additional_data_rows]

        

        # Prepare response data 
        response = {
            "all_data": all_data
        }
        # If record found, return it
        return jsonify(response), 200

    except Exception as e:
        print(e)
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


