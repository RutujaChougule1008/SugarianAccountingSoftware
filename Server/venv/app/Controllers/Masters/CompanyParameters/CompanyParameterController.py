from flask import jsonify, request
from app import app, db
from app.models.Masters.CompanyParameters.CompanyParameterModels import CompanyParameters
from datetime import datetime
import os
from sqlalchemy import text

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# Example SQL Query if needed
Company_Parameter_Query = '''
   SELECT Commission.Ac_Name_E AS commissionAcName, Interest.Ac_Name_E AS interestAcName, Transport.Ac_Name_E AS transportAcName, Postage.Ac_Name_E AS postageAcName, Self.Ac_Name_E AS selfAcName, 
                  dbo.gststatemaster.State_Name, CGSTAc.Ac_Name_E AS CGSTAcName, SGSTAc.Ac_Name_E AS SGSTAcName, IGSTAc.Ac_Name_E AS IGSTAcName, PurchaseCGSTAc.Ac_Name_E AS PurchaseCGSTAcName, 
                  PurchaseSGSTAc.Ac_Name_E AS PurchaseSGSTAcName, PurchaseIGSTAc.Ac_Name_E AS PurchaseIGSTAcName, TrasnportRCMGSTRateAC.GST_Name AS TransportRCMGSTRateAcName, 
                  CGSTRCMAc.Ac_Name_E AS CGSTRCMAcName, SGSTRCMAc.Ac_Name_E AS SGSTRCMAcName, IGSTRCMAc.Ac_Name_E AS IGSTRCMAcName, FreightAc.Ac_Name_E AS FreightAcName, 
                  PurchaseTCSAc.Ac_Name_E AS PurchaseTCSAcName, SaleTCSAc.Ac_Name_E AS SaleTCSAcName, OtherAmountAc.Ac_Name_E AS OtherAmountAcName, MarketSaseAc.Ac_Name_E AS MarketSaseAcName, 
                  SuperCostAc.Ac_Name_E AS SuperCostAcName, PackingAc.Ac_Name_E AS PackingAcName, HamaliAc.Ac_Name_E AS HamaliAcName, TransportTDSAc.Ac_Name_E AS TransportTDSAcName, 
                  TransportTDSAcCut.Ac_Name_E AS TransportTDSAcCutAcName, ReturnSaleCGSTAc.Ac_Name_E AS ReturnSaleCGSTAcAcName, ReturnSaleSGSTAc.Ac_Name_E AS ReturnSaleSGSTAcName, 
                  ReturnSaleIGSTAc.Ac_Name_E AS ReturnSaleIGSTAcName, ReturnPurchaseCGSTAc.Ac_Name_E AS ReturnPurchaseCGSTAcName, ReturnPurchaseSGSTAc.Ac_Name_E AS ReturnPurchaseSGSTAcName, 
                  ReturnPurchaseIGSTAc.Ac_Name_E AS ReturnPurchaseIGSTAcName, SaleTDSAc.Ac_Name_E AS SaleTDSAcName, PurchaseTDSAc.Ac_Name_E AS PurchaseTDSAcName, RateDiffAc.Ac_Name_E AS RateDiffAcName, 
                  DepreciationAc.Ac_Name_E AS DepreciationAcName, InterestTDSAc.Ac_Name_E AS InterestTDSAcName, BankPaymentAc.Ac_Name_E AS BankPaymentAcName
FROM     dbo.nt_1_companyparameters INNER JOIN
                  dbo.nt_1_accountmaster AS PurchaseSGSTAc ON dbo.nt_1_companyparameters.Company_Code = PurchaseSGSTAc.company_code AND dbo.nt_1_companyparameters.PurchaseSGSTAc = PurchaseSGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS BankPaymentAc ON dbo.nt_1_companyparameters.BankPaymentAc = BankPaymentAc.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = BankPaymentAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS InterestTDSAc ON dbo.nt_1_companyparameters.InterestTDSAc = InterestTDSAc.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = InterestTDSAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS DepreciationAc ON dbo.nt_1_companyparameters.DepreciationAC = DepreciationAc.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = DepreciationAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS RateDiffAc ON dbo.nt_1_companyparameters.Company_Code = RateDiffAc.company_code AND dbo.nt_1_companyparameters.RateDiffAc = RateDiffAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS PurchaseTDSAc ON dbo.nt_1_companyparameters.Company_Code = PurchaseTDSAc.company_code AND dbo.nt_1_companyparameters.PurchaseTDSAc = PurchaseTDSAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS SaleTDSAc ON dbo.nt_1_companyparameters.SaleTDSAc = SaleTDSAc.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = SaleTDSAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS ReturnPurchaseIGSTAc ON dbo.nt_1_companyparameters.Company_Code = ReturnPurchaseIGSTAc.company_code AND 
                  dbo.nt_1_companyparameters.ReturnPurchaseIGST = ReturnPurchaseIGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS ReturnPurchaseSGSTAc ON dbo.nt_1_companyparameters.Company_Code = ReturnPurchaseSGSTAc.company_code AND 
                  dbo.nt_1_companyparameters.ReturnPurchaseSGST = ReturnPurchaseSGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS ReturnPurchaseCGSTAc ON dbo.nt_1_companyparameters.ReturnPurchaseCGST = ReturnPurchaseCGSTAc.Ac_Code AND 
                  dbo.nt_1_companyparameters.Company_Code = ReturnPurchaseCGSTAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS ReturnSaleIGSTAc ON dbo.nt_1_companyparameters.Company_Code = ReturnSaleIGSTAc.company_code AND 
                  dbo.nt_1_companyparameters.ReturnSaleIGST = ReturnSaleIGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS ReturnSaleSGSTAc ON dbo.nt_1_companyparameters.ReturnSaleSGST = ReturnSaleSGSTAc.Ac_Code AND 
                  dbo.nt_1_companyparameters.Company_Code = ReturnSaleSGSTAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS ReturnSaleCGSTAc ON dbo.nt_1_companyparameters.Company_Code = ReturnSaleCGSTAc.company_code AND 
                  dbo.nt_1_companyparameters.ReturnSaleCGST = ReturnSaleCGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS TransportTDSAcCut ON dbo.nt_1_companyparameters.Company_Code = TransportTDSAcCut.company_code AND 
                  dbo.nt_1_companyparameters.TransportTDS_AcCut = TransportTDSAcCut.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS TransportTDSAc ON dbo.nt_1_companyparameters.Company_Code = TransportTDSAc.company_code AND dbo.nt_1_companyparameters.TransportTDS_Ac = TransportTDSAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS HamaliAc ON dbo.nt_1_companyparameters.Company_Code = HamaliAc.company_code AND dbo.nt_1_companyparameters.Hamali = HamaliAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS PackingAc ON dbo.nt_1_companyparameters.Packing = PackingAc.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = PackingAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS SuperCostAc ON dbo.nt_1_companyparameters.Company_Code = SuperCostAc.company_code AND dbo.nt_1_companyparameters.SuperCost = SuperCostAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS MarketSaseAc ON dbo.nt_1_companyparameters.Company_Code = MarketSaseAc.company_code AND dbo.nt_1_companyparameters.MarketSase = MarketSaseAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS OtherAmountAc ON dbo.nt_1_companyparameters.Company_Code = OtherAmountAc.company_code AND dbo.nt_1_companyparameters.OTHER_AMOUNT_AC = OtherAmountAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS SaleTCSAc ON dbo.nt_1_companyparameters.Company_Code = SaleTCSAc.company_code AND dbo.nt_1_companyparameters.SaleTCSAc = SaleTCSAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS PurchaseTCSAc ON dbo.nt_1_companyparameters.Company_Code = PurchaseTCSAc.company_code AND dbo.nt_1_companyparameters.PurchaseTCSAc = PurchaseTCSAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS FreightAc ON dbo.nt_1_companyparameters.Freight_Ac = FreightAc.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = FreightAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS IGSTRCMAc ON dbo.nt_1_companyparameters.IGST_RCM_Ac = IGSTRCMAc.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = IGSTRCMAc.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS SGSTRCMAc ON dbo.nt_1_companyparameters.Company_Code = SGSTRCMAc.company_code AND dbo.nt_1_companyparameters.SGST_RCM_Ac = SGSTRCMAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS CGSTRCMAc ON dbo.nt_1_companyparameters.Company_Code = CGSTRCMAc.company_code AND dbo.nt_1_companyparameters.CGST_RCM_Ac = CGSTRCMAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_gstratemaster AS TrasnportRCMGSTRateAC ON dbo.nt_1_companyparameters.Company_Code = TrasnportRCMGSTRateAC.Company_Code AND 
                  dbo.nt_1_companyparameters.Transport_RCM_GSTRate = TrasnportRCMGSTRateAC.Doc_no AND dbo.nt_1_companyparameters.Year_Code = TrasnportRCMGSTRateAC.Year_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS RoundOff ON dbo.nt_1_companyparameters.Company_Code = RoundOff.company_code AND dbo.nt_1_companyparameters.RoundOff = RoundOff.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS PurchaseIGSTAc ON dbo.nt_1_companyparameters.Company_Code = PurchaseIGSTAc.company_code AND dbo.nt_1_companyparameters.PurchaseIGSTAc = PurchaseIGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS PurchaseCGSTAc ON dbo.nt_1_companyparameters.Company_Code = PurchaseCGSTAc.company_code AND 
                  dbo.nt_1_companyparameters.PurchaseCGSTAc = PurchaseCGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS Self ON dbo.nt_1_companyparameters.Company_Code = Self.company_code AND dbo.nt_1_companyparameters.SELF_AC = Self.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS Interest ON dbo.nt_1_companyparameters.Company_Code = Interest.company_code AND dbo.nt_1_companyparameters.INTEREST_AC = Interest.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS Transport ON dbo.nt_1_companyparameters.Company_Code = Transport.company_code AND dbo.nt_1_companyparameters.TRANSPORT_AC = Transport.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS Postage ON dbo.nt_1_companyparameters.Company_Code = Postage.company_code AND dbo.nt_1_companyparameters.POSTAGE_AC = Postage.Ac_Code LEFT OUTER JOIN
                  dbo.gststatemaster ON dbo.nt_1_companyparameters.GSTStateCode = dbo.gststatemaster.State_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS CGSTAc ON dbo.nt_1_companyparameters.Company_Code = CGSTAc.company_code AND dbo.nt_1_companyparameters.CGSTAc = CGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS SGSTAc ON dbo.nt_1_companyparameters.Company_Code = SGSTAc.company_code AND dbo.nt_1_companyparameters.SGSTAc = SGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS IGSTAc ON dbo.nt_1_companyparameters.Company_Code = IGSTAc.company_code AND dbo.nt_1_companyparameters.IGSTAc = IGSTAc.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS Commission ON dbo.nt_1_companyparameters.COMMISSION_AC = Commission.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = Commission.company_code
        WHERE  dbo.nt_1_companyparameters.Company_Code = :company_code and  dbo.nt_1_companyparameters.Year_Code = :year_code
'''

