const helpers = {
    objectToQueryString: (obj) => {
        const str = [];
        for (const p in obj)
            if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");   
    },
    validateObjectProperties: (object, properties) => {
        return !properties.some(property => {
            return !object[property]
        })
    },
    displaySuccessModal: (queryParams) => {
        const data = queryParams
        const properties = [
            'title',
            'price',
            'quantity',
            'img',
            'status'
        ]
        const display = helpers.validateObjectProperties(data, properties)
        if (!display || data.status !== 'approved') {
            return false
        }
        return true
    }
}

module.exports = helpers