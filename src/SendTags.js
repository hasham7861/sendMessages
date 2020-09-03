import React, { useState, useEffect } from 'react'
import { getNetworkMap } from './services/Rest'

const sendTypes = { organization: "organization", firstname: "firstname", lastname: "lastname", tags: "tags" }

export default function SendTags() {
    const [recipients, updateRecipients] = useState("")
    const [qualifier, updateQualifier] = useState("")
    const [sendTo, updateSendTo] = useState("")
    const [sendType, updateSendType] = useState("")
    const [sent, updateSent] = useState(false)
    const [networkMap, updateNetworkMap] = useState(null)

    const handleChange = (event) => {
        const value = event.target.value   
        switch (event.target.name) {
            case "sendType":
                updateSendType(value.toLowerCase().replace(/\s/g, ''))
                return
            case "sendTo":
                updateSendTo(value.toLowerCase()
                    .replace(/\s/g, '').split(",")
                    .filter(contactId => !["inc", "corp", "ltd", "co"].includes(contactId)))
                return
            case "qualifier":
                updateQualifier(value.toLowerCase())
                return
            default:
                return;
        }
    }
    useEffect(() => {

        // load all the contacts for this app
        getNetworkMap().then(data => updateNetworkMap(data))
    }, [])

    /**
     * return a contact if it matches the filter
     * @param {String} contactId 
     */
    const getContact = (contactId) => {
        for (let contact of networkMap) {
            if (sendType == "organization" && contact.organizationId == contactId) {
                return contact
            } else if (sendType == "firstname" && contact.firstname.toLowerCase() == contactId) {
                return contact
            } else if (sendType == "lastname" && contact.lastname.toLowerCase() == contactId) {
                return contact
            } else if (sendType == "tags" && contact.tags.includes(contactId)) {
                return contact
            }
        }
        return null
    }
    /**
     * send messages to the filtered contacts
     */
    const filteredContactsAndSendMessage = () => {
        let filterContacts = ""

        for (let i = 0; i < sendTo.length; i++) {
            let contactId = sendTo[i]
            let contact = getContact(contactId.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""))

            if (qualifier == "and") {
                if (!contact) {
                    updateRecipients("")
                    updateSent(false)
                    return ""
                }
                let firstname = contact.firstName, lastname = contact.lastName
                filterContacts += `${firstname} ${lastname}`
            } else if (qualifier == "or" && contact) {
                let firstname = contact.firstName, lastname = contact.lastName
                filterContacts += `${firstname} ${lastname}`
            }

            if (contact && i != sendTo.length - 1) {
                filterContacts += ', '
            }


        }

        updateRecipients(filterContacts)
        updateSent(true)

    }


    const handleSubmit = (event) => {
        event.preventDefault()

        filteredContactsAndSendMessage()
    }

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                <label style={{ paddingRight: "10px" }}>
                    <div>
                        <span style={{ paddingRight: "10px" }}>Send Type (Organization, First Name, Last Name, or Tags):</span>
                        <input type="text" name="sendType" onChange={handleChange} />
                    </div>
                    <div>
                        <span style={{ paddingRight: "10px", paddingTop: "20px" }}>Send To (separated by commas):</span>
                        <input type="text" name="sendTo" onChange={handleChange} />
                    </div>
                    <div>
                        <span style={{ paddingRight: "10px", paddingTop: "20px" }}>AND/OR?: </span>
                        <input type="text" name="qualifier" onChange={handleChange} />
                    </div>
                </label>
                <input type="submit" value="Send Messages" />
            </form>
            {sent && <div>Sent to: {recipients}</div>}
        </div>
    )
}