def format_dates(record):
    return {
        
        "DODate": record.DODate.strftime('%Y-%m-%d') if record.DODate else None

    }


@app.route(API_URL + "/get-CompanyParameters-Record", methods=["GET"])
def get_CompanyParameters_Record():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')

        if company_code is None or year_code is None:
            return jsonify({'error': 'Missing Company_Code or Year_Code parameter'}), 400

        try:
            company_code = int(company_code)
            year_code = int(year_code)
        except ValueError:
            return jsonify({'error': 'Invalid Company_Code or Year_Code parameter'}), 400

        record = CompanyParameters.query.filter_by(Company_Code=company_code, Year_Code=year_code).first()

        if record is None:
            return jsonify({'error': 'No record found for the provided Company_Code'}), 404


        # Example of executing an additional SQL query if needed
        additional_data = db.session.execute(
            text(Company_Parameter_Query),
            {"company_code": company_code, "year_code": year_code}
        )
        additional_data_rows = additional_data.fetchall()

        record_data={column.name: getattr(record, column.name) for column in record.__table__.columns}
        record_data.update(format_dates(record))

        response = {
            "CompanyParameters_data": record_data,
            "additional_data": [dict(row._mapping) for row in additional_data_rows]
        }

        return jsonify(response), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500


@app.route(API_URL + "/create-or-update-CompanyParameters", methods=["POST"])
def create_or_update_CompanyParameters():
    try:
        company_code = request.json.get('Company_Code')
        year_code = request.json.get('Year_Code')

        if company_code is None or year_code is None:
            return jsonify({'error': 'Missing Company_Code or Year_Code parameter'}), 400

        try:
            company_code = int(company_code)
            year_code = int(year_code)
        except ValueError:
            return jsonify({'error': 'Invalid Company_Code or Year_Code parameter'}), 400

        existing_record = CompanyParameters.query.filter_by(Company_Code=company_code, Year_Code=year_code).first()

        if existing_record:
            update_data = request.json
            for key, value in update_data.items():
                setattr(existing_record, key, value)
            
            updated_data = {column.name: getattr(existing_record, column.name) for column in existing_record.__table__.columns}
            db.session.commit()
            return jsonify({'message': 'Record updated successfully', 'record': updated_data}), 200
        else:
            new_record_data = request.json
            new_record = CompanyParameters(**new_record_data)
            db.session.add(new_record)
            db.session.commit()
            
            new_created_data = {column.name: getattr(new_record, column.name) for column in new_record.__table__.columns}
            return jsonify({'message': 'Record created successfully', 'record': new_created_data}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500




