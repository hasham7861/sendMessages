const networkMapAPI = 'https://sheetdb.io/api/v1/aka2sv6jd00dh'

export async function getNetworkMap() {
    let response = await fetch(networkMapAPI)
    let responseInJson = await response.json()
    // removing punctuation from organization id
    for (let contact of responseInJson) {
        if (contact.organizationId)
            contact.organizationId = contact.organizationId.toLowerCase().replace(/\s/g, '').split(",")[0]
    }
    return responseInJson
}
