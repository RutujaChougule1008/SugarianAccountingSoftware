import ast
from datetime import datetime
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
from app.models.Utilities.UserCreationWithPermission.UserCreationWithPermissionModel import TblUser, TblUserDetail
from app.models.Utilities.UserCreationWithPermission.UserCreationWithPermissionSchema import TblUserSchema, TblUserDetailSchema

tbl_user_schema = TblUserSchema()
tbl_user_schemas = TblUserSchema(many=True)

tbl_user_detail_schema = TblUserDetailSchema()
tbl_user_detail_schemas = TblUserDetailSchema(many=True)

VIEW_PERMISSION = 1
EDIT_PERMISSION = 2
DELETE_PERMISSION = 4
SAVE_PERMISSION = 8

userQuery = '''
SELECT        dbo.tbluser.User_Id, dbo.tbluser.User_Name, dbo.tbluser.User_Type, dbo.tbluser.Password, dbo.tbluser.EmailId, dbo.tbluser.EmailPassword, dbo.tbluser.uid, dbo.tbluser.userfullname, dbo.tbluser.Mobile, 
                         dbo.tbluser.User_Security, dbo.tbluser.PaymentsPassword, dbo.tbluser.User_Password, dbo.tbluserdetail.Detail_Id, dbo.tbluserdetail.Program_Name, dbo.tbluserdetail.Tran_Type, dbo.tbluserdetail.udid, 
                         dbo.tbluserdetail.canView, dbo.tbluserdetail.canEdit, dbo.tbluserdetail.canSave, dbo.tbluserdetail.canDelete, dbo.tbluserdetail.DND
FROM            dbo.tbluser INNER JOIN
                         dbo.tbluserdetail ON dbo.tbluser.uid = dbo.tbluserdetail.uid
WHERE dbo.tbluser.uid =:uid
'''

def format_dates(data):
    formatted_data = (
        {column.name: getattr(data, column.name) for column in data.__table__.columns}
        if not isinstance(data, dict)
        else data.copy()
    )
    for date_field in ["Modified_Date", "Created_Date"]:
        if date_field in formatted_data and formatted_data[date_field]:
            formatted_data[date_field] = formatted_data[date_field].strftime('%Y-%m-%d')

    return formatted_data




