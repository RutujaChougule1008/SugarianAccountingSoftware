// CityMasterUtility.js
import React, { useState } from "react";
import TableUtility from "../../../../Common/UtilityCommon/TableUtility"; // Adjust the path as necessary

const CityMasterUtility = () => {
    const apiUrl = `${process.env.REACT_APP_API}/getall-cities`;
    const columns = [
        { label: "City Code", key: "city_code" },
        { label: "City Name", key: "city_name_e" },
        { label: "Pincode", key: "pincode" },
        { label: "GST State Code", key: "GstStateCode" },
        { label: "State Name", key: "state" }
    ];

    return (
        <TableUtility
            title="City Master Utility"
            apiUrl={apiUrl}
            columns={columns}
            rowKey="city_code"
            addUrl="/city-master"
            detailUrl="/city-master"
            permissionUrl="/city-master-utility"
            queryParams={{ company_code: sessionStorage.getItem('Company_Code') }} 
        />
    );
};

export default CityMasterUtility;
