const { Router } = require('express')
const Checkout = require('../libs/checkout')

const router = Router()

router.get('/', (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
});

router.get('/detail', async (req, res) => {
    try {
        const {
            query: {
                title: description,
                price,
                unit: quantity,
                img
            }
        } = req
        const data = {
            description,
            price,
            quantity,
            img
        }
        const checkout = await Checkout.createPreference(data)
        res.render('detail', {
            ...req.query,
            ...checkout
        });
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
});

router.get('/feedback', (req, res) => {
    res.json({
       Payment: req.query.payment_id,
       Status: req.query.status,
       MerchantOrder: req.query.merchant_order_id
   })
});

router.post('/notifications/ipn', async (req, res) => {
    const {
        query: {
            topic,
            id
        }
    } = req
    let merchandOrder = null
    switch (topic) {
        case 'payment':
            const payment = await Checkout.findPaymentById(id)
            const {
                payment: {
                    order: {
                        id: paymentId
                    }
                }
            } = payment
            merchandOrder = await Checkout.findMerchantOrderById(paymentId)
            break
        case 'merchant_order':
            merchandOrder = await Checkout.findMerchantOrderById(id)
            break
        default:
            break
    }
    if (!merchandOrder) {
        return res.status(400).json({
            message: 'something bad happend'
        })
    }
    const merchandStatus = Checkout.getMerchantOrderStatus(merchandOrder)
    res.json({
        merchandStatus,
        query: req.query
   })
})


router.post('/notifications/weebhooks', (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

module.exports = router
