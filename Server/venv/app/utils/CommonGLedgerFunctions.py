from sqlalchemy import text
from app import app, db

def fetch_company_parameters(company_code, year_code):
        query = """
        SELECT dbo.nt_1_companyparameters.IGSTAc, dbo.nt_1_companyparameters.SGSTAc, dbo.nt_1_companyparameters.CGSTAc, dbo.nt_1_companyparameters.PurchaseCGSTAc, dbo.nt_1_companyparameters.PurchaseSGSTAc, 
                  dbo.nt_1_companyparameters.PurchaseIGSTAc, dbo.nt_1_companyparameters.SaleTCSAc, dbo.nt_1_companyparameters.SaleTDSAc, saleigst.accoid AS saleigstaccoid, salesgst.accoid AS salesgstaccoid, 
                  salecgst.accoid AS salecgstaccoid, purchasecgst.accoid AS Purchasecgstaccoid, purchasesgst.accoid AS Purchasesgstaccoid, purchaseigst.accoid AS Purchaseigstaccoid, saletcs.accoid AS saletcsaccoid, 
                  saletds.accoid AS saletdsaccoid, dbo.nt_1_companyparameters.RoundOff, dbo.nt_1_companyparameters.TransportTDS_AcCut, transporttdsaccut.Ac_Code AS transporttdscutaccode, transporttdsaccut.accoid AS transporttdscutacid, 
                  dbo.nt_1_companyparameters.Freight_Ac, frieghtac.Ac_Code, transporttdsaccut.Ac_Name_E AS transportTDSAcname, frieghtac.Ac_Name_E AS Frieghtacname, frieghtac.accoid AS freightAcid, dbo.nt_1_companyparameters.SELF_AC, 
                  self.Ac_Code AS selfacacode, self.Ac_Name_E AS selfacname, self.accoid AS selfacid, dbo.nt_1_companyparameters.AutoVoucher, dbo.nt_1_companyparameters.COMMISSION_AC, commisionac.Ac_Code AS commisionaccode, 
                  commisionac.Ac_Name_E AS commisionacname, commisionac.accoid AS commisionacid, dbo.nt_1_companyparameters.RateDiffAc, ratediffac.Ac_Code AS ratediffaccode, ratediffac.Ac_Name_E AS ratediffacname, 
                  ratediffac.accoid AS ratediffacid, dbo.nt_1_companyparameters.CGST_RCM_Ac, dbo.nt_1_companyparameters.SGST_RCM_Ac, dbo.nt_1_companyparameters.IGST_RCM_Ac, RCMCGST.accoid AS RCMCGSTAcID, 
                  RCMSGST.accoid AS RCMSGSTacID, RCMIGST.accoid AS RCMIGSTAcID, RCMCGST.Ac_Name_E AS RCMCGSTname, RCMSGST.Ac_Name_E AS RCMSGSTName, RCMIGST.Ac_Name_E AS RCMIGSTName, 
                  dbo.nt_1_companyparameters.BalanceLimit, dbo.nt_1_companyparameters.SaleTDSRate, dbo.nt_1_companyparameters.PurchaseTDSRate, dbo.nt_1_companyparameters.TCS AS TCSRate, Other_Amount_AC.accoid As OtherAmtAcid, 
                  Other_Amount_AC.Ac_Name_E As OtherAmtAcName, dbo.nt_1_companyparameters.OTHER_AMOUNT_AC
FROM     dbo.nt_1_companyparameters INNER JOIN
                  dbo.nt_1_accountmaster AS saleigst ON dbo.nt_1_companyparameters.IGSTAc = saleigst.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = saleigst.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS salesgst ON dbo.nt_1_companyparameters.SGSTAc = salesgst.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = salesgst.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS salecgst ON dbo.nt_1_companyparameters.CGSTAc = salecgst.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = salecgst.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS purchasecgst ON dbo.nt_1_companyparameters.PurchaseCGSTAc = purchasecgst.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = purchasecgst.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS purchasesgst ON dbo.nt_1_companyparameters.PurchaseSGSTAc = purchasesgst.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = purchasesgst.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS purchaseigst ON dbo.nt_1_companyparameters.PurchaseIGSTAc = purchaseigst.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = purchaseigst.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS saletcs ON dbo.nt_1_companyparameters.SaleTCSAc = saletcs.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = saletcs.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS saletds ON dbo.nt_1_companyparameters.SaleTDSAc = saletds.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = saletds.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS rountof ON dbo.nt_1_companyparameters.RoundOff = rountof.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = rountof.company_code INNER JOIN
                  dbo.nt_1_accountmaster AS self ON dbo.nt_1_companyparameters.SELF_AC = self.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS Other_Amount_AC ON dbo.nt_1_companyparameters.OTHER_AMOUNT_AC = Other_Amount_AC.Ac_Code AND saleigst.accoid = Other_Amount_AC.accoid AND 
                  dbo.nt_1_companyparameters.Company_Code = Other_Amount_AC.company_code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS RCMIGST ON dbo.nt_1_companyparameters.Company_Code = RCMIGST.company_code AND dbo.nt_1_companyparameters.IGST_RCM_Ac = RCMIGST.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS RCMSGST ON dbo.nt_1_companyparameters.Company_Code = RCMSGST.company_code AND dbo.nt_1_companyparameters.SGST_RCM_Ac = RCMSGST.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS RCMCGST ON dbo.nt_1_companyparameters.Company_Code = RCMCGST.company_code AND dbo.nt_1_companyparameters.CGST_RCM_Ac = RCMCGST.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS ratediffac ON dbo.nt_1_companyparameters.Company_Code = ratediffac.company_code AND dbo.nt_1_companyparameters.RateDiffAc = ratediffac.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS commisionac ON dbo.nt_1_companyparameters.Company_Code = commisionac.company_code AND dbo.nt_1_companyparameters.COMMISSION_AC = commisionac.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS frieghtac ON dbo.nt_1_companyparameters.Company_Code = frieghtac.company_code AND dbo.nt_1_companyparameters.Freight_Ac = frieghtac.Ac_Code LEFT OUTER JOIN
                  dbo.nt_1_accountmaster AS transporttdsaccut ON dbo.nt_1_companyparameters.TransportTDS_Ac = transporttdsaccut.Ac_Code AND dbo.nt_1_companyparameters.Company_Code = transporttdsaccut.company_code
         
            
          WHERE dbo.nt_1_companyparameters.Company_Code = :company_code AND dbo.nt_1_companyparameters.Year_Code = :year_code
        """
        result = db.session.execute(text(query), {'company_code': company_code, 'year_code': year_code}).fetchone()
        return result


