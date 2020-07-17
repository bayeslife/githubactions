import { getAPI,getAPIDomain } from '../config'

let handleResponse = res =>{ 
    if(res.status===401){
        window.location.href = `${getAPIDomain()}/auth/login`
    }else {
        return res.json()
}}

const service = {
    get: (url) => fetch(getAPI() + url, {credentials: 'include'}).then(handleResponse),
    put: (url, body) => fetch(getAPI() + url, { credentials: 'include',method: 'PUT', body: JSON.stringify(body) }).then(handleResponse),
    delete: (url) => fetch(getAPI() + url, { credentials: 'include',method: 'DELETE' }).then(handleResponse),
    post: (url, body) => fetch(getAPI() + url, { credentials: 'include',method: 'POST', body: JSON.stringify(body) }).then(handleResponse),
}

export const getFiles = (currentWeek) => {
    return service.get(`/files/${currentWeek}`);
}

export const deleteFile = (url) => {
    return service.delete(url);
}

export const postJob = (Job) => {
    return service.post(`/jobs/${Job.currentWeek}`, Job);
}

export const publishJob = (Job) => {
    return service.post(`/publish/${Job.currentWeek}`, Job);
}