@app.route(API_URL + "/insert-user", methods=["POST"])
def insert_user_with_permissions():
    try:
        data = request.get_json()
        user_data = data.get('user_data')
        permission_data = data.get('permission_data')

        # Input validation
        if not user_data or not permission_data:
            return jsonify({"error": "Missing parameters"}), 400

        max_doc_no = db.session.query(func.max(TblUser.User_Id)).scalar() or 0
        new_doc_no = max_doc_no + 1
        user_data['User_Id'] = new_doc_no

        # Convert date strings in user_data to datetime objects
        if 'Created_Date' in user_data:
            user_data['Created_Date'] = datetime.strptime(user_data['Created_Date'], '%Y-%m-%d')
        if 'Modified_Date' in user_data:
            user_data['Modified_Date'] = datetime.strptime(user_data['Modified_Date'], '%Y-%m-%d')

        # Insert new user record
        new_user = TblUser(**user_data)
        db.session.add(new_user)
        db.session.flush()  # This is important to get the uid for the new user

        uId = new_user.uid

        createdDetails = []

        for perm_item in permission_data:
            perm_item['User_Id'] = new_doc_no
            perm_item['uid'] = uId
            new_permission = TblUserDetail(**perm_item)
            new_user.details.append(new_permission)
            createdDetails.append(new_permission)

            # Debugging output
            print("Added permission:", new_permission)

        db.session.commit()  # Commit all changes

        return jsonify({
            "message": "User and permissions inserted successfully!",
            "head": tbl_user_schema.dump(new_user),
            "addedDetails": tbl_user_detail_schemas.dump(createdDetails),
        }), 201

    except Exception as e:
        print("Traceback", traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500



@app.route(API_URL + "/update-user", methods=["PUT"])
def update_user():
    try:
        uid = request.args.get('uid')
        data = request.get_json()
        user_data = data.get('user_data')
        permission_data = data.get('permission_data')

        # Input validation
        if not user_data or not permission_data:
            return jsonify({"error": "Missing parameters"}), 400

        # Fetch the existing user by uid
        user = TblUser.query.filter_by(uid=uid).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        updatedPermissions = []

        # Update user details
        for key, value in user_data.items():
            # Convert date strings to datetime objects
            if key in ['Created_Date', 'Modified_Date'] and isinstance(value, str):
                value = datetime.strptime(value, '%Y-%m-%d')
            setattr(user, key, value)

        # Process permissions
        for perm_item in permission_data:
            # Convert date strings to datetime objects
            if 'Created_Date' in perm_item and isinstance(perm_item['Created_Date'], str):
                perm_item['Created_Date'] = datetime.strptime(perm_item['Created_Date'], '%Y-%m-%d')
            if 'Modified_Date' in perm_item and isinstance(perm_item['Modified_Date'], str):
                perm_item['Modified_Date'] = datetime.strptime(perm_item['Modified_Date'], '%Y-%m-%d')
                
            perm_item['User_Id'] = user.User_Id
            perm_item['uid'] = uid

            # Check if permission already exists
            existing_permission = TblUserDetail.query.filter_by(
                User_Id=user.User_Id,
                Program_Name=perm_item.get('Program_Name'),
                Tran_Type=perm_item.get('Tran_Type')
            ).first()

            if existing_permission:
                # Update all relevant fields in existing permission
                for field, value in perm_item.items():
                    setattr(existing_permission, field, value)
                existing_permission.Modified_Date = datetime.now()
                updatedPermissions.append(existing_permission)
            else:
                # Insert new permission record if it does not exist
                new_permission = TblUserDetail(**perm_item)
                db.session.add(new_permission)
                updatedPermissions.append(new_permission)

        # Commit the updates
        db.session.commit()

        return jsonify({
            "message": "User and permissions updated successfully!",
            "head": tbl_user_schema.dump(user),
            "updatedDetails": tbl_user_detail_schemas.dump(updatedPermissions),
        }), 200

    except Exception as e:
        print("Traceback", traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

@app.route(API_URL + "/delete_user", methods=["DELETE"])
def delete_user():
    try:
        uid = request.args.get('uid')
        if not User_Id:
            return jsonify({"error": "Missing required parameter"}), 400

        with db.session.begin():
            deleted_contact_rows = TblUserDetail.query.filter_by(uid=uid).delete()
            deleted_master_rows = TblUser.query.filter_by(uid=uid).delete()

        db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_master_rows} master row(s) and {deleted_contact_rows} contact row(s) successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/get-next-user-Id", methods=["GET"])
def get_next_user_id():
    try:
        # Get the company_code and year_code from the request parameters
        company_code = request.args.get('Company_Code')

        # Validate required parameters
        if not company_code:
            return jsonify({"error": "Missing 'Company_Code'"}), 400

        # Query the database for the maximum doc_no in the specified company and year
        max_doc_no = db.session.query(func.max(TblUser.User_Id)).filter_by(Company_Code=company_code).scalar()

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
    
# @app.route(API_URL + "/get_user_permissions", methods=['GET'])
# def get_user_permissions():
#     uid = request.args.get('uid')
    
#     if not uid:
#         return jsonify({'error': 'User ID is required'}), 400

#     try:
#         # Prepare the SQL query using text() to indicate raw SQL
#         query = text('''
#             SELECT dbo.tbluserdetail.Program_Name, dbo.tbluserdetail.Permission,  
#                    dbo.tbluser.User_Type, dbo.tbluser.uid
#             FROM dbo.tbluser 
#             LEFT OUTER JOIN dbo.tbluserdetail 
#             ON dbo.tbluser.uid = dbo.tbluserdetail.uid
#             WHERE dbo.tbluser.uid = :uid
#         ''')
        
#         # Execute the query with the uid parameter
#         result = db.session.execute(query, {'uid': uid})

#         permissions = []
#         for row in result:
#             permission_field = row.Permission

#             # Handle case where Permission is 'Y' (all permissions)
#             if permission_field == 'Y':
#                 permission_list = ['view', 'edit', 'save', 'delete']  # Grant all permissions
#             elif isinstance(permission_field, str):
#                 # If permission is a comma-separated string, split it into a list
#                 permission_list = [perm.strip() for perm in permission_field.split(',')]
#             else:
#                 permission_list = []

#             permissions.append({
#                 'Program_Name': row.Program_Name,
#                 'Permission': permission_list,  
#                 'User_Type': row.User_Type,
#                 'uid': row.uid
#             })

#         if not permissions:
#             return jsonify({'error': 'User not found'}), 404

#         return jsonify({'permissions': permissions}), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/get_user_permissions", methods=["GET"])
def getUserById():
    """Retrieve a specific OtherGSTInput record by document number."""
    try:
        company_code = request.args.get('Company_Code')
        Year_Code = request.args.get('Year_Code')
        Program_Name = request.args.get('Program_Name')
        uid = request.args.get('uid')
        if not all([company_code, Year_Code, Program_Name, uid]):
            return jsonify({'error': 'Missing parameters'}), 400

        try:
            company_code = int(company_code)
            Year_Code = int(Year_Code)
            Program_Name = str(Program_Name)
            uid = int(uid)
        except ValueError:
            return jsonify({'error': 'Invalid parameter type'}), 400

        # user_record = TblUser.query.filter_by(Company_Code=company_code, User_Id=User_Id).first()
        # if not user_record:
        #     return jsonify({'error': 'No user record found'}), 404

        
        user_detail_record = TblUserDetail.query.filter_by(Company_Code=company_code, Year_Code=Year_Code, Program_Name=Program_Name, uid=uid).first()
        if not user_detail_record:
            return jsonify({'error': 'No user detail record found'}), 404

        # user_data = tbl_user_schema.dump(user_record)
        user_detail_data = tbl_user_detail_schema.dump(user_detail_record)

        
        return jsonify({ 'UserDetails': user_detail_data}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route(API_URL + "/getLastUserWithPermissions", methods=["GET"])
def getLastUserWithPermissions():
    try:
        Company_Code = request.args.get('Company_Code')
        if not Company_Code:
            return jsonify({"error": "Missing required parameters"}), 400

        # Query the last user by Company_Code and order by User_Id descending
        last_user = TblUser.query.filter_by(Company_Code=Company_Code).order_by(TblUser.User_Id.desc()).first()

        if last_user is None:
            return jsonify({"error": "No records found"}), 404

        lastUid = last_user.uid

        # Execute the additional query to fetch permissions or other related data
        additional_data = db.session.execute(text(userQuery), {'uid': lastUid})
        additional_data_rows = additional_data.fetchall()

        # Prepare the lastUserData dictionary from the last_user record
        lastUserData = {column.name: getattr(last_user, column.name) for column in last_user.__table__.columns}

        # Convert additional_data_rows to a list of dictionaries
        lastUserPermissionData = [dict(row._mapping) for row in additional_data_rows]

        # Format dates if required for lastUserPermissionData
        lastUserPermissionData = [format_dates(data) for data in lastUserPermissionData]

        # Prepare response data
        response = {
            "lastUserData": lastUserData,
            "lastUserPermissionData": lastUserPermissionData
        }
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/getProgramNames", methods=["GET"])
def get_program_names():
    try:
        program_names = db.session.query(TblUserDetail.Program_Name).distinct().all()
        
        program_names_list = [name[0] for name in program_names if name[0] is not None]

        return jsonify({"programNames": program_names_list}), 200

    except Exception as e:
        print("Error fetching program names:", e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


