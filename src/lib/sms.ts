async function send(
    phoneNumber: string,
    message: string
): Promise<{ success: boolean; message?: string }> {
    const url = "https://sms.smsnotifygh.com/smsapi"
    const apiKey = "f5b8b5e4-4608-4f9e-858f-a88c4531a33b"
    const senderId = "EATME food"

    const params = new URLSearchParams({
        key: apiKey,
        to: phoneNumber,
        msg: message,
        sender_id: senderId,
    })

    const fullUrl = `${url}?${params.toString()}`
    console.log("Sending SMS via GET request:", fullUrl)

    try {
        const response = await fetch(fullUrl)

        if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`)
        }

        const resultText = await response.text()
        console.log("SMS API Response:", resultText)

        const success = resultText.toLowerCase().includes("success")

        return {
            success,
            message: resultText,
        }
    } catch (error: any) {
        console.error("SMS send failed:", error.message)
        return {
            success: false,
            message: `Failed to send SMS: ${error.message}`,
        }
    }
}

const ADMIN_PHONE = "0550222666";

export const sms = {
    send,
    ADMIN_PHONE
}  