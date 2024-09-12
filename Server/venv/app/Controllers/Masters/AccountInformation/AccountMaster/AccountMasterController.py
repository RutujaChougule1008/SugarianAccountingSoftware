import traceback
from flask import Flask, jsonify, request
from app import app, db
import requests
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# Import schemas from the schemas module
from app.models.Masters.AccountInformation.AccountMaster.AccountMasterModel import AccountMaster, AccountContact, AcGroups
from app.models.Masters.AccountInformation.AccountMaster.AccountMasterSchema import AccountMasterSchema, AccountContactSchema, AcGroupsSchema
from app.models.eBuySugarian.Users.EBuy_UserModel import EBuyUsers
from app.utils.CommonGLedgerFunctions import get_accoid

# Define schemas
account_master_schema = AccountMasterSchema()
account_master_schemas = AccountMasterSchema(many=True)

account_contact_schema = AccountContactSchema()
account_contact_schemas = AccountContactSchema(many=True)

# Global SQL Query
ACCOUNT_CONTACT_DETAILS_QUERY = '''
   SELECT city.city_name_e AS cityname, dbo.nt_1_bsgroupmaster.group_Name_E AS groupcodename, State.State_Name
FROM     dbo.nt_1_accountmaster INNER JOIN
                  dbo.gststatemaster AS State ON dbo.nt_1_accountmaster.GSTStateCode = State.State_Code LEFT OUTER JOIN
                  dbo.nt_1_citymaster AS city ON dbo.nt_1_accountmaster.cityid = city.cityid LEFT OUTER JOIN
                  dbo.nt_1_accontacts ON dbo.nt_1_accountmaster.accoid = dbo.nt_1_accontacts.accoid LEFT OUTER JOIN
                  dbo.nt_1_bsgroupmaster ON dbo.nt_1_accountmaster.bsid = dbo.nt_1_bsgroupmaster.bsid
    WHERE dbo.nt_1_accountmaster.accoid = :accoid
'''


# Get data from both tables AccountMaster and AccountContact
# @app.route(API_URL + "/getdata-accountmaster", methods=["GET"])
# def getdata_accountmaster():
#     try:
#         company_code = request.args.get('Company_Code')
#         if not company_code:
#             return jsonify({"error": "Missing 'Company_Code' parameter"}), 400
        
#         records = AccountMaster.query.filter_by(company_code=company_code).all()

#         if not records:
#             return jsonify({"error": "No records found"}), 404

#         all_records_data = []

#         for record in records:
#             account_master_data = {column.name: getattr(record, column.name) for column in record.__table__.columns}

#             additional_data = db.session.execute(text(ACCOUNT_CONTACT_DETAILS_QUERY), {"accoid": record.accoid})
#             additional_data_row = additional_data.fetchone()  # Fetch only the first row

#             account_labels = dict(additional_data_row._mapping) if additional_data_row else {}

#             # detail_records = AccountContact.query.filter_by(accoid=record.accoid).all()
#             # detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

#             record_response = {
#                 "account_master_data": account_master_data,
#                 # "account_detail_data": detail_data,
#                 "account_labels": account_labels
#             }

#             all_records_data.append(record_response)

#         response = {
#             "all_data_account_master": all_records_data
#         }
#         return jsonify(response), 200

