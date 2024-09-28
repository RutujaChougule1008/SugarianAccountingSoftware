import React, { useState } from 'react';
import routes from '../../CompoentsConfig';
import axios from 'axios';
import './UserCreationWithPermission.css'

const API_URL = process.env.REACT_APP_API;

const UserCreationWithPermission = () => {
  const [userData, setUserData] = useState({
    User_Name: '',
    EmailId: '',
    User_Password: '',
  });

  const [permissionsList, setPermissionsList] = useState(
    routes.map(route => ({
      Program_Name: route.path,
      view: false,
      edit: false,
      delete: false,
      save: false,
    }))
  );

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleCheckboxChange = (index, permission) => {
    const updatedPermissions = [...permissionsList];
    updatedPermissions[index][permission] = !updatedPermissions[index][permission];
    setPermissionsList(updatedPermissions);
  };

  const handleSubmit = async () => {
    debugger
    const userPermissions = permissionsList
      .filter(({ view, edit, delete: del, save }) => view || edit || del || save) 
      .map(({ Program_Name, view, edit, delete: del, save }) => {
        const permissionsArray = [
          view ? 'view' : null,
          edit ? 'edit' : null,
          del ? 'delete' : null,
          save ? 'save' : null,
        ].filter(Boolean); 
  
        // Return only if permissionsArray is not empty
        return permissionsArray.length > 0 ? { Program_Name, Permission: permissionsArray } : null;
      })
      .filter(Boolean); 
  
    const userDataToSubmit = {
      user_data: userData,
      permission_data: userPermissions,
    };
  
    try {
      const response = await axios.post(`${API_URL}/insert-user`, userDataToSubmit);
      console.log('User created successfully:', response.data);
    } catch (error) {
      console.error('Error creating user:', error.response ? error.response.data : error.message);
    }
  };
  
  return (
    <div>
      <h3>Create User</h3>
      <form>
        <div>
          <label>User Name:</label>
          <input type="text" name="User_Name" value={userData.User_Name} onChange={handleUserChange} required />
        </div>
        <div>
          <label>Password</label>
          <input type="text" name="User_Password" value={userData.User_Password} onChange={handleUserChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="EmailId" value={userData.EmailId} onChange={handleUserChange} required />
        </div>
      </form>

      <h3>User Permissions</h3>
      <div className="contact-data-seach-form-table">
      <table className="custom-table1">
        <thead>
          <tr>
            <th>Program Name</th>
            <th>View</th>
            <th>Edit</th>
            <th>Delete</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {permissionsList.map((permission, index) => (
            <tr key={index}>
              <td>{permission.Program_Name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.view}
                  onChange={() => handleCheckboxChange(index, 'view')}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.edit}
                  onChange={() => handleCheckboxChange(index, 'edit')}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.delete}
                  onChange={() => handleCheckboxChange(index, 'delete')}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.save}
                  onChange={() => handleCheckboxChange(index, 'save')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={handleSubmit}>Create User</button>
    </div>
    </div>
  );
};

export default UserCreationWithPermission;
