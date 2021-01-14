
const updateOptions = (options, isFormData) => {
    const updatedOptions = {...options};
   // console.log('updatedOptions', updatedOptions, updatedOptions.headers['Content-Type']);
    const token = localStorage.getItem('token');
    updatedOptions.headers = {
        ...updatedOptions.headers
    }
    if(token){
        updatedOptions.headers.Authorization = 'Bearer ' + token;
    }
    if(!isFormData){
        updatedOptions.headers['Content-Type'] = 'application/json';
    }
    else{
        // updatedOptions.body = {...options.body};
        console.log(updatedOptions.body, options.body);
    }
    
    return updatedOptions;
}

export default function fetcher(path, options, isFormData = false) {
    const baseUrl = 'http://localhost:8080';
    return fetch(baseUrl + path, updateOptions(options, isFormData));
}