
let location = window.location.origin

let port = process.env.REACT_APP_BACKEND_PORT | 1111

export function getAPIDomain() {
    return location.replace(':3000',`:${port}`)
}

export function getSocketUrl() {
    let location = window.location.href
    return location.replace(':3000',`:${port}`)
}

export function getAPI() {
    return `${location}/api`
}
