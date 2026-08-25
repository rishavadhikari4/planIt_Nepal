import API from './api';

export const submitContactForm = async (formData) => {
  try {
    const response = await API.post('/api/contacts/form', formData);
    return {
      success: true,
      message: response.data.message || 'Contact form submitted successfully!'
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Error submitting contact form. Please try again.' 
    };
  }
};

export const getContacts = async ({ page = 1, limit = 10, subject = "" } = {}) => {
  try {
    const params = { page, limit };
    if (subject) params.subject = subject;
    const response = await API.get('/api/contacts/form', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch contacts form'
    };
  }
};

export const getContactById = async (id) =>{
  try{
    const response = await API.get(`/api/contacts/form/${id}`);
    return response.data;
  }catch(error){
    console.error("Error Fetching Contacts: ", error);
    return{
      success:false,
      message: error.response?.data?.message || "Failed to fetch the Contact Form"
    }
  }
}

export const deleteContactById = async(id) =>{
  try{
    const response = await API.delete(`/api/contacts/form/${id}`);
    return response.data;
  }catch(error){
    console.error("Error Fetching Contacts: ", error);
    return {
      success:false,
      message: error.response?.data?.message || 'Failed to delete the contacts form'
    }
  }
}


/** Move an enquiry through the queue, or leave a staff-only note on it. */
export const updateContactStatus = async (id, { status, internalNote }) => {
  const response = await API.patch(`/api/contacts/form/${id}`, { status, internalNote });
  return response.data;
};

/** Reply by email. The reply is recorded even if the mail fails to send. */
export const replyToContact = async (id, body) => {
  const response = await API.post(`/api/contacts/form/${id}/reply`, { body });
  return response.data;
};