def get_accoid(ac_code,company_code):
        result = db.session.execute(
            text("SELECT accoid FROM nt_1_accountmaster WHERE Ac_Code = :ac_code and company_code= :company_code ORDER BY accoid"),
            {'ac_code': ac_code , 'company_code': company_code}
        ).fetchone()
        return result.accoid if result else None


def getPurchaseAc(ic):
    print("ic", ic)
    result = db.session.execute(
        text("select Purchase_AC from nt_1_systemmaster where systemid =:ic"),
        {'ic': ic}
    ).fetchone()
    return result.Purchase_AC if result else None

def getSaleAc(ic):
    print("ic", ic)
    result = db.session.execute(
        text("select Sale_AC from nt_1_systemmaster where systemid =:ic"),
        {'ic': ic}
    ).fetchone()
    return result.Sale_AC if result else None

def get_acShort_Name(ac_code,company_code):
        print("company_code",company_code)
        result = db.session.execute(
            text("SELECT Short_Name FROM nt_1_accountmaster WHERE Ac_Code = :ac_code and company_code= :company_code ORDER BY accoid"),
            {'ac_code': ac_code , 'company_code': company_code}
        ).fetchone()
        return result.Short_Name if result else None


def fetch_auto_voucher_value(company_code, year_code):
        query = """
        SELECT        AutoVoucher
FROM            dbo.nt_1_companyparameters 
          WHERE Company_Code = :company_code AND Year_Code = :year_code
        """
        result = db.session.execute(text(query), {'company_code': company_code, 'year_code': year_code}).fetchone()
        return result


      
