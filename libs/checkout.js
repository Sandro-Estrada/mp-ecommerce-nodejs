const mercadopago = require("mercadopago")
const path = require('path')
const { objectToQueryString } = require('../libs/helpers')

const BASE_URL = 'https://sandro-estrada-mp-commerce-nod.herokuapp.com'

const PAYER_INFO = {
    name: 'Lalo',
    surname: 'Landa',
    email: 'test_user_81131286@testuser.com',
    phone: {
        area_code: '52',
        number: 5549737300
    },
    address: {
        zip_code: '03940',
        street_name: 'Insurgentes Sur',
        street_number: 1602
    }
}

const ITEM = {
    id: '1234',
    description: '“Dispositivo móvil de Tienda e-commerce'
}

const EMAIL = 'sandro.ferax@gmail.com'

class CheckoutController {
    static async createPreference(data) {
        try {
            const {
                description,
                price,
                quantity,
                img,
                payer = PAYER_INFO
            } = data

            const queryString = objectToQueryString({
                title: description,
                price,
                quantity,
                img
            })
            const preference = {
                items: [{
                    ...ITEM,
                    title: description,
                    unit_price: Number(price),
                    quantity: Number(quantity),
                    picture_url: path.join(__dirname, `../${img}`)
                }],
                payer,
                back_urls: {
                    success: `${BASE_URL}?${queryString}`,
                    failure: `${BASE_URL}/fail?${queryString}`,
                    pending: `${BASE_URL}/pending?${queryString}`
                },
                external_reference: EMAIL,
                auto_return: 'approved',
                //`${BASE_URL}/notifications/weebhooks?source_news=webhooks`
                notification_url: 'https://hookb.in/aBem81oE62f1oobLKG9k',
                payment_methods: {
                    excluded_payment_methods: [
                        {
                            id: "amex"
                        }
                    ],
                    excluded_payment_types: [
                        {
                            id: "atm"
                        }
                    ],
                    installments: 6, 
                    default_installments: 6 
                }
            }
        
            const response = await mercadopago.preferences.create(preference)
            return ({id: response.body.id})
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    static async findPaymentById(id) {
        try {
            const payment = await mercadopago.payment.findById(id)
            return payment
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    static async findMerchantOrderById(id) {
        try {
            const merchantOrder = await mercadopago.merchant_orders.findById(id)
            return merchantOrder
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    static getMerchantOrderStatus(merchantOrder) {
        try {
            const [
                readyToShip,
                notPaid
            ] = [
                'ready',
                'Not paid yet'
            ]
            const paidAmount = 0
            merchantOrder.payments.forEach(payment => {
                if (payment['status'] == 'approved'){
                    paidAmount += payment['transaction_amount']
                } 
            })
            if(paidAmount >= merchantOrder.total_amount){
                if (merchantOrder.shipments.length > 0) {
                    if(merchantOrder.shipments[0].status == 'ready_to_ship') {
                        return readyToShip
                    }
                } else {
                    return readyToShip
                }
            } else {
                return notPaid
            }
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    static async findPlanById(id) {
        try {
            // I did not find information on how to get the data of a plan through the SDK
            const plan = null
            return plan
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    static async findSubscriptionById(id) {
        try {
            // I did not find information on how to get the data of a subscription through the SDK
            const subscription = null
            return subscription
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    static async findInvoiceById(id) {
        try {
            // I did not find information on how to get the data of an invoice through the SDK
            const invoice = null
            return invoice
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}

module.exports = CheckoutController
