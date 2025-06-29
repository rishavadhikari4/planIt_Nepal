import {useState} from "react";
import { useNavigate} from "react-router-dom";
import { addDecoration } from "../services/decorationService";
import { toast } from "react-toastify";
import '../styles/Decorations.css';

const AddDecoration = () =>{
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name:'',
        description:'',
    });

    const [imageFile,setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>{
    setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
    }));
    };

    const handleFileChange = (e) =>{
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async(e)=>{
        e.preventDefault();

        if(!formData.name || !formData.description ||
            !imageFile){
                toast.error("please fill in all field and select an image");
                return;
            }

            setLoading(true);

            const data = new FormData();
            data.append('name',formData.name);
            data.append('description',formData.description);
            data.append('image',imageFile);

            try{
                await addDecoration(
                    data,
                    (successMessage) =>{
                        toast.success(successMessage);
                        navigate('/admin-decorations');
                    },
                    (errorMessage) => {
                        toast.error(errorMessage);
                    }
                );
            }catch(error){
                toast.error("An Unexpected error occured");
            }finally{
                setLoading(false);
            }

        };
        const handleBack = () => {
            navigate('/admin-decorations');
        };
        return(
            <div className="edit-container">
                <h2>
                    Add New Decoration
                </h2>
                <button className="back-button"
                onClick={handleBack}
                style={{
                    marginBottom:'1rem'
                }}
                >
                     ← Back
                </button>

                <form onSubmit={handleSubmit} className="edit-form">

                <label>Name:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />

                <label>Description:</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                />    

                <label>Image:</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  required 
                />

                <button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Venue"}
                </button>        
                </form>
            </div>
        );
};

export default AddDecoration;
