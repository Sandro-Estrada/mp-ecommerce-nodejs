const mercadopago = require("mercadopago")
const path = require('path')

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
            console.log(`${BASE_URL}/${img.replace('./', '')}` )
            const preference = {
                items: [{
                    ...ITEM,
                    title: description,
                    unit_price: Number(price),
                    quantity: Number(quantity),
                    picture_url: `${BASE_URL}/${img.replace('./', '')}` //path.join(`${BASE_URL}`, img)
                }],
                payer,
                back_urls: {
                    success: `${BASE_URL}/feedback`,
                    failure: `${BASE_URL}/feedback`,
                    pending: `${BASE_URL}/feedback`
                },
                external_reference: EMAIL,
                auto_return: 'approved',
                notification_url: `${BASE_URL}/notifications/weebhooks`,
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
}

module.exports = CheckoutController
