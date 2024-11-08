// making HTTP call using axios
import {axios } from './axios.min.js'
export const httpPostCall = async (url,payload) => {
    return new Promise( (resolve, reject) => {
        axios.post(url,payload)
        .then(response => {
            resolve(response);
        })
        .catch(error => {
            console.log(error);
            resolve({data:undefined});
        });
    });
}

// making HTTP call using axios
export const httpGetCall = async (url, params = {}, filters = {}) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: {
                ...params, // Spread any additional query parameters
                ...filters  // Add any filters as additional parameters
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwttoken")}`  // Include the authorization key in the headers
            }
        })
        .then(response => {
            resolve(response.data); // Resolve with the response data directly
        })
        .catch(error => {
            console.log("Error occurred:", error.message);
            resolve({ data: undefined }); // Return undefined data on error
        });
    });
};