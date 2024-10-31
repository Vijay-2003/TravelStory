import axiosInstance from "./axiosinstance";

const uploadImage = async(imageFile) => {
    const formData = new FormData();

    // Append image file to form Data
    formData.append('image', imageFile);

    try {
        const response = await axiosInstance.post('/image-upload', formData, {
            headers: {
                'Content-Type':'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading image:', error.message);  
        throw error;   // Rethrow the error for further handling 
    }
}


export default uploadImage;