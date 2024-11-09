from flask import jsonify, request
from app import app, db
from app.models.Company.UserLogin.UserLoginModels import UserLogin
from sqlalchemy import text
from app.utils.CommonGLedgerFunctions import get_accoid
import os
API_URL= os.getenv('API_URL')


@app.route(API_URL+'/userlogin', methods=['POST'])
def userlogin():
    # Parse login credentials from JSON request data
    login_data = request.get_json()
    if not login_data:
        return jsonify({'error': 'No data provided'}), 400

    # Retrieve user name and password from the request data
    login_name = login_data.get('User_Name')
    password = login_data.get('User_Password')

    # Validate that the necessary data is present
    if not login_name or not password:
        return jsonify({'error': 'Both username and password are required'}), 400

    # Check if user exists in the database
    user = UserLogin.query.filter_by(User_Name=login_name).first()
    if user is None:
        return jsonify({'error': 'User not found'}), 404

    # return jsonify({'error': 'Invalid password'}), 401
    if user.User_Password != password:
        return jsonify({'error': 'Invalid login credentials'}), 401

    # If the credentials are correct, respond with a success message (and perhaps a JWT token or session cookie)
    return jsonify({'message': 'Login successful', 'user_id': user.uid}), 200


@app.route(API_URL+'/get_self_ac', methods=['GET'])
def get_self_ac():
    # Parse query parameters
    company_code = request.args.get('Company_Code')
    year_code = request.args.get('Year_Code')

    if not company_code or not year_code:
        return jsonify({'error': 'Both Company_Code and Year_Code are required'}), 400

    try:
        company_code = int(company_code)
        year_code = int(year_code)
    except ValueError:
        return jsonify({'error': 'Company_Code and Year_Code must be integers'}), 400

    query = text("SELECT SELF_AC FROM nt_1_companyparameters WHERE Company_Code=:company_code AND Year_Code=:year_code")
    result = db.session.execute(query, {'company_code': company_code, 'year_code': year_code}).fetchone()

    if result is None:
        return jsonify({'error': 'No data found for the given Company_Code and Year_Code'}), 404

    self_ac = result.SELF_AC

    accoid = get_accoid(self_ac,company_code)

    return jsonify({
        'SELF_AC': self_ac,
        'Self_acid':accoid,
        }), 200