#     except Exception as e:
#         return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL+"/getdata-accountmaster", methods=["GET"])
def getdata_accountmaster():
    try:
        company_code = request.args.get('Company_Code')
        if not company_code:
            return jsonify({"error": "Missing 'Company_Code' parameter"}), 400

        query = ('''SELECT dbo.nt_1_accountmaster.Ac_Code, dbo.nt_1_accountmaster.Ac_type, dbo.nt_1_accountmaster.Ac_Name_E, dbo.nt_1_accountmaster.Short_Name, dbo.nt_1_accountmaster.Commission, dbo.nt_1_accountmaster.Address_E, 
                  dbo.nt_1_citymaster.city_name_e, dbo.nt_1_accountmaster.Gst_No, dbo.nt_1_accountmaster.AC_Pan, dbo.nt_1_accountmaster.FSSAI, dbo.nt_1_accountmaster.adhar_no, dbo.nt_1_accountmaster.Mobile_No, 
                  dbo.nt_1_accountmaster.accoid
FROM     dbo.nt_1_accountmaster LEFT OUTER JOIN
                  dbo.nt_1_citymaster ON dbo.nt_1_accountmaster.cityid = dbo.nt_1_citymaster.cityid
                 where dbo.nt_1_accountmaster.Company_Code = :company_code 
                                 '''
            )
        additional_data = db.session.execute(text(query), {"company_code": company_code})

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


# Get data by the particular Ac_Code
@app.route(API_URL + "/getaccountmasterByid", methods=["GET"])
def getaccountmasterByid():
    try:
        ac_code = request.args.get('Ac_Code')
        company_code = request.args.get('Company_Code')
        if not all([company_code, ac_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        account_master = AccountMaster.query.filter_by(Ac_Code=ac_code, company_code=company_code).first()
        if not account_master:
            return jsonify({"error": "No records found"}), 404

        accoid = account_master.accoid
        ac_code = account_master.Ac_Code
        additional_data = db.session.execute(text(ACCOUNT_CONTACT_DETAILS_QUERY), {"accoid": accoid})
        additional_data_row = additional_data.fetchone()  # Fetch only the first row

        group_codes_data = AcGroups.query.filter_by(Ac_Code=ac_code, Company_Code=company_code).all()
        group_codes = [group.Group_Code for group in group_codes_data] if group_codes_data else []

        account_master_data = {column.name: getattr(account_master, column.name) for column in account_master.__table__.columns}

        account_labels = dict(additional_data_row._mapping) if additional_data_row else {}

        detail_records = AccountContact.query.filter_by(accoid=accoid).all()
        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "account_labels": account_labels,
             "group_codes": group_codes
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + "/getNextAcCode_AccountMaster", methods=["GET"])
def getNextAcCode_AccountMaster():
    try:
        Company_Code = request.args.get('Company_Code')

        if not all([Company_Code]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Fetch the maximum unit_code for the given Company_Code and Year_Code
        max_ac_code = db.session.query(func.max(AccountMaster.Ac_Code)).filter_by(company_code=Company_Code).scalar()

        if max_ac_code is None:
            next_ac_code = 1
        else:
            next_ac_code = max_ac_code + 1

        response = {
            "next_ac_code": next_ac_code
        }
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Fetch the last record from the database by accoid
@app.route(API_URL + "/get-lastaccountdata", methods=["GET"])
def get_lastaccountMasterdata():
    try:
        company_code = request.args.get('Company_Code')

        if not all([company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        last_account_master = AccountMaster.query.filter_by(company_code=company_code).order_by(AccountMaster.Ac_Code.desc()).first()

        if not last_account_master:
            return jsonify({"error": "No records found"}), 404

        accoid = last_account_master.accoid
        ac_code = last_account_master.Ac_Code
        additional_data = db.session.execute(text(ACCOUNT_CONTACT_DETAILS_QUERY), {"accoid": accoid})
        additional_data_row = additional_data.fetchone()  # Fetch only the first row


        account_master_data = {column.name: getattr(last_account_master, column.name) for column in last_account_master.__table__.columns}

        account_labels = dict(additional_data_row._mapping) if additional_data_row else {}

        detail_records = AccountContact.query.filter_by(accoid=accoid).all()

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        group_codes_data = AcGroups.query.filter_by(Ac_Code=ac_code, Company_Code=company_code).all()
        group_codes = [group.Group_Code for group in group_codes_data] if group_codes_data else []
        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "account_labels": account_labels,
            "group_codes": group_codes
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Get first record from the database
@app.route(API_URL + "/get-firstaccount-navigation", methods=["GET"])
def get_firstaccountMaster_navigation():
    try:
        company_code = request.args.get('Company_Code')
    
        if not all([company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        first_account_master = AccountMaster.query.filter_by(company_code=company_code).order_by(AccountMaster.Ac_Code.asc()).first()

        if not first_account_master:
            return jsonify({"error": "No records found"}), 404

        accoid = first_account_master.accoid
        ac_code = first_account_master.Ac_Code
        additional_data = db.session.execute(text(ACCOUNT_CONTACT_DETAILS_QUERY), {"accoid": accoid})
        additional_data_row = additional_data.fetchone()  # Fetch only the first row

        account_master_data = {column.name: getattr(first_account_master, column.name) for column in first_account_master.__table__.columns}

        account_labels = dict(additional_data_row._mapping) if additional_data_row else {}

        detail_records = AccountContact.query.filter_by(accoid=accoid).all()

        group_codes_data = AcGroups.query.filter_by(Ac_Code=ac_code, Company_Code=company_code).all()
        group_codes = [group.Group_Code for group in group_codes_data] if group_codes_data else []

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "account_labels": account_labels,
             "group_codes": group_codes
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Get previous record from the database
@app.route(API_URL + "/get-previousaccount-navigation", methods=["GET"])
def get_previousaccountMaster_navigation():
    try:
        current_ac_code = request.args.get('current_ac_code')
        company_code = request.args.get('Company_Code')
        

        if not all([current_ac_code, company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        previous_account_master = AccountMaster.query.filter(AccountMaster.Ac_Code < current_ac_code).filter_by(company_code=company_code).order_by(AccountMaster.Ac_Code.desc()).first()

        if not previous_account_master:
            return jsonify({"error": "No previous records found"}), 404

        accoid = previous_account_master.accoid
        ac_code = previous_account_master.Ac_Code
        additional_data = db.session.execute(text(ACCOUNT_CONTACT_DETAILS_QUERY), {"accoid": accoid})
        additional_data_row = additional_data.fetchone()  # Fetch only the first row

        account_master_data = {column.name: getattr(previous_account_master, column.name) for column in previous_account_master.__table__.columns}

        account_labels = dict(additional_data_row._mapping) if additional_data_row else {}

        detail_records = AccountContact.query.filter_by(accoid=accoid).all()

        group_codes_data = AcGroups.query.filter_by(Ac_Code=ac_code, Company_Code=company_code).all()
        group_codes = [group.Group_Code for group in group_codes_data] if group_codes_data else []

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "account_labels": account_labels,
             "group_codes": group_codes
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Get next record from the database
@app.route(API_URL + "/get-nextaccount-navigation", methods=["GET"])
def get_nextaccountMaster_navigation():
    try:
        current_ac_code = request.args.get('current_ac_code')
        company_code = request.args.get('Company_Code')
        

        if not all([current_ac_code, company_code]):
            return jsonify({"error": "Missing required parameters"}), 400

        next_account_master = AccountMaster.query.filter(AccountMaster.Ac_Code > current_ac_code).filter_by(company_code=company_code).order_by(AccountMaster.Ac_Code.asc()).first()

        if not next_account_master:
            return jsonify({"error": "No next records found"}), 404

        accoid = next_account_master.accoid
        ac_code = next_account_master.Ac_Code
        additional_data = db.session.execute(text(ACCOUNT_CONTACT_DETAILS_QUERY), {"accoid": accoid})
        additional_data_row = additional_data.fetchone()  # Fetch only the first row

        account_master_data = {column.name: getattr(next_account_master, column.name) for column in next_account_master.__table__.columns}

        account_labels = dict(additional_data_row._mapping) if additional_data_row else {}

        detail_records = AccountContact.query.filter_by(accoid=accoid).all()

        group_codes_data = AcGroups.query.filter_by(Ac_Code=ac_code, Company_Code=company_code).all()
        group_codes = [group.Group_Code for group in group_codes_data] if group_codes_data else []

        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "account_labels": account_labels,
             "group_codes": group_codes
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

@app.route(API_URL + "/insert-accountmaster", methods=["POST"])
def insert_accountmaster():
    tranType = "OP"
    yearCode = 1

    def create_gledger_entry(data, amount, drcr, ac_code, accoid):
        return {
            "TRAN_TYPE": tranType,
            "DOC_NO": new_master.Ac_Code,
            "DOC_DATE": "03/31/2025",
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['company_code'],
            "YEAR_CODE": yearCode,
            "ORDER_CODE": 12,
            "DRCR": drcr,
            "UNIT_Code": '',
            "NARRATION": "Opening Balance",
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 0,
            "SORT_TYPE": tranType,
            "SORT_NO": new_master.Ac_Code,
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
        master_data = data['master_data']
        contact_data = data['contact_data']

        gst_no = master_data.get('Gst_No')

        if gst_no:
            # Check for existing record by GST No
            existing_master = AccountMaster.query.filter_by(Gst_No=gst_no).first()

            if existing_master:
                existing_ac_code = existing_master.Ac_Code
                input_ac_code = master_data.get('Ac_Code')

                # If Ac_Code matches, proceed with updating user details
                if existing_ac_code == input_ac_code:
                    accoid = existing_master.accoid
                    user = EBuyUsers.query.filter_by(gst_no=gst_no).first()
                    if user:
                        user.accoid = accoid
                        user.ac_code = existing_ac_code
                        existing_master.user_id = user.user_id
                        db.session.commit()
                        return jsonify({
                            "message": "User updated successfully with existing AccountMaster",
                            "accoid": accoid
                        }), 200
                else:
                    existing_master = None  # Treat as new record if Ac_Code is different

        # Insert new record logic
        if 'Ac_Code' not in master_data or not master_data['Ac_Code']:
            max_ac_code = db.session.query(func.max(AccountMaster.Ac_Code)).scalar() or 0
            master_data['Ac_Code'] = max_ac_code + 1
        new_master = AccountMaster(**master_data)
        db.session.add(new_master)
        db.session.flush()  # Ensure new_master.accoid is generated

        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []

        max_person_id = db.session.query(func.max(AccountContact.PersonId)).scalar() or 0
        for item in contact_data:
            item['Ac_Code'] = new_master.Ac_Code
            item['accoid'] = new_master.accoid

            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item['PersonId'] = max_person_id + 1
                    new_contact = AccountContact(**item)
                    db.session.add(new_contact)
                    createdDetails.append(new_contact)
                    max_person_id += 1

                elif item['rowaction'] == "update":
                    id = item['id']
                    update_values = {k: v for k, v in item.items() if k not in ('id', 'rowaction', 'accoid')}
                    db.session.query(AccountContact).filter(AccountContact.id == id).update(update_values)
                    updatedDetails.append(id)

                elif item['rowaction'] == "delete":
                    id = item['id']
                    contact_to_delete = db.session.query(AccountContact).filter(AccountContact.id == id).one_or_none()
                    if contact_to_delete:
                        db.session.delete(contact_to_delete)
                        deletedDetailIds.append(id)

        db.session.commit()

        Amount = float(master_data.get('Opening_Balance', 0) or 0)

        gledger_entries = []

        if Amount > 0:
            ac_code = master_data['Ac_Code']
            accoid = new_master.accoid
            add_gledger_entry(gledger_entries, master_data, Amount, "D", ac_code, accoid)

        # Update TblUsers table with the new accoid
        user = EBuyUsers.query.filter_by(gst_no=gst_no).first()
        if user:
            user.accoid = new_master.accoid
            user.ac_code = new_master.Ac_Code
            new_master.user_id = user.user_id
            db.session.commit()

        query_params = {
            'Company_Code': master_data['company_code'],
            'DOC_NO': new_master.Ac_Code,
            'Year_Code': yearCode,
            'TRAN_TYPE': tranType,
        }

        response = requests.post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)

        if response.status_code == 201:
            db.session.commit()
        else:
            print("Error creating gLedger record:", response.json())
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response.json()}), response.status_code

        return jsonify({
            "message": "Data inserted successfully",
            "AccountMaster": account_master_schema.dump(new_master),
            "AccountContacts": account_contact_schemas.dump(contact_data),
            "updatedDetails": updatedDetails,
            "deletedDetailIds": deletedDetailIds
        }), 201
    
    

    except Exception as e:
        print("Traceback", traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500





# Update record for AccountMaster and AccountContact
@app.route(API_URL + "/update-accountmaster", methods=["PUT"])
def update_accountmaster():
    tranType = "OP"
    yearCode = 1
    def create_gledger_entry(data, amount, drcr, ac_code, accoid):
        return {
            "TRAN_TYPE": tranType,
            "DOC_NO": updatedAcCode,
            "DOC_DATE": "03/31/2025",
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['company_code'],
            "YEAR_CODE": yearCode,
            "ORDER_CODE": 12,
            "DRCR": drcr,
            "UNIT_Code": '',
            "NARRATION": "Opening Balance",
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 0,
            "SORT_TYPE": tranType,
            "SORT_NO": updatedAcCode,
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
        accoid = request.args.get('accoid')
        if not accoid:
            return jsonify({"error": "Missing 'accoid' parameter"}), 400

        data = request.get_json()
        master_data = data['master_data']
        contact_data = data['contact_data']

        # Update the AccountMaster
        AccountMaster.query.filter_by(accoid=accoid).update(master_data)
        updatedHeadCount = db.session.query(AccountMaster).filter(AccountMaster.accoid == accoid).update(master_data)
        updated_account_master = db.session.query(AccountMaster).filter(AccountMaster.accoid == accoid).one()
        updatedAcCode = updated_account_master.Ac_Code

        # Process AccountContact updates
        created_contacts = []
        updated_contacts = []
        deleted_contact_ids = []

        for item in contact_data:
            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item['Ac_Code'] = updatedAcCode
                    max_person_id = db.session.query(func.max(AccountContact.PersonId)).scalar() or 0
                    item['PersonId'] = max_person_id + 1
                    item['accoid'] = accoid
                    new_contact = AccountContact(**item)
                    db.session.add(new_contact)
                    created_contacts.append(new_contact)


                elif item['rowaction'] == "update":
                    id = item['id']
                    update_values = {k: v for k, v in item.items() if k not in ('id', 'rowaction', 'accoid')}
                    AccountContact.query.filter_by(id=id).update(update_values)
                    updated_contacts.append(id)


                elif item['rowaction'] == "delete":
                    id = item['id']
                    contact_to_delete = AccountContact.query.filter_by(id=id).one_or_none()
                    if contact_to_delete:
                        db.session.delete(contact_to_delete)
                        deleted_contact_ids.append(id)

        db.session.commit()

        Amount = float(master_data.get('Opening_Balance', 0) or 0)

        gledger_entries = []

        if Amount > 0:
            ac_code = master_data['Ac_Code']
            accoid = get_accoid(ac_code,master_data['company_code'])
            add_gledger_entry(gledger_entries, master_data, Amount, "D", ac_code, accoid)

        query_params = {
            'Company_Code': master_data['company_code'],
            'DOC_NO': updatedAcCode,
            'Year_Code': yearCode,
            'TRAN_TYPE': tranType,
        }

        response = requests.post("http://localhost:8080/api/sugarian/create-Record-gLedger", params=query_params, json=gledger_entries)

        if response.status_code == 201:
            db.session.commit()
        else:
            print("Traceback",traceback.format_exc())
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response.json()}), response.status_code

        return jsonify({
            "message": "Data updated successfully",
            "created_contacts": account_contact_schemas.dump(created_contacts),
            "updated_contacts": updated_contacts,
            "deleted_contact_ids": deleted_contact_ids
        }), 200

    except Exception as e:
        print("Traceback",traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Delete record from database based on Ac_Code
@app.route(API_URL + "/delete_accountmaster", methods=["DELETE"])
def delete_accountmaster():
    yearCode = 1
    tranType="OP"
    try:
        accoid = request.args.get('accoid')
        Company_Code = request.args.get('company_code')
        doc_no = request.args.get('Ac_Code')
        if not all ([accoid,Company_Code,doc_no]):
            return jsonify({"error": "Missing required parameter"}), 400

        with db.session.begin():
            deleted_contact_rows = AccountContact.query.filter_by(accoid=accoid).delete()
            deleted_master_rows = AccountMaster.query.filter_by(accoid=accoid).delete()

        if deleted_contact_rows > 0 and deleted_master_rows > 0:
            query_params = {
                'Company_Code': Company_Code,
                'DOC_NO': doc_no,
                'Year_Code': yearCode,
                'TRAN_TYPE': tranType,
            }

            # Make the external request
            response = requests.delete("http://localhost:8080/api/sugarian/delete-Record-gLedger", params=query_params)
            
            if response.status_code != 200:
                raise Exception("Failed to create record in gLedger")
            
            return jsonify({
            "message": f"Deleted successfully"
        }), 200

        db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_master_rows} master row(s) and {deleted_contact_rows} contact row(s) successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + "/getBy_GstNo", methods=["GET"])
def getBy_GstNo():
    try:
        gst_no = request.args.get('gst_no')

        if not gst_no:
            return jsonify({"error": "Missing required parameter: gst_no"}), 400

        # Fetch records from EBuyUsers matching the provided gst_no
        e_buy_user_records = EBuyUsers.query.filter_by(gst_no=gst_no).all()
        account_master_records = AccountMaster.query.filter_by(Gst_No=gst_no).all()

        if not e_buy_user_records and not account_master_records:
            return jsonify({"error": "No records found for the provided gst_no"}), 404

        account_master_data = [
            {column.name: getattr(record, column.name) for column in record.__table__.columns}
            for record in account_master_records
        ]
        e_buy_user_data = [
            {column.name: getattr(record, column.name) for column in record.__table__.columns}
            for record in e_buy_user_records
        ]

        response = {
            "accountMasterData": account_master_data,
            "eBuyUserData": e_buy_user_data
        }

        return jsonify(response), 200

    except Exception as e:
        print("Traceback:", traceback.format_exc())
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + '/create-multiple-acgroups', methods=['POST'])
def create_multiple_acgroups():
    try:
        # Extract JSON data from the request
        data = request.get_json()
        acGroups_data = data.get('acGroups')

        # Validate data
        if not acGroups_data:
            return jsonify({'error': 'Missing acGroups data'}), 400

        responses = []

        # Process each group entry
        for group_data in acGroups_data:
            ac_code = group_data.get('Ac_Code')
            group_code = group_data.get('Group_Code')
            company_code = group_data.get('Company_Code')

            # Validate required parameters
            if not all([ac_code, group_code, company_code]):
                responses.append({'error': 'Missing required fields for one or more entries'})
                continue

            # Find the corresponding AccountMaster entry
            account_master = AccountMaster.query.filter_by(Ac_Code=ac_code, company_code=company_code).first()
            if not account_master:
                responses.append({'error': f'No AccountMaster record found with Ac_Code {ac_code} and Company_Code {company_code}'})
                continue
            
            # Create and add the new AcGroups record
            new_acgroup = AcGroups(Group_Code=group_code, Company_Code=company_code, accoid=account_master.accoid, Ac_Code = ac_code)
            db.session.add(new_acgroup)
            responses.append({
                'message': 'AcGroup created successfully',
                'AcGroup': {
                    'Group_Code': group_code,
                    'Company_Code': company_code,
                    'accoid': account_master.accoid
                }
            })

        # Commit changes to the database
        db.session.commit()

        return jsonify(responses), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500